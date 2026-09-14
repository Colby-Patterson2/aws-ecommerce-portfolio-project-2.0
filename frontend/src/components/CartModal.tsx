import type { Cart, Product } from '../types'
import { CartIcon, TrashIcon, XIcon, ShieldCheckIcon, ArrowRightIcon } from './Icons'

type CartModalProps = Readonly<{
  isOpen: boolean
  cart: Cart
  cartTotal: number
  productById: Map<string, Product>
  onClose: () => void
  onRemove: (productId: string) => void
  onGoToCheckout: () => void
}>

export default function CartModal({
  isOpen,
  cart,
  cartTotal,
  productById,
  onClose,
  onRemove,
  onGoToCheckout,
}: CartModalProps) {
  if (!isOpen) {
    return null
  }

  const totalItemsCount = cart.items.reduce((sum, item) => sum + item.qty, 0)

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="cart-panel modal-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cart-modal-head">
          <div className="cart-title-group">
            <CartIcon size={22} className="cart-header-icon" />
            <h2>Shopping Cart</h2>
            <span className="cart-badge-count">{totalItemsCount}</span>
          </div>
          <button
            type="button"
            className="icon-close-btn"
            onClick={onClose}
            aria-label="Close cart"
          >
            <XIcon size={20} />
          </button>
        </div>

        {cart.items.length === 0 ? (
          <div className="empty-cart-state">
            <CartIcon size={48} className="empty-cart-icon" />
            <p className="empty-title">Your cart is empty</p>
            <p className="empty-subtitle">Explore our outdoor gear catalog to add items.</p>
            <button type="button" className="secondary-button" onClick={onClose}>
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <ul className="cart-items-list">
              {cart.items.map((item) => {
                const product = productById.get(item.productId)
                const itemSubtotal = item.qty * item.price
                return (
                  <li key={item.productId} className="cart-item-row">
                    {product?.imageUrl && (
                      <div className="cart-item-thumb">
                        <img src={product.imageUrl} alt={product.name} />
                      </div>
                    )}
                    <div className="cart-item-info">
                      <h4 className="cart-item-name">{product?.name ?? item.productId}</h4>
                      <p className="cart-item-meta">
                        Qty: <strong>{item.qty}</strong> × ${item.price.toFixed(2)}
                      </p>
                      <span className="cart-item-subtotal">${itemSubtotal.toFixed(2)}</span>
                    </div>
                    <button
                      type="button"
                      className="cart-remove-btn"
                      onClick={() => onRemove(item.productId)}
                      title="Remove item"
                      aria-label={`Remove ${product?.name ?? item.productId}`}
                    >
                      <TrashIcon size={16} />
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="cart-trust-note">
              <ShieldCheckIcon size={16} />
              <span>Free returns & serverless instant checkout guarantee</span>
            </div>

            <div className="cart-footer-summary">
              <div className="summary-row subtotal">
                <span>Subtotal</span>
                <strong>${cartTotal.toFixed(2)}</strong>
              </div>
              <div className="summary-row shipping">
                <span>Shipping</span>
                <span className="free-badge">FREE</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <h3>${cartTotal.toFixed(2)}</h3>
              </div>
              <button type="button" className="primary-checkout-btn" onClick={onGoToCheckout}>
                <span>Proceed to Checkout</span>
                <ArrowRightIcon size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
