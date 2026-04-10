import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { items, priceType, creditApplied, customerEmail } = req.body

    if (!items || !items.length) {
      return res.status(400).json({ error: 'No items provided' })
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
    const amountDue = Math.round((subtotal - (creditApplied || 0)) * 100) / 100

    // If fully covered by credit, skip Stripe and create order directly
    if (amountDue <= 0) {
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          price_type: priceType,
          subtotal,
          credit_applied: creditApplied || 0,
          amount_charged: 0,
          status: 'processing',
          items,
          customer_email: customerEmail,
        })
        .select()
        .single()

      if (orderErr) throw orderErr

      // Record credit spent
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
        await addRetailCredit(order, items)
      }

      return res.status(200).json({ success: true, orderId: order.id })
    }

    // Create Stripe Checkout Session
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: [item.color, item.size].filter(Boolean).join(' / ') || undefined,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }))

    // If partial credit, add a discount
    const discounts = []
    if (creditApplied > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(creditApplied * 100),
        currency: 'usd',
        name: 'Store Credit',
        duration: 'once',
      })
      discounts.push({ coupon: coupon.id })
    }

    const origin = req.headers.origin || 'https://superpure-water.vercel.app'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      discounts,
      customer_email: customerEmail || undefined,
      automatic_tax: { enabled: true },
      success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${priceType === 'wholesale' ? 'wholesale' : ''}`,
      metadata: {
        priceType,
        creditApplied: String(creditApplied || 0),
        itemsJson: JSON.stringify(items.map(i => ({ name: i.name, qty: i.qty, productId: i.productId }))),
      },
    })

    return res.status(200).json({ url: session.url, sessionId: session.id })
  } catch (err) {
    console.error('Checkout error:', err)
    return res.status(500).json({ error: err.message })
  }
}

async function addRetailCredit(order, items) {
  // Get product pricing to calculate credit (retail - wholesale)
  const productIds = [...new Set(items.map(i => i.productId))]
  const { data: pricing } = await supabase
    .from('product_pricing')
    .select('*')
    .in('product_id', productIds)

  // If no pricing in DB yet, skip credit (pricing not set up)
  if (!pricing || !pricing.length) return

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
