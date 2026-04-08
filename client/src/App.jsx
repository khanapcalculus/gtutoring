import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [groups, setGroups] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    subject: 'Mathematics',
    grade: 'Grade 10'
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Calculus', 'English']
  const grades = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_URL}/api/groups`)
      const data = await response.json()
      setGroups(data)
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(`${API_URL}/api/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (response.ok) {
        setMessage('Successfully joined the group!')
        fetchGroups()
        setFormData({ ...formData, name: '' })
      } else {
        setMessage(data.error || 'Something went wrong')
      }
    } catch (error) {
      setMessage('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <nav className="navbar glass">
        <div className="container nav-content">
          <h1 className="logo">GTutoring<span>.</span></h1>
          <button className="btn-secondary">Login</button>
        </div>
      </nav>

      <header className="hero">
        <div className="container hero-content animate-fade-in">
          <h2>Master Your Subjects Together</h2>
          <p>Join elite group tutoring sessions. Learn, collaborate, and excel with peers at your grade level.</p>
        </div>
      </header>

      <main className="container main-layout">
        <section className="booking-section glass animate-fade-in">
          <h3>Book a Session</h3>
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="Enter your name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="grid-2">
              <div className="input-group">
                <label>Subject</label>
                <select 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                >
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Grade</label>
                <select 
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                >
                  {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <button className="btn-primary" disabled={loading}>
              {loading ? 'Booking...' : 'Join Group'}
            </button>
            {message && <p className="form-message">{message}</p>}
          </form>
        </section>

        <section className="groups-section animate-fade-in">
          <h3>Active Groups</h3>
          <div className="groups-grid">
            {groups.length === 0 ? <p className="text-dim">No groups available yet.</p> : (
              groups.map(group => (
                <div key={group.id} className="group-card glass">
                  <div className="group-header">
                    <h4>{group.subject}</h4>
                    <span className={`status-badge ${group.status.toLowerCase()}`}>
                      {group.status}
                    </span>
                  </div>
                  <p className="group-grade">{group.grade}</p>
                  <div className="occupancy-bar">
                    <div 
                      className="occupancy-fill" 
                      style={{ width: `${(group.members.length / group.capacity) * 100}%` }}
                    ></div>
                  </div>
                  <p className="occupancy-text">{group.members.length} / {group.capacity} students</p>
                  <div className="members-list">
                    {group.members.map((m, i) => <span key={i} className="member-avatar">{m[0]}</span>)}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="footer container">
        <p>&copy; 2026 GTutoring. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
