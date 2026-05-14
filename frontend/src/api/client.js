import { mockUsers, mockBooks, categories, findUserById, findBookById, pickUser, pickOwner, formatBookListItem, formatBookDetail } from './mockData';

function delay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function success(data, message = 'success') {
  return { code: 0, message, data };
}

function fail(code, message) {
  return { code, message, data: null };
}

// 存储当前登录用户的 token（模拟）
let currentToken = localStorage.getItem('token') || null;
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');

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

// 检查 token（模拟）
function checkAuth() {
  if (!currentToken || !currentUser) {
    throw { statusCode: 401, message: '未登录或token已过期' };
  }
}

// ===== API 接口 =====

export async function login(username, password) {
  await delay();
  if (!username) return fail(400, '缺少必填参数: username');
  if (!password) return fail(400, '缺少必填参数: password');

  const user = mockUsers.find(u => u.username === username);
  if (!user || user.password !== password) {
    return fail(1001, '用户名或密码错误');
  }

  const token = `mock-token-${user.id}-${Date.now()}`;
  setToken(token);
  setUser(pickUser(user));

  return success({ token, user: pickUser(user) });
}

export async function logout() {
  setToken(null);
  setUser(null);
  return success(null);
}

export async function getBooks({ keyword, category } = {}) {
  await delay();
  checkAuth();

  let list = [...mockBooks];

  if (keyword) {
    const k = keyword.toString().trim();
    list = list.filter(b => b.title.includes(k) || b.author.includes(k));
  }

  if (category) {
    const c = category.toString().trim();
    list = list.filter(b => b.category === c);
  }

  const result = list.map(formatBookListItem);
  return success({ list: result, total: result.length });
}

export async function getBookById(id) {
  await delay();
  checkAuth();

  const book = findBookById(Number(id));
  if (!book) return fail(404, '图书不存在');

  return success(formatBookDetail(book));
}

export async function createBook(data) {
  await delay();
  checkAuth();

  const { title, author, publisher, description, category, cover } = data;

  if (!title) return fail(400, '缺少必填参数: title');
  if (!author) return fail(400, '缺少必填参数: author');
  if (category && !categories.includes(category)) {
    return fail(400, 'category 必须是: 技术/文学/管理/其他');
  }

  const now = new Date().toISOString();
  const newBook = {
    id: mockBooks.length + 1,
    title,
    author,
    publisher: publisher || '',
    description: description || '',
    category: category || '其他',
    cover: cover || '',
    ownerId: currentUser.id,
    status: 'available',
    borrowerId: null,
    borrowedAt: null,
    dueDate: null,
    borrowHistory: [],
    createdAt: now,
  };

  mockBooks.push(newBook);

  return success({
    id: newBook.id,
    title: newBook.title,
    status: newBook.status,
    owner: pickOwner(currentUser),
    createdAt: newBook.createdAt,
  });
}

export async function borrowBook(id) {
  await delay();
  checkAuth();

  const book = findBookById(Number(id));
  if (!book) return fail(404, '图书不存在');

  if (book.ownerId === currentUser.id) {
    return fail(2002, '不能借阅自己捐赠的图书');
  }

  if (book.status === 'borrowed') {
    return fail(2001, '该图书已被借出');
  }

  const now = new Date();
  const dueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const nowIso = now.toISOString();
  const dueIso = dueDate.toISOString();

  book.status = 'borrowed';
  book.borrowerId = currentUser.id;
  book.borrowedAt = nowIso;
  book.dueDate = dueIso;

  book.borrowHistory.push({
    userId: currentUser.id,
    userName: currentUser.name,
    action: 'borrow',
    time: nowIso,
  });

  return success({ borrowedAt: nowIso, dueDate: dueIso });
}

export async function returnBook(id) {
  await delay();
  checkAuth();

  const book = findBookById(Number(id));
  if (!book) return fail(404, '图书不存在');

  if (book.status !== 'borrowed') {
    return fail(2003, '该图书当前未被借出');
  }

  if (book.borrowerId !== currentUser.id) {
    return fail(403, '只有当前借阅人可以归还');
  }

  const nowIso = new Date().toISOString();

  book.status = 'available';
  book.borrowerId = null;
  book.borrowedAt = null;
  book.dueDate = null;

  book.borrowHistory.push({
    userId: currentUser.id,
    userName: currentUser.name,
    action: 'return',
    time: nowIso,
  });

  return success({ returnedAt: nowIso });
}

export async function getMyBorrows() {
  await delay();
  checkAuth();

  const list = mockBooks.flatMap((book) => {
    const records = [];

    if (book.borrowerId === currentUser.id && book.borrowedAt) {
      records.push({
        borrowId: Number(`${book.id}${currentUser.id}`),
        book: {
          id: book.id,
          title: book.title,
          cover: book.cover,
        },
        borrowedAt: book.borrowedAt,
        dueDate: book.dueDate,
        returnedAt: null,
        status: 'borrowing',
      });
    }

    book.borrowHistory.forEach((entry, index) => {
      if (entry.userId !== currentUser.id || entry.action !== 'borrow') return;
      const returnEntry = book.borrowHistory.slice(index + 1).find(
        item => item.userId === currentUser.id && item.action === 'return'
      );
      if (!returnEntry) return;

      const borrowedAt = entry.time;
      const dueDate = new Date(new Date(borrowedAt).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
      records.push({
        borrowId: Number(`${book.id}${currentUser.id}${index}`),
        book: {
          id: book.id,
          title: book.title,
          cover: book.cover,
        },
        borrowedAt,
        dueDate,
        returnedAt: returnEntry.time,
        status: 'returned',
      });
    });

    return records;
  }).sort((a, b) => new Date(b.borrowedAt) - new Date(a.borrowedAt));

  return success({ list, total: list.length });
}
