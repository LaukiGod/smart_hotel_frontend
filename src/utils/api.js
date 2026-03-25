const BASE = '/api'

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) opts.body = JSON.stringify(body)

  const res = await fetch(`${BASE}${path}`, opts)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Request failed')
  }
  return data
}

// ── Customer ──────────────────────────────────────────────
export const api = {
  // Customer
  loginTable: (body) => request('POST', '/user/login-table', body),
  setAllergies: (body) => request('POST', '/user/set-allergies', body),
  getMenu: () => request('GET', '/user/menu'),
  placeOrder: (body) => request('POST', '/user/order', body),
  clearTable: (body) => request('POST', '/user/clear-table', body),

  // Dashboard
  getOrders: () => request('GET', '/restaurant/orders'),
  updateOrderStatus: (body) => request('POST', '/restaurant/order-status', body),
  getAlerts: () => request('GET', '/restaurant/alerts'),
  getInventory: () => request('GET', '/restaurant/inventory'),
  addInventory: (body) => request('POST', '/restaurant/add-inventory', body),
  deleteInventory: (id) => request('DELETE', `/restaurant/inventory/${id}`),
  getTables: () => request('GET', '/restaurant/tables'),
  addDish: (body) => request('POST', '/restaurant/add-dish', body),
  updateDish: (body) => request('PUT', '/restaurant/update-dish', body),
  deleteDish: (id) => request('DELETE', `/restaurant/dish/${id}`),
}
