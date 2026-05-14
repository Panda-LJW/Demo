import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LibraryBig, LockKeyhole, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('zhangsan');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }

    if (!password.trim()) {
      setError('请输入密码');
      return;
    }

    setIsSubmitting(true);
    const result = await login(username.trim(), password.trim());
    setIsSubmitting(false);

    if (result.success) {
      navigate('/books');
    } else {
      setError(result.error || '用户名或密码错误');
    }
  };

  return (
    <main className="login-wrapper">
      <section className="login-shell">
        <div className="login-illustration" aria-hidden="true">
          <div className="shelf shelf-one"></div>
          <div className="shelf shelf-two"></div>
          <div className="shelf shelf-three"></div>
          <div className="reading-card">
            <LibraryBig size={36} />
            <span>Team Library</span>
          </div>
        </div>

        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-heading">
            <div className="login-mark">
              <LibraryBig size={24} />
            </div>
            <h1 className="login-title">团队图书共享系统</h1>
            <p className="login-subtitle">登录后查看图书、申请借阅和提交捐书信息</p>
          </div>

          <div className={`login-error ${error ? 'show' : ''}`}>{error}</div>

          <div className="form-group">
            <label className="form-label" htmlFor="username">用户名</label>
            <div className="input-with-icon">
              <UserRound size={18} />
              <input
                id="username"
                className="form-input"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                placeholder="zhangsan"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">密码</label>
            <div className="input-password-wrapper input-with-icon">
              <LockKeyhole size={18} />
              <input
                id="password"
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="123456"
              />
              <button
                className="input-password-toggle"
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className={`btn btn-primary login-submit ${isSubmitting ? 'loading' : ''}`} type="submit">
            登录
          </button>

          <div className="login-account-strip">
            <span>测试账号</span>
            <b>zhangsan</b>
            <span>/</span>
            <b>123456</b>
          </div>
        </form>
      </section>
    </main>
  );
}
