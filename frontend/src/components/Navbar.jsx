import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-left">
        <span className="logo-text">يَاد</span>
      </Link>
      <div className="navbar-right">
        <Link to="/" className="navbar-link">Decks</Link>
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
