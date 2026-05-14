import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookPlus, CheckCircle2, ImagePlus } from 'lucide-react';
import { createBook } from '../api/client';

const categories = ['技术', '文学', '管理', '其他'];

export default function DonateBookPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    author: '',
    publisher: '',
    category: '技术',
    description: '',
    cover: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, submit: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = '请填写书名';
    if (!form.author.trim()) next.author = '请填写作者';
    if (!categories.includes(form.category)) next.category = '请选择有效分类';
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    const response = await createBook(form);
    setIsSubmitting(false);

    if (response.code === 0) {
      setIsSuccess(true);
      window.setTimeout(() => navigate('/books'), 1200);
    } else {
      setErrors({ submit: response.message });
    }
  };

  if (isSuccess) {
    return (
      <section className="card empty-state success-state">
        <CheckCircle2 size={64} />
        <h1 className="empty-state-title">捐书成功</h1>
        <p className="empty-state-desc">图书已进入共享书架，团队成员现在可以看到它了。</p>
        <button className="btn btn-primary btn-sm" type="button" onClick={() => navigate('/books')}>
          返回列表
        </button>
      </section>
    );
  }

  return (
    <div className="donate-page page-stack">
      <button className="back-link" type="button" onClick={() => navigate(-1)}>
        返回
      </button>

      <section className="page-hero compact">
        <div>
          <p className="eyebrow">Donate A Book</p>
          <h1 className="page-title">捐书页</h1>
          <p className="page-desc">填写书名和作者即可提交；出版社、简介和封面 URL 可以稍后补充。</p>
        </div>
      </section>

      <form className="donate-layout" onSubmit={handleSubmit}>
        <section className="card form-card">
          {errors.submit && <div className="login-error show">{errors.submit}</div>}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="title">书名 <span className="required">*</span></label>
              <input
                id="title"
                className={`form-input ${errors.title ? 'error' : ''}`}
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="例如：深入理解计算机系统"
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="author">作者 <span className="required">*</span></label>
              <input
                id="author"
                className={`form-input ${errors.author ? 'error' : ''}`}
                value={form.author}
                onChange={(event) => updateField('author', event.target.value)}
                placeholder="作者姓名"
              />
              {errors.author && <span className="form-error">{errors.author}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="publisher">出版社</label>
              <input
                id="publisher"
                className="form-input"
                value={form.publisher}
                onChange={(event) => updateField('publisher', event.target.value)}
                placeholder="选填"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="category">分类 <span className="required">*</span></label>
              <select
                id="category"
                className="form-select"
                value={form.category}
                onChange={(event) => updateField('category', event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cover">封面图 URL</label>
            <input
              id="cover"
              className="form-input"
              value={form.cover}
              onChange={(event) => updateField('cover', event.target.value)}
              placeholder="https://example.com/cover.jpg"
            />
            <span className="form-hint">可留空，列表页会展示默认书籍占位视觉。</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">简介</label>
            <textarea
              id="description"
              className="form-textarea"
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="简单介绍这本书适合谁读、为什么值得分享..."
            />
          </div>

          <div className="form-actions">
            <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} />
              取消
            </button>
            <button className="btn btn-accent" type="submit" disabled={isSubmitting}>
              <BookPlus size={16} />
              {isSubmitting ? '提交中...' : '确认捐书'}
            </button>
          </div>
        </section>

        <aside className="card donate-aside">
          <div className="aside-icon">
            <ImagePlus size={30} />
          </div>
          <h2>表单规则</h2>
          <p>书名与作者是必填项。提交失败时会保留表单内容，方便你直接修正。</p>
          <ul>
            <li>分类使用固定下拉选项</li>
            <li>封面 URL 允许为空</li>
            <li>成功后自动返回图书列表</li>
          </ul>
        </aside>
      </form>
    </div>
  );
}
