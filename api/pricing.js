import { createClient } from '@supabase/supabase-js'
import { verifyAuth } from './auth.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('product_pricing').select('*')
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    // Auth required for price changes
    const user = verifyAuth(req)
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { products } = req.body
    if (!products || !products.length) {
      return res.status(400).json({ error: 'No products provided' })
    }

    const { error } = await supabase
      .from('product_pricing')
      .upsert(
        products.map(p => ({
          product_id: p.product_id,
          wholesale_price: p.wholesale_price,
          retail_price: p.retail_price,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'product_id' }
      )

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
