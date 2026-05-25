const API_BASE = '/api';
const STORAGE_KEY = 'bustrack-session';

function saveSession(token, user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

function getToken() {
  const session = getSession();
  return session?.token || null;
}

function getUser() {
  const session = getSession();
  return session?.user || null;
}

function logout() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.href = 'login.html';
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

async function authFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (response.status === 401) {
    if (options.silent) {
      clearSession();
      throw new Error('Sessão inválida');
    }
    logout();
    throw new Error('Sessão expirada. Faça login novamente');
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : {};

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Erro na requisição');
  }

  return data;
}

async function validateSession() {
  if (!getToken()) return false;
  try {
    const user = await authFetch('/auth/me', { silent: true });
    saveSession(getToken(), user);
    return true;
  } catch {
    return false;
  }
}

function formatDateTime(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function routeToRolePage() {
  const user = getUser();
  if (!user) return;
  if (user.role === 'motorista') window.location.href = 'motorista.html';
  if (user.role === 'responsavel') window.location.href = 'responsavel.html';
  if (user.role === 'aluno') window.location.href = 'aluno.html';
}

function requireRole(role) {
  const user = getUser();
  if (!user) {
    window.location.href = 'login.html';
    return false;
  }
  if (user.role !== role) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function renderUserInfo(selector) {
  const user = getUser();
  const target = document.querySelector(selector);
  if (user && target) {
    target.textContent = `${user.nome} (${user.role})`;
  }
}
