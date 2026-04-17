// Sync products from Fulfill Engine + Printify APIs
// Returns normalized product list with pricing, images, variants

const FE_API_KEY = process.env.FULFILL_ENGINE_API_KEY
const FE_ACCOUNT_ID = 'act-9679744'
const FE_CAMPAIGN_ID = '1ee36d04-dcd2-4568-8b37-794f077a1f5f'

const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY
const PRINTIFY_SHOP_ID = '26705492'

async function fetchFEProducts() {
  try {
    // Fetch campaign products from Fulfill Engine
    const res = await fetch(
      `https://api.fulfillengine.com/api/accounts/${FE_ACCOUNT_ID}/campaigns/${FE_CAMPAIGN_ID}`,
      {
        headers: {
          'X-API-KEY': FE_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!res.ok) {
      const text = await res.text()
      console.error('FE API error:', res.status, text)
      return { products: [], variants: {}, error: `FE API returned ${res.status}` }
    }

    const data = await res.json()
    const products = []
    const variants = {}

    // FE returns campaign with products array
    const feProducts = data.products || data.catalogProducts || data.items || []

    for (const p of feProducts) {
      const id = p.id || p.productId || p.catalogProductId
      const sku = p.catalogProductId || p.sku || p.styleNumber || ''
      const name = p.name || p.productName || p.title || ''
      const description = p.description || ''
      const costPrice = Number(p.cost || p.costPrice || p.unitCost || p.price || 0)

      // Get image - try multiple possible fields
      let image = ''
      if (p.images && p.images.length) {
        image = p.images[0].url || p.images[0].src || p.images[0]
      } else if (p.image) {
        image = p.image.url || p.image.src || p.image
      } else if (p.thumbnailUrl) {
        image = p.thumbnailUrl
      } else if (p.primaryImageUrl) {
        image = p.primaryImageUrl
      }

      // Get category
      const category = p.category || p.productCategory || p.type || 'Uncategorized'

      // Get sizes and colors
      const sizes = []
      const colors = []
      if (p.variants) {
        for (const v of p.variants) {
          if (v.size && !sizes.includes(v.size)) sizes.push(v.size)
          if (v.color && !colors.includes(v.color)) colors.push(v.color)
        }
      } else if (p.availableSizes) {
        sizes.push(...(Array.isArray(p.availableSizes) ? p.availableSizes : []))
      }
      if (p.availableColors) {
        colors.push(...(Array.isArray(p.availableColors) ? p.availableColors : []))
      }

      products.push({
        id,
        catalogProductId: sku,
        name,
        description,
        image,
        category,
        costPrice,
        wholesalePrice: Math.round(costPrice * 1.33 * 100) / 100, // Default 33% markup
        retailPrice: Math.round(costPrice * 1.69 * 100) / 100,    // Default 69% markup
        sku,
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

    // Paginate through all Printify products
    while (hasMore) {
      const res = await fetch(
        `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json?page=${currentPage}&limit=50`,
        {
          headers: { 'Authorization': `Bearer ${PRINTIFY_API_KEY}` },
        }
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
          // Parse title like "Black / S"
          if (v.title) {
            const parts = v.title.split(' / ')
            if (parts[0] && !colors.includes(parts[0])) colors.push(parts[0])
            if (parts[1] && !sizes.includes(parts[1])) sizes.push(parts[1])
          }
        }
      }

      // Derive SKU from blueprint
      const sku = p.tags?.[0] || `P-${id.substring(0, 6)}`

      products.push({
        id,
        catalogProductId: sku,
        name,
        description: description.replace(/<[^>]*>/g, '').substring(0, 200), // Strip HTML
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
  if (n.includes('hoodie') || n.includes('pullover') || n.includes('sweatshirt')) return 'Hoodies'
  if (n.includes('tee') || n.includes('t-shirt') || n.includes('tshirt')) return 'Tees'
  if (n.includes('polo')) return 'Polos'
  if (n.includes('short')) return 'Shorts'
  if (n.includes('pant') || n.includes('jogger')) return 'Pants'
  if (n.includes('quarter') || n.includes('1/4') || n.includes('zip')) return 'Quarter-Zips'
  if (n.includes('hat') || n.includes('cap') || n.includes('beanie')) return 'Hats'
  if (n.includes('bag') || n.includes('tote') || n.includes('backpack') || n.includes('duffel')) return 'Bags'
  if (n.includes('tumbler') || n.includes('bottle') || n.includes('mug')) return 'Accessories'
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
