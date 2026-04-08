import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './App.css'

function Admin() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        navigate('/login')
        return
      }

      try {
        const response = await fetch(`${API_URL}/api/admin/data`, {
          headers: { 'Authorization': token }
        })
        const result = await response.json()
        if (response.ok) {
          setData(result)
        } else {
          setError(result.error || 'Failed to fetch data')
          if (response.status === 401 || response.status === 403) {
            navigate('/login')
          }
        }
      } catch (err) {
        setError('Connection failed')
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [navigate, API_URL])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/login')
  }

  return (
    <div className="admin-page">
      <nav className="navbar glass">
        <div className="container nav-content">
          <Link to="/" className="logo-link"><h1 className="logo">GTutoring<span>.</span></h1></Link>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </nav>

      <main className="container admin-container animate-fade-in">
        <header className="admin-header">
          <h2>Admin Dashboard</h2>
          <p className="text-dim">Detailed overview of all group and individual bookings.</p>
        </header>

        {loading ? <p>Loading data...</p> : error ? <p className="error-message">{error}</p> : (
          <div className="admin-table-container glass">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Group ID</th>
                  <th>Subject</th>
                  <th>Grade</th>
                  <th>Curriculum</th>
                  <th>Type</th>
                  <th>Members Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map(group => (
                  <tr key={group.id}>
                    <td>#{group.id}</td>
                    <td>{group.subject}</td>
                    <td>{group.grade}</td>
                    <td>{group.curriculum}</td>
                    <td>{group.type}</td>
                    <td>
                      <div className="members-detailed-cell">
                        {group.members.map((m, i) => (
                          <div key={i} className="member-detail-row">
                            <strong>{m.studentName}</strong> 
                            <span className="text-dim"> (Parent: {m.parentName})</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${group.status.toLowerCase()}`}>
                        {group.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

export default Admin
