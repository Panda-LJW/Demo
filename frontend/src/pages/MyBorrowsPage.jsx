import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CalendarClock, CircleCheck, Clock } from 'lucide-react';
import { getMyBorrows } from '../api/client';
import StatusChip from '../components/StatusChip';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('zh-CN');
}

function getBorrowStatus(item) {
  if (item.status === 'returned') return 'returned';
  if (item.dueDate && new Date(item.dueDate).getTime() < Date.now()) return 'overdue';
  return 'borrowed';
}

export default function MyBorrowsPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('all');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const response = await getMyBorrows();
      if (response.code === 0) setItems(response.data.list);
      setIsLoading(false);
    }
    load();
  }, []);

  const stats = useMemo(() => ({
    borrowed: items.filter((item) => getBorrowStatus(item) === 'borrowed').length,
    returned: items.filter((item) => getBorrowStatus(item) === 'returned').length,
    overdue: items.filter((item) => getBorrowStatus(item) === 'overdue').length,
  }), [items]);

  const visibleItems = items.filter((item) => {
    if (activeStatus === 'all') return true;
    return getBorrowStatus(item) === activeStatus;
  });

  return (
    <div className="my-borrows-page page-stack">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Borrow Records</p>
          <h1 className="page-title">我的借阅页</h1>
          <p className="page-desc">查看当前借阅、历史归还和逾期状态；点击书名可回到详情页处理归还。</p>
        </div>
      </section>

      <section className="borrow-stats">
        <button
          className={`stat-card card ${activeStatus === 'borrowed' ? 'active' : ''}`}
          type="button"
          onClick={() => setActiveStatus(activeStatus === 'borrowed' ? 'all' : 'borrowed')}
        >
          <CalendarClock size={22} />
          <span>借阅中</span>
          <strong>{stats.borrowed}</strong>
        </button>
        <button
          className={`stat-card card ${activeStatus === 'returned' ? 'active' : ''}`}
          type="button"
          onClick={() => setActiveStatus(activeStatus === 'returned' ? 'all' : 'returned')}
        >
          <CircleCheck size={22} />
          <span>已归还</span>
          <strong>{stats.returned}</strong>
        </button>
        <button
          className={`stat-card card ${activeStatus === 'overdue' ? 'active' : ''}`}
          type="button"
          onClick={() => setActiveStatus(activeStatus === 'overdue' ? 'all' : 'overdue')}
        >
          <Clock size={22} />
          <span>逾期</span>
          <strong>{stats.overdue}</strong>
        </button>
      </section>

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>正在读取借阅记录...</p>
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📖</div>
          <h2 className="empty-state-title">暂无借阅记录</h2>
          <p className="empty-state-desc">去列表页找到一本可借图书，申请借阅后会出现在这里。</p>
          <Link to="/books" className="btn btn-primary btn-sm">去图书列表</Link>
        </div>
      ) : (
        <section className="card borrow-table">
          <div className="borrow-table-head">
            <span>图书</span>
            <span>借阅日期</span>
            <span>应还日期</span>
            <span>状态</span>
          </div>
          {visibleItems.map((item) => {
            const status = getBorrowStatus(item);
            return (
              <Link className="borrow-row" to={`/books/${item.book.id}`} key={item.borrowId}>
                <span className="borrow-book">
                  <span className="borrow-cover">
                    {item.book.cover ? <img src={item.book.cover} alt="" /> : <BookOpen size={20} />}
                  </span>
                  <strong>{item.book.title}</strong>
                </span>
                <span>{formatDate(item.borrowedAt)}</span>
                <span>{formatDate(item.dueDate)}</span>
                <StatusChip status={status} />
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
