import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { Card, Button, Badge, Spinner, EmptyState } from '../UI'
import styles from './CustomerSteps.module.css'

const DISH_IMAGES = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=70',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=70',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=70',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=70',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=70',
  'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=70',
]

function getImage(dishId) {
  return DISH_IMAGES[(dishId - 1) % DISH_IMAGES.length]
}

export default function MenuPage({ session, onOrderPlaced }) {
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([]) // array of dish._id
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getMenu()
      .then(data => setDishes(data))
      .catch(() => setError('Could not load menu'))
      .finally(() => setLoading(false))
  }, [])

  function toggleCart(id) {
    setCart(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id])
  }

  async function handleOrder() {
    if (!cart.length) return
    setPlacing(true)
    setError('')
    try {
      const result = await api.placeOrder({ tableNo: session.tableNo, dishes: cart })
      onOrderPlaced(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setPlacing(false)
    }
  }

  const cartDishes = dishes.filter(d => cart.includes(d._id))
  const cartTotal = cartDishes.reduce((sum, d) => sum + d.price, 0)

  return (
    <div className={`${styles.stepWrap} animate-fade-up`}>
      <div className={styles.stepHeader}>
        <div className={`${styles.stepTag} mono`}>STEP 03</div>
        <h2 className={`${styles.stepTitle} display`}>Choose Your Dishes</h2>
        <p className={styles.stepSub}>Tap a dish to add it to your order</p>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spinner size={32} />
        </div>
      )}

      {!loading && dishes.length === 0 && (
        <EmptyState icon="🍽" title="Menu is empty" sub="Ask staff to add dishes" />
      )}

      {!loading && dishes.length > 0 && (
        <div className={styles.menuGrid}>
          {dishes.map((dish, i) => {
            const inCart = cart.includes(dish._id)
            return (
              <button
                key={dish._id}
                type="button"
                className={`${styles.dishCard} ${inCart ? styles.dishCardActive : ''} animate-fade-up`}
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => toggleCart(dish._id)}
              >
                <div className={styles.dishImgWrap}>
                  <img
                    src={ dish.imageUrl}
                    alt={dish.name}
                    className={styles.dishImg}
                    loading="lazy"
                  />
                  {inCart && (
                    <div className={styles.dishCheckOverlay}>✓</div>
                  )}
                </div>
                <div className={styles.dishInfo}>
                  <div className={styles.dishName}>{dish.name}</div>
                  <div className={`${styles.dishPrice} mono`}>₹{dish.price}</div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Cart bar */}
      {cart.length > 0 && (
        <div className={`${styles.cartBar} animate-fade-up`}>
          <div className={styles.cartInfo}>
            <span className={styles.cartCount}>{cart.length} item{cart.length > 1 ? 's' : ''}</span>
            <span className={`${styles.cartTotal} mono`}>₹{cartTotal}</span>
          </div>
          {error && <div className={styles.cartError}>⚠ {error}</div>}
          <Button onClick={handleOrder} loading={placing} size="lg">
            {placing ? 'Placing Order…' : 'Place Order →'}
          </Button>
        </div>
      )}
    </div>
  )
}
