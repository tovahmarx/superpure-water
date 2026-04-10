import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom'
import { ShoppingCart, Plus, Minus, Trash2, LogOut, Package, DollarSign, Users, BarChart3, Eye, EyeOff, Settings, ChevronRight, Search, Filter, ArrowLeft, Check, X, Edit2, Save, Droplets, ShoppingBag, Truck, CreditCard, Menu } from 'lucide-react'
import './App.css'

// ============================================================
// CONTEXT
// ============================================================
const AuthContext = createContext(null)
const CartContext = createContext(null)

// ============================================================
// MOCK DATA — Replace with Supabase later
// ============================================================
const DEMO_PRODUCTS = [
  {
    id: 'spw-001',
    name: 'Super Pure Water - 24 Pack (16.9oz)',
    description: 'Premium purified water, 24 bottles per case. Perfect for events, offices, and retail.',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&h=600&fit=crop',
    category: 'Cases',
    costPrice: 3.20,
    wholesalePrice: 5.50,
    retailPrice: 8.99,
    sku: 'SPW-24-16',
    stock: 500,
    source: 'Fulfill Engine',
    active: true,
  },
  {
    id: 'spw-002',
    name: 'Super Pure Water - 12 Pack (1 Liter)',
    description: 'Premium purified water, 12 one-liter bottles per case. Great for gyms and wellness centers.',
    image: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=600&h=600&fit=crop',
    category: 'Cases',
    costPrice: 4.80,
    wholesalePrice: 8.00,
    retailPrice: 13.99,
    sku: 'SPW-12-1L',
    stock: 350,
    source: 'Fulfill Engine',
    active: true,
  },
  {
    id: 'spw-003',
    name: 'Super Pure Water - 6 Pack (1 Gallon)',
    description: 'Premium purified water, 6 gallon jugs per case. Ideal for home delivery and offices.',
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=600&h=600&fit=crop',
    category: 'Bulk',
    costPrice: 7.50,
    wholesalePrice: 12.00,
    retailPrice: 19.99,
    sku: 'SPW-6-GAL',
    stock: 200,
    source: 'Fulfill Engine',
    active: true,
  },
  {
    id: 'spw-004',
    name: 'Super Pure Water Branded T-Shirt',
    description: 'Premium cotton tee with Super Pure Water logo. Available in S-XXL.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
    category: 'Merch',
    costPrice: 6.50,
    wholesalePrice: 12.00,
    retailPrice: 24.99,
    sku: 'SPW-TEE-WHT',
    stock: 150,
    source: 'Printify',
    active: true,
  },
  {
    id: 'spw-005',
    name: 'Super Pure Water Branded Cap',
    description: 'Embroidered snapback cap with Super Pure Water logo.',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600&h=600&fit=crop',
    category: 'Merch',
    costPrice: 4.00,
    wholesalePrice: 8.00,
    retailPrice: 18.99,
    sku: 'SPW-CAP-BLK',
    stock: 200,
    source: 'Printify',
    active: true,
  },
  {
    id: 'spw-006',
    name: 'Super Pure Water Stainless Bottle',
    description: '32oz insulated stainless steel water bottle with Super Pure Water branding.',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop',
    category: 'Merch',
    costPrice: 8.00,
    wholesalePrice: 15.00,
    retailPrice: 29.99,
    sku: 'SPW-SBOT-32',
    stock: 100,
    source: 'Printify',
    active: true,
  },
]

const DEMO_ORDERS = [
  {
    id: 'ORD-001',
    customer: 'John Smith',
    email: 'john@example.com',
    type: 'retail',
    items: [{ productId: 'spw-001', name: 'Super Pure Water - 24 Pack (16.9oz)', qty: 3, price: 8.99 }],
    total: 26.97,
    status: 'processing',
    date: '2026-04-08',
  },
  {
    id: 'ORD-002',
    customer: 'Kris (Owner)',
    email: 'kris@superpurewater.com',
    type: 'wholesale',
    items: [
      { productId: 'spw-001', name: 'Super Pure Water - 24 Pack (16.9oz)', qty: 50, price: 5.50 },
      { productId: 'spw-002', name: 'Super Pure Water - 12 Pack (1 Liter)', qty: 30, price: 8.00 },
    ],
    total: 515.00,
    status: 'shipped',
    date: '2026-04-07',
  },
  {
    id: 'ORD-003',
    customer: 'Sarah Lee',
    email: 'sarah@example.com',
    type: 'retail',
    items: [{ productId: 'spw-004', name: 'Super Pure Water Branded T-Shirt', qty: 2, price: 24.99 }],
    total: 49.98,
    status: 'delivered',
    date: '2026-04-05',
  },
]

// ============================================================
// HELPERS
// ============================================================
const fmt = (n) => '$' + Number(n).toFixed(2)
const pct = (cost, sell) => (((sell - cost) / cost) * 100).toFixed(0) + '%'

// ============================================================
// AUTH PROVIDER
// ============================================================
function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('spw_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (role, password) => {
    if (role === 'admin' && password === 'tovah2026') {
      const u = { role: 'admin', name: 'Tovah', email: 'tovah@brandsbystatus.com' }
      setUser(u)
      localStorage.setItem('spw_user', JSON.stringify(u))
      return true
    }
    if (role === 'owner' && password === 'kris2026') {
      const u = { role: 'owner', name: 'Kris', email: 'kris@superpurewater.com' }
      setUser(u)
      localStorage.setItem('spw_user', JSON.stringify(u))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('spw_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ============================================================
// CART PROVIDER
// ============================================================
function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const addItem = (product, qty = 1, priceType = 'retail') => {
    const price = priceType === 'wholesale' ? product.wholesalePrice : product.retailPrice
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id && i.priceType === priceType)
      if (existing) {
        return prev.map(i =>
          i.productId === product.id && i.priceType === priceType
            ? { ...i, qty: i.qty + qty }
            : i
        )
      }
      return [...prev, { productId: product.id, name: product.name, image: product.image, price, qty, priceType }]
    })
  }

  const updateQty = (productId, priceType, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => !(i.productId === productId && i.priceType === priceType)))
    } else {
      setItems(prev => prev.map(i =>
        i.productId === productId && i.priceType === priceType ? { ...i, qty } : i
      ))
    }
  }

  const removeItem = (productId, priceType) => {
    setItems(prev => prev.filter(i => !(i.productId === productId && i.priceType === priceType)))
  }

  const clearCart = () => setItems([])
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

// ============================================================
// SHARED COMPONENTS
// ============================================================
function Badge({ children, variant = 'default' }) {
  const colors = {
    default: { bg: 'var(--gray-100)', color: 'var(--gray-700)' },
    blue: { bg: 'var(--blue-light)', color: 'var(--blue)' },
    green: { bg: 'var(--green-light)', color: 'var(--green)' },
    red: { bg: 'var(--red-light)', color: 'var(--red)' },
    amber: { bg: 'var(--amber-light)', color: 'var(--amber)' },
  }
  const c = colors[variant] || colors.default
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 10px',
      borderRadius: '100px', fontSize: '12px', fontWeight: 600,
      background: c.bg, color: c.color, letterSpacing: '0.02em',
    }}>
      {children}
    </span>
  )
}

function StatusBadge({ status }) {
  const map = {
    processing: { label: 'Processing', variant: 'blue' },
    shipped: { label: 'Shipped', variant: 'amber' },
    delivered: { label: 'Delivered', variant: 'green' },
    cancelled: { label: 'Cancelled', variant: 'red' },
    pending: { label: 'Pending', variant: 'default' },
  }
  const s = map[status] || map.pending
  return <Badge variant={s.variant}>{s.label}</Badge>
}

function Btn({ children, variant = 'primary', size = 'md', onClick, style, disabled, type = 'button' }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    fontWeight: 600, borderRadius: 'var(--radius-md)', transition: 'all 0.15s',
    opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto',
  }
  const sizes = {
    sm: { padding: '6px 14px', fontSize: '13px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '14px 28px', fontSize: '15px' },
  }
  const variants = {
    primary: { background: 'var(--black)', color: 'var(--white)' },
    secondary: { background: 'var(--gray-100)', color: 'var(--gray-800)' },
    outline: { background: 'transparent', color: 'var(--gray-800)', border: '1px solid var(--gray-200)' },
    danger: { background: 'var(--red)', color: 'var(--white)' },
    ghost: { background: 'transparent', color: 'var(--gray-600)' },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
    >
      {children}
    </button>
  )
}

function Input({ label, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-700)' }}>{label}</label>}
      <input
        {...props}
        style={{
          padding: '10px 14px', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)',
          fontSize: '14px', outline: 'none', transition: 'border 0.15s', background: 'var(--white)',
          ...props.style,
        }}
      />
    </div>
  )
}

// ============================================================
// CUSTOMER STOREFRONT
// ============================================================
function CustomerStore() {
  const [products] = useState(DEMO_PRODUCTS.filter(p => p.active))
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showCart, setShowCart] = useState(false)
  const cart = useContext(CartContext)

  const categories = ['All', ...new Set(products.map(p => p.category))]
  const filtered = products.filter(p => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  if (selectedProduct) {
    return <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} priceType="retail" />
  }

  if (showCart) {
    return <CartView onBack={() => setShowCart(false)} priceType="retail" />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--white)', borderBottom: '1px solid var(--gray-200)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '16px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Droplets size={28} style={{ color: 'var(--blue)' }} />
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
                SUPER PURE WATER
              </h1>
              <p style={{ fontSize: '11px', color: 'var(--gray-500)', letterSpacing: '0.1em', fontWeight: 500 }}>
                PREMIUM HYDRATION
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/login" style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: 500 }}>
              Wholesale Login
            </Link>
            <button
              onClick={() => setShowCart(true)}
              style={{
                position: 'relative', display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', background: 'var(--black)', color: 'var(--white)',
                borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600,
              }}
            >
              <ShoppingCart size={18} />
              Cart
              {cart.count > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  background: 'var(--blue)', color: 'var(--white)',
                  borderRadius: '100px', width: '20px', height: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700,
                }}>
                  {cart.count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0066FF 0%, #0044AA 100%)',
        padding: '60px 24px', textAlign: 'center', color: 'var(--white)',
      }}>
        <h2 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '12px' }}>
          Pure Water. Pure Life.
        </h2>
        <p style={{ fontSize: '18px', opacity: 0.85, maxWidth: '500px', margin: '0 auto' }}>
          Premium purified water and branded merchandise. Delivered fresh to your door.
        </p>
      </section>

      {/* Filters */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px 10px 38px',
                border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)',
                fontSize: '14px', outline: 'none', background: 'var(--white)',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600,
                  background: selectedCategory === cat ? 'var(--black)' : 'var(--white)',
                  color: selectedCategory === cat ? 'var(--white)' : 'var(--gray-600)',
                  border: selectedCategory === cat ? 'none' : '1px solid var(--gray-200)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '24px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px',
      }}>
        {filtered.map(product => (
          <div
            key={product.id}
            style={{
              background: 'var(--white)', borderRadius: 'var(--radius-lg)',
              overflow: 'hidden', border: '1px solid var(--gray-200)',
              transition: 'box-shadow 0.2s', cursor: 'pointer',
            }}
            onClick={() => setSelectedProduct(product)}
            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{
              height: '220px', background: 'var(--gray-100)', overflow: 'hidden',
            }}>
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '16px' }}>
              <Badge>{product.category}</Badge>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginTop: '8px', lineHeight: 1.3, color: 'var(--gray-900)' }}>
                {product.name}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px', lineHeight: 1.4 }}>
                {product.description.slice(0, 80)}...
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gray-900)' }}>
                  {fmt(product.retailPrice)}
                </span>
                <Btn
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    cart.addItem(product, 1, 'retail')
                  }}
                >
                  Add to Cart
                </Btn>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer style={{
        background: 'var(--gray-900)', color: 'var(--gray-400)', padding: '40px 24px',
        textAlign: 'center', marginTop: '40px',
      }}>
        <p style={{ fontSize: '13px' }}>
          Super Pure Water &copy; 2026. Powered by Create & Source.
        </p>
      </footer>
    </div>
  )
}

// ============================================================
// PRODUCT DETAIL
// ============================================================
function ProductDetail({ product, onBack, priceType }) {
  const cart = useContext(CartContext)
  const [qty, setQty] = useState(1)
  const price = priceType === 'wholesale' ? product.wholesalePrice : product.retailPrice

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <div style={{
        maxWidth: '900px', margin: '0 auto', padding: '40px 24px',
      }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gray-500)', fontSize: '14px', fontWeight: 500, marginBottom: '24px' }}>
          <ArrowLeft size={16} /> Back to products
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--gray-200)' }}>
          <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--gray-100)' }}>
            <img src={product.image} alt={product.name} style={{ width: '100%', height: '400px', objectFit: 'cover' }} />
          </div>
          <div>
            <Badge>{product.category}</Badge>
            <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '12px', lineHeight: 1.2, color: 'var(--gray-900)' }}>
              {product.name}
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--gray-600)', marginTop: '12px', lineHeight: 1.6 }}>
              {product.description}
            </p>
            <div style={{ marginTop: '20px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--gray-900)' }}>{fmt(price)}</span>
              {priceType === 'wholesale' && (
                <span style={{ fontSize: '14px', color: 'var(--gray-400)', marginLeft: '8px', textDecoration: 'line-through' }}>
                  {fmt(product.retailPrice)}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', border: '1px solid var(--gray-200)',
                borderRadius: 'var(--radius-md)', overflow: 'hidden',
              }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ padding: '10px 14px', borderRight: '1px solid var(--gray-200)' }}>
                  <Minus size={16} />
                </button>
                <span style={{ padding: '10px 20px', fontWeight: 600, minWidth: '50px', textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} style={{ padding: '10px 14px', borderLeft: '1px solid var(--gray-200)' }}>
                  <Plus size={16} />
                </button>
              </div>
              <Btn size="lg" onClick={() => { cart.addItem(product, qty, priceType); onBack() }} style={{ flex: 1 }}>
                <ShoppingCart size={18} /> Add to Cart — {fmt(price * qty)}
              </Btn>
            </div>
            <div style={{ marginTop: '24px', padding: '16px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--gray-600)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>SKU</span><span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{product.sku}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Source</span><span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{product.source}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Availability</span>
                <span style={{ fontWeight: 600, color: product.stock > 0 ? 'var(--green)' : 'var(--red)' }}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// CART VIEW
// ============================================================
function CartView({ onBack, priceType }) {
  const cart = useContext(CartContext)
  const [orderPlaced, setOrderPlaced] = useState(false)

  if (orderPlaced) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', background: 'var(--green-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          }}>
            <Check size={32} style={{ color: 'var(--green)' }} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)' }}>Order Placed!</h2>
          <p style={{ color: 'var(--gray-500)', marginTop: '8px' }}>Thank you for your order. You will receive a confirmation email shortly.</p>
          <Btn onClick={() => { cart.clearCart(); onBack() }} style={{ marginTop: '24px' }}>Continue Shopping</Btn>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gray-500)', fontSize: '14px', fontWeight: 500, marginBottom: '24px' }}>
          <ArrowLeft size={16} /> Back to products
        </button>
        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--gray-900)' }}>
          Your Cart
        </h1>
        {cart.items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
            <ShoppingCart size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontSize: '16px', fontWeight: 500 }}>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cart.items.map(item => (
                <div key={item.productId + item.priceType} style={{
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                  background: 'var(--white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)',
                }}>
                  <img src={item.image} alt="" style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-900)' }}>{item.name}</p>
                    <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{fmt(item.price)} each</p>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                  }}>
                    <button onClick={() => cart.updateQty(item.productId, item.priceType, item.qty - 1)} style={{ padding: '6px 10px' }}>
                      <Minus size={14} />
                    </button>
                    <span style={{ padding: '6px 12px', fontWeight: 600, fontSize: '13px' }}>{item.qty}</span>
                    <button onClick={() => cart.updateQty(item.productId, item.priceType, item.qty + 1)} style={{ padding: '6px 10px' }}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 700, minWidth: '70px', textAlign: 'right' }}>
                    {fmt(item.price * item.qty)}
                  </span>
                  <button onClick={() => cart.removeItem(item.productId, item.priceType)} style={{ color: 'var(--gray-400)' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: '24px', padding: '20px', background: 'var(--white)',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: 'var(--gray-500)' }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>{fmt(cart.total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ color: 'var(--gray-500)' }}>Shipping</span>
                <span style={{ fontWeight: 600, color: 'var(--green)' }}>Free</span>
              </div>
              <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '16px', fontWeight: 700 }}>Total</span>
                <span style={{ fontSize: '20px', fontWeight: 800 }}>{fmt(cart.total)}</span>
              </div>
              <Btn size="lg" onClick={() => setOrderPlaced(true)} style={{ width: '100%', marginTop: '16px' }}>
                <CreditCard size={18} /> Place Order
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ============================================================
// LOGIN PAGE
// ============================================================
function LoginPage() {
  const { login, user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [role, setRole] = useState('owner')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/wholesale')
  }, [user])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const success = login(role, password)
    if (success) {
      navigate(role === 'admin' ? '/admin' : '/wholesale')
    } else {
      setError('Invalid password')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--gray-50)',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px', padding: '40px', background: 'var(--white)',
        borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Droplets size={36} style={{ color: 'var(--blue)', margin: '0 auto 12px' }} />
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)' }}>Super Pure Water</h1>
          <p style={{ fontSize: '14px', color: 'var(--gray-500)', marginTop: '4px' }}>Sign in to your portal</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: '6px' }}>Portal</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setRole('owner')}
                style={{
                  flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600,
                  background: role === 'owner' ? 'var(--black)' : 'var(--gray-100)',
                  color: role === 'owner' ? 'var(--white)' : 'var(--gray-600)',
                  border: role === 'owner' ? 'none' : '1px solid var(--gray-200)',
                }}
              >
                Owner (Kris)
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                style={{
                  flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600,
                  background: role === 'admin' ? 'var(--black)' : 'var(--gray-100)',
                  color: role === 'admin' ? 'var(--white)' : 'var(--gray-600)',
                  border: role === 'admin' ? 'none' : '1px solid var(--gray-200)',
                }}
              >
                Admin (Tovah)
              </button>
            </div>
          </div>
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          {error && <p style={{ color: 'var(--red)', fontSize: '13px', marginTop: '8px' }}>{error}</p>}
          <Btn type="submit" size="lg" style={{ width: '100%', marginTop: '20px' }}>Sign In</Btn>
        </form>
        <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--gray-500)' }}>
          Back to store
        </Link>
      </div>
    </div>
  )
}

// ============================================================
// OWNER PORTAL (KRIS)
// ============================================================
function OwnerPortal() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [page, setPage] = useState('products')
  const [products] = useState(DEMO_PRODUCTS.filter(p => p.active))
  const [orders] = useState(DEMO_ORDERS.filter(o => o.type === 'wholesale'))
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showCart, setShowCart] = useState(false)
  const cart = useContext(CartContext)

  if (!user || user.role !== 'owner') return <Navigate to="/login" />

  if (selectedProduct) {
    return <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} priceType="wholesale" />
  }

  if (showCart) {
    return <CartView onBack={() => setShowCart(false)} priceType="wholesale" />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--white)', borderBottom: '1px solid var(--gray-200)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '14px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Droplets size={24} style={{ color: 'var(--blue)' }} />
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: 800, lineHeight: 1 }}>SUPER PURE WATER</h1>
              <p style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: 500 }}>WHOLESALE PORTAL</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Welcome, {user.name}</span>
            <button
              onClick={() => setShowCart(true)}
              style={{
                position: 'relative', display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', background: 'var(--black)', color: 'var(--white)',
                borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600,
              }}
            >
              <ShoppingCart size={16} />
              {cart.count > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  background: 'var(--blue)', color: 'var(--white)',
                  borderRadius: '100px', width: '18px', height: '18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700,
                }}>
                  {cart.count}
                </span>
              )}
            </button>
            <button onClick={() => { logout(); navigate('/') }} style={{ color: 'var(--gray-400)' }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 24px 0' }}>
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--gray-200)' }}>
          {[
            { key: 'products', label: 'Products', icon: <Package size={16} /> },
            { key: 'orders', label: 'My Orders', icon: <Truck size={16} /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setPage(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 18px', fontSize: '13px', fontWeight: 600,
                color: page === tab.key ? 'var(--gray-900)' : 'var(--gray-500)',
                borderBottom: page === tab.key ? '2px solid var(--black)' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {page === 'products' && (
          <>
            <div style={{
              background: 'linear-gradient(135deg, #0066FF 0%, #0044AA 100%)',
              borderRadius: 'var(--radius-lg)', padding: '32px', color: 'var(--white)', marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Wholesale Pricing</h2>
              <p style={{ fontSize: '14px', opacity: 0.85 }}>Order at wholesale prices. Minimum quantities may apply.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {products.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  style={{
                    background: 'var(--white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                    border: '1px solid var(--gray-200)', cursor: 'pointer', transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{ height: '180px', overflow: 'hidden', background: 'var(--gray-100)' }}>
                    <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '16px' }}>
                    <Badge>{p.source}</Badge>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, marginTop: '8px', color: 'var(--gray-900)' }}>{p.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--blue)' }}>{fmt(p.wholesalePrice)}</span>
                      <span style={{ fontSize: '13px', color: 'var(--gray-400)', textDecoration: 'line-through' }}>{fmt(p.retailPrice)}</span>
                      <Badge variant="green">Save {pct(p.wholesalePrice, p.retailPrice)}</Badge>
                    </div>
                    <Btn
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); cart.addItem(p, 1, 'wholesale') }}
                      style={{ width: '100%', marginTop: '12px' }}
                    >
                      Add to Cart
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {page === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gray-900)' }}>Order History</h2>
            {orders.length === 0 ? (
              <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '40px' }}>No orders yet</p>
            ) : (
              orders.map(order => (
                <div key={order.id} style={{
                  background: 'var(--white)', borderRadius: 'var(--radius-md)',
                  padding: '20px', border: '1px solid var(--gray-200)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)' }}>{order.id}</span>
                      <span style={{ fontSize: '13px', color: 'var(--gray-400)', marginLeft: '12px' }}>{order.date}</span>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--gray-600)', padding: '4px 0' }}>
                      <span>{item.name} x{item.qty}</span>
                      <span style={{ fontWeight: 600 }}>{fmt(item.price * item.qty)}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid var(--gray-100)', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700 }}>Total</span>
                    <span style={{ fontWeight: 800, fontSize: '16px' }}>{fmt(order.total)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// ADMIN PORTAL (TOVAH)
// ============================================================
function AdminPortal() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [page, setPage] = useState('dashboard')
  const [products, setProducts] = useState(DEMO_PRODUCTS)
  const [orders] = useState(DEMO_ORDERS)
  const [showCost, setShowCost] = useState(true)
  const [editingProduct, setEditingProduct] = useState(null)

  if (!user || user.role !== 'admin') return <Navigate to="/login" />

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
  const totalCost = orders.reduce((s, o) => {
    return s + o.items.reduce((is, item) => {
      const prod = products.find(p => p.id === item.productId)
      return is + (prod ? prod.costPrice * item.qty : 0)
    }, 0)
  }, 0)
  const totalProfit = totalRevenue - totalCost

  const sidebarItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} /> },
    { key: 'products', label: 'Products', icon: <Package size={18} /> },
    { key: 'orders', label: 'Orders', icon: <Truck size={18} /> },
    { key: 'pricing', label: 'Pricing', icon: <DollarSign size={18} /> },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px', background: 'var(--gray-900)', color: 'var(--white)',
        padding: '20px 0', display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Droplets size={22} style={{ color: 'var(--blue)' }} />
            <div>
              <h1 style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.02em' }}>SUPER PURE</h1>
              <p style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '0.08em' }}>ADMIN PANEL</p>
            </div>
          </div>
        </div>
        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {sidebarItems.map(item => (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 500,
                color: page === item.key ? 'var(--white)' : 'rgba(255,255,255,0.5)',
                background: page === item.key ? 'rgba(255,255,255,0.08)' : 'transparent',
                marginBottom: '2px', textAlign: 'left',
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '12px', opacity: 0.5, marginBottom: '4px' }}>Signed in as</div>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>{user.name}</div>
          <button
            onClick={() => { logout(); navigate('/') }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '10px' }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, background: 'var(--gray-50)', overflow: 'auto' }}>
        <div style={{ padding: '32px' }}>
          {/* Dashboard */}
          {page === 'dashboard' && (
            <>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '24px' }}>Dashboard</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                {[
                  { label: 'Total Revenue', value: fmt(totalRevenue), icon: <DollarSign size={20} />, color: 'var(--blue)' },
                  { label: 'Your Cost', value: fmt(totalCost), icon: <ShoppingBag size={20} />, color: 'var(--amber)' },
                  { label: 'Profit', value: fmt(totalProfit), icon: <BarChart3 size={20} />, color: 'var(--green)' },
                  { label: 'Total Orders', value: orders.length, icon: <Package size={20} />, color: 'var(--gray-600)' },
                ].map((stat, i) => (
                  <div key={i} style={{
                    background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '20px',
                    border: '1px solid var(--gray-200)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: 500 }}>{stat.label}</span>
                      <div style={{ color: stat.color }}>{stat.icon}</div>
                    </div>
                    <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--gray-900)' }}>{stat.value}</span>
                  </div>
                ))}
              </div>

              <div style={{
                background: 'var(--white)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--gray-200)', overflow: 'hidden',
              }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)' }}>Recent Orders</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      {['Order', 'Customer', 'Type', 'Total', 'Your Cost', 'Profit', 'Status'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => {
                      const cost = order.items.reduce((s, item) => {
                        const prod = products.find(p => p.id === item.productId)
                        return s + (prod ? prod.costPrice * item.qty : 0)
                      }, 0)
                      const profit = order.total - cost
                      return (
                        <tr key={order.id} style={{ borderBottom: '1px solid var(--gray-50)' }}>
                          <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>{order.id}</td>
                          <td style={{ padding: '12px 16px', fontSize: '13px' }}>{order.customer}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <Badge variant={order.type === 'wholesale' ? 'blue' : 'default'}>
                              {order.type}
                            </Badge>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>{fmt(order.total)}</td>
                          <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--amber)' }}>{fmt(cost)}</td>
                          <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: 'var(--green)' }}>{fmt(profit)}</td>
                          <td style={{ padding: '12px 16px' }}><StatusBadge status={order.status} /></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Products */}
          {page === 'products' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)' }}>Products</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Btn variant="outline" size="sm" onClick={() => setShowCost(!showCost)}>
                    {showCost ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showCost ? 'Hide Costs' : 'Show Costs'}
                  </Btn>
                </div>
              </div>
              <div style={{
                background: 'var(--white)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--gray-200)', overflow: 'hidden',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      {['Product', 'SKU', 'Source', showCost ? 'Your Cost' : null, 'Wholesale (Kris)', 'Retail', showCost ? 'Kris Margin' : null, showCost ? 'Retail Margin' : null, 'Stock'].filter(Boolean).map(h => (
                        <th key={h} style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 600, color: 'var(--gray-500)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--gray-50)' }}>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={p.image} alt="" style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-900)' }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--gray-500)', fontFamily: 'monospace' }}>{p.sku}</td>
                        <td style={{ padding: '12px 14px' }}><Badge variant={p.source === 'Printify' ? 'blue' : 'green'}>{p.source}</Badge></td>
                        {showCost && <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--red)' }}>{fmt(p.costPrice)}</td>}
                        <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--blue)' }}>{fmt(p.wholesalePrice)}</td>
                        <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600 }}>{fmt(p.retailPrice)}</td>
                        {showCost && <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--green)' }}>{pct(p.costPrice, p.wholesalePrice)}</td>}
                        {showCost && <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--green)' }}>{pct(p.costPrice, p.retailPrice)}</td>}
                        <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600 }}>{p.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Orders */}
          {page === 'orders' && (
            <>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '24px' }}>All Orders</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {orders.map(order => {
                  const cost = order.items.reduce((s, item) => {
                    const prod = products.find(p => p.id === item.productId)
                    return s + (prod ? prod.costPrice * item.qty : 0)
                  }, 0)
                  return (
                    <div key={order.id} style={{
                      background: 'var(--white)', borderRadius: 'var(--radius-md)',
                      padding: '20px', border: '1px solid var(--gray-200)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)' }}>{order.id}</span>
                          <Badge variant={order.type === 'wholesale' ? 'blue' : 'default'}>{order.type}</Badge>
                          <StatusBadge status={order.status} />
                        </div>
                        <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>{order.date}</span>
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '12px' }}>
                        <strong>{order.customer}</strong> &middot; {order.email}
                      </div>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--gray-600)', padding: '4px 0' }}>
                          <span>{item.name} x{item.qty}</span>
                          <span style={{ fontWeight: 600 }}>{fmt(item.price * item.qty)}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid var(--gray-100)', marginTop: '12px', paddingTop: '12px', display: 'flex', gap: '24px' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue</span>
                          <div style={{ fontSize: '16px', fontWeight: 800 }}>{fmt(order.total)}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cost</span>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--amber)' }}>{fmt(cost)}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profit</span>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--green)' }}>{fmt(order.total - cost)}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Pricing */}
          {page === 'pricing' && (
            <>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '8px' }}>Pricing Manager</h2>
              <p style={{ fontSize: '14px', color: 'var(--gray-500)', marginBottom: '24px' }}>
                View all three pricing tiers. Edit wholesale and retail prices for each product.
              </p>
              <div style={{
                background: 'var(--white)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--gray-200)', overflow: 'hidden',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      {['Product', 'Your Cost (Printify/FE)', 'You Charge Kris', 'Your Margin', 'Kris Charges Customers', 'Kris Margin', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 600, color: 'var(--gray-500)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => {
                      const isEditing = editingProduct === p.id
                      return (
                        <PricingRow
                          key={p.id}
                          product={p}
                          isEditing={isEditing}
                          onEdit={() => setEditingProduct(p.id)}
                          onSave={(updates) => {
                            setProducts(prev => prev.map(prod =>
                              prod.id === p.id ? { ...prod, ...updates } : prod
                            ))
                            setEditingProduct(null)
                          }}
                          onCancel={() => setEditingProduct(null)}
                        />
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{
                marginTop: '24px', padding: '20px', background: 'var(--white)',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)',
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--gray-900)' }}>How Pricing Works</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'var(--red-light)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Your Cost</div>
                    <div style={{ fontSize: '13px', color: 'var(--gray-700)' }}>What Printify or Fulfill Engine charges you. Only you see this.</div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--blue-light)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Wholesale (Kris)</div>
                    <div style={{ fontSize: '13px', color: 'var(--gray-700)' }}>What you charge Kris. This is your markup on cost.</div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--green-light)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Retail Price</div>
                    <div style={{ fontSize: '13px', color: 'var(--gray-700)' }}>What end customers pay. Set by you or Kris.</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

// ============================================================
// PRICING ROW (EDITABLE)
// ============================================================
function PricingRow({ product, isEditing, onEdit, onSave, onCancel }) {
  const [wholesale, setWholesale] = useState(product.wholesalePrice)
  const [retail, setRetail] = useState(product.retailPrice)

  const yourMargin = ((wholesale - product.costPrice) / product.costPrice * 100).toFixed(0)
  const krisMargin = ((retail - wholesale) / wholesale * 100).toFixed(0)

  return (
    <tr style={{ borderBottom: '1px solid var(--gray-50)' }}>
      <td style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={product.image} alt="" style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-900)' }}>{product.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{product.sku}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 700, color: 'var(--red)' }}>
        {fmt(product.costPrice)}
      </td>
      <td style={{ padding: '12px 14px' }}>
        {isEditing ? (
          <input
            type="number"
            step="0.01"
            value={wholesale}
            onChange={(e) => setWholesale(parseFloat(e.target.value) || 0)}
            style={{
              width: '80px', padding: '6px 8px', border: '1px solid var(--blue)',
              borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600,
            }}
          />
        ) : (
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--blue)' }}>{fmt(product.wholesalePrice)}</span>
        )}
      </td>
      <td style={{ padding: '12px 14px' }}>
        <Badge variant={Number(yourMargin) > 0 ? 'green' : 'red'}>{yourMargin}%</Badge>
      </td>
      <td style={{ padding: '12px 14px' }}>
        {isEditing ? (
          <input
            type="number"
            step="0.01"
            value={retail}
            onChange={(e) => setRetail(parseFloat(e.target.value) || 0)}
            style={{
              width: '80px', padding: '6px 8px', border: '1px solid var(--green)',
              borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600,
            }}
          />
        ) : (
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gray-900)' }}>{fmt(product.retailPrice)}</span>
        )}
      </td>
      <td style={{ padding: '12px 14px' }}>
        <Badge variant={Number(krisMargin) > 0 ? 'green' : 'red'}>{krisMargin}%</Badge>
      </td>
      <td style={{ padding: '12px 14px' }}>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => onSave({ wholesalePrice: wholesale, retailPrice: retail })} style={{ color: 'var(--green)' }}><Check size={16} /></button>
            <button onClick={onCancel} style={{ color: 'var(--red)' }}><X size={16} /></button>
          </div>
        ) : (
          <button onClick={onEdit} style={{ color: 'var(--gray-400)' }}><Edit2 size={14} /></button>
        )}
      </td>
    </tr>
  )
}

// ============================================================
// APP ROUTER
// ============================================================
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CustomerStore />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/wholesale" element={<OwnerPortal />} />
      <Route path="/admin" element={<AdminPortal />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
