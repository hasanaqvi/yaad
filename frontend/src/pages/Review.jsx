import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'
import Navbar from '../components/Navbar'

export default function Review() {
  const { languageId } = useParams()
  const navigate = useNavigate()
  const [queue, setQueue] = useState([])
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [language, setLanguage] = useState(null)

  useEffect(() => {
    api.get('/languages/').then(res => {
      const lang = res.data.find(l => l.id === parseInt(languageId))
      setLanguage(lang)
    })
    api.get(`/reviews/due/${languageId}`).then(res => {
      setQueue(res.data)
      setLoading(false)
    })
  }, [languageId])

  const handleRate = async (quality) => {
    if (submitting) return
    setSubmitting(true)
    const card = queue[current]
    await api.post('/reviews/submit', { card_id: card.card.id, quality })
    const next = current + 1
    if (next >= queue.length) {
      setDone(true)
    } else {
      setCurrent(next)
      setFlipped(false)
    }
    setSubmitting(false)
  }

  const ratings = [
    { quality: 0, label: 'Again', sublabel: 'Forgot', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    { quality: 3, label: 'Hard', sublabel: '<1 day', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    { quality: 4, label: 'Good', sublabel: 'A few days', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    { quality: 5, label: 'Easy', sublabel: 'Long time', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Navbar />
      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading...</div>
    </div>
  )

  if (queue.length === 0 || done) return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Navbar />
      <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {queue.length === 0 ? 'No cards due!' : 'Session complete!'}
        </h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          {queue.length === 0
            ? 'All cards are up to date. Come back later!'
            : `You reviewed ${queue.length} ${queue.length === 1 ? 'card' : 'cards'}. Great work!`}
        </p>
        <button
          onClick={() => navigate('/')}
          style={{ padding: '0.75rem 2rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
        >
          Back to dashboard
        </button>
      </div>
    </div>
  )

  const card = queue[current].card

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Navbar />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>← Back</button>
          <span style={{ color: '#666', fontSize: '0.9rem' }}>{current + 1} / {queue.length}</span>
          <span style={{ color: '#666', fontSize: '0.9rem' }}>{language?.flag_emoji} {language?.name}</span>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', minHeight: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', marginBottom: '1.5rem', cursor: flipped ? 'default' : 'pointer', transition: 'all 0.2s' }}
          onClick={() => !flipped && setFlipped(true)}
        >
          {!flipped ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>English</p>
              <p style={{ fontSize: '2rem', fontWeight: 700 }}>{card.english}</p>
              <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '1.5rem' }}>Tap to reveal</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Translation</p>
              <p style={{ fontSize: '2.25rem', fontWeight: 700, color: '#2563eb' }}>{card.translation}</p>
              {card.pronunciation && (
                <p style={{ color: '#888', fontSize: '1rem', marginTop: '0.5rem' }}>/{card.pronunciation}/</p>
              )}
              {card.notes && (
                <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '1rem', fontStyle: 'italic' }}>{card.notes}</p>
              )}
            </div>
          )}
        </div>

        {flipped && (
          <div>
            <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>How well did you remember?</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {ratings.map(r => (
                <button
                  key={r.quality}
                  onClick={() => handleRate(r.quality)}
                  disabled={submitting}
                  style={{ padding: '0.75rem 0.5rem', background: r.bg, color: r.color, border: `1px solid ${r.border}`, borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  <div>{r.label}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 400, marginTop: '0.2rem', opacity: 0.8 }}>{r.sublabel}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}