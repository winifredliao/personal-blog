import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import axios from 'axios'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'

export default function PostDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(`/api/posts/${slug}`)
      .then(r => setPost(r.data))
      .catch(() => setError('文章不存在或已被刪除'))
      .finally(() => setLoading(false))
  }, [slug])

  const handleDelete = async () => {
    if (!window.confirm('確定要刪除這篇文章嗎？')) return
    await axios.delete(`/api/posts/${slug}`)
    navigate('/')
  }

  if (loading) return <div className="loading">載入中…</div>
  if (error) return (
    <div className="container">
      <div className="alert alert-danger">{error}</div>
      <Link to="/" className="back-link">← 回首頁</Link>
    </div>
  )

  return (
    <div className="container">
      <Link to="/" className="back-link">← 回首頁</Link>

      <article className="post-detail">
        <header className="post-header">
          <div className="post-header-category">{post.category}</div>
          <h1>{post.title}</h1>
          <div className="post-header-meta">
            <span>🗓 {format(new Date(post.created_at), 'yyyy年M月d日 HH:mm', { locale: zhTW })}</span>
            {post.tags && (
              <span>🏷 {post.tags.split(',').filter(Boolean).map(t => t.trim()).join(' · ')}</span>
            )}
          </div>
        </header>

        {/* 操作按鈕 */}
        <div className="post-actions">
          <button className="btn btn-outline" onClick={() => navigate(`/edit/${slug}`)}>
            ✏️ 編輯
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            🗑 刪除
          </button>
        </div>

        {/* Markdown 內容 */}
        <div className="markdown-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>{children}</code>
                )
              },
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  )
}
