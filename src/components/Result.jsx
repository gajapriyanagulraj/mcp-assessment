import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Result() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  useEffect(() => {
    if (!state?.participant) navigate('/', { replace: true });
  }, [state, navigate]);

  if (!state?.participant) return null;
  const { name, disqualified } = state.participant;

  if (disqualified) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
          <h2 style={{ color: '#dc2626', marginBottom: '.75rem' }}>Disqualified</h2>
          <p style={{ color: '#64748b' }}>You switched tabs during the test. Your attempt has been recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ marginBottom: '.75rem' }}>Assessment Submitted</h2>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>
          Thank you, <strong>{name}</strong>! Your responses have been recorded.
        </p>
      </div>
    </div>
  );
}
