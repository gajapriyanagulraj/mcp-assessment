import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Credentials — change these as needed
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'vedha@0110';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem('mcq_admin_auth', '1');
      navigate('/admin', { replace: true });
    } else {
      setError('Invalid username or password.');
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '3rem auto' }}>
        <h2 style={{ marginBottom: '.4rem' }}>🔒 Admin Login</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '.9rem' }}>
          This area is restricted to administrators only.
        </p>
        <form className="reg-form" onSubmit={handleSubmit} autoComplete="off">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(''); }}
            required
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            required
          />
          {error && (
            <p style={{ color: '#dc2626', fontSize: '.88rem', marginTop: '-.3rem' }}>
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary">Login →</button>
        </form>
      </div>
    </div>
  );
}
