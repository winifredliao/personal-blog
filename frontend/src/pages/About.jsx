import { useState, useEffect } from 'react'
import axios from 'axios'

export default function About() {
  const [about, setAbout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [msg, setMsg] = useState('')

  useEffect(() => {
    axios.get('/api/about')
      .then(r => { setAbout(r.data); setForm(r.data) })
      .catch(() => setEditing(true))
      .finally(() => setLoading(false))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.put('/api/about', form)
      setAbout(res.data)
      setEditing(false)
      setMsg('✅ 已儲存！')
      setTimeout(() => setMsg(''), 2000)
    } catch {
      setMsg('❌ 儲存失敗')
    }
  }

  if (loading) return <div className="loading">載入中…</div>

  if (editing) {
    return (
      <div className="container">
        <div className="editor-page">
          <h2>✍️ 關於我</h2>
          {msg && <div className="alert alert-success">{msg}</div>}
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>姓名 *</label>
              <input className="form-control" value={form.name || ''} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>個人簡介</label>
              <textarea className="form-control" rows={5} value={form.bio || ''} onChange={e => set('bio', e.target.value)} />
            </div>
            <div className="form-group">
              <label>頭像 URL</label>
              <input className="form-control" value={form.avatar_url || ''} onChange={e => set('avatar_url', e.target.value)} placeholder="https://..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>GitHub</label>
                <input className="form-control" value={form.github || ''} onChange={e => set('github', e.target.value)} placeholder="https://github.com/..." />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="form-control" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '.75rem' }}>
              <button type="submit" className="btn btn-primary">💾 儲存</button>
              {about && <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>取消</button>}
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      {msg && <div className="alert alert-success" style={{ maxWidth: 640, margin: '0 auto 1rem' }}>{msg}</div>}
      <div className="about-card">
        {about.avatar_url && (
          <img src={about.avatar_url} alt="avatar" className="about-avatar" />
        )}
        <div className="about-name">{about.name}</div>
        {about.bio && <p className="about-bio">{about.bio}</p>}
        <div className="about-links">
          {about.github && (
            <a href={about.github} target="_blank" rel="noreferrer" className="about-link">
              🐙 GitHub
            </a>
          )}
          {about.twitter && (
            <a href={about.twitter} target="_blank" rel="noreferrer" className="about-link">
              🐦 Twitter
            </a>
          )}
          {about.email && (
            <a href={`mailto:${about.email}`} className="about-link">
              📧 Email
            </a>
          )}
          <button className="about-link btn" style={{ cursor: 'pointer' }} onClick={() => setEditing(true)}>
            ✏️ 編輯
          </button>
        </div>
      </div>
    </div>
  )
}
