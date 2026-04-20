import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const NAV_ITEMS = [
  { to: '/',        label: 'Home',    icon: '🏠' },
  { to: '/library', label: 'Library', icon: '📚' },
  { to: '/profile', label: 'Profile', icon: '👤' },
]

export default function Navbar() {
  const { logout } = useAuth()
  const { theme, toggle } = useTheme()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="navbar">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <span className="logo-text">یاد</span>
      </Link>
      <div className="navbar-right">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`nav-pill${pathname === item.to ? ' active' : ''}`}
          >
            {item.icon} {item.label}
          </Link>
        ))}
        <button className="theme-toggle" onClick={toggle} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => { logout(); navigate('/login') }}>
          Sign out
        </button>
      </div>
    </nav>
  )
}
