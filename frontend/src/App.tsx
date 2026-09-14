import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  addToCart,
  checkout,
  getCart,
  getProducts,
  removeFromCart,
} from './api'
import CartModal from './components/CartModal'
import CatalogPanel from './components/CatalogPanel'
import CheckoutPage from './components/CheckoutPage'
import OrderConfirmationPage from './components/OrderConfirmationPage'
import { StoreLogoIcon, CartIcon, SparklesIcon } from './components/Icons'
import type { Cart, Order, Product } from './types'
import './App.css'

const SESSION_KEY = 'ecommerce-demo-session'
const ADDED_LABEL_DURATION_MS = 3000

function getSessionId(): string {
  const saved = localStorage.getItem(SESSION_KEY)
  if (saved) {
    return saved
  }

  const created = `session-${crypto.randomUUID().slice(0, 10)}`
  localStorage.setItem(SESSION_KEY, created)
  return created
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sessionId] = useState(getSessionId)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Cart>({ sessionId, items: [], updatedAt: '' })
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [addedProductIds, setAddedProductIds] = useState<Set<string>>(() => new Set())
  const addedLabelTimersRef = useRef<Map<string, number>>(new Map())

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  )

  const categories = useMemo(() => {
    return ['All', ...new Set(products.map((product) => product.category))]
  }, [products])

  const totalCartCount = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + item.qty, 0)
  }, [cart.items])

  const visibleProducts = useMemo(() => {
    let list = [...products]

    if (selectedCategory !== 'All') {
      list = list.filter((product) => product.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      list = list.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query),
      )
    }

    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name))
    }

    return list
  }, [products, selectedCategory, searchQuery, sortBy])

  const cartTotal = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + item.price * item.qty, 0)
  }, [cart.items])

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        const [fetchedProducts, fetchedCart] = await Promise.all([
          getProducts(),
          getCart(sessionId),
        ])
        setProducts(fetchedProducts)
        setCart(fetchedCart)
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load storefront data.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [sessionId])

  useEffect(() => {
    return () => {
      for (const timerId of addedLabelTimersRef.current.values()) {
        window.clearTimeout(timerId)
      }
      addedLabelTimersRef.current.clear()
    }
  }, [])

  async function handleAddToCart(product: Product) {
    try {
      setError('')
      const updatedCart = await addToCart(sessionId, {
        productId: product.id,
        qty: 1,
        price: product.price,
      })
      setCart(updatedCart)

      setAddedProductIds((previous) => {
        const next = new Set(previous)
        next.add(product.id)
        return next
      })

      const existingTimer = addedLabelTimersRef.current.get(product.id)
      if (existingTimer !== undefined) {
        window.clearTimeout(existingTimer)
      }

      const timerId = window.setTimeout(() => {
        setAddedProductIds((previous) => {
          if (!previous.has(product.id)) {
            return previous
          }

          const next = new Set(previous)
          next.delete(product.id)
          return next
        })
        addedLabelTimersRef.current.delete(product.id)
      }, ADDED_LABEL_DURATION_MS)

      addedLabelTimersRef.current.set(product.id, timerId)
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Failed to add item.')
    }
  }

  async function handleRemoveFromCart(productId: string) {
    try {
      setError('')
      const updatedCart = await removeFromCart(sessionId, productId)
      setCart(updatedCart)
    } catch (removeError) {
      setError(
        removeError instanceof Error ? removeError.message : 'Failed to remove item.',
      )
    }
  }

  async function handleCheckout() {
    try {
      setError('')
      setIsCheckingOut(true)
      const order = await checkout(sessionId)
      setConfirmedOrder(order)
      setCart({ sessionId, items: [], updatedAt: new Date().toISOString() })
      setIsCartOpen(false)
      navigate(`/order/${order.orderId}`, { state: { order } })
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : 'Checkout failed. Try again.',
      )
    } finally {
      setIsCheckingOut(false)
    }
  }

  function handleGoToCheckout() {
    setIsCartOpen(false)
    navigate('/checkout')
  }

  function handleBackToCatalog() {
    setIsCartOpen(false)
    navigate('/')
  }

  const orderFromRoute =
    location.pathname.startsWith('/order/') &&
    typeof location.state === 'object' &&
    location.state !== null &&
    'order' in location.state
      ? ((location.state as { order?: Order }).order ?? confirmedOrder)
      : confirmedOrder

  const isHomePage = location.pathname === '/'

  return (
    <div className="app-shell">
      {/* Top Navbar */}
      <header className="store-navbar">
        <div className="navbar-container">
          <button type="button" className="nav-brand" onClick={handleBackToCatalog}>
            <div className="logo-icon-wrap">
              <StoreLogoIcon size={24} />
            </div>
            <div className="brand-text">
              <span className="brand-name">Northstar Outfitters</span>
              <span className="brand-tagline">Premium Outdoor & Travel Gear</span>
            </div>
          </button>

          <div className="nav-actions">
            <button
              type="button"
              className="cart-trigger"
              onClick={() => setIsCartOpen(true)}
              aria-label="View Cart"
            >
              <CartIcon size={20} />
              <span className="cart-text">Cart</span>
              {totalCartCount > 0 && <span className="cart-badge">{totalCartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner (Shown on Catalog Home) */}
      {isHomePage && (
        <section className="hero-banner">
          <div className="hero-content">
            <div className="eyebrow-badge">
              <SparklesIcon size={14} />
              <span>AWS Serverless E-Commerce Demo</span>
            </div>
            <h1 className="hero-title">Equip Your Next Adventure</h1>
            <p className="hero-copy">
              Explore professional-grade outdoor apparel, technical footwear, and field gear built for performance. Powered by AWS Lambda & DynamoDB.
            </p>
          </div>
        </section>
      )}

      {error && <p className="error-banner">{error}</p>}

      <main className="content-grid route-grid">
        <Routes>
          <Route
            path="/"
            element={
              <CatalogPanel
                categories={categories}
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                isLoading={isLoading}
                visibleProducts={visibleProducts}
                onSelectCategory={setSelectedCategory}
                onAddToCart={handleAddToCart}
                addedProductIds={addedProductIds}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <CheckoutPage
                cart={cart}
                cartTotal={cartTotal}
                productById={productById}
                isCheckingOut={isCheckingOut}
                onRemove={handleRemoveFromCart}
                onPlaceOrder={handleCheckout}
                onContinueShopping={handleBackToCatalog}
              />
            }
          />
          <Route
            path="/order/:orderId"
            element={<OrderConfirmationPage order={orderFromRoute} onBackToCatalog={handleBackToCatalog} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <CartModal
        isOpen={isCartOpen}
        cart={cart}
        cartTotal={cartTotal}
        productById={productById}
        onClose={() => setIsCartOpen(false)}
        onRemove={handleRemoveFromCart}
        onGoToCheckout={handleGoToCheckout}
      />

      <footer className="store-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo-icon-wrap small">
              <StoreLogoIcon size={18} />
            </div>
            <strong>Northstar Outfitters</strong>
          </div>
          <div className="footer-meta">
            <p>AWS Portfolio Project · Built with React, Vite, Sharp & Serverless Backend</p>
            <p className="session-tag">Active Session: <code>{sessionId}</code></p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
