import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'

const PAGE_SIZE = 15

export default function Home() {
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || ''

  useEffect(() => {
    setPage(1)
  }, [search, activeCategory])

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE }
      if (search) params.search = search
      if (activeCategory) params.category = activeCategory
      const res = await axios.get('/api/posts', { params })
      setPosts(res.data)
      setTotal(Number(res.headers['x-total-count'] ?? res.data.length))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, activeCategory, page])

  useEffect(() => {
    const t = setTimeout(fetchPosts, 300)
    return () => clearTimeout(t)
  }, [fetchPosts])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const formatDate = (d) =>
    d ? format(new Date(d), 'yyyy年M月d日', { locale: zhTW }) : ''

  return (
    <div className="container-wide">
      {/* Hero */}
      <div className="hero">
        {activeCategory ? (
          <h1>{activeCategory}</h1>
        ) : (
          <>
            <h1>Winnie's Blog</h1>
            <p>分享程式開發、技術心得與生活隨筆</p>
          </>
        )}
      </div>

      {/* Search */}
      <div className="search-bar">
        <input
          className="search-input"
          aria-label="搜尋文章"
          placeholder="搜尋文章…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Posts */}
      {loading ? (
        <div className="loading">載入中…</div>
      ) : posts.length === 0 ? (
        <div className="empty">沒有符合條件的文章</div>
      ) : (
        <>
          <div className="post-grid">
            {posts.map(post => (
              <Link
                key={post.id}
                to={`/post/${post.slug}`}
                className="post-card"
              >
                <div className="card-category">{post.category}</div>
                <div className="card-title">{post.title}</div>
                {post.summary && (
                  <div className="card-summary">{post.summary}</div>
                )}
                {post.tags && (
                  <div className="card-tags">
                    {post.tags.split(',').filter(Boolean).map(t => (
                      <span key={t} className="tag">{t.trim()}</span>
                    ))}
                  </div>
                )}
                <div className="card-meta">
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="pagination" aria-label="文章分頁">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
              >
                上一頁
              </button>
              <span className="pagination-status">第 {page} / {totalPages} 頁</span>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages}
              >
                下一頁
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}
