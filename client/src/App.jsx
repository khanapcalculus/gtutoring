import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Login from './Login'
import Admin from './Admin'

const COUNTRY_CODES = [
  { code: '+1',   label: '+1   US / Canada' },
  { code: '+44',  label: '+44  UK' },
  { code: '+91',  label: '+91  India' },
  { code: '+61',  label: '+61  Australia' },
  { code: '+64',  label: '+64  New Zealand' },
  // Middle East
  { code: '+971', label: '+971 UAE' },
  { code: '+966', label: '+966 Saudi Arabia' },
  { code: '+974', label: '+974 Qatar' },
  { code: '+968', label: '+968 Oman' },
  { code: '+965', label: '+965 Kuwait' },
  { code: '+973', label: '+973 Bahrain' },
  // Asia
  { code: '+852', label: '+852 Hong Kong' },
  { code: '+65',  label: '+65  Singapore' },
  { code: '+60',  label: '+60  Malaysia' },
  { code: '+92',  label: '+92  Pakistan' },
  { code: '+880', label: '+880 Bangladesh' },
  { code: '+94',  label: '+94  Sri Lanka' },
  { code: '+27',  label: '+27  South Africa' },
  // Europe
  { code: '+33',  label: '+33  France' },
  { code: '+49',  label: '+49  Germany' },
  { code: '+34',  label: '+34  Spain' },
  { code: '+351', label: '+351 Portugal' },
  { code: '+41',  label: '+41  Switzerland' },
  { code: '+39',  label: '+39  Italy' },
  { code: '+31',  label: '+31  Netherlands' },
  { code: '+32',  label: '+32  Belgium' },
  { code: '+46',  label: '+46  Sweden' },
  { code: '+47',  label: '+47  Norway' },
  { code: '+45',  label: '+45  Denmark' },
  { code: '+358', label: '+358 Finland' },
  { code: '+353', label: '+353 Ireland' },
]

// Canvas Sine Wave Background
function SineWaveBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animFrame
    let time = 0

    const waves = [
      { color: 'rgba(99,102,241,0.5)', amp: 60, freq: 0.015, speed: 0.02, offset: 0 },
      { color: 'rgba(244,63,94,0.35)', amp: 45, freq: 0.02,  speed: 0.015, offset: 100 },
      { color: 'rgba(16,185,129,0.3)', amp: 80, freq: 0.01,  speed: 0.025, offset: 200 },
      { color: 'rgba(139,92,246,0.4)', amp: 35, freq: 0.025, speed: 0.018, offset: 50 },
      { color: 'rgba(251,191,36,0.25)', amp: 55, freq: 0.012, speed: 0.03, offset: 150 },
    ]

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      waves.forEach(wave => {
        ctx.beginPath()
        ctx.moveTo(0, canvas.height / 2)

        for (let x = 0; x <= canvas.width; x++) {
          const y = canvas.height / 2
            + Math.sin(x * wave.freq + time * wave.speed + wave.offset) * wave.amp
            + Math.sin(x * wave.freq * 2.3 + time * wave.speed * 0.7) * (wave.amp * 0.4)
          ctx.lineTo(x, y)
        }

        ctx.strokeStyle = wave.color
        ctx.lineWidth = 2.5
        ctx.shadowColor = wave.color
        ctx.shadowBlur = 8
        ctx.stroke()
      })

      time++
      animFrame = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animFrame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="sine-canvas" />
}

const COLORS = ['#6366f1','#f43f5e','#10b981','#a78bfa','#fbbf24','#38bdf8']

function RisingParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${5 + Math.random() * 90}%`,
    bottom: `${Math.random() * 20}%`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 3 + Math.random() * 5,
    duration: `${6 + Math.random() * 10}s`,
    delay: `${Math.random() * 8}s`,
  }))

  return (
    <>
      {particles.map(p => (
        <div key={p.id} className="particle-dot" style={{
          left: p.left,
          bottom: p.bottom,
          background: p.color,
          width: p.size,
          height: p.size,
          boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          animationDuration: p.duration,
          animationDelay: p.delay,
        }} />
      ))}
    </>
  )
}

function SciFiIcons() {
  return (
    <>
      <div className="sci-icon sci-icon-1">⚛</div>
      <div className="sci-icon sci-icon-2">∫</div>
      <div className="sci-icon sci-icon-3">⌬</div>
      <div className="sci-icon sci-icon-4">θ</div>
      <div className="sci-icon sci-icon-5">∑</div>
    </>
  )
}

function HomePage() {
  const [groups, setGroups] = useState([])
  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    email: '',
    countryCode: '+1',
    phone: '',
    subject: 'Mathematics',
    grade: 'Grade 10',
    type: 'Group Tutoring',
    curriculum: 'CBSE'
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Calculus', 'English']
  const grades = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
  const types = ['Group Tutoring', 'One to One Tutoring']
  const curriculums = ['CBSE', 'ICSE', 'GCSE', 'IB', 'IGCSE', 'Others']

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

  useEffect(() => { fetchGroups() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const payload = { ...formData, phone: formData.countryCode + formData.phone }
      const response = await fetch(`${API_URL}/api/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await response.json()
      if (response.ok) {
        setMessage('✅ Booking successful! We will be in touch soon.')
        fetchGroups()
        setFormData({ ...formData, studentName: '', parentName: '', email: '', phone: '' })
      } else {
        setMessage(data.error || 'Something went wrong')
      }
    } catch (error) {
      setMessage('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => setFormData({ ...formData, [key]: e.target.value })

  return (
    <div className="app">
      <SineWaveBackground />
      <RisingParticles />
      <SciFiIcons />

      <div className="top-right-login">
        <Link to="/login" className="btn-secondary subtle-login">Admin Login</Link>
      </div>

      <main className="container main-layout simplified-layout">
        <section className="booking-section glass animate-fade-in">
          <h3>Book a Session</h3>
          <form onSubmit={handleSubmit} className="booking-form">

            <div className="input-group">
              <label>Student's Name</label>
              <input type="text" placeholder="Student full name" value={formData.studentName} onChange={set('studentName')} required />
            </div>

            <div className="input-group">
              <label>Parent's Name</label>
              <input type="text" placeholder="Parent / Guardian name" value={formData.parentName} onChange={set('parentName')} required />
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input type="email" placeholder="your@email.com" value={formData.email} onChange={set('email')} required />
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <div className="phone-group">
                <select className="country-code-select" value={formData.countryCode} onChange={set('countryCode')}>
                  {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
                <input type="tel" placeholder="Phone number" value={formData.phone} onChange={set('phone')} required />
              </div>
            </div>

            <div className="input-group">
              <label>Subject</label>
              <select value={formData.subject} onChange={set('subject')}>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label>Grade</label>
              <select value={formData.grade} onChange={set('grade')}>
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label>Tutoring Type</label>
              <select value={formData.type} onChange={set('type')}>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label>Curriculum</label>
              <select value={formData.curriculum} onChange={set('curriculum')}>
                {curriculums.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button className="btn-primary" disabled={loading}>
              {loading ? 'Booking...' : 'Book Session'}
            </button>
            {message && <p className="form-message">{message}</p>}
          </form>
        </section>
      </main>

      <footer className="footer container">
        <p>&copy; 2026 GTutoring. All rights reserved.</p>
      </footer>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  )
}

export default App
