const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY
const PRINTIFY_SHOP_ID = '26705492'
const FE_FLAT_RATE = 10.00

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { items, address } = req.body

    if (!items || !items.length) {
      return res.status(400).json({ error: 'No items provided' })
    }

    const feItems = items.filter(i => i.source === 'Fulfill Engine')
    const printifyItems = items.filter(i => i.source === 'Printify')

    let feShipping = 0
    let printifyShipping = 0
    let printifyShippingDetails = null

    // FE: flat $10 if any FE items
    if (feItems.length > 0) {
      feShipping = FE_FLAT_RATE
    }

    // Printify: call shipping API
    if (printifyItems.length > 0 && address) {
      try {
        // Build line items for Printify shipping calc
        // We need blueprint_id and print_provider_id from the product
        // For now, use a simpler approach — estimate based on Printify's standard shipping
        const shippingPayload = {
          line_items: printifyItems.map(item => ({
            product_id: item.productId,
            variant_id: item.variantId || 1, // fallback
            quantity: item.qty,
          })),
          address_to: {
            first_name: address.firstName || 'Customer',
            last_name: address.lastName || '',
            email: address.email || '',
            country: address.country || 'US',
            region: address.state || '',
            address1: address.address1 || '',
            city: address.city || '',
            zip: address.zip || '',
          },
        }

        const printifyRes = await fetch(
          `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/orders/shipping.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(shippingPayload),
          }
        )

        if (printifyRes.ok) {
          const shippingData = await printifyRes.json()
          // Printify returns { standard: number, express: number } in cents
          if (shippingData.standard !== undefined) {
            printifyShipping = shippingData.standard / 100
            printifyShippingDetails = {
              standard: shippingData.standard / 100,
              express: shippingData.express ? shippingData.express / 100 : null,
            }
          }
        } else {
          // Fallback: flat rate for Printify if API fails
          console.warn('Printify shipping API failed, using fallback')
          printifyShipping = 5.99
        }
      } catch (err) {
        console.warn('Printify shipping error:', err)
        printifyShipping = 5.99
      }
    } else if (printifyItems.length > 0 && !address) {
      // No address yet — return estimate
      printifyShipping = 5.99
      printifyShippingDetails = { estimated: true }
    }

    const totalShipping = Math.round((feShipping + printifyShipping) * 100) / 100

    return res.status(200).json({
      total: totalShipping,
      breakdown: {
        fulfillEngine: feItems.length > 0 ? { amount: feShipping, label: 'Flat rate shipping' } : null,
        printify: printifyItems.length > 0 ? {
          amount: printifyShipping,
          label: printifyShippingDetails?.estimated ? 'Estimated shipping' : 'Calculated shipping',
          details: printifyShippingDetails,
        } : null,
      },
    })
  } catch (err) {
    console.error('Shipping calc error:', err)
    return res.status(500).json({ error: err.message })
  }
}
