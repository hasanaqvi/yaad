import { useEffect, useState } from 'react'
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
  const [newCard, setNewCard] = useState({ english: '', translation: '', notes: '', pronunciation: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/languages/').then(res => {
      const lang = res.data.find(l => l.id === parseInt(languageId))
      setLanguage(lang)
    })
    fetchCards()
  }, [languageId])

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

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post(`/cards/${languageId}`, newCard)
      setCards([res.data, ...cards])
      setNewCard({ english: '', translation: '', notes: '', pronunciation: '' })
      setShowAdd(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add card')
    }
  }

  const handleDelete = async (cardId) => {
    if (!confirm('Delete this card?')) return
    await api.delete(`/cards/${languageId}/${cardId}`)
    setCards(cards.filter(c => c.id !== cardId))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '1rem' }}>← Back</button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {language?.flag_emoji} {language?.name}
          </h1>
          <span style={{ color: '#666', fontSize: '0.9rem' }}>{cards.length} cards</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Search cards..."
            style={{ flex: 1, padding: '0.6rem 1rem', border: '1px solid #ddd', borderRadius: '8px', background: 'white' }}
          />
          <button
            onClick={() => setShowAdd(!showAdd)}
            style={{ padding: '0.6rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
          >
            + Add Card
          </button>
        </div>

        {showAdd && (
          <form onSubmit={handleAdd} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <h3 style={{ marginBottom: '1rem' }}>New Card</h3>
            {error && <p style={{ color: 'red', marginBottom: '0.75rem' }}>{error}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>English</label>
                <input value={newCard.english} onChange={e => setNewCard({ ...newCard, english: e.target.value })} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Translation</label>
                <input value={newCard.translation} onChange={e => setNewCard({ ...newCard, translation: e.target.value })} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Pronunciation (optional)</label>
                <input value={newCard.pronunciation} onChange={e => setNewCard({ ...newCard, pronunciation: e.target.value })} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Notes (optional)</label>
                <input value={newCard.notes} onChange={e => setNewCard({ ...newCard, notes: e.target.value })} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" style={{ padding: '0.6rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Add Card</button>
              <button type="button" onClick={() => { setShowAdd(false); setError('') }} style={{ padding: '0.6rem 1.25rem', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: 'white' }}>Cancel</button>
            </div>
          </form>
        )}

        {loading ? <p style={{ color: '#666' }}>Loading...</p> : cards.length === 0 ? (
          <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', textAlign: 'center', color: '#666' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🃏</p>
            <p style={{ fontWeight: 500 }}>{search ? 'No cards match your search' : 'No cards yet'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {cards.map(card => (
              <div key={card.id} style={{ background: 'white', padding: '1rem 1.5rem', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 600 }}>{card.english}</span>
                    <span style={{ color: '#2563eb', fontSize: '1.1rem' }}>{card.translation}</span>
                    {card.pronunciation && <span style={{ color: '#888', fontSize: '0.85rem' }}>/{card.pronunciation}/</span>}
                  </div>
                  {card.notes && <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem' }}>{card.notes}</p>}
                </div>
                <button onClick={() => handleDelete(card.id)} style={{ padding: '0.4rem 0.75rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', marginLeft: '1rem' }}>
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