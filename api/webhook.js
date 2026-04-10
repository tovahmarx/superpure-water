import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  httpClient: Stripe.createFetchHttpClient(),
})
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Disable body parsing so we get the raw body for Stripe signature verification
export const config = {
  api: { bodyParser: false },
}

async function buffer(readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event
  if (endpointSecret) {
    const buf = await buffer(req)
    const sig = req.headers['stripe-signature']
    try {
      event = stripe.webhooks.constructEvent(buf, sig, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return res.status(400).json({ error: 'Invalid signature' })
    }
  } else {
    // No webhook secret configured — parse body directly (dev mode)
    const buf = await buffer(req)
    event = JSON.parse(buf.toString())
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    const priceType = session.metadata?.priceType || 'retail'
    const creditApplied = Number(session.metadata?.creditApplied || 0)
    let orderItems = []
    try {
      orderItems = JSON.parse(session.metadata?.itemsJson || '[]')
    } catch {}

    // Retrieve line items for full details
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

    const items = lineItems.data.map((li, idx) => ({
      name: li.description,
      qty: li.quantity,
      price: li.amount_total / 100 / li.quantity,
      productId: orderItems[idx]?.productId || null,
    }))

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)

    // Create order in Supabase
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent,
        customer_email: session.customer_details?.email,
        customer_name: session.customer_details?.name,
        price_type: priceType,
        subtotal,
        credit_applied: creditApplied,
        amount_charged: session.amount_total / 100,
        status: 'processing',
        items,
      })
      .select()
      .single()

    if (orderErr) {
      console.error('Order creation error:', orderErr)
      return res.status(500).json({ error: 'Failed to create order' })
    }

    // Record credit spent (wholesale with credit)
    if (creditApplied > 0) {
      await supabase.from('credit_ledger').insert({
        type: 'spent',
        amount: creditApplied,
        description: `Order: ${items.length} item${items.length > 1 ? 's' : ''}`,
        order_id: order.id,
        items: items.map(i => ({ name: i.name, qty: i.qty })),
      })
    }

    // If retail order, add credit for Kris
    if (priceType === 'retail') {
      const productIds = [...new Set(items.map(i => i.productId).filter(Boolean))]
      if (productIds.length) {
        const { data: pricing } = await supabase
          .from('product_pricing')
          .select('*')
          .in('product_id', productIds)

        if (pricing && pricing.length) {
          let earned = 0
          items.forEach(item => {
            const p = pricing.find(pr => pr.product_id === item.productId)
            if (p && p.retail_price > 0 && p.wholesale_price > 0) {
              earned += (p.retail_price - p.wholesale_price) * item.qty
            }
          })
          earned = Math.round(earned * 100) / 100
          if (earned > 0) {
            await supabase.from('credit_ledger').insert({
              type: 'earned',
              amount: earned,
              description: `Retail sale: ${items.length} item${items.length > 1 ? 's' : ''} sold`,
              order_id: order.id,
              items: items.map(i => ({ name: i.name, qty: i.qty })),
            })
          }
        }
      }
    }

    console.log('Order created:', order.id)
  }

  return res.status(200).json({ received: true })
}
