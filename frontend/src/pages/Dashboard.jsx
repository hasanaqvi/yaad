import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [languages, setLanguages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newLang, setNewLang] = useState({ name: '', flag_emoji: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/languages/').then(res => setLanguages(res.data)).finally(() => setLoading(false))
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/languages/', newLang)
      setLanguages([...languages, res.data])
      setNewLang({ name: '', flag_emoji: '' })
      setShowAdd(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add language')
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete the ${name} deck and all its cards?`)) return
    await api.delete(`/languages/${id}`)
    setLanguages(languages.filter(l => l.id !== id))
  }

  return (
    <div className="page">
      <Navbar />
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Welcome back, {user?.display_name}</h1>
            <p className="page-subtitle">Your language decks</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
            + Add deck
          </button>
        </div>

        {showAdd && (
          <form onSubmit={handleAdd} className="card card-padded" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>New deck</h3>
            {error && <div className="error-msg" style={{ marginBottom: '0.875rem' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Language</label>
                <input
                  className="input"
                  value={newLang.name}
                  onChange={e => setNewLang({ ...newLang, name: e.target.value })}
                  placeholder="e.g. Arabic"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group" style={{ width: '90px' }}>
                <label className="form-label">Flag</label>
                <input
                  className="input"
                  value={newLang.flag_emoji}
                  onChange={e => setNewLang({ ...newLang, flag_emoji: e.target.value })}
                  placeholder="🇸🇦"
                  style={{ fontSize: '1.2rem', textAlign: 'center' }}
                />
              </div>
              <button className="btn btn-primary" type="submit">Add</button>
              <button className="btn btn-outline" type="button" onClick={() => { setShowAdd(false); setError('') }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading…</p>
        ) : languages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <p className="empty-title">No decks yet</p>
            <p className="empty-text">Add your first language deck to get started</p>
          </div>
        ) : (
          <div className="card-list">
            {languages.map(lang => (
              <div key={lang.id} className="deck-card">
                <div className="deck-info" onClick={() => navigate(`/languages/${lang.id}`)}>
                  <span className="deck-flag">{lang.flag_emoji || '🌐'}</span>
                  <div>
                    <p className="deck-name">{lang.name}</p>
                    <p className="deck-count">{lang.card_count} {lang.card_count === 1 ? 'card' : 'cards'}</p>
                  </div>
                </div>
                <div className="deck-actions">
                  <button className="btn btn-sm btn-review" onClick={() => navigate(`/review/${lang.id}`)}>Review</button>
                  <button className="btn btn-sm btn-cards" onClick={() => navigate(`/languages/${lang.id}`)}>Cards</button>
                  <button className="btn btn-sm btn-danger-soft" onClick={() => handleDelete(lang.id, lang.name)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
