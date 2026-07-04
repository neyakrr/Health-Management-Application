import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login({ setAuth }) {
  const [loginType, setLoginType] = useState('user'); // 'user' | 'caregiver'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = loginType === 'caregiver'
        ? 'http://localhost:8080/api/auth/caregiver-login'
        : 'http://localhost:8080/api/auth/login';

      const response = await axios.post(endpoint, { email, password });
      const { token, role, user, patientUserId } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', role || 'USER');
      if (patientUserId) localStorage.setItem('patientUserId', patientUserId);

      setAuth(true);
      navigate(role === 'CAREGIVER' ? '/caregiver-dashboard' : '/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #EEF2FF 0%, #F3F4F6 100%)' }}>
      <div style={{ width: '420px', background: 'white', borderRadius: '16px', padding: '2.25rem', boxShadow: '0 8px 32px rgba(79, 70, 229, 0.12)' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🏥</div>
          <h2 style={{ margin: 0, color: '#4F46E5', fontWeight: 800, fontSize: '1.5rem' }}>Health Concierge</h2>
          <p style={{ margin: '0.25rem 0 0', color: '#9CA3AF', fontSize: '0.88rem' }}>Your personal health companion</p>
        </div>

        {/* Toggle: User / Caregiver */}
        <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: '10px', padding: '4px', marginBottom: '1.75rem' }}>
          {['user', 'caregiver'].map(type => (
            <button
              key={type}
              onClick={() => { setLoginType(type); setError(''); }}
              style={{
                flex: 1, padding: '0.55rem', border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.2s',
                background: loginType === type ? 'white' : 'transparent',
                color: loginType === type ? '#4F46E5' : '#6B7280',
                boxShadow: loginType === type ? '0 1px 4px rgba(0,0,0,0.12)' : 'none'
              }}
            >
              {type === 'user' ? '👤 Patient / User' : '🧑‍⚕️ Caregiver'}
            </button>
          ))}
        </div>

        {/* Caregiver info hint */}
        {loginType === 'caregiver' && (
          <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '8px', padding: '0.65rem 0.9rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#4338CA' }}>
            👁️ Use the credentials sent to your email by the patient's Health Concierge account.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ margin: 0, color: '#EF4444', fontSize: '0.85rem', background: '#FEF2F2', padding: '0.6rem 0.75rem', borderRadius: '8px' }}>
              ⚠️ {error}
            </p>
          )}

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            style={{
              padding: '0.8rem', background: loading ? '#A5B4FC' : '#4F46E5', color: 'white',
              border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: '0.95rem', transition: 'background 0.2s', marginTop: '0.25rem'
            }}
          >
            {loading ? 'Signing in...' : `Sign In as ${loginType === 'caregiver' ? 'Caregiver' : 'Patient'}`}
          </button>
        </form>

        {loginType === 'user' && (
          <p style={{ marginTop: '1.25rem', textAlign: 'center', color: '#6B7280', fontSize: '0.88rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#4F46E5', fontWeight: 600, textDecoration: 'none' }}>
              Register here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#6B7280', marginBottom: '0.35rem' };
const inputStyle = { width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s', background: '#FAFAFA' };
