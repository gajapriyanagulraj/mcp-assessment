import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    navigate('/quiz', { state: { name: name.trim(), email: email.trim().toLowerCase() } });
  }

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginBottom: '0.5rem' }}>Welcome</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          Enter your details to begin the 25-question assessment.
        </p>
        <form className="reg-form" onSubmit={handleSubmit} autoComplete="off">
          <input
            type="text"
            placeholder="Full Name *"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email Address *"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            Start Assessment →
          </button>
        </form>
      </div>
    </div>
  );
}
