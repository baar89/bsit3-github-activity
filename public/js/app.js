const API = '/api';

const state = {
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  csrfToken: null
};

const setFlash = (message, type = 'info') => {
  const flash = document.getElementById('flash');
  if (!flash) return;
  flash.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => { flash.innerHTML = ''; }, 5000);
};

const fetchCsrf = async () => {
  const response = await fetch(`${API}/csrf-token`, { credentials: 'include' });
  const data = await response.json();
  state.csrfToken = data.csrfToken;
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
  ...(state.csrfToken ? { 'x-csrf-token': state.csrfToken } : {})
});

const api = async (url, options = {}) => {
  const response = await fetch(`${API}${url}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.headers || {}),
      ...authHeaders()
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
};

const applyTheme = () => {
  const dark = localStorage.getItem('theme') === 'dark';
  document.body.classList.toggle('dark-mode', dark);
};

const toggleTheme = () => {
  const current = localStorage.getItem('theme') === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', current);
  applyTheme();
};

const logout = async () => {
  try {
    await fetchCsrf();
    await api('/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error(error.message);
  }
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
};

const countdownLabel = (endTime) => {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const total = Math.floor(diff / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}h ${m}m ${s}s`;
};

window.addEventListener('DOMContentLoaded', applyTheme);
