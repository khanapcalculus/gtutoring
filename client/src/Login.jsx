import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './App.css'

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (response.ok) {
        localStorage.setItem('adminToken', data.token)
        navigate('/admin')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Connection failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <nav className="navbar glass">
        <div className="container nav-content">
          <Link to="/" className="logo-link"><h1 className="logo">GTutoring<span>.</span></h1></Link>
        </div>
      </nav>

      <main className="container login-container">
        <div className="login-card glass animate-fade-in">
          <h2>Admin Login</h2>
          <p className="text-dim">Enter credentials to manage bookings.</p>
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="input-group">
              <label>Username</label>
              <input 
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required 
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required 
              />
            </div>
            <button className="btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <p className="error-message">{error}</p>}
          </form>
        </div>
      </main>
    </div>
  )
}

export default Login
