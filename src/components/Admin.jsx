import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import QUESTIONS from '../data/questions';
import { getParticipants, clearParticipants } from '../utils/storage';
import Toast from './Toast';

/* ── helpers ───────────────────────────────────────────── */
function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function RankBadge({ rank }) {
  if (rank === 1) return <span className="badge badge-gold">🥇 1st</span>;
  if (rank === 2) return <span className="badge badge-silver">🥈 2nd</span>;
  if (rank === 3) return <span className="badge badge-bronze">🥉 3rd</span>;
  return <span style={{ color: '#64748b' }}>{rank}th</span>;
}

/* ── modal ─────────────────────────────────────────────── */
function DetailModal({ participant, onClose }) {
  if (!participant) return null;
  const { name, email, score, date, responses } = participant;

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 style={{ marginBottom: '.3rem' }}>{name}</h2>
        <p style={{ color: '#64748b', fontSize: '.88rem', marginBottom: '1.2rem' }}>
          {email} · Score: {score}/25 · {new Date(date).toLocaleString()}
        </p>
        <div>
          {responses.map((r, i) => {
            const q   = QUESTIONS[i];
            const sel = q.options[r.selected];
            const cor = q.options[q.answer];
            return (
              <div className="answer-row" key={i}>
                <div className="ans-icon">{r.correct ? '✅' : '❌'}</div>
                <div>
                  <div className="ans-q">
                    Q{i + 1} [{q.category}] {q.text.replace(/\n/g, ' ')}
                  </div>
                  <div className={`ans-sub ${r.correct ? 'ans-correct' : 'ans-wrong'}`}>
                    Your answer: <strong>{sel}</strong>
                  </div>
                  {!r.correct && (
                    <div className="ans-sub ans-correct">
                      Correct: <strong>{cor}</strong>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── main component ────────────────────────────────────── */
export default function Admin() {
  const [all, setAll]         = useState([]);
  const [search, setSearch]   = useState('');
  const [sortBy, setSortBy]   = useState('rank');
  const [selected, setSelected] = useState(null);
  const [toast, setToast]     = useState('');
  const navigate = useNavigate();

  function handleLogout() {
    sessionStorage.removeItem('mcq_admin_auth');
    navigate('/admin/login', { replace: true });
  }

  const load = useCallback(() => setAll(getParticipants()), []);
  useEffect(() => {
    load();
    const handler = e => { if (e.key === 'mcq_participants') load(); };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [load]);

  /* analytics */
  const n      = all.length;
  const scores = all.map(p => p.score);
  const avg    = n ? (scores.reduce((a, b) => a + b, 0) / n).toFixed(1) : '—';
  const high   = n ? Math.max(...scores) : '—';
  const low    = n ? Math.min(...scores) : '—';

  /* filter + sort */
  const q = search.toLowerCase();
  let data = q
    ? all.filter(p => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
    : [...all];

  const rankMap = {};
  [...all].sort((a, b) => b.score - a.score).forEach((p, i) => { rankMap[p.id] = i + 1; });

  switch (sortBy) {
    case 'rank':
    case 'score_desc': data.sort((a, b) => b.score - a.score); break;
    case 'score_asc':  data.sort((a, b) => a.score - b.score); break;
    case 'name':       data.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'date':       data.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
    default: break;
  }

  function handleClear() {
    if (!window.confirm('Delete ALL participant data? This cannot be undone.')) return;
    clearParticipants();
    setAll([]);
    setToast('All participant data cleared.');
  }

  return (
    <>
      <div className="container" style={{ maxWidth: '1100px' }}>

        {/* Analytics */}
        <div className="analytics-grid">
          <div className="analytics-card"><div className="a-val">{n}</div><div className="a-lbl">Total Participants</div></div>
          <div className="analytics-card"><div className="a-val">{avg}</div><div className="a-lbl">Average Score</div></div>
          <div className="analytics-card"><div className="a-val">{high}</div><div className="a-lbl">Highest Score</div></div>
          <div className="analytics-card"><div className="a-val">{low}</div><div className="a-lbl">Lowest Score</div></div>
        </div>

        {/* Controls */}
        <div className="card" style={{ padding: '1rem 1.5rem' }}>
          <div className="controls-row">
            <input
              type="text"
              placeholder="🔍 Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="rank">Sort by Rank</option>
              <option value="name">Sort by Name</option>
              <option value="score_desc">Score (High → Low)</option>
              <option value="score_asc">Score (Low → High)</option>
              <option value="date">Sort by Date</option>
            </select>
            <button
              className="btn btn-danger"
              onClick={handleClear}
              style={{ flex: 0, whiteSpace: 'nowrap' }}
            >
              Clear All Data
            </button>
            <button
              className="btn btn-outline"
              onClick={handleLogout}
              style={{ flex: 0, whiteSpace: 'nowrap' }}
            >
              🔓 Logout
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {data.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              No participants yet. Share the assessment link to get started.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Correct</th>
                  <th>Wrong</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p, idx) => (
                  <tr key={p.id}>
                    <td style={{ color: '#94a3b8' }}>{idx + 1}</td>
                    <td><RankBadge rank={rankMap[p.id]} /></td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ color: '#64748b' }}>{p.email}</td>
                    <td><strong>{p.score}</strong>/25</td>
                    <td style={{ color: '#16a34a', fontWeight: 600 }}>{p.correct}</td>
                    <td style={{ color: '#dc2626', fontWeight: 600 }}>{p.wrong}</td>
                    <td>
                      {p.disqualified
                        ? <span className="badge" style={{ background: '#fee2e2', color: '#dc2626' }}>Disqualified</span>
                        : <span className="badge" style={{ background: '#dcfce7', color: '#16a34a' }}>Completed</span>}
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '.82rem' }}>
                      {new Date(p.date).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td>
                      <button className="detail-btn" onClick={() => setSelected(p)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && <DetailModal participant={selected} onClose={() => setSelected(null)} />}
      <Toast message={toast} onDone={() => setToast('')} />
    </>
  );
}
