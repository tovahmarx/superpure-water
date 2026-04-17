// Sync products from Fulfill Engine + Printify APIs
// Returns normalized product list with pricing, images, variants

const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY
const PRINTIFY_SHOP_ID = '26705492'

// Fulfill Engine public storefront API — no API key needed
const FE_STORE_SLUG = 'super-pure-water'

async function fetchFEProducts() {
  try {
    const res = await fetch(
      `https://api.fulfillengine.com/shop/campaigns/${FE_STORE_SLUG}`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!res.ok) {
      const text = await res.text()
      console.error('FE API error:', res.status, text)
      return { products: [], variants: {}, error: `FE API returned ${res.status}` }
    }

    const data = await res.json()
    const feProducts = data.products || []
    const products = []
    const variants = {}

    for (const p of feProducts) {
      const id = p.id
      const name = p.name || ''
      const description = p.description || ''
      const costPrice = Number(p.salesBasePrice || p.defaultPrice || 0)

      // Get image from first color option's front image
      let image = ''
      for (const opt of (p.options || [])) {
        if (image) break
        for (const val of (opt.optionValues || [])) {
          if (image) break
          for (const img of (val.images || [])) {
            if (img.imageType === 'Front' && img.url) {
              image = img.url
              break
            }
          }
        }
      }

      // Extract sizes and colors from options
      const sizes = []
      const colors = []
      for (const opt of (p.options || [])) {
        if (opt.name === 'Size' || opt.optionType === 0) {
          for (const val of (opt.optionValues || [])) {
            if (val.name && !sizes.includes(val.name)) sizes.push(val.name)
          }
        }
        if (opt.name === 'Color' || opt.optionType === 1) {
          for (const val of (opt.optionValues || [])) {
            if (val.name && !colors.includes(val.name)) colors.push(val.name)
          }
        }
      }

      products.push({
        id,
        catalogProductId: id,
        name,
        description,
        image,
        category: guessCategory(name),
        costPrice,
        wholesalePrice: Math.round(costPrice * 1.33 * 100) / 100,
        retailPrice: Math.round(costPrice * 1.69 * 100) / 100,
        sku: `FE-${id.substring(0, 8).toUpperCase()}`,
        source: 'Fulfill Engine',
        active: true,
      })

      if (sizes.length || colors.length) {
        variants[id] = { sizes, colors }
      }
    }

    return { products, variants, error: null }
  } catch (err) {
    console.error('FE fetch error:', err)
    return { products: [], variants: {}, error: err.message }
  }
}

async function fetchPrintifyProducts() {
  try {
    let allProducts = []
    let currentPage = 1
    let hasMore = true

    while (hasMore) {
      const res = await fetch(
        `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json?page=${currentPage}&limit=50`,
        { headers: { 'Authorization': `Bearer ${PRINTIFY_API_KEY}` } }
      )

      if (!res.ok) {
        const text = await res.text()
        console.error('Printify API error:', res.status, text)
        return { products: [], variants: {}, error: `Printify API returned ${res.status}` }
      }

      const data = await res.json()
      const items = data.data || data || []

      if (items.length === 0) {
        hasMore = false
      } else {
        allProducts.push(...items)
        currentPage++
        if (items.length < 50) hasMore = false
      }
    }

    const products = []
    const variants = {}

    for (const p of allProducts) {
      const id = p.id
      const name = p.title || ''
      const description = p.description || ''

      // Get front image
      let image = ''
      if (p.images && p.images.length) {
        const frontImg = p.images.find(img => img.position === 'front' || img.is_default)
        image = frontImg ? frontImg.src : p.images[0].src
      }

      // Get cost from variants (lowest enabled variant cost)
      let costPrice = 0
      const sizes = []
      const colors = []

      if (p.variants && p.variants.length) {
        const enabledVariants = p.variants.filter(v => v.is_enabled)
        if (enabledVariants.length) {
          // Cost is in cents from Printify
          costPrice = Math.min(...enabledVariants.map(v => v.cost || v.price || 0)) / 100
        }

        for (const v of enabledVariants) {
          if (v.title) {
            const parts = v.title.split(' / ')
            if (parts[0] && !colors.includes(parts[0])) colors.push(parts[0])
            if (parts[1] && !sizes.includes(parts[1])) sizes.push(parts[1])
          }
        }
      }

      const sku = p.tags?.[0] || `P-${id.substring(0, 6)}`

      products.push({
        id,
        catalogProductId: sku,
        name,
        description: description.replace(/<[^>]*>/g, '').substring(0, 200),
        image,
        category: guessCategory(name),
        costPrice,
        wholesalePrice: Math.round(costPrice * 1.33 * 100) / 100,
        retailPrice: Math.round(costPrice * 1.69 * 100) / 100,
        sku: `${sku}-P`,
        source: 'Printify',
        active: true,
      })

      if (sizes.length || colors.length) {
        variants[id] = { sizes, colors }
      }
    }

    return { products, variants, error: null }
  } catch (err) {
    console.error('Printify fetch error:', err)
    return { products: [], variants: {}, error: err.message }
  }
}

function guessCategory(name) {
  const n = name.toLowerCase()
  if (n.includes('hoodie') || n.includes('sweatshirt')) return 'Hoodies'
  if (n.includes('tee') || n.includes('t-shirt') || n.includes('tshirt') || n.includes('v-neck')) return 'Tees'
  if (n.includes('tank')) return 'Tanks'
  if (n.includes('polo')) return 'Polos'
  if (n.includes('short')) return 'Shorts'
  if (n.includes('pant') || n.includes('jogger')) return 'Pants'
  if (n.includes('quarter') || n.includes('1/4') || n.includes('zip') || n.includes('pullover') || n.includes('fleece')) return 'Quarter-Zips'
  if (n.includes('hat') || n.includes('cap') || n.includes('beanie')) return 'Hats'
  if (n.includes('bag') || n.includes('tote') || n.includes('backpack') || n.includes('duffel') || n.includes('crossbody')) return 'Bags'
  if (n.includes('tumbler') || n.includes('bottle') || n.includes('mug') || n.includes('speaker')) return 'Accessories'
  if (n.includes('towel')) return 'Towels'
  return 'Apparel'
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const [feResult, printifyResult] = await Promise.all([
    fetchFEProducts(),
    fetchPrintifyProducts(),
  ])

  const allProducts = [...feResult.products, ...printifyResult.products]
  const allVariants = { ...feResult.variants, ...printifyResult.variants }

  return res.status(200).json({
    products: allProducts,
    variants: allVariants,
    counts: {
      fulfillEngine: feResult.products.length,
      printify: printifyResult.products.length,
      total: allProducts.length,
    },
    errors: {
      fulfillEngine: feResult.error,
      printify: printifyResult.error,
    },
  })
}
