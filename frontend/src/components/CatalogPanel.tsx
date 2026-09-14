 import type { Product } from '../types'
import { CheckIcon, CartIcon, SearchIcon, SparklesIcon } from './Icons'

type CatalogPanelProps = Readonly<{
  categories: string[]
  selectedCategory: string
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
  isLoading: boolean
  visibleProducts: Product[]
  onSelectCategory: (category: string) => void
  onAddToCart: (product: Product) => void
  addedProductIds: ReadonlySet<string>
}>

export default function CatalogPanel({
  categories,
  selectedCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  isLoading,
  visibleProducts,
  onSelectCategory,
  onAddToCart,
  addedProductIds,
}: CatalogPanelProps) {
  const renderCatalogContent = () => {
    if (isLoading) {
      return (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading catalog...</p>
        </div>
      )
    }

    if (visibleProducts.length === 0) {
      return (
        <div className="empty-catalog">
          <SparklesIcon size={40} className="empty-icon" />
          <h3>No matching products found</h3>
          <p>Try adjusting your search terms or clearing the category filter.</p>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              onSearchChange('')
              onSelectCategory('All')
            }}
          >
            Reset Filters
          </button>
        </div>
      )
    }

    return (
      <div className="product-grid">
        {visibleProducts.map((product) => {
          const isAdded = addedProductIds.has(product.id)
          return (
            <article className="product-card" key={product.id}>
              <div className="card-image-container">
                <picture>
                  {product.imageUrlWebp ? (
                    <source srcSet={product.imageUrlWebp} type="image/webp" />
                  ) : null}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    loading="lazy"
                    className="product-img"
                  />
                </picture>
                <span className="category-badge">{product.category}</span>
                {product.stock && product.stock <= 5 ? (
                  <span className="stock-badge low">Only {product.stock} left</span>
                ) : (
                  <span className="stock-badge">In Stock</span>
                )}
              </div>

              <div className="card-body">
                <h3 className="product-title">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                
                <div className="card-footer">
                  <div className="price-container">
                    <span className="price-currency">$</span>
                    <span className="price-amount">{product.price.toFixed(2)}</span>
                  </div>

                  <button
                    type="button"
                    className={`add-cart-btn ${isAdded ? 'added' : ''}`}
                    onClick={() => onAddToCart(product)}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    {isAdded ? (
                      <>
                        <CheckIcon size={16} />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <CartIcon size={16} />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    )
  }

  return (
    <section className="catalog-panel">
      {/* Controls Bar: Category tabs, search input, sort selector */}
      <div className="catalog-toolbar">
        <div className="category-row" role="tablist" aria-label="Filter products by category">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={selectedCategory === category ? 'chip active' : 'chip'}
              onClick={() => onSelectCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="search-sort-group">
          <div className="search-box">
            <SearchIcon className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
              aria-label="Search products"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="sort-box">
            <label htmlFor="sort-select" className="sort-label">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="sort-select"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="catalog-header-meta">
        <span className="results-count">
          Showing <strong>{visibleProducts.length}</strong> {visibleProducts.length === 1 ? 'product' : 'products'}
        </span>
        {searchQuery && (
          <span className="search-active-pill">
            Search: "{searchQuery}"
          </span>
        )}
      </div>

      {renderCatalogContent()}
    </section>
  )
}
