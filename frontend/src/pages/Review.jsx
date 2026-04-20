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
    { quality: 0, label: 'Again',  sublabel: 'Forgot',     cls: 'rating-again' },
    { quality: 3, label: 'Hard',   sublabel: '< 1 day',    cls: 'rating-hard'  },
    { quality: 4, label: 'Good',   sublabel: 'Few days',   cls: 'rating-good'  },
    { quality: 5, label: 'Easy',   sublabel: 'Long time',  cls: 'rating-easy'  },
  ]

  if (loading) return (
    <div className="page">
      <Navbar />
      <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</p>
    </div>
  )

  if (queue.length === 0 || done) return (
    <div className="page">
      <Navbar />
      <div className="done-screen">
        <div className="done-icon">{done ? '🎉' : '✨'}</div>
        <h2 className="done-title">{queue.length === 0 ? 'All caught up!' : 'Session complete!'}</h2>
        <p className="done-text">
          {queue.length === 0
            ? 'No cards are due right now. Come back later!'
            : `You reviewed ${queue.length} ${queue.length === 1 ? 'card' : 'cards'}. Great work!`}
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>Back to decks</button>
      </div>
    </div>
  )

  const card = queue[current].card
  const progress = (current / queue.length) * 100

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ maxWidth: '560px' }}>
        <div className="review-meta">
          <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {current + 1} / {queue.length}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {language?.flag_emoji} {language?.name}
          </span>
        </div>

        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="flip-card" onClick={() => !flipped && setFlipped(true)}>
          <div className={`flip-card-inner${flipped ? ' flipped' : ''}`}>
            <div className="flip-card-face">
              <p className="flip-label">English</p>
              <p className="flip-word">{card.english}</p>
              <p className="flip-hint">Click to reveal</p>
            </div>
            <div className="flip-card-face flip-card-back">
              <p className="flip-label">Translation</p>
              <p className="flip-word-tr">{card.translation}</p>
              {card.notes && <p className="flip-notes">{card.notes}</p>}
            </div>
          </div>
        </div>

        {flipped && (
          <>
            <p className="review-prompt">How well did you remember?</p>
            <div className="rating-grid">
              {ratings.map(r => (
                <button
                  key={r.quality}
                  className={`rating-btn ${r.cls}`}
                  onClick={() => handleRate(r.quality)}
                  disabled={submitting}
                >
                  {r.label}
                  <div className="rating-sublabel">{r.sublabel}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
