import { Link } from 'react-router-dom';
import { BookOpen, UserRound } from 'lucide-react';
import StatusChip from './StatusChip';

export default function BookCard({ book }) {
  return (
    <Link to={`/books/${book.id}`} className="book-card card card-clickable">
      <div className="book-cover-wrap">
        <img
          src={book.cover}
          alt={book.title}
          className="card-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="cover-fallback">
          <BookOpen size={42} />
        </div>
        <div className="book-card-status">
          <StatusChip status={book.status} />
        </div>
      </div>
      <div className="card-body book-card-body">
        <p className="book-category">{book.category}</p>
        <h3 className="card-title">{book.title}</h3>
        <p className="card-subtitle">{book.author}</p>
        <div className="card-meta">
          <span className="owner-line">
            <UserRound size={14} />
            {book.owner?.name || '未知'} 捐赠
          </span>
          {book.borrower && <span className="borrower-line">{book.borrower.name} 借阅中</span>}
        </div>
      </div>
    </Link>
  );
}
