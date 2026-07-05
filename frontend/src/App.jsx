import { Activity, Calendar, MessageSquare, Pill, Users, BookOpen, LogOut, Heart } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import './axiosConfig';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Medications from './pages/Medications';
import Appointments from './pages/Appointments';
import Journal from './pages/Journal';
import Caregivers from './pages/Caregivers';
import CaregiverDashboard from './pages/CaregiverDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

function Sidebar({ setAuth }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('patientUserId');
    setAuth(false);
    navigate('/login');
  };

  // User initials for avatar
  const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo-icon">🏥</div>
        <span className="sidebar-title">Health Concierge</span>
      </div>

      {/* User chip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.65rem',
        padding: '0.75rem', background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(124,58,237,0.06))',
        borderRadius: '14px', marginBottom: '1rem',
        border: '1px solid rgba(79,70,229,0.12)',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 800, fontSize: '0.85rem',
          boxShadow: '0 4px 10px rgba(79,70,229,0.3)', flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name || 'User'}
          </p>
          <p style={{ margin: 0, fontSize: '0.7rem', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.email || ''}
          </p>
        </div>
      </div>

      {/* Nav items */}
      <span className="sidebar-section-label">Navigation</span>

      <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        <Activity size={18} /> <span>Dashboard</span>
      </NavLink>
      <NavLink to="/chat" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        <MessageSquare size={18} /> <span>Concierge Chat</span>
      </NavLink>

      <span className="sidebar-section-label">Health</span>

      <NavLink to="/medications" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        <Pill size={18} /> <span>Medications</span>
      </NavLink>
      <NavLink to="/appointments" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        <Calendar size={18} /> <span>Appointments</span>
      </NavLink>
      <NavLink to="/journal" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        <BookOpen size={18} /> <span>Journal</span>
      </NavLink>

      <span className="sidebar-section-label">Account</span>

      <NavLink to="/caregivers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        <Users size={18} /> <span>Caregivers</span>
      </NavLink>

      <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(229,231,235,0.6)' }}>
        <button
          onClick={handleLogout}
          className="nav-link"
          style={{ color: '#EF4444' }}
        >
          <LogOut size={18} /> <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

function ProtectedRoute({ isAuth, children }) {
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const [isAuth, setAuth] = useState(false);
  const [role, setRole] = useState('USER');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    if (token) {
      setAuth(true);
      setRole(savedRole || 'USER');
    }
  }, []);

  const handleSetAuth = (value) => {
    setAuth(value);
    if (value) {
      setRole(localStorage.getItem('role') || 'USER');
    } else {
      setRole('USER');
    }
  };

  const handleCaregiverLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('patientUserId');
    setAuth(false);
    setRole('USER');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setAuth={handleSetAuth} />} />
        <Route path="/register" element={<Register setAuth={handleSetAuth} />} />

        {/* Caregiver-only route */}
        <Route path="/caregiver-dashboard" element={
          <ProtectedRoute isAuth={isAuth}>
            <CaregiverDashboard onLogout={handleCaregiverLogout} />
          </ProtectedRoute>
        } />

        {/* Patient routes */}
        <Route path="/*" element={
          <ProtectedRoute isAuth={isAuth}>
            {role === 'CAREGIVER' ? (
              <Navigate to="/caregiver-dashboard" replace />
            ) : (
              <div className="app-container">
                <Sidebar setAuth={handleSetAuth} />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/medications" element={<Medications />} />
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/caregivers" element={<Caregivers />} />
                  </Routes>
                </main>
              </div>
            )}
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
