import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#1a1a1a' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>یاد</span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#555', fontWeight: 500 }}>Languages</Link>
        <span style={{ color: '#555' }}>{user?.display_name}</span>
        <button onClick={handleLogout} style={{ padding: '0.4rem 1rem', border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer', color: '#555' }}>
          Logout
        </button>
      </div>
    </nav>
  )
}