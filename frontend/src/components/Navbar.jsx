import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          My<span>Blog</span>
        </Link>
        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            首頁
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            關於我
          </NavLink>
          <Link to="/new" className="nav-link btn-new">
            ✏️ 新文章
          </Link>
        </div>
      </div>
    </nav>
  )
}
