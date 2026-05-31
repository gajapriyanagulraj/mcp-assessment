import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QUESTIONS from '../data/questions';
import { saveParticipant } from '../utils/storage';
import Toast from './Toast';

export default function Quiz() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const [answers, setAnswers] = useState({});
  const [toast, setToast]     = useState('');
  const [disqualified, setDisqualified] = useState(
    () => sessionStorage.getItem('mcq_disqualified') === '1'
  );
  const answersRef = useRef({});

  // Keep ref in sync so the visibility handler always sees latest answers
  useEffect(() => { answersRef.current = answers; }, [answers]);

  // Redirect to home if landed directly without registration
  useEffect(() => {
    if (!state?.name) navigate('/', { replace: true });
  }, [state, navigate]);

  // Tab-switch / window-blur detection
  useEffect(() => {
    if (!state?.name) return;

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        disqualifyUser();
      }
    }

    function handleBlur() {
      disqualifyUser();
    }

    function disqualifyUser() {
      // Prevent duplicate entries on refresh
      if (sessionStorage.getItem('mcq_disqualified') === '1') return;

      const currentAnswers = answersRef.current;
      const responses = QUESTIONS.map((q, i) => ({
        questionId: q.id,
        selected: currentAnswers[i] ?? null,
        correct: currentAnswers[i] !== undefined && currentAnswers[i] === q.answer,
      }));
      const correct = responses.filter(r => r.correct).length;
      const participant = {
        id: Date.now().toString(),
        name: state.name,
        email: state.email,
        score: correct,
        correct,
        wrong: QUESTIONS.length - correct,
        disqualified: true,
        responses,
        date: new Date().toISOString(),
      };
      saveParticipant(participant);
      sessionStorage.setItem('mcq_disqualified', '1');
      setDisqualified(true);
      // Clean up listeners immediately
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [state, navigate]);

  const answered = Object.keys(answers).length;
  const progress  = Math.round((answered / QUESTIONS.length) * 100);

  function selectAnswer(qIdx, optIdx) {
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  }

  function handleSubmit() {
    const firstUnanswered = QUESTIONS.findIndex((_, i) => answers[i] === undefined);
    if (firstUnanswered !== -1) {
      setToast(`Please answer question ${firstUnanswered + 1} before submitting.`);
      document.getElementById(`q-block-${firstUnanswered}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const responses = QUESTIONS.map((q, i) => ({
      questionId: q.id,
      selected: answers[i],
      correct: answers[i] === q.answer,
    }));

    const correct = responses.filter(r => r.correct).length;
    const participant = {
      id: Date.now().toString(),
      name: state.name,
      email: state.email,
      score: correct,
      correct,
      wrong: QUESTIONS.length - correct,
      percent: Math.round((correct / QUESTIONS.length) * 100),
      responses,
      date: new Date().toISOString(),
    };

    saveParticipant(participant);
    navigate('/result', { state: { participant }, replace: true });
  }

  if (!state?.name) return null;

  // ── Disqualified screen ───────────────────────────────────
  if (disqualified) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
          <h2 style={{ color: '#dc2626', marginBottom: '.75rem' }}>Disqualified</h2>
          <p style={{ color: '#64748b', maxWidth: '420px', margin: '0 auto' }}>
            You switched tabs or left the window during the test.<br />
            Your attempt has been recorded and the test is now closed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        {/* Header */}
        <div className="quiz-header">
          <div>
            <span style={{ fontWeight: 700 }}>{state.name}</span>
            <span style={{ color: '#64748b', fontSize: '.9rem' }}> — answer all 25 questions</span>
          </div>
          <span style={{ fontSize: '.9rem', color: '#64748b' }}>
            {answered} / {QUESTIONS.length} answered
          </span>
        </div>

        {/* Progress bar */}
        <div className="progress-bar-wrap">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {/* Questions */}
        {QUESTIONS.map((q, idx) => (
          <div className="question-block" id={`q-block-${idx}`} key={q.id}>
            <div className="q-num">Question {idx + 1} of {QUESTIONS.length}</div>
            <span className="q-category">{q.category}</span>
            <div className="q-text">
              {q.text.split('\n').map((line, i) => (
                <span key={i}>{line}{i < q.text.split('\n').length - 1 && <br />}</span>
              ))}
            </div>
            <div className="options">
              {q.options.map((opt, optIdx) => (
                <label
                  key={optIdx}
                  className={`option-label${answers[idx] === optIdx ? ' selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`q${idx}`}
                    value={optIdx}
                    checked={answers[idx] === optIdx}
                    onChange={() => selectAnswer(idx, optIdx)}
                  />
                  <span><strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div style={{ textAlign: 'right', marginTop: '1rem' }}>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Submit Test
          </button>
        </div>
      </div>

      <Toast message={toast} onDone={() => setToast('')} />
    </div>
  );
}
