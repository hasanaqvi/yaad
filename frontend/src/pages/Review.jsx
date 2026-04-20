import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'
import Navbar from '../components/Navbar'

const RATINGS = [
  { quality: 0, label: 'Again', sublabel: 'Forgot',    cls: 'rating-again', key: '1' },
  { quality: 3, label: 'Hard',  sublabel: '< 1 day',   cls: 'rating-hard',  key: '2' },
  { quality: 4, label: 'Good',  sublabel: 'Few days',  cls: 'rating-good',  key: '3' },
  { quality: 5, label: 'Easy',  sublabel: 'Long time', cls: 'rating-easy',  key: '4' },
]

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
      setLanguage(res.data.find(l => l.id === parseInt(languageId)))
    })
    api.get(`/reviews/due/${languageId}`).then(res => {
      setQueue(res.data)
      setLoading(false)
    })
  }, [languageId])

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if ((e.key === ' ' || e.key === 'Enter') && !flipped) {
        e.preventDefault()
        setFlipped(true)
        return
      }
      if (flipped && !submitting) {
        const r = RATINGS.find(r => r.key === e.key)
        if (r) handleRate(r.quality)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flipped, submitting, current, queue])

  const handleRate = async (quality) => {
    if (submitting) return
    setSubmitting(true)
    await api.post('/reviews/submit', { card_id: queue[current].card.id, quality })
    const next = current + 1
    if (next >= queue.length) setDone(true)
    else { setCurrent(next); setFlipped(false) }
    setSubmitting(false)
  }

  const handleSkip = () => {
    const updated = [...queue]
    const [skipped] = updated.splice(current, 1)
    updated.push(skipped)
    setQueue(updated)
    setFlipped(false)
  }

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
              <p className="flip-hint">Click or press Space</p>
            </div>
            <div className="flip-card-face flip-card-back">
              <p className="flip-label">Translation</p>
              <p className="flip-word-tr">{card.translation}</p>
              {card.notes && <p className="flip-notes">{card.notes}</p>}
            </div>
          </div>
        </div>

        <div className="review-actions-row">
          <button className="btn btn-ghost btn-sm review-skip" onClick={handleSkip}>
            Skip →
          </button>
        </div>

        {flipped && (
          <>
            <p className="review-prompt">How well did you remember?</p>
            <div className="rating-grid">
              {RATINGS.map(r => (
                <button
                  key={r.quality}
                  className={`rating-btn ${r.cls}`}
                  onClick={() => handleRate(r.quality)}
                  disabled={submitting}
                >
                  <span className="rating-key">{r.key}</span>
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
