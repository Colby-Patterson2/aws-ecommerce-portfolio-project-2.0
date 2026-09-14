import type { Cart, Product } from '../types'
import { ArrowLeftIcon, CartIcon, ShieldCheckIcon, TrashIcon, CheckIcon } from './Icons'

type CheckoutPageProps = Readonly<{
  cart: Cart
  cartTotal: number
  productById: Map<string, Product>
  isCheckingOut: boolean
  onRemove: (productId: string) => void
  onPlaceOrder: () => void
  onContinueShopping: () => void
}>

export default function CheckoutPage({
  cart,
  cartTotal,
  productById,
  isCheckingOut,
  onRemove,
  onPlaceOrder,
  onContinueShopping,
}: CheckoutPageProps) {
  const totalItemsCount = cart.items.reduce((sum, item) => sum + item.qty, 0)

  return (
    <section className="checkout-page">
      <div className="checkout-page-header">
        <button type="button" className="back-link-btn" onClick={onContinueShopping}>
          <ArrowLeftIcon size={16} />
          <span>Back to Catalog</span>
        </button>
        <div className="checkout-title-row">
          <h2>Order Checkout</h2>
          <span className="checkout-item-count">{totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}</span>
        </div>
      </div>

      {cart.items.length === 0 ? (
        <div className="checkout-empty">
          <CartIcon size={48} className="empty-icon" />
          <h3>Your cart is empty</h3>
          <p>Add products from the catalog, then return here to place your order.</p>
          <button type="button" className="primary-checkout-btn" onClick={onContinueShopping}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="checkout-layout-grid">
          {/* Main Items Column */}
          <div className="checkout-items-col">
            <h3 className="section-title">Order Items ({totalItemsCount})</h3>
            <ul className="checkout-items-list">
              {cart.items.map((item) => {
                const product = productById.get(item.productId)
                const lineTotal = item.qty * item.price
                return (
                  <li key={item.productId} className="checkout-item-row">
                    {product?.imageUrl && (
                      <div className="checkout-item-thumb">
                        <img src={product.imageUrl} alt={product.name} />
                      </div>
                    )}
                    <div className="checkout-item-details">
                      <h4>{product?.name ?? item.productId}</h4>
                      <p className="checkout-item-cat">{product?.category ?? 'Gear'}</p>
                      <div className="checkout-item-price-meta">
                        <span>Qty: <strong>{item.qty}</strong></span>
                        <span>×</span>
                        <span>${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="checkout-item-action">
                      <span className="line-total">${lineTotal.toFixed(2)}</span>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => onRemove(item.productId)}
                        title="Remove item"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Side Summary Column */}
          <div className="checkout-summary-col">
            <div className="checkout-summary-card">
              <h3>Summary</h3>

              <div className="summary-breakdown">
                <div className="breakdown-row">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="breakdown-row">
                  <span>Est. Shipping</span>
                  <span className="free-text">FREE</span>
                </div>
                <div className="breakdown-row">
                  <span>Taxes</span>
                  <span>$0.00</span>
                </div>
                <div className="breakdown-divider" />
                <div className="breakdown-row total-row">
                  <span>Order Total</span>
                  <span className="total-amount">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="demo-notice">
                <ShieldCheckIcon size={18} />
                <span>Demo environment: Order will process immediately via Serverless API Gateway.</span>
              </div>

              <button
                type="button"
                className="place-order-btn"
                onClick={onPlaceOrder}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <>
                    <div className="spinner-small" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon size={18} />
                    <span>Place Order · ${cartTotal.toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
