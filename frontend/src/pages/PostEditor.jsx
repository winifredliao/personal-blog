import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const empty = {
  title: '', slug: '', summary: '', content: '',
  category: 'General', tags: '', published: true,
}

function toSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w一-鿿\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80)
}

export default function PostEditor() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(slug)

  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isEdit) {
      axios.get(`/api/posts/${slug}`).then(r => setForm(r.data)).catch(() => setError('找不到文章'))
    }
  }, [slug, isEdit])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleTitleChange = (v) => {
    set('title', v)
    if (!isEdit) set('slug', toSlug(v))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isEdit) {
        await axios.put(`/api/posts/${slug}`, form)
        setSuccess('文章已更新！')
        setTimeout(() => navigate(`/post/${slug}`), 800)
      } else {
        const res = await axios.post('/api/posts', form)
        setSuccess('文章已發布！')
        setTimeout(() => navigate(`/post/${res.data.slug}`), 800)
      }
    } catch (err) {
      setError(err.response?.data?.detail || '操作失敗，請再試一次')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <Link to="/" className="back-link">← 回首頁</Link>
      <div className="editor-page">
        <h2>{isEdit ? '✏️ 編輯文章' : '📝 新增文章'}</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>標題 *</label>
            <input
              className="form-control"
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="文章標題"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Slug（網址）*</label>
              <input
                className="form-control"
                value={form.slug}
                onChange={e => set('slug', e.target.value)}
                placeholder="my-post-slug"
                required
              />
            </div>
            <div className="form-group">
              <label>分類</label>
              <input
                className="form-control"
                value={form.category}
                onChange={e => set('category', e.target.value)}
                placeholder="技術、生活、公告…"
              />
            </div>
          </div>

          <div className="form-group">
            <label>摘要</label>
            <input
              className="form-control"
              value={form.summary}
              onChange={e => set('summary', e.target.value)}
              placeholder="一句話描述文章內容（選填）"
            />
          </div>

          <div className="form-group">
            <label>標籤（逗號分隔）</label>
            <input
              className="form-control"
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder="React,Python,教學"
            />
          </div>

          <div className="form-group">
            <label>內容（支援 Markdown）*</label>
            <textarea
              className="form-control"
              rows={18}
              value={form.content}
              onChange={e => set('content', e.target.value)}
              placeholder="## 標題&#10;&#10;在這裡輸入文章內容，支援 Markdown 語法…"
              required
            />
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="published"
                checked={form.published}
                onChange={e => set('published', e.target.checked)}
              />
              <label htmlFor="published">立即發布</label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '.75rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '儲存中…' : isEdit ? '💾 儲存更改' : '🚀 發布文章'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
