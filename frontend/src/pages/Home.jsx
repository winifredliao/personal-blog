import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || ''

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (activeCategory) params.category = activeCategory
      const res = await axios.get('/api/posts', { params })
      setPosts(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, activeCategory])

  useEffect(() => {
    const t = setTimeout(fetchPosts, 300)
    return () => clearTimeout(t)
  }, [fetchPosts])

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
      )}
    </div>
  )
}
