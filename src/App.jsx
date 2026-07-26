import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API = 'http://localhost:3001/api/testimonials'

function App() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    rating: '5',
  })
  const [pending, setPending] = useState([])
  const [approved, setApproved] = useState([])
  const [status, setStatus] = useState('pending')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const refreshTestimonials = async () => {
    setLoading(true)
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        fetch(`${API}?status=pending&limit=10&offset=0`),
        fetch(`${API}?status=approved&limit=10&offset=0`),
      ])
      const pendingData = await pendingRes.json()
      const approvedData = await approvedRes.json()
      setPending(pendingData)
      setApproved(approvedData)
    } catch (error) {
      console.error(error)
      setMessage('Unable to load testimonials right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshTestimonials()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    const response = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (response.ok) {
      setForm({ name: '', email: '', company: '', message: '', rating: '5' })
      setMessage('Thanks! Your testimonial is waiting for approval.')
      refreshTestimonials()
    } else {
      setMessage('We could not save that testimonial. Please try again.')
    }
  }

  const handleReview = async (id, nextStatus) => {
    const response = await fetch(`${API}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })

    if (response.ok) {
      refreshTestimonials()
    }
  }

  const summary = useMemo(() => ({
    pending: pending.length,
    approved: approved.length,
  }), [approved.length, pending.length])

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">Testimonial platform</p>
          <h1>Collect customer proof and publish it quickly.</h1>
          <p className="hero-copy">
            Customers submit stories, the owner reviews them, and approved stories surface in the public wall and embedded widget.
          </p>
        </div>
        <div className="hero-stats">
          <div>
            <strong>{summary.pending}</strong>
            <span>Pending</span>
          </div>
          <div>
            <strong>{summary.approved}</strong>
            <span>Approved</span>
          </div>
        </div>
      </header>

      <main className="content-grid">
        <section className="panel">
          <h2>Submit a testimonial</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Email
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>
              Company
              <input name="company" value={form.company} onChange={handleChange} />
            </label>
            <label>
              Rating
              <select name="rating" value={form.rating} onChange={handleChange}>
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
                <option value="2">2 stars</option>
                <option value="1">1 star</option>
              </select>
            </label>
            <label className="full">
              Testimonial
              <textarea name="message" rows="4" value={form.message} onChange={handleChange} required />
            </label>
            <button className="primary" type="submit">Submit testimonial</button>
          </form>
          {message ? <p className="form-message">{message}</p> : null}
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Moderation dashboard</h2>
            <div className="segmented-control">
              <button type="button" className={status === 'pending' ? 'active' : ''} onClick={() => setStatus('pending')}>Pending</button>
              <button type="button" className={status === 'approved' ? 'active' : ''} onClick={() => setStatus('approved')}>Approved</button>
            </div>
          </div>

          {loading ? (
            <p>Loading submissions…</p>
          ) : (
            <div className="list-stack">
              {(status === 'pending' ? pending : approved).length === 0 ? (
                <p>No testimonials in this view yet.</p>
              ) : (
                (status === 'pending' ? pending : approved).map((item) => (
                  <article className="review-card" key={item.id}>
                    <div>
                      <h3>{item.name}</h3>
                      <p>{item.company || 'Independent customer'}</p>
                      <p className="quote">“{item.message}”</p>
                      <p className="meta">{item.rating}★ • {item.email}</p>
                    </div>
                    {status === 'pending' ? (
                      <div className="actions">
                        <button type="button" className="approve" onClick={() => handleReview(item.id, 'approved')}>Approve</button>
                        <button type="button" className="reject" onClick={() => handleReview(item.id, 'rejected')}>Reject</button>
                      </div>
                    ) : null}
                  </article>
                ))
              )}
            </div>
          )}
        </section>
      </main>

      <section className="panel wall-panel">
        <div className="panel-header">
          <h2>Public wall</h2>
          <a href="/widget-demo.html" target="_blank" rel="noreferrer">Open widget demo</a>
        </div>
        <div className="wall-grid">
          {approved.map((item) => (
            <article className="testimonial-card" key={item.id}>
              <div className="stars">{'★'.repeat(item.rating)}</div>
              <p>“{item.message}”</p>
              <strong>{item.name}</strong>
              <span>{item.company || 'Customer'}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default App
