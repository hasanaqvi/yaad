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
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Welcome back, {user?.display_name}!</h1>
            <p style={{ color: '#666', marginTop: '0.25rem' }}>Your language decks</p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            style={{ padding: '0.6rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
          >
            + Add Language
          </button>
        </div>

        {showAdd && (
          <form onSubmit={handleAdd} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <h3 style={{ marginBottom: '1rem' }}>New Language</h3>
            {error && <p style={{ color: 'red', marginBottom: '0.75rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Language name</label>
                <input
                  value={newLang.name}
                  onChange={e => setNewLang({ ...newLang, name: e.target.value })}
                  placeholder="e.g. Arabic"
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px' }}
                  required
                />
              </div>
              <div style={{ width: '100px' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Flag emoji</label>
                <input
                  value={newLang.flag_emoji}
                  onChange={e => setNewLang({ ...newLang, flag_emoji: e.target.value })}
                  placeholder="🇸🇦"
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1.25rem' }}
                />
              </div>
              <button type="submit" style={{ padding: '0.6rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                Add
              </button>
              <button type="button" onClick={() => setShowAdd(false)} style={{ padding: '0.6rem 1.25rem', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: 'white' }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p style={{ color: '#666' }}>Loading...</p>
        ) : languages.length === 0 ? (
          <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', textAlign: 'center', color: '#666' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</p>
            <p style={{ fontWeight: 500 }}>No language decks yet</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>Add your first language to get started</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {languages.map(lang => (
              <div key={lang.id} style={{ background: 'white', padding: '1.25rem 1.5rem', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => navigate(`/languages/${lang.id}`)}>
                  <span style={{ fontSize: '2rem' }}>{lang.flag_emoji || '🌐'}</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{lang.name}</p>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>{lang.card_count} {lang.card_count === 1 ? 'card' : 'cards'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => navigate(`/review/${lang.id}`)} style={{ padding: '0.5rem 1rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                    Review
                  </button>
                  <button onClick={() => navigate(`/languages/${lang.id}`)} style={{ padding: '0.5rem 1rem', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                    Cards
                  </button>
                  <button onClick={() => handleDelete(lang.id, lang.name)} style={{ padding: '0.5rem 1rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}