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
  const [addError, setAddError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', flag_emoji: '' })
  const [editError, setEditError] = useState('')

  useEffect(() => {
    api.get('/languages/').then(res => setLanguages(res.data)).finally(() => setLoading(false))
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setAddError('')
    try {
      const res = await api.post('/languages/', newLang)
      setLanguages([...languages, res.data])
      setNewLang({ name: '', flag_emoji: '' })
      setShowAdd(false)
    } catch (err) {
      setAddError(err.response?.data?.detail || 'Failed to add language')
    }
  }

  const startEdit = (lang) => {
    setEditingId(lang.id)
    setEditForm({ name: lang.name, flag_emoji: lang.flag_emoji || '' })
    setEditError('')
  }

  const saveEdit = async (id) => {
    setEditError('')
    try {
      const res = await api.put(`/languages/${id}`, editForm)
      setLanguages(languages.map(l => l.id === id ? { ...l, ...res.data } : l))
      setEditingId(null)
    } catch (err) {
      setEditError(err.response?.data?.detail || 'Failed to update')
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete the ${name} deck and all its cards?`)) return
    await api.delete(`/languages/${id}`)
    setLanguages(languages.filter(l => l.id !== id))
  }

  const totalCards = languages.reduce((s, l) => s + (l.card_count || 0), 0)
  const dueToday  = languages.reduce((s, l) => s + (l.due_count || 0), 0)

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ maxWidth: '680px' }}>

        <div className="hero">
          <h1 className="hero-title">Yaad</h1>
          <p className="hero-subtitle">Remember with ease. Your personal vocabulary companion.</p>
        </div>

        <div className="stat-grid">
          <div className="stat-card lift">
            <span className="stat-num">{loading ? '—' : totalCards}</span>
            <span className="stat-label">Total Cards</span>
          </div>
          <div className="stat-card lift">
            <span className={`stat-num${dueToday > 0 ? ' stat-num-accent' : ''}`}>
              {loading ? '—' : dueToday}
            </span>
            <span className="stat-label">Due Today</span>
          </div>
        </div>

        {showAdd && (
          <form onSubmit={handleAdd} className="card card-padded" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>New deck</h3>
            {addError && <div className="error-msg" style={{ marginBottom: '0.875rem' }}>{addError}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Language</label>
                <input className="input" value={newLang.name} onChange={e => setNewLang({ ...newLang, name: e.target.value })} placeholder="e.g. Arabic" required autoFocus />
              </div>
              <div className="form-group" style={{ width: '90px' }}>
                <label className="form-label">Flag</label>
                <input className="input" value={newLang.flag_emoji} onChange={e => setNewLang({ ...newLang, flag_emoji: e.target.value })} placeholder="🇸🇦" style={{ fontSize: '1.2rem', textAlign: 'center' }} />
              </div>
              <button className="btn btn-primary" type="submit">Add</button>
              <button className="btn btn-outline" type="button" onClick={() => { setShowAdd(false); setAddError('') }}>Cancel</button>
            </div>
          </form>
        )}

        {editError && <div className="error-msg" style={{ marginBottom: '0.75rem' }}>{editError}</div>}

        {loading ? null : languages.length === 0 ? (
          <div className="dashed-container">
            <div className="dashed-icon-wrap">📖</div>
            <p className="dashed-title">Start Your Journey</p>
            <p className="dashed-text">Add your first flashcards to begin learning a new language</p>
            <button className="btn btn-primary btn-lg" onClick={() => setShowAdd(true)}>+ Add Your First Deck</button>
          </div>
        ) : (
          <>
            <div className="section-header">
              <span className="section-title">Your Decks</span>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(v => !v)}>+ Add deck</button>
            </div>
            <div className="card-list">
              {languages.map(lang => (
                <div key={lang.id} className="deck-card lift">
                  {editingId === lang.id ? (
                    <div className="deck-edit-row">
                      <input className="input" style={{ width: '80px', textAlign: 'center', fontSize: '1.2rem' }} value={editForm.flag_emoji} onChange={e => setEditForm({ ...editForm, flag_emoji: e.target.value })} placeholder="🌐" />
                      <input className="input" style={{ flex: 1 }} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} autoFocus />
                      <button className="btn btn-primary btn-sm" onClick={() => saveEdit(lang.id)}>Save</button>
                      <button className="btn btn-outline btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      <div className="deck-info" onClick={() => navigate(`/languages/${lang.id}`)}>
                        {lang.flag_emoji && <span className="deck-flag">{lang.flag_emoji}</span>}
                        <div>
                          <p className="deck-name">{lang.name}</p>
                          <p className="deck-count">
                            {lang.card_count} {lang.card_count === 1 ? 'card' : 'cards'}
                            {lang.due_count > 0 && <span style={{ color: 'var(--accent)', marginLeft: '0.5rem' }}>· {lang.due_count} due</span>}
                          </p>
                          {lang.card_count > 0 && (
                            <div className="deck-progress-bar">
                              <div className="deck-progress-fill" style={{ width: `${Math.round(((lang.mastered_count || 0) / lang.card_count) * 100)}%` }} />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="deck-actions">
                        <button className="btn btn-sm btn-review" onClick={() => navigate(`/review/${lang.id}`)}>Review</button>
                        <button className="btn btn-sm btn-cards" onClick={() => navigate(`/languages/${lang.id}`)}>Cards</button>
                        <button className="btn btn-sm btn-outline" onClick={() => startEdit(lang)}>Edit</button>
                        <button className="btn btn-sm btn-danger-soft" onClick={() => handleDelete(lang.id, lang.name)}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
