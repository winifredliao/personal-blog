import { Link } from 'react-router-dom'

export default function Navbar({ onMenuClick, menuOpen }) {
  return (
    <div className="mobile-topbar">
      <button
        type="button"
        className="hamburger-btn"
        aria-label={menuOpen ? '關閉選單' : '開啟選單'}
        aria-expanded={menuOpen}
        aria-controls="sidebar"
        onClick={onMenuClick}
      >
        <span />
        <span />
        <span />
      </button>
      <Link to="/" className="navbar-brand">
        Winnie's Blog
      </Link>
    </div>
  )
}
