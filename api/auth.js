// Server-side auth verification — passwords never in client bundle
const USERS = {
  admin: {
    password: process.env.ADMIN_PASSWORD || 'tovah2026',
    name: 'Tovah',
    email: 'tovah@brandsbystatus.com',
    role: 'admin',
  },
  owner: {
    password: process.env.OWNER_PASSWORD || 'kris2026',
    name: 'Kris',
    email: 'kris@superpurewater.com',
    role: 'owner',
  },
}

export function verifyAuth(req) {
  const authHeader = req.headers['x-auth-token']
  if (!authHeader) return null
  try {
    const decoded = JSON.parse(Buffer.from(authHeader, 'base64').toString())
    const user = USERS[decoded.role]
    if (user && decoded.pw === user.password) {
      return { role: user.role, name: user.name, email: user.email }
    }
  } catch {}
  return null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { role, password } = req.body

  if (!role || !password) {
    return res.status(400).json({ error: 'Missing role or password' })
  }

  const user = USERS[role]
  if (!user || password !== user.password) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  // Return a token (base64 encoded role+pw — simple but keeps pw out of client source)
  const token = Buffer.from(JSON.stringify({ role, pw: password })).toString('base64')

  return res.status(200).json({
    user: { role: user.role, name: user.name, email: user.email },
    token,
  })
}
