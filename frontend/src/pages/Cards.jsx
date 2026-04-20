import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'
import Navbar from '../components/Navbar'

export default function Cards() {
  const { languageId } = useParams()
  const navigate = useNavigate()
  const [cards, setCards] = useState([])
  const [language, setLanguage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newCard, setNewCard] = useState({ english: '', translation: '', notes: '' })
  const [error, setError] = useState('')
  const [flash, setFlash] = useState(false)
  const [addedCount, setAddedCount] = useState(0)

  const englishRef = useRef(null)
  const translationRef = useRef(null)
  const notesRef = useRef(null)

  useEffect(() => {
    api.get('/languages/').then(res => {
      const lang = res.data.find(l => l.id === parseInt(languageId))
      setLanguage(lang)
    })
    fetchCards()
  }, [languageId])

  useEffect(() => {
    if (showAdd) {
      setTimeout(() => englishRef.current?.focus(), 50)
    } else {
      setAddedCount(0)
      setError('')
    }
  }, [showAdd])

  const fetchCards = async (q = '') => {
    const params = q ? `?search=${q}` : ''
    const res = await api.get(`/cards/${languageId}${params}`)
    setCards(res.data)
    setLoading(false)
  }

  const handleSearch = (e) => {
    const q = e.target.value
    setSearch(q)
    fetchCards(q)
  }

  const submitCard = async () => {
    if (!newCard.english.trim() || !newCard.translation.trim()) return
    setError('')
    try {
      const res = await api.post(`/cards/${languageId}`, newCard)
      setCards(prev => [res.data, ...prev])
      setNewCard({ english: '', translation: '', notes: '' })
      setAddedCount(c => c + 1)
      setFlash(true)
      setTimeout(() => setFlash(false), 1800)
      englishRef.current?.focus()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add card')
    }
  }

  const handleKeyDown = (e, field) => {
    if (e.key === 'Escape') {
      setShowAdd(false)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (field === 'english') {
        translationRef.current?.focus()
      } else {
        submitCard()
      }
    }
  }

  const handleDelete = async (cardId) => {
    if (!confirm('Delete this card?')) return
    await api.delete(`/cards/${languageId}/${cardId}`)
    setCards(cards.filter(c => c.id !== cardId))
  }

  return (
    <div className="page">
      <Navbar />
      <div className="container">
        <div className="page-header">
          <div className="page-header-left">
            <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
            <div>
              <h1 className="page-title">{language?.flag_emoji} {language?.name}</h1>
              <p className="page-subtitle">{cards.length} {cards.length === 1 ? 'card' : 'cards'}</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(v => !v)}>
            {showAdd ? 'Done adding' : '+ Add cards'}
          </button>
        </div>

        {showAdd && (
          <div className="add-card-form">
            <div className="add-card-fields">
              <div className="form-group">
                <label className="form-label">Word / Phrase</label>
                <input
                  ref={englishRef}
                  className="input"
                  value={newCard.english}
                  onChange={e => setNewCard({ ...newCard, english: e.target.value })}
                  onKeyDown={e => handleKeyDown(e, 'english')}
                  placeholder="English"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Translation</label>
                <input
                  ref={translationRef}
                  className="input"
                  value={newCard.translation}
                  onChange={e => setNewCard({ ...newCard, translation: e.target.value })}
                  onKeyDown={e => handleKeyDown(e, 'translation')}
                  placeholder="Translation"
                />
              </div>
              <div className="form-group add-card-fields-full">
                <label className="form-label">Notes (optional)</label>
                <input
                  ref={notesRef}
                  className="input"
                  value={newCard.notes}
                  onChange={e => setNewCard({ ...newCard, notes: e.target.value })}
                  onKeyDown={e => handleKeyDown(e, 'notes')}
                  placeholder="Mnemonic, example sentence, context…"
                />
              </div>
            </div>
            <div className="add-card-footer">
              <div className="add-card-feedback">
                {flash && <span className="flash-success">✓ Card added</span>}
                {addedCount > 0 && !flash && (
                  <span className="add-card-count">{addedCount} {addedCount === 1 ? 'card' : 'cards'} added</span>
                )}
                {error && <span className="error-msg">{error}</span>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setShowAdd(false)}>Done</button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={submitCard}
                  disabled={!newCard.english.trim() || !newCard.translation.trim()}
                >
                  Add card
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="search-row">
          <input
            className="input"
            value={search}
            onChange={handleSearch}
            placeholder="Search cards…"
          />
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading…</p>
        ) : cards.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🃏</div>
            <p className="empty-title">{search ? 'No cards match your search' : 'No cards yet'}</p>
            <p className="empty-text">{search ? 'Try a different query' : 'Click "Add cards" above to get started'}</p>
          </div>
        ) : (
          <div className="card-list">
            {cards.map(card => (
              <div key={card.id} className="word-card">
                <div>
                  <div className="word-pair">
                    <span className="word-en">{card.english}</span>
                    <span className="word-tr">{card.translation}</span>
                  </div>
                  {card.notes && <p className="word-notes">{card.notes}</p>}
                </div>
                <button className="btn btn-sm btn-danger-soft" onClick={() => handleDelete(card.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
