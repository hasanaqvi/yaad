import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="navbar">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <span className="logo-text" style={{ color: 'var(--primary)' }}>Yaad</span>
      </Link>
      <div className="navbar-right">
        <Link to="/" className={`nav-pill${pathname === '/' ? ' active' : ''}`}>
          🏠 Home
        </Link>
        <span className="navbar-user">{user?.display_name}</span>
        <button className="theme-toggle" onClick={toggle} title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => { logout(); navigate('/login') }}>
          Sign out
        </button>
      </div>
    </nav>
  )
}
