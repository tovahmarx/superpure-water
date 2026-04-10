import { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom'
import { ShoppingCart, Plus, Minus, Trash2, LogOut, Package, DollarSign, Users, BarChart3, Eye, EyeOff, Settings, ChevronRight, Search, Filter, ArrowLeft, Check, X, Edit2, Save, Droplets, ShoppingBag, Truck, CreditCard, Menu, Loader } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import COLOR_IMAGES from './colorImages.js'
import './App.css'

// ============================================================
// SUPABASE CLIENT
// ============================================================
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
)

// ============================================================
// CONTEXT
// ============================================================
const AuthContext = createContext(null)
const CartContext = createContext(null)
const CreditContext = createContext(null)

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < breakpoint)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    setIsMobile(mq.matches)
    return () => mq.removeEventListener('change', handler)
  }, [breakpoint])
  return isMobile
}

// ============================================================
// REAL PRODUCT DATA — From Fulfill Engine Super Pure Water Store
// Campaign: 1ee36d04-dcd2-4568-8b37-794f077a1f5f
// Account: act-9679744
// ============================================================
const INITIAL_PRODUCTS = [
  { id: "65775645-66b3-4a5b-833a-9cec72ab20a1", catalogProductId: "PST74", name: "Sport-Tek Wind Pant", description: "Whether worn alone or with a Sport-Tek wind shirt, these water-repellent pants provide lightweight protection.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-6412650-front-black-product.png", category: "Pants", costPrice: 24.70, wholesalePrice: 32.85, retailPrice: 41.72, sku: "PST74", source: "Fulfill Engine", active: true },
  { id: "94d1ffac-cd30-4115-8395-3522405aa10d", catalogProductId: "596807", name: "Puma Golf Men's Icon Quarter-Zip", description: "4.94 oz., 100% polyester moisture-wicking 4-way stretch ultra-lightweight contrast covered reverse coil zipper.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-9090780-front-quiet-shade-product.png", category: "Quarter-Zips", costPrice: 35.75, wholesalePrice: 47.55, retailPrice: 54.0, sku: "596807", source: "Fulfill Engine", active: true },
  { id: "3de311b9-8f1d-4264-920d-3ca62893c4f6", catalogProductId: "CN9492", name: "Nike Therma-FIT 1/4-Zip Fleece", description: "Year-round workout essential with incredibly warm, insulating Therma-FIT fabric which breathes and manages moisture.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-1223464-front-team-anthracite-product.png", category: "Quarter-Zips", costPrice: 47.75, wholesalePrice: 63.51, retailPrice: 70.0, sku: "CN9492", source: "Fulfill Engine", active: true },
  { id: "65e52044-05d9-4e61-ad8e-eaacc615d7c3", catalogProductId: "TS7X2M", name: "Russell Athletic Dri-Power Essential 10\" Shorts", description: "4.1 oz., 100% polyester Dri-Power moisture management with odor protection and covered elastic waistband.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-8309125-front-black-product.png", category: "Shorts", costPrice: 20.20, wholesalePrice: 26.87, retailPrice: 34.12, sku: "TS7X2M", source: "Fulfill Engine", active: true },
  { id: "07460ba0-ca8f-49e9-bc42-fb97fdca50c7", catalogProductId: "651AFM", name: "Russell Athletic 9\" Dri-Power Mesh Shorts", description: "2.8 oz., 100% polyester mesh Dri-Power moisture management with covered elastic waistband.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-3303865-front-black-product.png", category: "Shorts", costPrice: 19.50, wholesalePrice: 25.94, retailPrice: 32.94, sku: "651AFM", source: "Fulfill Engine", active: true },
  { id: "7a068fc5-0f94-465a-905c-158f65c59ccd", catalogProductId: "PC78J", name: "Port & Company Core Fleece Jogger", description: "Cozy joggers in our core weight. 7.8-ounce, 50/50 cotton/poly fleece with removable tag.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-4315778-front-athletic-heather-product.png", category: "Pants", costPrice: 19.05, wholesalePrice: 25.34, retailPrice: 32.18, sku: "PC78J", source: "Fulfill Engine", active: true },
  { id: "b70f4613-f2d7-4657-a8b0-774e34aaa336", catalogProductId: "DT6107", name: "District V.I.T. Fleece Jogger", description: "An ideal canvas for decorators, these soft joggers are everything and more at an unbeatable value.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-9455438-front-light-heather-grey-product.png", category: "Pants", costPrice: 22.35, wholesalePrice: 29.73, retailPrice: 37.76, sku: "DT6107", source: "Fulfill Engine", active: true },
  { id: "d4bcad88-d6e4-410a-82a6-ffd7b9032894", catalogProductId: "ST443", name: "Sport-Tek Club 1/4-Zip Pullover", description: "4.4-ounce, 100% recycled polyester interlock with PosiCharge technology.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-7648137-front-black--deep-red-product.png", category: "Quarter-Zips", costPrice: 18.75, wholesalePrice: 24.94, retailPrice: 31.67, sku: "ST443", source: "Fulfill Engine", active: true },
  { id: "b261913e-84b3-4fe1-8a14-5de66fa0a441", catalogProductId: "426500", name: "Badger Sport On The Rise 1/4 Zip Pullover", description: "A lightweight quarter zip built for teams, featuring moisture-wicking fabric and forward shoulder seams.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-894689-front-black--white-product.png", category: "Quarter-Zips", costPrice: 19.70, wholesalePrice: 26.2, retailPrice: 33.27, sku: "426500", source: "Fulfill Engine", active: true },
  { id: "e1cde862-44ee-4b07-b05e-f0477f7bb07f", catalogProductId: "IND4000", name: "Independent Trading Co. Heavyweight Hoodie", description: "80/20 cotton/polyester blend 3-end fleece with 100% cotton face, generous fit, fleece lined hood.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-7713044-front-tiger-camo-product.png", category: "Hoodies", costPrice: 34.60, wholesalePrice: 46.02, retailPrice: 55.0, sku: "IND4000", source: "Fulfill Engine", active: true },
  { id: "c28036eb-ab06-4f74-b7f5-18e1526003c0", catalogProductId: "NKAO9293", name: "Nike Stretch-to-Fit Mesh Back Cap", description: "Comfort, style and function converge. 83/14/3 nylon/cotton/spandex, structured, mid-profile.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-4985775-front-white--white-product.png", category: "Hats", costPrice: 25.40, wholesalePrice: 33.78, retailPrice: 42.9, sku: "NKAO9293", source: "Fulfill Engine", active: true },
  { id: "40a827e5-4d5d-42a6-8c52-0764c36df32d", catalogProductId: "NKDC1963", name: "Nike Dri-FIT Micro Pique 2.0 Polo", description: "The best-selling Nike polo with updated design lines and Dri-FIT moisture management technology.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-4524406-front-white-product.png", category: "Polos", costPrice: 33.65, wholesalePrice: 44.75, retailPrice: 56.83, sku: "NKDC1963", source: "Fulfill Engine", active: true },
  { id: "2ebe2108-6ec6-46a4-9e54-5cac7386d253", catalogProductId: "NKDC1991", name: "Nike Ladies Dri-FIT Micro Pique 2.0 Polo", description: "The best-selling Nike polo for women with soft, stretchable micro pique fabric.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-7493676-front-black-product.png", category: "Polos", costPrice: 33.65, wholesalePrice: 44.75, retailPrice: 56.83, sku: "NKDC1991", source: "Fulfill Engine", active: true },
  { id: "ed197e7c-16f7-43b1-b4d4-9c74ad80ab0b", catalogProductId: "AT304", name: "Adidas Men's D4T Woven 7\" Shorts", description: "3.7 oz., 100% recycled polyester, AEROREADY moisture-management with side vents.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-8314200-front-black--white-product.png", category: "Shorts", costPrice: 39.15, wholesalePrice: 52.07, retailPrice: 60.0, sku: "AT304", source: "Fulfill Engine", active: true },
  { id: "366b8c1a-d5df-444d-8588-af62fd7b3f1b", catalogProductId: "R20SWM", name: "Russell Athletic Legend Woven Shorts", description: "Polyester with 4-way stretch, water-repellent finish, covered elastic waistband with internal drawcord.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-3359975-front-black-product.png", category: "Shorts", costPrice: 30.10, wholesalePrice: 40.03, retailPrice: 50.84, sku: "R20SWM", source: "Fulfill Engine", active: true },
  { id: "9d1ba28f-4b40-464e-9ed9-d4c8971cc93b", catalogProductId: "S162", name: "Champion Polyester Mesh 9\" Shorts", description: "Champion mesh shorts with pockets, athletic performance fit.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-8203175-front-athletic-grey-product.png", category: "Shorts", costPrice: 20.30, wholesalePrice: 27.0, retailPrice: 34.29, sku: "S162", source: "Fulfill Engine", active: true },
  { id: "bf2c31a9-670e-4d58-a19f-7754720d5b59", catalogProductId: "RW26", name: "Champion Reverse Weave Shorts", description: "12 oz., 82/18 cotton/polyester fleece, double-needle stitched throughout, ribbed waistband with drawcord.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-6044878-front-black-product.png", category: "Shorts", costPrice: 32.35, wholesalePrice: 43.03, retailPrice: 54.65, sku: "RW26", source: "Fulfill Engine", active: true },
  { id: "43121382-86a5-4629-82cd-83eb34373088", catalogProductId: "AT315", name: "Adidas Men's Entrada 26 Shorts", description: "4.4 oz., 100% recycled polyester, CLIMACOOL moisture-management, elastic waistband with drawcord.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-1340385-front-black--white-product.png", category: "Shorts", costPrice: 18.20, wholesalePrice: 24.21, retailPrice: 30.75, sku: "AT315", source: "Fulfill Engine", active: true },
  { id: "72119eb5-d9f2-41e4-bf2d-5fa4a11f1a5c", catalogProductId: "L8869", name: "Cotton Canvas Tote", description: "11 oz., 100% cotton canvas with 24\" contrast handles, open front pocket, gusseted bottom.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-9284409-front-natural--black-product.png", category: "Bags", costPrice: 16.50, wholesalePrice: 21.95, retailPrice: 27.88, sku: "L8869", source: "Fulfill Engine", active: true },
  { id: "8762a9d5-b5ba-4cee-ac88-4c7c638021df", catalogProductId: "BG204", name: "Port Authority Backpack", description: "Classic backpack with large main compartment, laptop sleeve and zippered front pocket.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-4247333-front-blue-product.png", category: "Bags", costPrice: 21.10, wholesalePrice: 28.06, retailPrice: 35.64, sku: "BG204", source: "Fulfill Engine", active: true },
  { id: "474d12a6-59f2-4b93-b2c9-345c81790b44", catalogProductId: "BP20079-CO2", name: "40oz Tumbler", description: "Thor 40oz Eco-Friendly Straw Tumbler with durable double-wall construction, fits most cupholders.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-8769455-front-black-product.png", category: "Accessories", costPrice: 15.40, wholesalePrice: 20.48, retailPrice: 26.01, sku: "BP20079-CO2", source: "Fulfill Engine", active: true },
  { id: "6bb7b0cb-b77e-4ce5-809f-294699194199", catalogProductId: "BP20067", name: "Bluetooth Speaker", description: "Stark 2.0 Bluetooth Speaker, compact with up to 4.5 hours battery, IPX5 waterproof rated.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-6272724-front-black-product.png", category: "Accessories", costPrice: 18.20, wholesalePrice: 24.21, retailPrice: 30.75, sku: "BP20067", source: "Fulfill Engine", active: true },
  { id: "91662cd6-18dd-4793-b743-b711b7c2bcb8", catalogProductId: "BG938", name: "Port Authority Dual-Compartment Crossbody", description: "Smooth matte polyester with two zippered compartments and adjustable shoulder strap.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-2631985-front-deep-black-product.png", category: "Bags", costPrice: 16.65, wholesalePrice: 22.14, retailPrice: 28.12, sku: "BG938", source: "Fulfill Engine", active: true },
  { id: "9a50908e-405f-4eb6-931f-fe8521fecd29", catalogProductId: "6006", name: "Flat Bill Trucker Cap", description: "Classic Trucker hat, structured, five-panel, high-profile, 3.5\" crown, snapback closure.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-5583643-front-black-product.png", category: "Hats", costPrice: 16.85, wholesalePrice: 22.41, retailPrice: 28.46, sku: "6006", source: "Fulfill Engine", active: true },
  { id: "dad39c44-2032-49d7-b668-13d9dbd3f6a6", catalogProductId: "VC300A", name: "Dad Hat", description: "100% bio-washed chino twill, unstructured, six-panel, low-profile, buckle closure.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-3319311-front-black-product.png", category: "Hats", costPrice: 12.85, wholesalePrice: 17.09, retailPrice: 21.7, sku: "VC300A", source: "Fulfill Engine", active: true },
  { id: "3787264c-35c4-43e0-bc65-23e543ed9006", catalogProductId: "BG1050", name: "Medium Two-Tone Duffel", description: "600 denier polyester canvas with D-shaped zippered entry, front pocket with hook and loop closure.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-4631492-front-black--black-product.png", category: "Bags", costPrice: 22.90, wholesalePrice: 30.46, retailPrice: 38.68, sku: "BG1050", source: "Fulfill Engine", active: true },
  { id: "9871d311-2b4f-49f2-a94b-d303478cae98", catalogProductId: "K540", name: "Polo", description: "Silk Touch Performance Polo wicks moisture, resists snags with PosiCharge technology.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-6941853-front-teal-green-product.png", category: "Polos", costPrice: 17.55, wholesalePrice: 23.34, retailPrice: 29.64, sku: "K540", source: "Fulfill Engine", active: true },
  { id: "f4b9d451-ca8f-4360-b52a-8cdd8c2925fa", catalogProductId: "L573", name: "Ladies Polo", description: "Rapid Dry moisture-wicking mesh polo combining cotton feel with breathable performance.", image: "https://app.fulfillengine.com/images/1ee36d04-dcd2-4568-8b37-794f077a1f5f/super-pure-water/1ee36d04-dcd2-4568-8b37-794f077a1f5f-9791401-front-true-navy-product.png", category: "Polos", costPrice: 22.30, wholesalePrice: 29.66, retailPrice: 37.67, sku: "L573", source: "Fulfill Engine", active: true },
  // Printify Products
  { id: "69abc874a028393ce202a853", catalogProductId: "BC3719", name: "Bella+Canvas 3719 Hoodie", description: "Lightweight, lived-in comfort pullover hoodie, soft against the skin with a quiet, playful message.", image: "https://images-api.printify.com/mockup/69abc874a028393ce202a853/72023/16190/bellacanvas-3719.jpg?camera_label=front", category: "Hoodies", costPrice: 28.64, wholesalePrice: 38.09, retailPrice: 48.37, sku: "BC3719", source: "Printify", active: true },
  { id: "69abc732b360648baa01cd2d", catalogProductId: "G18500", name: "Gildan 18500 Hoodie", description: "Soft, midweight hoodie that feels like a warm embrace. Perfect for evening walks and slow mornings.", image: "https://images-api.printify.com/mockup/69abc732b360648baa01cd2d/32920/98424/gildan-18500.jpg?camera_label=front", category: "Hoodies", costPrice: 15.89, wholesalePrice: 21.13, retailPrice: 26.84, sku: "G18500", source: "Printify", active: true },
  { id: "69ab32d5d959867b0506f74a", catalogProductId: "BC3001", name: "Bella Canvas 3001 Tee", description: "A soft, breathable tee with clean water-themed design - bold blue lettering and a small drop icon.", image: "https://images-api.printify.com/mockup/69ab32d5d959867b0506f74a/18102/102044/bella-canvas-3001.jpg?camera_label=front-2", category: "Tees", costPrice: 13.79, wholesalePrice: 18.34, retailPrice: 27.0, sku: "BC3001-P", source: "Printify", active: true },
  { id: "69ab2f6fb360648baa01b3b3", catalogProductId: "NL6210", name: "Super Pure Water T-Shirt (Next Level 6210)", description: "Soft, lightweight tee with clean water-themed logo and subtle back text. CVC blend comfort.", image: "https://images-api.printify.com/mockup/69ab2f6fb360648baa01b3b3/100248/95837/super-pure-water-t-shirt-next-level-6210.jpg?camera_label=front", category: "Tees", costPrice: 13.59, wholesalePrice: 18.07, retailPrice: 27.0, sku: "NL6210-P", source: "Printify", active: true },
  { id: "69ab2e79c22eeedecc02a1f0", catalogProductId: "CC1717", name: "Comfort Colors 1717 Tee", description: "Garment-dyed tee with that perfectly broken-in feel. Fully customizable with Super Pure Water design.", image: "https://images-api.printify.com/mockup/69ab2e79c22eeedecc02a1f0/73204/98445/comfort-colors-1717.jpg?camera_label=front", category: "Tees", costPrice: 15.56, wholesalePrice: 20.69, retailPrice: 27.0, sku: "CC1717-P", source: "Printify", active: true },
]

// ============================================================
// PRODUCT VARIANTS — Sizes & Colors from FE + Printify APIs
// ============================================================
const PRODUCT_VARIANTS = {
  // FE Products
  "65775645-66b3-4a5b-833a-9cec72ab20a1": { sizes: ["X-Small","Small","Medium","Large","X-Large","XX-Large","XXX-Large","XXXX-Large"], colors: ["Black","True Navy","Graphite"] },
  "94d1ffac-cd30-4115-8395-3522405aa10d": { sizes: ["Small","Medium","Large","X-Large","XX-Large","XXX-Large","XXXX-Large"], colors: ["Quiet Shade","High Risk Red","Lapis Blue"] },
  "3de311b9-8f1d-4264-920d-3ca62893c4f6": { sizes: ["Small","Medium","Large","X-Large","XX-Large","XXX-Large"], colors: ["Team Anthracite","Team Black","Team Navy","Team Scarlet"] },
  "65e52044-05d9-4e61-ad8e-eaacc615d7c3": { sizes: ["Small","Medium","Large","X-Large","XX-Large","XXX-Large"], colors: ["Black","Cardinal","Dark Green","Maroon","Navy","Purple","Rock","Royal","Stealth","True Red"] },
  "07460ba0-ca8f-49e9-bc42-fb97fdca50c7": { sizes: ["Small","Medium","Large","X-Large","XX-Large","XXX-Large"], colors: ["Black","Burnt Orange","Dark Green","Maroon","Navy","Royal","Stealth","Steel","True Red","White"] },
  "7a068fc5-0f94-465a-905c-158f65c59ccd": { sizes: ["Small","Medium","Large","X-Large","XX-Large","XXX-Large","XXXX-Large"], colors: ["Athletic Heather","Dark Heather Grey","Jet Black","Navy"] },
  "b70f4613-f2d7-4657-a8b0-774e34aaa336": { sizes: ["X-Small","Small","Medium","Large","X-Large","XX-Large","XXX-Large","XXXX-Large"], colors: ["Light Heather Grey","Heathered Charcoal","Black","New Navy"] },
  "d4bcad88-d6e4-410a-82a6-ffd7b9032894": { sizes: ["X-Small","Small","Medium","Large","X-Large","XX-Large","XXX-Large","XXXX-Large"], colors: ["Black/ Deep Red","Black/ White","Iron Grey/ White","True Navy/ White"] },
  "b261913e-84b3-4fe1-8a14-5de66fa0a441": { sizes: ["Small","Medium","Large","X-Large","XX-Large","XXX-Large","XXXX-Large"], colors: ["Black/ White","Columbia Blue/ White","Burnt Orange/ White","Kelly/ White","Graphite/ White","Forest/ White","Navy/ White","Maroon/ White","Red/ White","Purple/ White","White/ Black","Royal/ White"] },
  "e1cde862-44ee-4b07-b05e-f0477f7bb07f": { sizes: ["X-Small","Small","Medium","Large","X-Large","XX-Large","XXX-Large"], colors: ["Black","Navy","Charcoal Heather","Grey Heather","Army","White","Royal","Red","Maroon","Saddle","Slate Blue","Bone","Sandstone","Alpine Green","Dusty Pink","Lavender","Mint","Storm Blue","Dusty Sage","Cement","Plum","Brown"] },
  "c28036eb-ab06-4f74-b7f5-18e1526003c0": { sizes: ["S/M","M/L","L/XL"], colors: ["White/ White","Cool Grey/ White","Team Red/ White","Navy/ White","Gym Blue/ White","Black/ White","Black/ Game Royal","Black/ Black","Anthracite/ White"] },
  "40a827e5-4d5d-42a6-8c52-0764c36df32d": { sizes: ["X-Small","Small","Medium","Large","X-Large","XX-Large","XXX-Large","XXXX-Large"], colors: ["White","Black","Navy","Cool Grey","Game Royal","Anthracite","University Red","Valor Blue","Gorge Green","Gym Blue","Brilliant Orange","Tidal Blue","Vivid Pink","Lucid Green","Court Purple","Blue Tint","Mint","Urban Lilac","Varsity Maize","Team Red"] },
  "2ebe2108-6ec6-46a4-9e54-5cac7386d253": { sizes: ["Small","Medium","Large","X-Large","XX-Large"], colors: ["Black","White","Navy","Cool Grey","Vivid Pink","Valor Blue","Anthracite","University Red","Tidal Blue","Gorge Green","Game Royal","Court Purple","Gym Blue","Brilliant Orange","Lucid Green","Blue Tint","Mint","Urban Lilac","Varsity Maize","Team Red"] },
  "ed197e7c-16f7-43b1-b4d4-9c74ad80ab0b": { sizes: ["Small","Medium","Large","X-Large","XX-Large","XXX-Large","XXXX-Large"], colors: ["Black/ White","Team Grey Four/ White","Team Power Red/ White","Team Royal Blue/ White"] },
  "366b8c1a-d5df-444d-8588-af62fd7b3f1b": { sizes: ["Small","Medium","Large","X-Large","XX-Large","XXX-Large","XXXX-Large"], colors: ["Black","Khaki","Navy","Stealth"] },
  "9d1ba28f-4b40-464e-9ed9-d4c8971cc93b": { sizes: ["Small","Medium","Large","X-Large","XX-Large"], colors: ["Athletic Grey","Athletic Royal"] },
  "bf2c31a9-670e-4d58-a19f-7754720d5b59": { sizes: ["Small","Medium","Large","X-Large","XX-Large","XXX-Large"], colors: ["Black","Navy","Oxford Grey"] },
  "43121382-86a5-4629-82cd-83eb34373088": { sizes: ["Small","Medium","Large","X-Large","XX-Large","XXX-Large"], colors: ["Black/ White"] },
  "72119eb5-d9f2-41e4-bf2d-5fa4a11f1a5c": { sizes: [], colors: ["Natural/ Black","Red","Natural/ Royal","Natural/ Forest"] },
  "8762a9d5-b5ba-4cee-ac88-4c7c638021df": { sizes: [], colors: ["Blue","Black","Charcoal","Green","Navy","Red"] },
  "474d12a6-59f2-4b93-b2c9-345c81790b44": { sizes: [], colors: ["Black","White","Blue","Lime","Orange","Navy","Red"] },
  "6bb7b0cb-b77e-4ce5-809f-294699194199": { sizes: [], colors: ["Black","Royal Blue"] },
  "91662cd6-18dd-4793-b743-b711b7c2bcb8": { sizes: [], colors: ["Deep Black","River Blue Navy","Sahara","Storm Grey"] },
  "9a50908e-405f-4eb6-931f-fe8521fecd29": { sizes: [], colors: ["Black","Charcoal/ Black","Charcoal/ White","Navy/ White","Navy","Red/ Black","Red","Royal/ White","White","Black/ White"] },
  "dad39c44-2032-49d7-b668-13d9dbd3f6a6": { sizes: [], colors: ["Black","White","Brown","Charcoal","Forest Green","Gold","Grey","Khaki","Maroon","Navy","Olive","Red","Royal","Stone"] },
  "3787264c-35c4-43e0-bc65-23e543ed9006": { sizes: [], colors: ["Black/ Black","Navy/ Black","Red/ Black","Royal/ Black"] },
  "9871d311-2b4f-49f2-a94b-d303478cae98": { sizes: ["XS","Small","Medium","Large","X-Large","XX-Large","XXX-Large","XXXX-Large"], colors: ["Black","White","Navy","Red","Royal","Dark Green","Maroon","Steel Grey","Carolina Blue","Teal Green","Bright Purple","Brilliant Blue","Gusty Grey","Lime","Neon Orange","Neon Yellow","Pink Raspberry","Parcel Blue"] },
  "f4b9d451-ca8f-4360-b52a-8cdd8c2925fa": { sizes: ["X-Small","Small","Medium","Large","X-Large","XX-Large","XXX-Large","XXXX-Large"], colors: ["Black","Engine Red","Grey Smoke","Skydiver Blue","True Navy"] },
  // Printify Products
  "69abc874a028393ce202a853": { sizes: ["XS","S","M","L","XL","2XL"], colors: ["White","Black","Gold","Forest","Athletic Heather","True Royal","Navy","Team Purple","Maroon"] },
  "69abc732b360648baa01cd2d": { sizes: ["S","M","L","XL","2XL","3XL","4XL","5XL"], colors: ["Ash","Black","Charcoal","Dark Heather","Forest Green","Graphite Heather","Heather Navy","Indigo Blue","Light Blue","Military Green","Sand","Sport Grey","White"] },
  "69ab32d5d959867b0506f74a": { sizes: ["XS","S","M","L","XL","2XL","3XL","4XL","5XL"], colors: ["Black"] },
  "69ab2f6fb360648baa01b3b3": { sizes: ["XS","S","M","L","XL","2XL","3XL","4XL","5XL"], colors: ["CVC Black"] },
  "69ab2e79c22eeedecc02a1f0": { sizes: ["S","M","L","XL","2XL","3XL","4XL"], colors: ["Black"] },
}

// Load saved pricing — checks localStorage first (instant), Supabase syncs in background
function loadProducts() {
  const saved = localStorage.getItem('spw_pricing')
  if (saved) {
    const pricing = JSON.parse(saved)
    return INITIAL_PRODUCTS.map(p => ({
      ...p,
      wholesalePrice: pricing[p.id]?.wholesalePrice ?? p.wholesalePrice,
      retailPrice: pricing[p.id]?.retailPrice ?? p.retailPrice,
    }))
  }
  return INITIAL_PRODUCTS
}

// Save pricing to both localStorage and Supabase
function savePricing(products) {
  const pricing = {}
  products.forEach(p => {
    pricing[p.id] = { wholesalePrice: p.wholesalePrice, retailPrice: p.retailPrice }
  })
  localStorage.setItem('spw_pricing', JSON.stringify(pricing))

  // Sync to Supabase in background
  fetch('/api/pricing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      products: products.map(p => ({
        product_id: p.id,
        wholesale_price: p.wholesalePrice,
        retail_price: p.retailPrice,
      }))
    }),
  }).catch(err => console.warn('Pricing sync failed:', err))
}

// Sync pricing FROM Supabase (runs once on load to pull latest)
async function syncPricingFromSupabase() {
  try {
    const res = await fetch('/api/pricing')
    if (!res.ok) return
    const data = await res.json()
    if (data && data.length) {
      const pricing = {}
      data.forEach(p => {
        pricing[p.product_id] = {
          wholesalePrice: Number(p.wholesale_price),
          retailPrice: Number(p.retail_price),
        }
      })
      localStorage.setItem('spw_pricing', JSON.stringify(pricing))
    }
  } catch {}
}

const DEMO_ORDERS = []

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
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('spw_cart') || '[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('spw_cart', JSON.stringify(items))
  }, [items])

  // Backfill source for old cart items loaded from localStorage
  useEffect(() => {
    setItems(prev => {
      let changed = false
      const updated = prev.map(item => {
        if (!item.source) {
          const prod = INITIAL_PRODUCTS.find(p => p.id === item.productId)
          if (prod) { changed = true; return { ...item, source: prod.source } }
        }
        return item
      })
      return changed ? updated : prev
    })
  }, [])

  const addItem = (product, qty = 1, priceType = 'retail') => {
    const price = priceType === 'wholesale' ? product.wholesalePrice : product.retailPrice
    const color = product.selectedColor || ''
    const size = product.selectedSize || ''
    const key = `${product.id}-${color}-${size}-${priceType}`
    setItems(prev => {
      const existing = prev.find(i => i.key === key)
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, qty: i.qty + qty } : i)
      }
      return [...prev, { key, productId: product.id, name: product.name, image: product.image, price, qty, priceType, color, size, source: product.source }]
    })
  }

  const updateQty = (key, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.key !== key))
    } else {
      setItems(prev => prev.map(i => i.key === key ? { ...i, qty } : i))
    }
  }

  const removeItem = (key) => {
    setItems(prev => prev.filter(i => i.key !== key))
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
// CREDIT PROVIDER (Kris's store credit from retail sales)
// ============================================================
function CreditProvider({ children }) {
  const [balance, setBalance] = useState(0)
  const [history, setHistory] = useState([])
  const [loaded, setLoaded] = useState(false)

  // Load credit data from Supabase
  useEffect(() => {
    async function load() {
      try {
        const { data: ledger } = await supabase
          .from('credit_ledger')
          .select('*')
          .order('created_at', { ascending: false })

        if (ledger && ledger.length) {
          let bal = 0
          ledger.forEach(e => {
            if (e.type === 'earned') bal += Number(e.amount)
            else bal -= Number(e.amount)
          })
          setBalance(Math.round(bal * 100) / 100)
          setHistory(ledger.map(e => ({
            id: e.id,
            type: e.type,
            amount: Number(e.amount),
            description: e.description,
            items: e.items,
            date: new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          })))
        }
      } catch {}
      setLoaded(true)
    }
    load()
  }, [])

  const refreshCredit = useCallback(async () => {
    try {
      const { data: ledger } = await supabase
        .from('credit_ledger')
        .select('*')
        .order('created_at', { ascending: false })

      if (ledger) {
        let bal = 0
        ledger.forEach(e => {
          if (e.type === 'earned') bal += Number(e.amount)
          else bal -= Number(e.amount)
        })
        setBalance(Math.round(bal * 100) / 100)
        setHistory(ledger.map(e => ({
          id: e.id,
          type: e.type,
          amount: Number(e.amount),
          description: e.description,
          items: e.items,
          date: new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        })))
      }
    } catch {}
  }, [])

  return (
    <CreditContext.Provider value={{ balance, history, refreshCredit, loaded }}>
      {children}
    </CreditContext.Provider>
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
  const [products] = useState(loadProducts().filter(p => p.active))
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showCart, setShowCart] = useState(false)
  const cart = useContext(CartContext)
  const mobile = useIsMobile()

  const categories = ['All', ...new Set(products.map(p => p.category))]
  const filtered = products.filter(p => {
    if (!p.active || p.retailPrice <= 0) return false
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
          maxWidth: '1200px', margin: '0 auto', padding: mobile ? '12px 16px' : '16px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.svg" alt="Super Pure Water" style={{ height: mobile ? '36px' : '48px', width: 'auto' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? '10px' : '16px' }}>
            {!mobile && <Link to="/login" style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: 500 }}>
              Wholesale Login
            </Link>}
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
        padding: mobile ? '32px 20px' : '60px 24px', textAlign: 'center', color: 'var(--white)',
      }}>
        <h2 style={{ fontSize: mobile ? '26px' : '40px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '12px' }}>
          Pure Water. Pure Life.
        </h2>
        <p style={{ fontSize: mobile ? '15px' : '18px', opacity: 0.85, maxWidth: '500px', margin: '0 auto' }}>
          Premium purified water and branded merchandise. Delivered fresh to your door.
        </p>
      </section>

      {/* Filters */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: mobile ? '16px 16px 0' : '24px 24px 0' }}>
        <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: '12px', alignItems: mobile ? 'stretch' : 'center' }}>
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
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: mobile ? '4px' : 0 }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600,
                  background: selectedCategory === cat ? 'var(--black)' : 'var(--white)',
                  color: selectedCategory === cat ? 'var(--white)' : 'var(--gray-600)',
                  border: selectedCategory === cat ? 'none' : '1px solid var(--gray-200)',
                  whiteSpace: 'nowrap', flexShrink: 0,
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
        maxWidth: '1200px', margin: '0 auto', padding: mobile ? '16px' : '24px',
        display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: mobile ? '12px' : '20px',
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
              height: mobile ? '150px' : '220px', background: 'var(--gray-100)', overflow: 'hidden', padding: mobile ? '10px' : '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div style={{ padding: mobile ? '10px' : '16px' }}>
              {!mobile && <Badge>{product.category}</Badge>}
              <h3 style={{ fontSize: mobile ? '13px' : '15px', fontWeight: 700, marginTop: mobile ? '0' : '8px', lineHeight: 1.3, color: 'var(--gray-900)' }}>
                {product.name}
              </h3>
              {!mobile && <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px', lineHeight: 1.4 }}>
                {product.description.slice(0, 80)}...
              </p>}
              <div style={{ display: 'flex', alignItems: mobile ? 'flex-start' : 'center', justifyContent: 'space-between', marginTop: mobile ? '8px' : '12px', flexDirection: mobile ? 'column' : 'row', gap: mobile ? '8px' : '0' }}>
                <span style={{ fontSize: mobile ? '17px' : '20px', fontWeight: 800, color: 'var(--gray-900)' }}>
                  {fmt(product.retailPrice)}
                </span>
                <Btn
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedProduct(product)
                  }}
                  style={mobile ? { width: '100%', fontSize: '12px', padding: '6px 10px' } : {}}
                >
                  Select Options
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
  const variants = PRODUCT_VARIANTS[product.id] || { sizes: [], colors: [] }
  const colorImgs = COLOR_IMAGES[product.id] || {}
  const [selectedColor, setSelectedColor] = useState(variants.colors[0] || '')
  const [selectedSize, setSelectedSize] = useState(variants.sizes[0] || '')
  const [selectedImageIdx, setSelectedImageIdx] = useState(0)
  const [added, setAdded] = useState(false)
  const mobile = useIsMobile()
  const price = priceType === 'wholesale' ? product.wholesalePrice : product.retailPrice
  const images = colorImgs[selectedColor] || [product.image]
  const currentImage = images[selectedImageIdx] || images[0] || product.image

  const canAdd = (!variants.colors.length || selectedColor) && (!variants.sizes.length || selectedSize)

  const handleAdd = () => {
    if (!canAdd) return
    cart.addItem({ ...product, selectedColor, selectedSize }, qty, priceType)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const selectStyle = (isSelected) => ({
    padding: '8px 16px', fontSize: '13px', fontWeight: 600,
    borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.15s',
    border: isSelected ? '2px solid var(--blue)' : '1px solid var(--gray-200)',
    background: isSelected ? 'var(--blue-light)' : 'var(--white)',
    color: isSelected ? 'var(--blue)' : 'var(--gray-700)',
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: mobile ? '16px' : '40px 24px' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gray-500)', fontSize: '14px', fontWeight: 500, marginBottom: mobile ? '16px' : '24px' }}>
          <ArrowLeft size={16} /> Back to products
        </button>
        <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: mobile ? '20px' : '40px', background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: mobile ? '16px' : '32px', border: '1px solid var(--gray-200)' }}>
          <div style={{ flex: mobile ? 'none' : '0 0 45%' }}>
            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--gray-100)' }}>
              <img src={currentImage} alt={product.name} style={{ width: '100%', height: mobile ? '280px' : '400px', objectFit: 'contain', padding: mobile ? '12px' : '20px' }} />
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    style={{
                      width: mobile ? '56px' : '72px', height: mobile ? '56px' : '72px', borderRadius: 'var(--radius-sm)',
                      border: selectedImageIdx === idx ? '2px solid var(--blue)' : '1px solid var(--gray-200)',
                      background: 'var(--gray-50)', padding: '4px', cursor: 'pointer', overflow: 'hidden',
                    }}
                  >
                    <img src={img} alt={idx === 0 ? 'Front' : 'Back'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Badge>{product.category}</Badge>
            <h1 style={{ fontSize: mobile ? '22px' : '28px', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '12px', lineHeight: 1.2, color: 'var(--gray-900)' }}>
              {product.name}
            </h1>
            <p style={{ fontSize: mobile ? '14px' : '15px', color: 'var(--gray-600)', marginTop: '12px', lineHeight: 1.6 }}>
              {product.description}
            </p>
            <div style={{ marginTop: '20px' }}>
              <span style={{ fontSize: mobile ? '26px' : '32px', fontWeight: 800, color: 'var(--gray-900)' }}>{fmt(price)}</span>
              {priceType === 'wholesale' && product.retailPrice > 0 && (
                <span style={{ fontSize: '14px', color: 'var(--gray-400)', marginLeft: '8px', textDecoration: 'line-through' }}>
                  {fmt(product.retailPrice)}
                </span>
              )}
            </div>

            {/* Color Selector */}
            {variants.colors.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>
                  Color — {selectedColor}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {variants.colors.map(c => (
                    <button key={c} onClick={() => { setSelectedColor(c); setSelectedImageIdx(0) }} style={selectStyle(selectedColor === c)}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {variants.sizes.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>
                  Size — {selectedSize}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {variants.sizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)} style={selectStyle(selectedSize === s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
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
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '16px 28px', marginTop: '16px',
                fontSize: '16px', fontWeight: 700, borderRadius: 'var(--radius-md)',
                background: added ? 'var(--green)' : 'var(--black)',
                color: 'var(--white)', border: 'none', cursor: 'pointer',
                opacity: canAdd ? 1 : 0.5,
              }}
            >
              {added ? (
                <><Check size={18} /> Added!</>
              ) : (
                <><ShoppingCart size={18} /> Add to Cart — {fmt(price * qty)}</>
              )}
            </button>

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
  const credit = useContext(CreditContext)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [useStoreCredit, setUseStoreCredit] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const [shipping, setShipping] = useState({ total: 0, breakdown: null, loading: true })
  const mobile = useIsMobile()

  const isWholesale = priceType === 'wholesale'
  const orderTotal = Math.round((cart.total + shipping.total) * 100) / 100
  const creditApplied = isWholesale && useStoreCredit ? Math.min(credit.balance, orderTotal) : 0
  const amountDue = Math.round((orderTotal - creditApplied) * 100) / 100

  // Fetch shipping when cart changes
  useEffect(() => {
    if (cart.items.length === 0) { setShipping({ total: 0, breakdown: null, loading: false }); return }
    let cancelled = false
    setShipping(s => ({ ...s, loading: true }))
    fetch('/api/shipping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart.items }),
    })
      .then(r => r.json())
      .then(data => { if (!cancelled) setShipping({ total: data.total || 0, breakdown: data.breakdown, loading: false }) })
      .catch(() => { if (!cancelled) setShipping({ total: 0, breakdown: null, loading: false }) })
    return () => { cancelled = true }
  }, [cart.items])

  const handlePlaceOrder = async () => {
    setCheckingOut(true)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items,
          priceType,
          creditApplied,
          shipping: shipping.total,
        }),
      })
      const data = await res.json()

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
        return
      }

      if (data.success) {
        // Fully covered by credit — no Stripe needed
        credit.refreshCredit()
        setOrderPlaced(true)
        return
      }

      alert(data.error || 'Something went wrong')
    } catch (err) {
      alert('Checkout failed: ' + err.message)
    }
    setCheckingOut(false)
  }

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
          {isWholesale && creditApplied > 0 && (
            <p style={{ color: 'var(--blue)', fontSize: '14px', fontWeight: 600, marginTop: '8px' }}>
              {fmt(creditApplied)} store credit applied
            </p>
          )}
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
                <div key={item.key} style={{
                  display: 'flex', flexDirection: mobile ? 'column' : 'row', alignItems: mobile ? 'stretch' : 'center', gap: mobile ? '12px' : '16px', padding: mobile ? '12px' : '16px',
                  background: 'var(--white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={item.image} alt="" style={{ width: mobile ? '56px' : '64px', height: mobile ? '56px' : '64px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-900)' }}>{item.name}</p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                        {item.color && <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gray-500)', background: 'var(--gray-50)', padding: '2px 8px', borderRadius: '4px' }}>{item.color}</span>}
                        {item.size && <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gray-500)', background: 'var(--gray-50)', padding: '2px 8px', borderRadius: '4px' }}>{item.size}</span>}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '2px' }}>{fmt(item.price)} each</p>
                    </div>
                    {mobile && (
                      <button onClick={() => cart.removeItem(item.key)} style={{ color: 'var(--gray-400)', flexShrink: 0 }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: mobile ? 'space-between' : 'flex-end', gap: '12px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', border: '1px solid var(--gray-200)',
                      borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                    }}>
                      <button onClick={() => cart.updateQty(item.key, item.qty - 1)} style={{ padding: '6px 10px' }}>
                        <Minus size={14} />
                      </button>
                      <span style={{ padding: '6px 12px', fontWeight: 600, fontSize: '13px' }}>{item.qty}</span>
                      <button onClick={() => cart.updateQty(item.key, item.qty + 1)} style={{ padding: '6px 10px' }}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: 700, minWidth: '70px', textAlign: 'right' }}>
                      {fmt(item.price * item.qty)}
                    </span>
                    {!mobile && (
                      <button onClick={() => cart.removeItem(item.key)} style={{ color: 'var(--gray-400)' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: 'var(--gray-500)' }}>Shipping</span>
                <span style={{ fontWeight: 600, color: shipping.loading ? 'var(--gray-400)' : shipping.total > 0 ? 'var(--gray-900)' : 'var(--green)' }}>
                  {shipping.loading ? 'Calculating...' : shipping.total > 0 ? fmt(shipping.total) : 'Free'}
                </span>
              </div>
              {shipping.breakdown && (shipping.breakdown.fulfillEngine || shipping.breakdown.printify) && (
                <div style={{ marginBottom: '12px', paddingLeft: '8px', fontSize: '12px', color: 'var(--gray-400)' }}>
                  {shipping.breakdown.fulfillEngine && <div>{shipping.breakdown.fulfillEngine.label}: {fmt(shipping.breakdown.fulfillEngine.amount)}</div>}
                  {shipping.breakdown.printify && <div>{shipping.breakdown.printify.label}: {fmt(shipping.breakdown.printify.amount)}</div>}
                </div>
              )}

              {/* Store Credit toggle for wholesale */}
              {isWholesale && credit.balance > 0 && (
                <div style={{
                  padding: '12px', background: 'var(--blue-light)', borderRadius: 'var(--radius-sm)',
                  marginBottom: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--blue-dark)' }}>Store Credit</p>
                      <p style={{ fontSize: '12px', color: 'var(--blue)', marginTop: '2px' }}>Available: {fmt(credit.balance)}</p>
                    </div>
                    <button
                      onClick={() => setUseStoreCredit(!useStoreCredit)}
                      style={{
                        padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600,
                        background: useStoreCredit ? 'var(--blue)' : 'var(--white)',
                        color: useStoreCredit ? 'var(--white)' : 'var(--blue)',
                        border: useStoreCredit ? 'none' : '1px solid var(--blue)',
                      }}
                    >
                      {useStoreCredit ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                  {useStoreCredit && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(0,102,255,0.15)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--blue)' }}>Credit applied</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--blue)' }}>-{fmt(creditApplied)}</span>
                    </div>
                  )}
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '16px', fontWeight: 700 }}>
                  {isWholesale && creditApplied > 0 ? 'Amount Due' : 'Total'}
                </span>
                <span style={{ fontSize: '20px', fontWeight: 800 }}>{fmt(amountDue)}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={checkingOut}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  width: '100%', padding: '16px 28px', marginTop: '16px',
                  fontSize: '16px', fontWeight: 700, borderRadius: 'var(--radius-md)',
                  background: 'var(--black)', color: 'var(--white)', border: 'none',
                  cursor: checkingOut ? 'wait' : 'pointer', opacity: checkingOut ? 0.7 : 1,
                }}
              >
                {checkingOut ? (
                  <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
                ) : amountDue <= 0 ? (
                  <><Check size={18} /> Place Order with Credit</>
                ) : (
                  <><CreditCard size={18} /> {isWholesale && creditApplied > 0 ? `Pay ${fmt(amountDue)} with Card` : 'Checkout'}</>
                )}
              </button>
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
          <img src="/logo.svg" alt="Super Pure Water" style={{ height: '56px', width: 'auto', margin: '0 auto 12px', display: 'block' }} />
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
  const [products] = useState(loadProducts().filter(p => p.active))
  const [orders] = useState(DEMO_ORDERS.filter(o => o.type === 'wholesale'))
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showCart, setShowCart] = useState(false)
  const cart = useContext(CartContext)
  const credit = useContext(CreditContext)
  const mobile = useIsMobile()

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
            <img src="/logo.svg" alt="Super Pure Water" style={{ height: '40px', width: 'auto' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setPage('credit')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: 'var(--radius-md)',
                background: credit.balance > 0 ? 'var(--green-light)' : 'var(--gray-100)',
                fontSize: '13px', fontWeight: 700,
                color: credit.balance > 0 ? 'var(--green)' : 'var(--gray-500)',
              }}
            >
              <DollarSign size={14} />
              {fmt(credit.balance)} Credit
            </button>
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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: mobile ? '12px 16px 0' : '20px 24px 0' }}>
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--gray-200)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {[
            { key: 'products', label: mobile ? 'Products' : 'Products', icon: <Package size={16} /> },
            { key: 'credit', label: mobile ? 'Credit' : 'Store Credit', icon: <DollarSign size={16} /> },
            { key: 'requests', label: mobile ? 'Requests' : 'Employee Requests', icon: <Users size={16} /> },
            { key: 'orders', label: mobile ? 'Orders' : 'My Orders', icon: <Truck size={16} /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setPage(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: mobile ? '10px 12px' : '10px 18px', fontSize: '13px', fontWeight: 600,
                color: page === tab.key ? 'var(--gray-900)' : 'var(--gray-500)',
                borderBottom: page === tab.key ? '2px solid var(--black)' : '2px solid transparent',
                marginBottom: '-1px', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: mobile ? '16px' : '24px' }}>
        {page === 'products' && (
          <>
            <div style={{
              background: 'linear-gradient(135deg, #0066FF 0%, #0044AA 100%)',
              borderRadius: 'var(--radius-lg)', padding: mobile ? '20px' : '32px', color: 'var(--white)', marginBottom: mobile ? '16px' : '24px',
            }}>
              <h2 style={{ fontSize: mobile ? '20px' : '24px', fontWeight: 800, marginBottom: '4px' }}>Wholesale Pricing</h2>
              <p style={{ fontSize: '14px', opacity: 0.85 }}>Order at wholesale prices. Minimum quantities may apply.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: mobile ? '10px' : '16px' }}>
              {products.filter(p => p.active && p.wholesalePrice > 0).map(p => (
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
                  <div style={{ height: mobile ? '140px' : '180px', overflow: 'hidden', background: 'var(--gray-100)', padding: mobile ? '10px' : '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ padding: mobile ? '10px' : '16px' }}>
                    {!mobile && <Badge>{p.source}</Badge>}
                    <h3 style={{ fontSize: mobile ? '13px' : '14px', fontWeight: 700, marginTop: mobile ? '0' : '8px', color: 'var(--gray-900)' }}>{p.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? '4px' : '8px', marginTop: mobile ? '6px' : '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: mobile ? '16px' : '20px', fontWeight: 800, color: 'var(--blue)' }}>{fmt(p.wholesalePrice)}</span>
                      <span style={{ fontSize: mobile ? '11px' : '13px', color: 'var(--gray-400)', textDecoration: 'line-through' }}>{fmt(p.retailPrice)}</span>
                    </div>
                    <Btn
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); setSelectedProduct(p) }}
                      style={{ width: '100%', marginTop: mobile ? '8px' : '12px', ...(mobile ? { fontSize: '12px', padding: '6px 10px' } : {}) }}
                    >
                      Select Options
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {page === 'credit' && (
          <div>
            {/* Credit Balance Card */}
            <div style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              borderRadius: 'var(--radius-lg)', padding: '32px', color: 'var(--white)', marginBottom: '24px',
            }}>
              <p style={{ fontSize: '14px', opacity: 0.85, marginBottom: '4px' }}>Available Store Credit</p>
              <h2 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.02em' }}>{fmt(credit.balance)}</h2>
              <p style={{ fontSize: '13px', opacity: 0.7, marginTop: '8px' }}>
                Credit is earned automatically when customers purchase from the retail store.
                Use it to order products for free, or pay the difference with a card.
              </p>
            </div>

            {/* Credit History */}
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '12px' }}>Credit History</h3>
            {credit.history.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '48px', background: 'var(--white)',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)',
              }}>
                <DollarSign size={40} style={{ color: 'var(--gray-300)', margin: '0 auto 12px' }} />
                <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--gray-500)' }}>No credit activity yet</p>
                <p style={{ fontSize: '13px', color: 'var(--gray-400)', marginTop: '4px' }}>Credits will appear here when retail orders are placed.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {credit.history.map(entry => (
                  <div key={entry.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px', background: 'var(--white)', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--gray-200)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: entry.type === 'earned' ? 'var(--green-light)' : 'var(--blue-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {entry.type === 'earned'
                          ? <Plus size={16} style={{ color: 'var(--green)' }} />
                          : <Minus size={16} style={{ color: 'var(--blue)' }} />
                        }
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-900)' }}>
                          {entry.type === 'earned' ? 'Credit Earned' : 'Credit Used'}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>
                          {entry.description} — {entry.date}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '16px', fontWeight: 700,
                      color: entry.type === 'earned' ? 'var(--green)' : 'var(--blue)',
                    }}>
                      {entry.type === 'earned' ? '+' : '-'}{fmt(entry.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {page === 'requests' && (
          <EmployeeRequestsView />
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
  const [products, setProducts] = useState(loadProducts())
  const [orders] = useState(DEMO_ORDERS)
  const [showCost, setShowCost] = useState(true)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [bulkMargin, setBulkMargin] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mobile = useIsMobile()

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
    <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', minHeight: '100vh' }}>
      {/* Mobile Header */}
      {mobile && (
        <header style={{
          background: 'var(--gray-900)', color: 'var(--white)', padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 200,
        }}>
          <img src="/logo.svg" alt="Super Pure Water" style={{ height: '32px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => { logout(); navigate('/') }} style={{ color: 'rgba(255,255,255,0.5)' }}>
              <LogOut size={16} />
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ color: 'var(--white)' }}>
              <Menu size={20} />
            </button>
          </div>
        </header>
      )}
      {mobile && mobileMenuOpen && (
        <nav style={{
          background: 'var(--gray-900)', padding: '8px 16px 16px',
          display: 'flex', gap: '6px', flexWrap: 'wrap',
        }}>
          {sidebarItems.map(item => (
            <button
              key={item.key}
              onClick={() => { setPage(item.key); setMobileMenuOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 500,
                color: page === item.key ? 'var(--white)' : 'rgba(255,255,255,0.5)',
                background: page === item.key ? 'rgba(255,255,255,0.12)' : 'transparent',
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      )}

      {/* Desktop Sidebar */}
      {!mobile && (
        <aside style={{
          width: '240px', background: 'var(--gray-900)', color: 'var(--white)',
          padding: '20px 0', display: 'flex', flexDirection: 'column', flexShrink: 0,
        }}>
          <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/logo.svg" alt="Super Pure Water" style={{ height: '36px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
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
      )}

      {/* Main */}
      <main style={{ flex: 1, background: 'var(--gray-50)', overflow: 'auto' }}>
        <div style={{ padding: mobile ? '16px' : '32px' }}>
          {/* Dashboard */}
          {page === 'dashboard' && (
            <>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '24px' }}>Dashboard</h2>
              <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: mobile ? '10px' : '16px', marginBottom: mobile ? '20px' : '32px' }}>
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
                <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: mobile ? '600px' : 'auto' }}>
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
                <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: mobile ? '700px' : 'auto' }}>
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

              {/* Bulk Margin Toolbar */}
              <div style={{
                background: 'var(--white)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--gray-200)', padding: '16px 20px',
                marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length}
                    onChange={e => setSelectedProducts(e.target.checked ? products.map(p => p.id) : [])}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--blue)' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-700)' }}>
                    {selectedProducts.length === products.length ? 'Deselect All' : 'Select All'} ({selectedProducts.length}/{products.length})
                  </span>
                </label>

                <div style={{ width: '1px', height: '24px', background: 'var(--gray-200)' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Margin %</span>
                  <input
                    type="number"
                    value={bulkMargin}
                    onChange={e => setBulkMargin(e.target.value)}
                    placeholder="e.g. 40"
                    style={{
                      width: '80px', padding: '6px 10px', fontSize: '14px', fontWeight: 600,
                      border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)',
                      textAlign: 'center',
                    }}
                  />
                </div>

                <button
                  onClick={() => {
                    if (!bulkMargin || selectedProducts.length === 0) return
                    const pct = parseFloat(bulkMargin) / 100
                    setProducts(prev => {
                      const updated = prev.map(p =>
                        selectedProducts.includes(p.id)
                          ? { ...p, wholesalePrice: Math.round(p.costPrice * (1 + pct) * 100) / 100 }
                          : p
                      )
                      savePricing(updated)
                      return updated
                    })
                  }}
                  disabled={!bulkMargin || selectedProducts.length === 0}
                  style={{
                    padding: '7px 16px', fontSize: '13px', fontWeight: 600,
                    background: selectedProducts.length > 0 && bulkMargin ? 'var(--blue)' : 'var(--gray-200)',
                    color: selectedProducts.length > 0 && bulkMargin ? 'var(--white)' : 'var(--gray-400)',
                    border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  }}
                >
                  Apply to Wholesale
                </button>

                <button
                  onClick={() => {
                    if (!bulkMargin || selectedProducts.length === 0) return
                    const pct = parseFloat(bulkMargin) / 100
                    setProducts(prev => {
                      const updated = prev.map(p => {
                        if (!selectedProducts.includes(p.id)) return p
                        const base = p.wholesalePrice > 0 ? p.wholesalePrice : p.costPrice
                        return { ...p, retailPrice: Math.round(base * (1 + pct) * 100) / 100 }
                      })
                      savePricing(updated)
                      return updated
                    })
                  }}
                  disabled={!bulkMargin || selectedProducts.length === 0}
                  style={{
                    padding: '7px 16px', fontSize: '13px', fontWeight: 600,
                    background: selectedProducts.length > 0 && bulkMargin ? 'var(--green)' : 'var(--gray-200)',
                    color: selectedProducts.length > 0 && bulkMargin ? 'var(--white)' : 'var(--gray-400)',
                    border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  }}
                >
                  Apply to Retail
                </button>

                <button
                  onClick={() => {
                    if (!bulkMargin || selectedProducts.length === 0) return
                    const pct = parseFloat(bulkMargin) / 100
                    setProducts(prev => {
                      const updated = prev.map(p => {
                        if (!selectedProducts.includes(p.id)) return p
                        const ws = Math.round(p.costPrice * (1 + pct) * 100) / 100
                        return { ...p, wholesalePrice: ws, retailPrice: Math.round(ws * (1 + pct) * 100) / 100 }
                      })
                      savePricing(updated)
                      return updated
                    })
                  }}
                  disabled={!bulkMargin || selectedProducts.length === 0}
                  style={{
                    padding: '7px 16px', fontSize: '13px', fontWeight: 600,
                    background: selectedProducts.length > 0 && bulkMargin ? 'var(--gray-900)' : 'var(--gray-200)',
                    color: selectedProducts.length > 0 && bulkMargin ? 'var(--white)' : 'var(--gray-400)',
                    border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  }}
                >
                  Apply to Both
                </button>
              </div>

              <div style={{
                background: 'var(--white)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--gray-200)', overflow: 'hidden',
              }}>
                <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: mobile ? '800px' : 'auto' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      <th style={{ padding: '12px 14px', width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === products.length}
                          onChange={e => setSelectedProducts(e.target.checked ? products.map(p => p.id) : [])}
                          style={{ width: '14px', height: '14px', accentColor: 'var(--blue)' }}
                        />
                      </th>
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
                          selected={selectedProducts.includes(p.id)}
                          onToggle={() => setSelectedProducts(prev =>
                            prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                          )}
                          onEdit={() => setEditingProduct(p.id)}
                          onSave={(updates) => {
                            setProducts(prev => {
                              const updated = prev.map(prod =>
                                prod.id === p.id ? { ...prod, ...updates } : prod
                              )
                              savePricing(updated)
                              return updated
                            })
                            setEditingProduct(null)
                          }}
                          onCancel={() => setEditingProduct(null)}
                        />
                      )
                    })}
                  </tbody>
                </table>
                </div>
              </div>

              <div style={{
                marginTop: '24px', padding: mobile ? '16px' : '20px', background: 'var(--white)',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)',
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--gray-900)' }}>How Pricing Works</h3>
                <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr 1fr', gap: mobile ? '10px' : '16px' }}>
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
function PricingRow({ product, isEditing, selected, onToggle, onEdit, onSave, onCancel }) {
  const [wholesale, setWholesale] = useState(product.wholesalePrice)
  const [retail, setRetail] = useState(product.retailPrice)

  useEffect(() => {
    setWholesale(product.wholesalePrice)
    setRetail(product.retailPrice)
  }, [product.wholesalePrice, product.retailPrice])

  const yourMargin = ((wholesale - product.costPrice) / product.costPrice * 100).toFixed(0)
  const krisMargin = wholesale > 0 ? ((retail - wholesale) / wholesale * 100).toFixed(0) : '0'

  return (
    <tr style={{ borderBottom: '1px solid var(--gray-50)', background: selected ? 'var(--blue-light)' : 'transparent' }}>
      <td style={{ padding: '12px 14px', width: '40px' }}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          style={{ width: '14px', height: '14px', accentColor: 'var(--blue)' }}
        />
      </td>
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
// EMPLOYEE REQUESTS VIEW (shown in Kris's owner portal)
// ============================================================
function EmployeeRequestsView() {
  const [requests, setRequests] = useState(() => JSON.parse(localStorage.getItem('spw_requests') || '[]'))

  const updateStatus = (idx, status) => {
    setRequests(prev => {
      const updated = prev.map((r, i) => i === idx ? { ...r, status } : r)
      localStorage.setItem('spw_requests', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '16px' }}>Employee Requests</h2>
      <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '24px' }}>
        Employees submit requests at <strong>/request</strong>. Review and approve below.
      </p>
      {requests.length === 0 ? (
        <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '40px' }}>No requests yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {requests.map((req, idx) => (
            <div key={idx} style={{
              background: 'var(--white)', borderRadius: 'var(--radius-md)',
              padding: '20px', border: '1px solid var(--gray-200)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)' }}>{req.employee}</span>
                  <span style={{ fontSize: '13px', color: 'var(--gray-400)', marginLeft: '12px' }}>
                    {new Date(req.date).toLocaleDateString()}
                  </span>
                </div>
                <Badge variant={req.status === 'approved' ? 'green' : req.status === 'denied' ? 'red' : 'default'}>
                  {req.status}
                </Badge>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {req.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--gray-600)' }}>
                    <img src={item.image} alt="" style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'contain', background: 'var(--gray-50)' }} />
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{item.name}</span>
                      <span style={{ marginLeft: '8px' }}>{item.color}{item.size ? ` / ${item.size}` : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
              {req.status === 'pending' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--gray-100)', paddingTop: '16px' }}>
                  <Btn size="sm" onClick={() => updateStatus(idx, 'approved')} style={{ background: 'var(--green)' }}>
                    <Check size={14} /> Approve
                  </Btn>
                  <button
                    onClick={() => updateStatus(idx, 'denied')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '6px 14px', fontSize: '13px', fontWeight: 600,
                      background: 'var(--white)', color: 'var(--red)',
                      border: '1px solid var(--red)', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    }}
                  >
                    <X size={14} /> Deny
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// REQUEST PRODUCT DETAIL (for employee request page)
// ============================================================
function RequestProductDetail({ product, onBack, onAdd }) {
  const variants = PRODUCT_VARIANTS[product.id] || { sizes: [], colors: [] }
  const colorImgs = COLOR_IMAGES[product.id] || {}
  const [selColor, setSelColor] = useState(variants.colors[0] || '')
  const [selSize, setSelSize] = useState(variants.sizes[0] || '')
  const [selectedImageIdx, setSelectedImageIdx] = useState(0)
  const mobile = useIsMobile()
  const images = colorImgs[selColor] || [product.image]
  const currentImg = images[selectedImageIdx] || images[0] || product.image

  const selectStyle = (active) => ({
    padding: '8px 16px', fontSize: '13px', fontWeight: 600,
    borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.15s',
    border: active ? '2px solid var(--blue)' : '1px solid var(--gray-200)',
    background: active ? 'var(--blue-light)' : 'var(--white)',
    color: active ? 'var(--blue)' : 'var(--gray-700)',
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: mobile ? '16px' : '40px 24px' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gray-500)', fontSize: '14px', fontWeight: 500, marginBottom: mobile ? '16px' : '24px' }}>
          <ArrowLeft size={16} /> Back to products
        </button>
        <div style={{ display: mobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns: mobile ? 'none' : '1fr 1fr', gap: mobile ? '20px' : '40px', background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: mobile ? '16px' : '32px', border: '1px solid var(--gray-200)', alignItems: 'start' }}>
          <div style={{ position: mobile ? 'static' : 'sticky', top: '24px' }}>
            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--gray-100)' }}>
              <img src={currentImg} alt={product.name} style={{ width: '100%', height: mobile ? '280px' : '400px', objectFit: 'contain', padding: mobile ? '12px' : '20px' }} />
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    style={{
                      width: '72px', height: '72px', borderRadius: 'var(--radius-sm)',
                      border: selectedImageIdx === idx ? '2px solid var(--blue)' : '1px solid var(--gray-200)',
                      background: 'var(--gray-50)', padding: '4px', cursor: 'pointer', overflow: 'hidden',
                    }}
                  >
                    <img src={img} alt={idx === 0 ? 'Front' : 'Back'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <Badge>{product.category}</Badge>
            <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '12px', lineHeight: 1.2, color: 'var(--gray-900)' }}>
              {product.name}
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--gray-600)', marginTop: '12px', lineHeight: 1.6 }}>
              {product.description}
            </p>

            {variants.colors.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>
                  Color — {selColor}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {variants.colors.map(c => (
                    <button key={c} onClick={() => { setSelColor(c); setSelectedImageIdx(0) }} style={selectStyle(selColor === c)}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {variants.sizes.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>
                  Size — {selSize}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {variants.sizes.map(s => (
                    <button key={s} onClick={() => setSelSize(s)} style={selectStyle(selSize === s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <Btn
              size="lg"
              onClick={() => onAdd({
                productId: product.id, name: product.name,
                image: currentImg, color: selColor, size: selSize,
              })}
              style={{ width: '100%', marginTop: '24px' }}
            >
              <Plus size={18} /> Add to Request
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// EMPLOYEE REQUEST PAGE
// ============================================================
function EmployeeRequest() {
  const products = loadProducts()
  const [name, setName] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [requests, setRequests] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const mobile = useIsMobile()

  if (selectedProduct) {
    return <RequestProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} onAdd={(item) => { setRequests(prev => [...prev, item]); setSelectedProduct(null) }} />
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', background: 'var(--green-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          }}>
            <Check size={32} style={{ color: 'var(--green)' }} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)' }}>Request Submitted!</h2>
          <p style={{ color: 'var(--gray-500)', marginTop: '8px' }}>Your request has been sent to the team. You will be notified when it is approved.</p>
          <Btn onClick={() => { setSubmitted(false); setRequests([]); setName('') }} style={{ marginTop: '24px' }}>Submit Another Request</Btn>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--white)', borderBottom: '1px solid var(--gray-100)',
        padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.svg" alt="Super Pure Water" style={{ height: '40px', width: 'auto' }} />
        </div>
        {requests.length > 0 && (
          <Badge variant="blue">{requests.length} item{requests.length > 1 ? 's' : ''} selected</Badge>
        )}
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Name Input */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '24px',
          border: '1px solid var(--gray-200)', marginBottom: '24px',
        }}>
          <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '8px', display: 'block' }}>
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your full name"
            style={{
              width: '100%', padding: '10px 14px', fontSize: '15px',
              border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Instructions */}
        <div style={{
          background: 'linear-gradient(135deg, #0066FF 0%, #0044AA 100%)',
          borderRadius: 'var(--radius-lg)', padding: '24px', color: 'var(--white)', marginBottom: '24px',
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>Select Your Items</h2>
          <p style={{ fontSize: '14px', opacity: 0.85 }}>Browse products below, choose your size and color, then submit your request for approval.</p>
        </div>

        {/* Product Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: mobile ? '10px' : '16px' }}>
          {products.filter(p => p.active).map(product => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              style={{
                background: 'var(--white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                border: '1px solid var(--gray-200)', cursor: 'pointer', transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ height: mobile ? '130px' : '180px', overflow: 'hidden', background: 'var(--gray-100)', padding: mobile ? '10px' : '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ padding: mobile ? '10px' : '16px' }}>
                <p style={{ fontSize: mobile ? '13px' : '14px', fontWeight: 700, color: 'var(--gray-900)' }}>{product.name}</p>
                {!mobile && <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '4px' }}>{product.category}</p>}
                <Btn size="sm" onClick={(e) => { e.stopPropagation(); setSelectedProduct(product) }} style={{ width: '100%', marginTop: mobile ? '8px' : '12px', ...(mobile ? { fontSize: '12px', padding: '6px 10px' } : {}) }}>
                  Select Options
                </Btn>
              </div>
            </div>
          ))}
        </div>

        {/* Request Summary + Submit */}
        {requests.length > 0 && (
          <div style={{
            position: 'fixed', bottom: '0', left: '0', right: '0',
            background: 'var(--white)', borderTop: '2px solid var(--gray-200)',
            padding: '16px 24px', zIndex: 100,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: mobile ? 'column' : 'row', alignItems: mobile ? 'stretch' : 'center', gap: mobile ? '12px' : '16px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gray-900)' }}>
                  {requests.length} item{requests.length > 1 ? 's' : ''} selected
                </span>
                {!mobile && <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {requests.map((r, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: 'var(--gray-50)', padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                      fontSize: '12px', color: 'var(--gray-600)',
                    }}>
                      <img src={r.image} alt="" style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'contain' }} />
                      <span>{r.name} — {r.color}{r.size ? ` / ${r.size}` : ''}</span>
                      <button onClick={() => setRequests(prev => prev.filter((_, idx) => idx !== i))} style={{ color: 'var(--gray-400)', marginLeft: '4px' }}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>}
              </div>
              <Btn
                onClick={() => {
                  if (!name.trim()) { alert('Please enter your name'); return }
                  // Save to localStorage for now (will move to Supabase)
                  const saved = JSON.parse(localStorage.getItem('spw_requests') || '[]')
                  saved.push({ employee: name, items: requests, date: new Date().toISOString(), status: 'pending' })
                  localStorage.setItem('spw_requests', JSON.stringify(saved))
                  setSubmitted(true)
                }}
                style={{ padding: '12px 32px' }}
              >
                Submit Request
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// APP ROUTER
// ============================================================
// ============================================================
// ORDER SUCCESS PAGE (after Stripe redirect)
// ============================================================
function OrderSuccess() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading')
  const cart = useContext(CartContext)
  const credit = useContext(CreditContext)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) { setStatus('error'); return }
    fetch(`/api/order-status?session_id=${sessionId}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === 'paid') {
          setStatus('success')
          cart.clearCart()
          credit.refreshCredit()
        } else {
          setStatus('pending')
        }
      })
      .catch(() => setStatus('error'))
  }, [sessionId])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)' }}>
      <div style={{ textAlign: 'center', padding: '40px', maxWidth: '500px' }}>
        {status === 'loading' && (
          <>
            <Loader size={48} style={{ color: 'var(--blue)', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)' }}>Confirming your order...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', background: 'var(--green-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            }}>
              <Check size={32} style={{ color: 'var(--green)' }} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)' }}>Order Confirmed!</h2>
            <p style={{ color: 'var(--gray-500)', marginTop: '8px' }}>Thank you for your purchase. You will receive a confirmation email shortly.</p>
            <Link to="/" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px 28px', marginTop: '24px', fontSize: '15px', fontWeight: 700,
              borderRadius: 'var(--radius-md)', background: 'var(--black)', color: 'var(--white)',
            }}>
              Continue Shopping
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <X size={48} style={{ color: 'var(--red)', margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)' }}>Something went wrong</h2>
            <p style={{ color: 'var(--gray-500)', marginTop: '8px' }}>Please contact support if you were charged.</p>
            <Link to="/" style={{
              display: 'inline-flex', padding: '14px 28px', marginTop: '24px', fontSize: '15px', fontWeight: 700,
              borderRadius: 'var(--radius-md)', background: 'var(--black)', color: 'var(--white)',
            }}>
              Back to Store
            </Link>
          </>
        )}
        {status === 'pending' && (
          <>
            <Loader size={48} style={{ color: 'var(--amber)', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)' }}>Payment Processing</h2>
            <p style={{ color: 'var(--gray-500)', marginTop: '8px' }}>Your payment is still being processed. Check your email for confirmation.</p>
            <Link to="/" style={{
              display: 'inline-flex', padding: '14px 28px', marginTop: '24px', fontSize: '15px', fontWeight: 700,
              borderRadius: 'var(--radius-md)', background: 'var(--black)', color: 'var(--white)',
            }}>
              Back to Store
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CustomerStore />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/wholesale" element={<OwnerPortal />} />
      <Route path="/admin" element={<AdminPortal />} />
      <Route path="/request" element={<EmployeeRequest />} />
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <CreditProvider>
            <AppRoutes />
          </CreditProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
