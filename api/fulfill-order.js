// Fulfill orders with Fulfill Engine and Printify after Stripe payment
// Called by the webhook after order is saved to Supabase

const FE_API_KEY = process.env.FULFILL_ENGINE_API_KEY
const FE_ACCOUNT_ID = 'act-9679744'
const FE_CAMPAIGN_ID = '1ee36d04-dcd2-4568-8b37-794f077a1f5f'

const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY
const PRINTIFY_SHOP_ID = '26705492'

// Map product IDs to their source and catalog info
const PRODUCT_CATALOG = {
  // FE Products — catalogProductId is the SKU used for ordering
  "65775645-66b3-4a5b-833a-9cec72ab20a1": { source: "FE", sku: "PST74" },
  "94d1ffac-cd30-4115-8395-3522405aa10d": { source: "FE", sku: "596807" },
  "3de311b9-8f1d-4264-920d-3ca62893c4f6": { source: "FE", sku: "CN9492" },
  "65e52044-05d9-4e61-ad8e-eaacc615d7c3": { source: "FE", sku: "TS7X2M" },
  "07460ba0-ca8f-49e9-bc42-fb97fdca50c7": { source: "FE", sku: "651AFM" },
  "7a068fc5-0f94-465a-905c-158f65c59ccd": { source: "FE", sku: "PC78J" },
  "b70f4613-f2d7-4657-a8b0-774e34aaa336": { source: "FE", sku: "DT6107" },
  "d4bcad88-d6e4-410a-82a6-ffd7b9032894": { source: "FE", sku: "ST443" },
  "b261913e-84b3-4fe1-8a14-5de66fa0a441": { source: "FE", sku: "426500" },
  "e1cde862-44ee-4b07-b05e-f0477f7bb07f": { source: "FE", sku: "IND4000" },
  "c28036eb-ab06-4f74-b7f5-18e1526003c0": { source: "FE", sku: "NKAO9293" },
  "40a827e5-4d5d-42a6-8c52-0764c36df32d": { source: "FE", sku: "NKDC1963" },
  "2ebe2108-6ec6-46a4-9e54-5cac7386d253": { source: "FE", sku: "NKDC1991" },
  "ed197e7c-16f7-43b1-b4d4-9c74ad80ab0b": { source: "FE", sku: "AT304" },
  "366b8c1a-d5df-444d-8588-af62fd7b3f1b": { source: "FE", sku: "R20SWM" },
  "9d1ba28f-4b40-464e-9ed9-d4c8971cc93b": { source: "FE", sku: "S162" },
  "bf2c31a9-670e-4d58-a19f-7754720d5b59": { source: "FE", sku: "RW26" },
  "43121382-86a5-4629-82cd-83eb34373088": { source: "FE", sku: "AT315" },
  "72119eb5-d9f2-41e4-bf2d-5fa4a11f1a5c": { source: "FE", sku: "L8869" },
  "8762a9d5-b5ba-4cee-ac88-4c7c638021df": { source: "FE", sku: "BG204" },
  "474d12a6-59f2-4b93-b2c9-345c81790b44": { source: "FE", sku: "BP20079-CO2" },
  "6bb7b0cb-b77e-4ce5-809f-294699194199": { source: "FE", sku: "BP20067" },
  "91662cd6-18dd-4793-b743-b711b7c2bcb8": { source: "FE", sku: "BG938" },
  "9a50908e-405f-4eb6-931f-fe8521fecd29": { source: "FE", sku: "6006" },
  "dad39c44-2032-49d7-b668-13d9dbd3f6a6": { source: "FE", sku: "VC300A" },
  "3787264c-35c4-43e0-bc65-23e543ed9006": { source: "FE", sku: "BG1050" },
  "9871d311-2b4f-49f2-a94b-d303478cae98": { source: "FE", sku: "K540" },
  "f4b9d451-ca8f-4360-b52a-8cdd8c2925fa": { source: "FE", sku: "L573" },
  // Printify Products
  "69abc874a028393ce202a853": { source: "Printify", printifyId: "69abc874a028393ce202a853" },
  "69abc732b360648baa01cd2d": { source: "Printify", printifyId: "69abc732b360648baa01cd2d" },
  "69ab32d5d959867b0506f74a": { source: "Printify", printifyId: "69ab32d5d959867b0506f74a" },
  "69ab2f6fb360648baa01b3b3": { source: "Printify", printifyId: "69ab2f6fb360648baa01b3b3" },
  "69ab2e79c22eeedecc02a1f0": { source: "Printify", printifyId: "69ab2e79c22eeedecc02a1f0" },
}

// Submit order to Fulfill Engine
async function submitFEOrder(items, shippingAddress, customerEmail, orderId) {
  const orderItemGroups = items.map(item => {
    const catalog = PRODUCT_CATALOG[item.productId]
    return {
      catalogProductId: catalog ? catalog.sku : item.productId,
      productColor: item.color || '',
      productSize: item.size || '',
      quantity: item.qty,
    }
  })

  const payload = {
    campaignId: FE_CAMPAIGN_ID,
    customerEmailAddress: customerEmail,
    customId: `SPW-${orderId}`,
    orderItemGroups,
    shipments: [{
      shippingAddress: {
        name: shippingAddress.name || `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim(),
        addressLine1: shippingAddress.line1 || shippingAddress.address1 || '',
        addressLine2: shippingAddress.line2 || shippingAddress.address2 || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        postalCode: shippingAddress.postal_code || shippingAddress.zip || '',
        country: shippingAddress.country || 'US',
      },
      shippingTier: 'economy',
      confirmationEmailAddress: customerEmail,
    }],
  }

  const res = await fetch(`https://api.fulfillengine.com/api/accounts/${FE_ACCOUNT_ID}/orders`, {
    method: 'POST',
    headers: {
      'X-API-KEY': FE_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = { raw: text } }

  return { success: res.ok, status: res.status, data }
}

// Look up Printify variant ID from color + size
async function getPrintifyVariantId(productId, color, size) {
  const res = await fetch(
    `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products/${productId}.json`,
    { headers: { 'Authorization': `Bearer ${PRINTIFY_API_KEY}` } }
  )
  if (!res.ok) return null

  const product = await res.json()
  const searchTitle = `${color} / ${size}`.trim()

  // Find matching variant
  const variant = product.variants.find(v => {
    if (!v.is_enabled) return false
    return v.title === searchTitle
  })

  // Fallback: try partial match
  if (!variant) {
    return product.variants.find(v =>
      v.is_enabled &&
      v.title.toLowerCase().includes((color || '').toLowerCase()) &&
      v.title.toLowerCase().includes((size || '').toLowerCase())
    )?.id || null
  }

  return variant?.id || null
}

// Submit order to Printify
async function submitPrintifyOrder(items, shippingAddress, customerEmail, orderId) {
  // Resolve variant IDs for each item
  const lineItems = []
  for (const item of items) {
    const variantId = await getPrintifyVariantId(item.productId, item.color, item.size)
    if (!variantId) {
      console.error(`Could not find Printify variant for ${item.productId} ${item.color} / ${item.size}`)
      continue
    }
    lineItems.push({
      product_id: item.productId,
      variant_id: variantId,
      quantity: item.qty,
    })
  }

  if (lineItems.length === 0) {
    return { success: false, error: 'No valid Printify variants found' }
  }

  const name = shippingAddress.name || `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim()
  const nameParts = name.split(' ')
  const firstName = nameParts[0] || 'Customer'
  const lastName = nameParts.slice(1).join(' ') || ''

  const payload = {
    external_id: `SPW-${orderId}`,
    label: `SPW-${orderId}`,
    line_items: lineItems,
    shipping_method: 1, // 1 = standard
    address_to: {
      first_name: firstName,
      last_name: lastName,
      email: customerEmail,
      country: shippingAddress.country || 'US',
      region: shippingAddress.state || '',
      address1: shippingAddress.line1 || shippingAddress.address1 || '',
      address2: shippingAddress.line2 || shippingAddress.address2 || '',
      city: shippingAddress.city || '',
      zip: shippingAddress.postal_code || shippingAddress.zip || '',
    },
    send_shipping_notification: true,
  }

  const res = await fetch(
    `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/orders.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  )

  const data = await res.json()
  return { success: res.ok, status: res.status, data }
}

// Main fulfillment function — called by webhook
export async function fulfillOrder(orderItems, shippingAddress, customerEmail, orderId) {
  const results = { fe: null, printify: null }

  // Split items by source — check hardcoded catalog first, fall back to item.source
  const feItems = []
  const printifyItems = []

  for (const item of orderItems) {
    const catalog = PRODUCT_CATALOG[item.productId]
    if (catalog) {
      if (catalog.source === 'FE') {
        feItems.push(item)
      } else {
        printifyItems.push(item)
      }
    } else if (item.source === 'Fulfill Engine' || item.source === 'FE') {
      // New synced product not in hardcoded catalog — use product UUID directly
      feItems.push(item)
    } else if (item.source === 'Printify') {
      printifyItems.push(item)
    } else {
      console.warn(`Unknown product ID and no source: ${item.productId}`)
    }
  }

  // Submit to each supplier
  if (feItems.length > 0) {
    try {
      results.fe = await submitFEOrder(feItems, shippingAddress, customerEmail, orderId)
      console.log('FE order result:', JSON.stringify(results.fe))
    } catch (err) {
      console.error('FE order error:', err)
      results.fe = { success: false, error: err.message }
    }
  }

  if (printifyItems.length > 0) {
    try {
      results.printify = await submitPrintifyOrder(printifyItems, shippingAddress, customerEmail, orderId)
      console.log('Printify order result:', JSON.stringify(results.printify))
    } catch (err) {
      console.error('Printify order error:', err)
      results.printify = { success: false, error: err.message }
    }
  }

  return results
}
