// Admin API helper — centralized fetch logic for admin endpoints
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ADMIN_API = `${SUPABASE_URL}/functions/v1/admin-api`;

function getToken(): string | null {
  return sessionStorage.getItem('admin_token');
}

export function getAdminInfo(): { username: string; display_name: string; role: string } | null {
  const raw = sessionStorage.getItem('admin_info');
  return raw ? JSON.parse(raw) : null;
}

export function isAdminAuthenticated(): boolean {
  return !!getToken();
}

export function logoutAdmin() {
  sessionStorage.removeItem('admin_token');
  sessionStorage.removeItem('admin_info');
}

export async function adminLogin(username: string, password: string): Promise<boolean> {
  const res = await fetch(`${ADMIN_API}/auth`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (data.success && data.token) {
    sessionStorage.setItem('admin_token', data.token);
    sessionStorage.setItem('admin_info', JSON.stringify(data.admin));
    return true;
  }
  return false;
}

async function api(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${ADMIN_API}/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': token,
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      ...(options.headers || {}),
    },
  });

  // If unauthorized, clear stale session and redirect to login
  if (res.status === 401) {
    logoutAdmin();
    window.location.href = '/admin/login';
    throw new Error('Session expired');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API error');
  return data;
}

// Stats
export const getStats = () => api('stats');

// Analytics
export const getAnalytics = () => api('analytics');
export const resetAnalytics = () => api('analytics/reset', { method: 'POST' });

// Users
export const getUsers = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return api(`users${qs}`);
};

export const createUser = (user: {
  name: string;
  email: string;
  phone?: string;
  payment_method: string;
  payment_amount?: number;
  notes?: string;
}) => api('users', { method: 'POST', body: JSON.stringify(user) });

export const updateUser = (id: string, updates: Record<string, any>) =>
  api(`users/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });

export const deleteUser = (id: string) =>
  api(`users/${id}`, { method: 'DELETE' });

export const getUserActivity = (id: string) =>
  api(`users/${id}/activity`);

// Magic Link
export const resendMagicLink = (userId: string) =>
  api(`users/${userId}/resend-magic-link`, { method: 'POST' });



// Webhooks
export const getWebhooks = () => api('webhooks');

export const createWebhook = (webhook: {
  name: string;
  url: string;
  events: string[];
  secret?: string;
}) => api('webhooks', { method: 'POST', body: JSON.stringify(webhook) });

export const updateWebhook = (id: string, updates: Record<string, any>) =>
  api(`webhooks/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });

export const deleteWebhook = (id: string) =>
  api(`webhooks/${id}`, { method: 'DELETE' });

export const getWebhookDeliveries = (id: string) =>
  api(`webhooks/${id}/deliveries`);

export const testWebhook = (id: string) =>
  api(`webhooks/${id}/test`, { method: 'POST' });

// Admin Users
export const getAdminUsers = () => api('admins');

export const createAdminUser = (admin: {
  username: string;
  password: string;
  display_name?: string;
  admin_role?: string;
}) => api('admins', { method: 'POST', body: JSON.stringify(admin) });

export const updateAdminUser = (id: string, updates: Record<string, any>) =>
  api(`admins/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });

export const deleteAdminUser = (id: string) =>
  api(`admins/${id}`, { method: 'DELETE' });

// Site Settings (public read, admin write)
export const getSiteSetting = async (key: string) => {
  const res = await fetch(`${ADMIN_API}/site-settings/${key}`, {
    headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` }
  });
  if (!res.ok) return null;
  return res.json();
};

export const updateSiteSetting = (key: string, value: any) =>
  api(`site-settings/${key}`, { method: 'PUT', body: JSON.stringify(value) });
