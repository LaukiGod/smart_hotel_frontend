const BASE = '/api'

// ── Secret helpers ─────────────────────────────────────
export const getSecret = () => localStorage.getItem('restaurantSecret')
export const saveSecret = (code) => localStorage.setItem('restaurantSecret', code)
export const clearSecret = () => localStorage.removeItem('restaurantSecret')

async function request(method, path, body, useSecret = false) {
  const headers = { 'Content-Type': 'application/json' }

  if (useSecret) {
    headers['x-restaurant-secret'] = getSecret()
  }

  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)

  const res = await fetch(`${BASE}${path}`, opts)

  // Secret was wrong or missing
if (res.status === 403) {
    throw new Error('Invalid secret. Access denied.')
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed')
  return data
}

// ── Customer (no secret needed) ────────────────────────
export const api = {
  loginTable:   (body) => request('POST', '/user/login-table', body),
  setAllergies: (body) => request('POST', '/user/set-allergies', body),
  getMenu:      ()     => request('GET',  '/user/menu'),
  placeOrder:   (body) => request('POST', '/user/order', body),
  clearTable:   (body) => request('POST', '/user/clear-table', body),

  // ── Restaurant (secret required) ──────────────────────
  getOrders:       ()     => request('GET',    '/restaurant/orders',           null, true),
  updateOrderStatus:(body) => request('POST',   '/restaurant/order-status',     body, true),
  getAlerts:       ()     => request('GET',    '/restaurant/alerts',           null, true),
  getInventory:    ()     => request('GET',    '/restaurant/inventory',        null, true),
  addInventory:    (body) => request('POST',   '/restaurant/add-inventory',    body, true),
  updateInventory: (id, body) => request('PUT', `/restaurant/inventory/${id}`,  body, true),
  deleteInventory: (id)   => request('DELETE', `/restaurant/inventory/${id}`,  null, true),
  getTables:       ()     => request('GET',    '/restaurant/tables',           null, true),
  addDish:         (body) => request('POST',   '/restaurant/add-dish',         body, true),
  updateDish:      (body) => request('PUT',    '/restaurant/update-dish',      body, true),
  deleteDish:      (id)   => request('DELETE', `/restaurant/dish/${id}`,       null, true),
}