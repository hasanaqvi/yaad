import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import Navbar from '../components/Navbar'

const PROGRESS_TIERS = [
  { key: 'new',       label: 'New',       color: 'var(--text-muted)',  border: 'var(--border)' },
  { key: 'learning',  label: 'Learning',  color: 'var(--accent)',      border: 'var(--accent)' },
  { key: 'reviewing', label: 'Reviewing', color: 'var(--primary)',     border: 'var(--primary)' },
  { key: 'mastered',  label: 'Mastered',  color: 'var(--success)',     border: 'var(--success)' },
]

export default function Profile() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [languages, setLanguages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/auth/stats'),
      api.get('/languages/'),
    ]).then(([s, l]) => {
      setStats(s.data)
      setLanguages(l.data)
    }).finally(() => setLoading(false))
  }, [])

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—'

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ maxWidth: '680px' }}>

        {/* Identity card */}
        <div className="card card-padded profile-identity">
          <div className="profile-avatar">
            {user?.display_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="page-title">{user?.display_name}</h1>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-since">Member since {memberSince}</p>
          </div>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading…</p>
        ) : (
          <>
            {/* Overview stats */}
            <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="stat-card lift">
                <span className="stat-num">{stats.total_cards}</span>
                <span className="stat-label">Total Cards</span>
              </div>
              <div className="stat-card lift">
                <span className={`stat-num${stats.due_today > 0 ? ' stat-num-accent' : ''}`}>
                  {stats.due_today}
                </span>
                <span className="stat-label">Due Today</span>
              </div>
            </div>

            {/* Progress breakdown */}
            <div className="section-header">
              <span className="section-title">Card Progress</span>
            </div>
            <div className="progress-tier-grid">
              {PROGRESS_TIERS.map(t => (
                <div key={t.key} className="stat-card" style={{ borderTop: `3px solid ${t.border}` }}>
                  <span className="stat-num" style={{ fontSize: '1.75rem', color: t.color }}>
                    {stats[t.key]}
                  </span>
                  <span className="stat-label">{t.label}</span>
                </div>
              ))}
            </div>

            {/* Languages table */}
            {languages.length > 0 && (
              <>
                <div className="section-header" style={{ marginTop: '1.75rem' }}>
                  <span className="section-title">Languages</span>
                </div>
                <div className="card" style={{ overflow: 'hidden' }}>
                  <table className="lib-table">
                    <thead>
                      <tr>
                        <th>Language</th>
                        <th>Cards</th>
                        <th>Due Today</th>
                      </tr>
                    </thead>
                    <tbody>
                      {languages.map(lang => (
                        <tr key={lang.id}>
                          <td>
                            {lang.flag_emoji && <span style={{ marginRight: '0.5rem' }}>{lang.flag_emoji}</span>}
                            {lang.name}
                          </td>
                          <td>{lang.card_count}</td>
                          <td>
                            {lang.due_count > 0
                              ? <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{lang.due_count}</span>
                              : <span style={{ color: 'var(--text-subtle)' }}>—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
