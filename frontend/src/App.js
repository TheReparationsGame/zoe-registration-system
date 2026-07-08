import React, { useState, useEffect } from 'react';
import Calculator from './Calculator';
import './App.css';

function App() {
  const [page, setPage] = useState('register');
  const [formData, setFormData] = useState({
    parentFirstName: '',
    parentLastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    insuranceProvider: '',
    insuranceMemberId: ''
  });

  const [children, setChildren] = useState([{ id: 0, firstName: '', lastName: '', dateOfBirth: '', sex: '', allergies: '', medications: '' }]);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ total: 0, submitted: 0, reviewed: 0, completed: 0 });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchRegistrations = async () => {
    try {
      const response = await fetch(`${API_URL}/registrations`);
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  useEffect(() => {
    if (page === 'dashboard') {
      fetchRegistrations();
      fetchStats();
    }
  }, [page]);

  const handleParentChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleChildChange = (id, field, value) => {
    setChildren(children.map(child => child.id === id ? { ...child, [field]: value } : child));
  };

  const addChild = () => {
    const newId = Math.max(...children.map(c => c.id), 0) + 1;
    setChildren([...children, { id: newId, firstName: '', lastName: '', dateOfBirth: '', sex: '', allergies: '', medications: '' }]);
  };

  const removeChild = (id) => {
    if (children.length > 1) {
      setChildren(children.filter(c => c.id !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          children: children.map(c => ({ firstName: c.firstName, lastName: c.lastName, dateOfBirth: c.dateOfBirth, sex: c.sex, allergies: c.allergies, medications: c.medications }))
        })
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`✓ Registration successful! ID: ${result.registrationId}\n\nMock email sent to ${formData.email}:\n\n${result.mockEmail.subject}\n\n${result.mockEmail.body}`);
        setFormData({ parentFirstName: '', parentLastName: '', email: '', phone: '', address: '', city: '', state: '', zip: '', insuranceProvider: '', insuranceMemberId: '' });
        setChildren([{ id: 0, firstName: '', lastName: '', dateOfBirth: '', sex: '', allergies: '', medications: '' }]);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }

    setLoading(false);
  };

  const downloadCSV = async () => {
    try {
      const response = await fetch(`${API_URL}/export/csv`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'zoe-registrations.csv';
      a.click();
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <img src="/zoe-logo.png" alt="Zöe Pediatrics" style={{height: "60px", marginBottom: "1rem"}} />
        <h1>Zöe Pediatrics</h1>
        <p className="tagline">Digital Patient Registration</p>
      </header>

      <nav className="nav">
        <button className={`nav-btn ${page === 'register' ? 'active' : ''}`} onClick={() => setPage('register')}>New Registration</button>
        <button className={`nav-btn ${page === 'dashboard' ? 'active' : ''}`} onClick={() => setPage('dashboard')}>Staff Dashboard</button>
        <button className={`nav-btn ${page === 'calculator' ? 'active' : ''}`} onClick={() => setPage('calculator')}>ROI Calculator</button>
      </nav>

      {page === 'register' && (
        <div className="container">
          <div className="form-wrapper">
            <h2>New Patient Registration</h2>
            <p className="form-subtitle">Complete information for all children in one submission</p>

            {message && (
              <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <fieldset>
                <legend>Parent/Guardian Information</legend>

                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input type="text" name="parentFirstName" value={formData.parentFirstName} onChange={handleParentChange} required />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input type="text" name="parentLastName" value={formData.parentLastName} onChange={handleParentChange} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleParentChange} required />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleParentChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleParentChange} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleParentChange} />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleParentChange} placeholder="GA" maxLength="2" />
                  </div>
                  <div className="form-group">
                    <label>Zip</label>
                    <input type="text" name="zip" value={formData.zip} onChange={handleParentChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Insurance Provider</label>
                    <input type="text" name="insuranceProvider" value={formData.insuranceProvider} onChange={handleParentChange} />
                  </div>
                  <div className="form-group">
                    <label>Member ID</label>
                    <input type="text" name="insuranceMemberId" value={formData.insuranceMemberId} onChange={handleParentChange} />
                  </div>
                </div>
              </fieldset>

              {children.map((child, idx) => (
                <fieldset key={child.id}>
                  <legend>Child {idx + 1} Information {children.length > 1 && <button type="button" className="remove-btn" onClick={() => removeChild(child.id)}>Remove</button>}</legend>

                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input type="text" value={child.firstName} onChange={(e) => handleChildChange(child.id, 'firstName', e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input type="text" value={child.lastName} onChange={(e) => handleChildChange(child.id, 'lastName', e.target.value)} required />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input type="date" value={child.dateOfBirth} onChange={(e) => handleChildChange(child.id, 'dateOfBirth', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Sex</label>
                      <select value={child.sex} onChange={(e) => handleChildChange(child.id, 'sex', e.target.value)}>
                        <option value="">Select...</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Allergies</label>
                    <textarea value={child.allergies} onChange={(e) => handleChildChange(child.id, 'allergies', e.target.value)} placeholder="List any known allergies" rows="2" />
                  </div>

                  <div className="form-group">
                    <label>Current Medications</label>
                    <textarea value={child.medications} onChange={(e) => handleChildChange(child.id, 'medications', e.target.value)} placeholder="List any medications" rows="2" />
                  </div>
                </fieldset>
              ))}

              <button type="button" className="add-child-btn" onClick={addChild}>+ Add Another Child</button>

              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Submitting...' : 'Submit Registration'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {page === 'dashboard' && (
        <div className="container">
          <div className="dashboard">
            <h2>Staff Dashboard</h2>

            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Total Registrations</span>
                <span className="stat-value">{stats.total}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Submitted</span>
                <span className="stat-value">{stats.submitted}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Reviewed</span>
                <span className="stat-value">{stats.reviewed}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Completed</span>
                <span className="stat-value">{stats.completed}</span>
              </div>
            </div>

            <div className="dashboard-actions">
              <button className="export-btn" onClick={downloadCSV}>Download as CSV</button>
              <button className="refresh-btn" onClick={() => { fetchRegistrations(); fetchStats(); }}>Refresh</button>
            </div>

            <div className="registrations-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Parent Name</th>
                    <th>Email</th>
                    <th>Children</th>
                    <th>Insurance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(sub => (
                    <tr key={sub.id}>
                      <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                      <td>{sub.parentFirstName} {sub.parentLastName}</td>
                      <td>{sub.email}</td>
                      <td>{sub.children ? sub.children.length : 0}</td>
                      <td>{sub.insuranceProvider || 'N/A'}</td>
                      <td><span className={`status-badge ${sub.status}`}>{sub.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {submissions.length === 0 && <p className="no-data">No registrations yet</p>}
            </div>
          </div>
        </div>
      )}

      {page === 'calculator' && <Calculator />}

      <footer className="footer">
        <p>Zöe Pediatrics Digital Registration System | Proof of Concept Demo</p>
      </footer>
    </div>
  );
}

export default App;
