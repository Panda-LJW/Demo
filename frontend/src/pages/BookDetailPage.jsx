import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, CalendarDays, CheckCircle2, Clock3, RotateCcw, UserRound } from 'lucide-react';
import { borrowBook, getBookById, returnBook } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusChip from '../components/StatusChip';

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('zh-CN');
}

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');

  const fetchBook = async () => {
    setIsLoading(true);
    const response = await getBookById(id);
    if (response.code === 0) {
      setBook(response.data);
    } else {
      setToast(response.message);
      setBook(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  const handleBorrow = async () => {
    setActionLoading(true);
    const response = await borrowBook(id);
    setToast(response.code === 0 ? '借阅成功，请在 14 天内归还' : response.message);
    if (response.code === 0) await fetchBook();
    setActionLoading(false);
  };

  const handleReturn = async () => {
    setActionLoading(true);
    const response = await returnBook(id);
    setToast(response.code === 0 ? '归还成功，感谢及时分享' : response.message);
    if (response.code === 0) await fetchBook();
    setActionLoading(false);
  };

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>正在翻到详情页...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="card empty-state">
        <div className="empty-state-icon">404</div>
        <h1 className="empty-state-title">图书不存在</h1>
        <p className="empty-state-desc">{toast || '这本书可能已经被移出共享书架。'}</p>
        <Link to="/books" className="btn btn-secondary btn-sm">返回列表</Link>
      </div>
    );
  }

  const isOwner = user?.id === book.owner?.id;
  const isBorrower = user?.id === book.borrower?.id;
  const canBorrow = book.status === 'available' && !isOwner;
  const canReturn = book.status === 'borrowed' && isBorrower;

  return (
    <div className="detail-page page-stack">
      {toast && (
        <div className={`toast toast-inline ${toast.includes('成功') ? 'toast-success' : ''}`}>
          {toast.includes('成功') ? <CheckCircle2 size={16} /> : null}
          {toast}
        </div>
      )}

      <button className="back-link" type="button" onClick={() => navigate(-1)}>返回</button>

      <section className="detail-grid">
        <div className="detail-cover-card card">
          <img
            src={book.cover}
            alt={book.title}
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
          <div className="detail-cover-fallback">
            <BookOpen size={54} />
          </div>
        </div>

        <article className="detail-panel card">
          <div className="detail-heading">
            <div>
              <p className="eyebrow">{book.category}</p>
              <h1>{book.title}</h1>
              <p>{book.author}</p>
            </div>
            <StatusChip status={book.status} />
          </div>

          <div className="detail-facts">
            <div>
              <UserRound size={18} />
              <span>持有人</span>
              <strong>{book.owner?.name || '未知'}</strong>
            </div>
            <div>
              <BookOpen size={18} />
              <span>出版社</span>
              <strong>{book.publisher || '未填写'}</strong>
            </div>
            <div>
              <CalendarDays size={18} />
              <span>上架时间</span>
              <strong>{formatDate(book.createdAt)}</strong>
            </div>
          </div>

          {book.borrower && (
            <div className="borrow-note">
              <Clock3 size={18} />
              <span>{book.borrower.name} 正在借阅，应于 {formatDate(book.borrower.dueDate)} 前归还。</span>
            </div>
          )}

          <div className="detail-description">
            <h2>简介</h2>
            <p>{book.description || '暂无简介。'}</p>
          </div>

          <div className="detail-actions">
            {canBorrow && (
              <button className="btn btn-primary" type="button" onClick={handleBorrow} disabled={actionLoading}>
                {actionLoading ? '提交中...' : '申请借阅'}
              </button>
            )}
            {canReturn && (
              <button className="btn btn-success" type="button" onClick={handleReturn} disabled={actionLoading}>
                <RotateCcw size={16} />
                {actionLoading ? '处理中...' : '归还图书'}
              </button>
            )}
            {isOwner && <span className="action-copy">这是你捐赠的图书，仅可查看借阅状态。</span>}
            {!canBorrow && !canReturn && !isOwner && <span className="action-copy">他人已借出，暂时只能查看详情。</span>}
          </div>
        </article>
      </section>

      <section className="card history-card">
        <div className="section-head">
          <h2>借阅历史</h2>
          <span>{book.borrowHistory?.length || 0} 条记录</span>
        </div>
        {book.borrowHistory?.length ? (
          <ul className="history-list">
            {book.borrowHistory.map((item, index) => (
              <li className="history-item" key={`${item.userId}-${item.time}-${index}`}>
                <span className={`history-action ${item.action}`}>{item.action === 'borrow' ? '借阅' : '归还'}</span>
                <span>{item.userName}</span>
                <span className="history-time">{formatDateTime(item.time)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-inline">暂无借阅历史，等待第一位读者。</div>
        )}
      </section>
    </div>
  );
}
