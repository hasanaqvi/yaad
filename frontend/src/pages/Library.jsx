import { useEffect, useState } from 'react'
import api from '../api/client'
import Navbar from '../components/Navbar'

function statusBadge(repetitions, intervalDays) {
  if (repetitions === 0)   return { label: 'New',       cls: 'badge badge-new' }
  if (intervalDays < 7)    return { label: 'Learning',  cls: 'badge badge-learning' }
  if (intervalDays < 21)   return { label: 'Reviewing', cls: 'badge badge-reviewing' }
  return                          { label: 'Mastered',  cls: 'badge badge-mastered' }
}

function formatDue(dateStr) {
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000)
  if (diff < 0)  return { text: 'Overdue',  cls: 'due-overdue' }
  if (diff === 0) return { text: 'Today',   cls: 'due-today-badge' }
  if (diff === 1) return { text: 'Tomorrow', cls: '' }
  return { text: `${diff}d`, cls: '' }
}

export default function Library() {
  const [cards, setCards]         = useState([])
  const [languages, setLanguages] = useState([])
  const [langFilter, setLangFilter] = useState('')
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm]   = useState({ english: '', translation: '', notes: '' })
  const [editError, setEditError] = useState('')

  useEffect(() => {
    api.get('/languages/').then(r => setLanguages(r.data))
    fetchCards()
  }, [])

  const fetchCards = async (language_id = '', q = '') => {
    setLoading(true)
    const params = new URLSearchParams()
    if (language_id) params.set('language_id', language_id)
    if (q) params.set('search', q)
    const res = await api.get(`/cards/library?${params}`)
    setCards(res.data)
    setLoading(false)
  }

  const handleFilter = (val) => {
    setLangFilter(val)
    fetchCards(val, search)
  }

  const handleSearch = (val) => {
    setSearch(val)
    fetchCards(langFilter, val)
  }

  const startEdit = (card) => {
    setEditingId(card.id)
    setEditForm({ english: card.english, translation: card.translation, notes: card.notes || '' })
    setEditError('')
  }

  const saveEdit = async (card) => {
    setEditError('')
    try {
      const res = await api.put(`/cards/${card.language_id}/${card.id}`, editForm)
      setCards(cards.map(c => c.id === card.id
        ? { ...c, english: res.data.english, translation: res.data.translation, notes: res.data.notes }
        : c
      ))
      setEditingId(null)
    } catch (err) {
      setEditError(err.response?.data?.detail || 'Failed to save')
    }
  }

  const handleDelete = async (card) => {
    if (!confirm(`Delete "${card.english}"?`)) return
    await api.delete(`/cards/${card.language_id}/${card.id}`)
    setCards(cards.filter(c => c.id !== card.id))
  }

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Library</h1>
            <p className="page-subtitle">{cards.length} {cards.length === 1 ? 'card' : 'cards'}</p>
          </div>
        </div>

        <div className="library-filters">
          <select
            className="input"
            style={{ width: 'auto', minWidth: '160px' }}
            value={langFilter}
            onChange={e => handleFilter(e.target.value)}
          >
            <option value="">All languages</option>
            {languages.map(l => (
              <option key={l.id} value={l.id}>
                {l.flag_emoji} {l.name}
              </option>
            ))}
          </select>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Search cards…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>

        {editError && <div className="error-msg" style={{ marginBottom: '0.75rem' }}>{editError}</div>}

        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading…</p>
        ) : cards.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <p className="empty-title">No cards found</p>
            <p className="empty-text">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="lib-table">
              <thead>
                <tr>
                  <th>Language</th>
                  <th>English</th>
                  <th>Translation</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Due</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cards.map(card => {
                  const isEditing = editingId === card.id
                  const badge = statusBadge(card.repetitions, card.interval_days)
                  const due = formatDue(card.next_review_date)
                  return (
                    <tr key={card.id}>
                      <td className="lib-lang-cell">
                        {card.flag_emoji && <span>{card.flag_emoji}</span>}
                        {card.language_name}
                      </td>
                      <td>
                        {isEditing
                          ? <input className="input input-sm" value={editForm.english} onChange={e => setEditForm({ ...editForm, english: e.target.value })} />
                          : card.english}
                      </td>
                      <td>
                        {isEditing
                          ? <input className="input input-sm" value={editForm.translation} onChange={e => setEditForm({ ...editForm, translation: e.target.value })} />
                          : card.translation}
                      </td>
                      <td className="lib-notes-cell">
                        {isEditing
                          ? <input className="input input-sm" value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} placeholder="Notes…" />
                          : <span style={{ color: 'var(--text-muted)' }}>{card.notes || '—'}</span>}
                      </td>
                      <td><span className={badge.cls}>{badge.label}</span></td>
                      <td><span className={due.cls}>{due.text}</span></td>
                      <td className="lib-actions-cell">
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button className="btn btn-primary btn-sm" onClick={() => saveEdit(card)}>Save</button>
                            <button className="btn btn-outline btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button className="btn btn-outline btn-sm" onClick={() => startEdit(card)}>Edit</button>
                            <button className="btn btn-danger-soft btn-sm" onClick={() => handleDelete(card)}>Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
