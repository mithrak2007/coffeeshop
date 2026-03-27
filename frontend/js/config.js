// Change this to your deployed Render backend URL after deployment
const API_BASE = 'https://your-backend.onrender.com/api';

// Auth helpers
const getToken = () => localStorage.getItem('brewco_token');
const getUser = () => {
  const u = localStorage.getItem('brewco_user');
  return u ? JSON.parse(u) : null;
};
const setAuth = (token, user) => {
  localStorage.setItem('brewco_token', token);
  localStorage.setItem('brewco_user', JSON.stringify(user));
};
const clearAuth = () => {
  localStorage.removeItem('brewco_token');
  localStorage.removeItem('brewco_user');
};
const isLoggedIn = () => !!getToken();
const isAdmin = () => { const u = getUser(); return u && u.role === 'admin'; };

// API fetch helper
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// Update nav based on auth state
function updateNav() {
  const user = getUser();
  const navAuth = document.getElementById('nav-auth');
  if (!navAuth) return;
  if (user) {
    navAuth.innerHTML = `
      <span class="nav-user">Hi, ${user.name.split(' ')[0]} ${user.role === 'admin' ? '⚡' : ''}</span>
      <a href="#" onclick="logout()" class="nav-btn outline">Logout</a>
    `;
  } else {
    navAuth.innerHTML = `<a href="/pages/login.html" class="nav-btn">Login</a>`;
  }
}

function logout() {
  clearAuth();
  window.location.href = '/index.html';
}

// Toast notifications
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : '✕'}</span> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 4000);
}

document.addEventListener('DOMContentLoaded', updateNav);
