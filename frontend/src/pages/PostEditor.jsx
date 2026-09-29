import { useState, useEffect, useRef } from 'react'
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
  const [dirty, setDirty] = useState(false)
  const [uploading, setUploading] = useState(false)
  const contentRef = useRef(null)

  useEffect(() => {
    if (isEdit) {
      axios.get(`/api/posts/${slug}`).then(r => setForm(r.data)).catch(() => setError('找不到文章'))
    }
  }, [slug, isEdit])

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!dirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [dirty])

  const set = (k, v) => {
    setDirty(true)
    setForm(f => ({ ...f, [k]: v }))
  }

  const handleTitleChange = (v) => {
    set('title', v)
    if (!isEdit) set('slug', toSlug(v))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await axios.post('/api/uploads/image', formData)
      const markdown = `![](${res.data.url})`
      const textarea = contentRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = form.content.slice(0, start) + markdown + form.content.slice(end)
      set('content', newContent)
      requestAnimationFrame(() => {
        const pos = start + markdown.length
        textarea.focus()
        textarea.setSelectionRange(pos, pos)
      })
    } catch (err) {
      setError(err.response?.data?.detail || '圖片上傳失敗')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isEdit) {
        await axios.put(`/api/posts/${slug}`, form)
        setDirty(false)
        setSuccess('文章已更新！')
        setTimeout(() => navigate(`/post/${slug}`), 800)
      } else {
        const res = await axios.post('/api/posts', form)
        setDirty(false)
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
        <h2>{isEdit ? '編輯文章' : '新增文章'}</h2>

        <div aria-live="polite">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="post-title">標題 *</label>
            <input
              id="post-title"
              className="form-control"
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="文章標題"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="post-slug">Slug（網址）*</label>
              <input
                id="post-slug"
                className="form-control"
                value={form.slug}
                onChange={e => set('slug', e.target.value)}
                placeholder="my-post-slug"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="post-category">分類</label>
              <input
                id="post-category"
                className="form-control"
                value={form.category}
                onChange={e => set('category', e.target.value)}
                placeholder="技術、生活、公告…"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="post-summary">摘要</label>
            <input
              id="post-summary"
              className="form-control"
              value={form.summary}
              onChange={e => set('summary', e.target.value)}
              placeholder="一句話描述文章內容（選填）"
            />
          </div>

          <div className="form-group">
            <label htmlFor="post-tags">標籤（逗號分隔）</label>
            <input
              id="post-tags"
              className="form-control"
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder="React,Python,教學"
            />
          </div>

          <div className="form-group">
            <label htmlFor="post-content">內容（支援 Markdown）*</label>
            <div className="editor-toolbar">
              <label className="btn btn-outline btn-upload">
                {uploading ? '上傳中…' : '插入圖片'}
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} hidden />
              </label>
            </div>
            <textarea
              id="post-content"
              ref={contentRef}
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
              {loading ? '儲存中…' : isEdit ? '儲存更改' : '發布文章'}
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
