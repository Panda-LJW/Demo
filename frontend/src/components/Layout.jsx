import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookMarked, BookOpen, LogOut, PlusCircle, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isLoginPage = location.pathname === '/login';
  if (isLoginPage) return children;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-layout">
      <header className="navbar">
        <div className="navbar-inner">
          <Link to="/books" className="brand">
            <span className="brand-mark">书</span>
            <span>团队图书共享</span>
          </Link>
          <nav className="navbar-nav" aria-label="主导航">
            <Link to="/books" className={`navbar-link ${isActive('/books') ? 'active' : ''}`}>
              <BookOpen size={16} />
              <span>图书列表</span>
            </Link>
            <Link to="/my-borrows" className={`navbar-link ${isActive('/my-borrows') ? 'active' : ''}`}>
              <BookMarked size={16} />
              <span>我的借阅</span>
            </Link>
            <Link to="/books/new" className={`navbar-link ${isActive('/books/new') ? 'active' : ''}`}>
              <PlusCircle size={16} />
              <span>我要捐书</span>
            </Link>
          </nav>
          <div className="navbar-user-area">
            {user && (
              <>
                <div className="navbar-user">
                  <span className="navbar-avatar">{user.name?.slice(0, 1) || <UserRound size={16} />}</span>
                  <span>{user.name}</span>
                </div>
                <button className="icon-btn logout-btn" onClick={handleLogout} title="退出登录" aria-label="退出登录">
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="page-container">
        {children}
      </main>
    </div>
  );
}
