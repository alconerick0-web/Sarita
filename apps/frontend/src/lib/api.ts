const BASE = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'Error en la petición');
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request<{ id: number; name: string; email: string; role: string; permissions: string[] }>('/auth/me'),

  // Categories
  categories: () => request<any[]>('/categories?active=true'),

  // Categories (all, no filter)
  allCategories: () => request<any[]>('/categories'),
  createCategory: (data: any) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: number, data: any) => request(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  toggleCategory: (id: number) => request(`/categories/${id}/toggle`, { method: 'PATCH' }),
  deleteCategory: (id: number) => request(`/categories/${id}`, { method: 'DELETE' }),

  // Products
  products: (active = true) => request<any[]>(`/products${active ? '?active=true' : ''}`),
  product: (id: number) => request<any>(`/products/${id}`),
  productIngredients: (id: number) => request<any[]>(`/products/${id}/ingredients`),
  createProduct: (data: any) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: any) => request(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  toggleProduct: (id: number) => request(`/products/${id}/toggle`, { method: 'PATCH' }),
  deleteProduct: (id: number) => request(`/products/${id}`, { method: 'DELETE' }),

  // Flavors
  flavors: () => request<any[]>('/flavors?active=true'),

  // Ingredients
  ingredients: () => request<any[]>('/ingredients'),
  lowStock: () => request<any[]>('/ingredients/low-stock'),
  restock: (id: number, quantity: number, reason: string) =>
    request(`/ingredients/${id}/restock`, { method: 'POST', body: JSON.stringify({ quantity, reason }) }),
  createIngredient: (data: any) => request('/ingredients', { method: 'POST', body: JSON.stringify(data) }),
  updateIngredient: (id: number, data: any) => request(`/ingredients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  toggleIngredient: (id: number) => request(`/ingredients/${id}/toggle`, { method: 'PATCH' }),
  deleteIngredient: (id: number) => request(`/ingredients/${id}`, { method: 'DELETE' }),

  // Orders
  createOrder: (customerName?: string) =>
    request<any>('/orders', { method: 'POST', body: JSON.stringify({ customerName }) }),
  addItem: (orderId: number, item: any) =>
    request<any>(`/orders/${orderId}/items`, { method: 'POST', body: JSON.stringify(item) }),
  removeItem: (orderId: number, itemId: number) =>
    request(`/orders/${orderId}/items/${itemId}`, { method: 'DELETE' }),
  completeOrder: (orderId: number) =>
    request<any>(`/orders/${orderId}/complete`, { method: 'POST' }),
  cancelOrder: (orderId: number) =>
    request(`/orders/${orderId}/cancel`, { method: 'POST' }),
  orders: (all = false) => request<any[]>(`/orders${all ? '?all=true' : ''}`),

  // Invoices
  invoices: () => request<any[]>('/invoices'),
  invoice: (id: number) => request<any>(`/invoices/${id}`),
  invoicePdfUrl: (id: number) => `${BASE}/api/invoices/${id}/pdf`,

  // Recipe PDF export
  recipePdfUrl: (params?: { categoryId?: number }) => {
    const qs = params?.categoryId ? `?categoryId=${params.categoryId}` : '';
    return `${BASE}/api/products/recipe-pdf${qs}`;
  },

  // Reports
  dashboard: () => request<any>('/reports/dashboard'),
  revenue: (period: 'day' | 'week' | 'month') => request<any>(`/reports/revenue?period=${period}`),
  topProducts: () => request<any[]>('/reports/top-products'),

  // Users
  users: () => request<any[]>('/users'),
  createUser: (data: any) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: number, data: any) => request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Roles
  roles: () => request<any[]>('/roles'),
  createRole: (data: any) => request('/roles', { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (id: number, data: any) => request(`/roles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};
