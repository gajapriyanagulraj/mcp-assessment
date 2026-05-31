import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Register   from './components/Register';
import Quiz       from './components/Quiz';
import Result     from './components/Result';
import Admin      from './components/Admin';
import AdminLogin from './components/AdminLogin';
import './App.css';

function isAdminLoggedIn() {
  return sessionStorage.getItem('mcq_admin_auth') === '1';
}

function ProtectedAdmin() {
  return isAdminLoggedIn() ? <Admin /> : <Navigate to="/admin/login" replace />;
}

function Header() {
  const { pathname } = useLocation();
  const onAdminPage = pathname.startsWith('/admin');
  return (
    <header>
      <h1>Tech MCQ Assessment</h1>
      {onAdminPage
        ? <Link to="/">← Back to Assessment</Link>
        : null
      }
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/"            element={<Register />} />
        <Route path="/quiz"        element={<Quiz />} />
        <Route path="/result"      element={<Result />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin"       element={<ProtectedAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
