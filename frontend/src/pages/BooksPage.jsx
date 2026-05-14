import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookPlus, Filter, Search, X } from 'lucide-react';
import { getBooks } from '../api/client';
import BookCard from '../components/BookCard';

const categories = ['全部', '技术', '文学', '管理', '其他'];

export default function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '全部');

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    const params = {};
    if (keyword.trim()) params.keyword = keyword.trim();
    if (activeCategory !== '全部') params.category = activeCategory;

    const response = await getBooks(params);
    if (response.code === 0) {
      setBooks(response.data.list);
    }
    setIsLoading(false);
  }, [keyword, activeCategory]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const syncSearchParams = (nextKeyword, nextCategory) => {
    const next = new URLSearchParams();
    if (nextKeyword.trim()) next.set('keyword', nextKeyword.trim());
    if (nextCategory !== '全部') next.set('category', nextCategory);
    setSearchParams(next);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    syncSearchParams(keyword, activeCategory);
    fetchBooks();
  };

  const handleClear = () => {
    setKeyword('');
    syncSearchParams('', activeCategory);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    syncSearchParams(keyword, category);
  };

  return (
    <div className="books-page page-stack">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Library Catalog</p>
          <h1 className="page-title">图书列表</h1>
          <p className="page-desc">搜索、筛选并查看团队成员共享的图书，可借图书可以直接进入详情申请借阅。</p>
        </div>
        <Link to="/books/new" className="btn btn-accent">
          <BookPlus size={18} />
          我要捐书
        </Link>
      </section>

      <section className="toolbar-card card">
        <form className="search-bar" onSubmit={handleSearch}>
          <Search className="search-bar-icon" size={18} />
          <input
            className="form-input"
            type="text"
            placeholder="搜索书名或作者..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <button
            className={`search-bar-clear ${keyword ? 'visible' : ''}`}
            type="button"
            onClick={handleClear}
            aria-label="清空搜索"
          >
            <X size={15} />
          </button>
        </form>

        <div className="filter-group">
          <span className="filter-label">
            <Filter size={16} />
            分类
          </span>
          <div className="filter-tabs">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`filter-tab ${activeCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="list-summary">
        <span>共找到</span>
        <strong>{books.length}</strong>
        <span>本图书</span>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>正在整理书架...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📚</div>
          <h2 className="empty-state-title">没有找到相关图书</h2>
          <p className="empty-state-desc">换个关键词，或去捐书页添加一本新的团队藏书。</p>
          <Link to="/books/new" className="btn btn-accent btn-sm">我要捐书</Link>
        </div>
      ) : (
        <section className="book-grid">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </section>
      )}
    </div>
  );
}
