import type { Order } from '../types'
import { CheckCircleIcon, ArrowLeftIcon, ShieldCheckIcon, TruckIcon } from './Icons'

type OrderConfirmationPageProps = Readonly<{
  order: Order | null
  onBackToCatalog: () => void
}>

export default function OrderConfirmationPage({
  order,
  onBackToCatalog,
}: OrderConfirmationPageProps) {
  if (!order) {
    return (
      <section className="order-page">
        <div className="order-card-wrapper error">
          <h3>Order Not Found</h3>
          <p>We could not find details for this order in your session.</p>
          <button type="button" className="primary-checkout-btn" onClick={onBackToCatalog}>
            <ArrowLeftIcon size={16} />
            <span>Return to Catalog</span>
          </button>
        </div>
      </section>
    )
  }

  const formattedDate = new Date(order.createdAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <section className="order-page">
      <div className="order-card-wrapper">
        <div className="order-badge-header">
          <CheckCircleIcon size={52} className="success-icon" />
          <h2>Order Confirmed!</h2>
          <p className="order-subtitle">
            Thank you for shopping with Northstar Outfitters. Your order has been placed successfully.
          </p>
        </div>

        <div className="order-receipt-card">
          <div className="receipt-header">
            <div>
              <span className="label">Order Reference</span>
              <p className="order-id-code">{order.orderId}</p>
            </div>
            <div className="status-pill confirmed">
              <span className="dot" />
              <span>{order.status.toUpperCase()}</span>
            </div>
          </div>

          <div className="receipt-meta-grid">
            <div className="meta-item">
              <span className="label">Date & Time</span>
              <p>{formattedDate}</p>
            </div>
            <div className="meta-item">
              <span className="label">Total Amount</span>
              <p className="total-highlight">${order.total.toFixed(2)}</p>
            </div>
            <div className="meta-item">
              <span className="label">Items</span>
              <p>{order.items?.length ?? 0} {order.items?.length === 1 ? 'item' : 'items'}</p>
            </div>
            <div className="meta-item">
              <span className="label">Fulfillment</span>
              <p>Instant Digital Processing</p>
            </div>
          </div>

          <div className="order-perks">
            <div className="perk">
              <TruckIcon size={18} />
              <span>Free Express Delivery</span>
            </div>
            <div className="perk">
              <ShieldCheckIcon size={18} />
              <span>AWS DynamoDB Verified</span>
            </div>
          </div>
        </div>

        <div className="order-action-bar">
          <button type="button" className="primary-checkout-btn" onClick={onBackToCatalog}>
            <ArrowLeftIcon size={16} />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </section>
  )
}
