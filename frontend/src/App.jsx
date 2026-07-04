import { Activity, Calendar, MessageSquare, Pill, Users, BookOpen, LogOut } from 'lucide-react';
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
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('patientUserId');
    setAuth(false);
    navigate('/login');
  };

  return (
    <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="sidebar-title">Health Concierge</div>
      <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        <Activity size={20} /> Dashboard
      </NavLink>
      <NavLink to="/chat" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        <MessageSquare size={20} /> Concierge Chat
      </NavLink>
      <NavLink to="/medications" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        <Pill size={20} /> Medications
      </NavLink>
      <NavLink to="/appointments" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        <Calendar size={20} /> Appointments
      </NavLink>
      <NavLink to="/journal" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        <BookOpen size={20} /> Journal
      </NavLink>
      <NavLink to="/caregivers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        <Users size={20} /> Caregivers
      </NavLink>
      <div style={{ marginTop: 'auto', padding: '1rem' }}>
        <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
          <LogOut size={20} /> Logout
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
