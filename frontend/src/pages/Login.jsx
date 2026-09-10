import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(password)
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || '登入失敗，請再試一次')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <Link to="/" className="back-link">← 回首頁</Link>
      <div className="editor-page">
        <h2>管理員登入</h2>
        <div aria-live="polite">
          {error && <div className="alert alert-danger">{error}</div>}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-password">密碼</label>
            <input
              id="login-password"
              className="form-control"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '登入中…' : '登入'}
          </button>
        </form>
      </div>
    </div>
  )
}
