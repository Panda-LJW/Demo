const API_PREFIX = '/api';

let currentToken = localStorage.getItem('token') || null;
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');

function fail(code, message) {
  return { code, message, data: null };
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

async function request(path, options = {}) {
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_PREFIX}${path}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return fail(response.status || 500, '接口返回格式不是 JSON');
    }

    const result = await response.json();

    if (response.status === 401) {
      setToken(null);
      setUser(null);
    }

    return result;
  } catch (error) {
    return fail(500, '无法连接 mock 服务器，请确认 mock 服务已启动');
  }
}

export function getToken() {
  return currentToken;
}

export function setToken(token) {
  currentToken = token;
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

export function getUser() {
  return currentUser;
}

export function setUser(user) {
  currentUser = user;
  if (user) localStorage.setItem('user', JSON.stringify(user));
  else localStorage.removeItem('user');
}

export async function login(username, password) {
  if (!username) return fail(400, '缺少必填参数: username');
  if (!password) return fail(400, '缺少必填参数: password');

  const response = await request('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  if (response.code === 0) {
    setToken(response.data.token);
    setUser(response.data.user);
  }

  return response;
}

export async function logout() {
  setToken(null);
  setUser(null);
  return { code: 0, message: 'success', data: null };
}

export async function getBooks(params = {}) {
  return request(`/books${buildQuery(params)}`);
}

export async function getBookById(id) {
  return request(`/books/${id}`);
}

export async function createBook(data) {
  return request('/books', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function borrowBook(id) {
  return request(`/books/${id}/borrow`, {
    method: 'POST',
  });
}

export async function returnBook(id) {
  return request(`/books/${id}/return`, {
    method: 'POST',
  });
}

export async function getMyBorrows() {
  return request('/users/me/borrows');
}
