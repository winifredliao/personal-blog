import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ open, onNavigate }) {
  const [categories, setCategories] = useState([])
  const [searchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || ''
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    onNavigate()
    navigate('/')
  }

  useEffect(() => {
    axios.get('/api/categories').then(r => setCategories(r.data))
  }, [])

  return (
    <nav id="sidebar" className={'sidebar' + (open ? ' open' : '')} aria-label="主要導覽">
      <Link to="/" className="sidebar-brand" onClick={onNavigate}>
        Winnie's Blog
      </Link>

      <NavLink
        to="/"
        end
        className={({ isActive }) => 'sidebar-link' + (isActive && !activeCategory ? ' active' : '')}
        onClick={onNavigate}
      >
        全部文章
      </NavLink>

      <div className="sidebar-section-title">文章分類</div>
      {categories.map(c => (
        <Link
          key={c}
          to={`/?category=${encodeURIComponent(c)}`}
          className={'sidebar-link' + (activeCategory === c ? ' active' : '')}
          aria-current={activeCategory === c ? 'page' : undefined}
          onClick={onNavigate}
        >
          {c}
        </Link>
      ))}

      <NavLink
        to="/about"
        className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
        onClick={onNavigate}
      >
        關於我
      </NavLink>

      {isAuthenticated && (
        <>
          <Link to="/new" className="sidebar-new" onClick={onNavigate}>
            新文章
          </Link>
          <button type="button" className="sidebar-link sidebar-logout" onClick={handleLogout}>
            登出
          </button>
        </>
      )}
    </nav>
  )
}
