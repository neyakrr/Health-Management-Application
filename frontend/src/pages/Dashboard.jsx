import React, { useState, useEffect } from 'react';
import axios from 'axios';

const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const formatDate = (dt) => {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

const formatDateShort = (dt) => {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

function SkeletonCard({ height = 120 }) {
  return (
    <div style={{
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: '16px',
      height,
    }} />
  );
}

function StatCard({ icon, label, value, sub, accent, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div style={{
      background: 'white',
      borderRadius: '18px',
      padding: '1.5rem',
      boxShadow: '0 4px 20px rgba(79,70,229,0.08)',
      borderTop: `4px solid ${accent}`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
      cursor: 'default',
      position: 'relative',
      overflow: 'hidden',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${accent}33`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,70,229,0.08)'; }}
    >
      {/* Decorative circle */}
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '80px', height: '80px',
        borderRadius: '50%',
        background: `${accent}18`,
      }} />
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.3rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.78rem', color: accent, fontWeight: 600, marginTop: '0.4rem' }}>{sub}</div>}
    </div>
  );
}

function QuickAction({ icon, label, onClick, accent }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
        padding: '1rem 1.25rem', borderRadius: '14px', border: 'none',
        background: hover ? accent : `${accent}15`,
        color: hover ? 'white' : accent,
        cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem',
        transition: 'all 0.2s ease', boxShadow: hover ? `0 6px 20px ${accent}44` : 'none',
        transform: hover ? 'scale(1.06)' : 'scale(1)',
        minWidth: '90px',
      }}
    >
      <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      {label}
    </button>
  );
}

function ActivityItem({ icon, text, time, accent }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      padding: '0.75rem 0', borderBottom: '1px solid #F3F4F6',
    }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: `${accent}18`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#374151', fontWeight: 500 }}>{text}</p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.1rem' }}>{time}</p>
      </div>
    </div>
  );
}

function HealthScoreRing({ score }) {
  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r="44" fill="none" stroke="#F3F4F6" strokeWidth="10" />
        <circle
          cx="55" cy="55" r="44" fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="55" y="52" textAnchor="middle" fontSize="22" fontWeight="800" fill="#111827">{score}</text>
        <text x="55" y="68" textAnchor="middle" fontSize="10" fill="#9CA3AF">/ 100</text>
      </svg>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Attention'}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [medications, setMedications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [journalData, setJournalData] = useState({ vitals: [], symptoms: [] });
  const [visible, setVisible] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get('/api/medications', { headers }).catch(() => ({ data: [] })),
      axios.get('/api/appointments', { headers }).catch(() => ({ data: [] })),
      axios.get('/api/journal?days=7', { headers }).catch(() => ({ data: { vitals: [], symptoms: [] } })),
    ]).then(([medRes, apptRes, journalRes]) => {
      setMedications(Array.isArray(medRes.data) ? medRes.data : []);
      setAppointments(Array.isArray(apptRes.data) ? apptRes.data : []);
      const jd = journalRes.data;
      if (jd && jd.vitals !== undefined) {
        setJournalData({ vitals: jd.vitals || [], symptoms: jd.symptoms || [] });
      } else if (Array.isArray(jd)) {
        setJournalData({ vitals: jd.filter(d => d.type), symptoms: jd.filter(d => d.symptom) });
      }
    }).finally(() => {
      setLoading(false);
      setTimeout(() => setVisible(true), 50);
    });
  }, []);

  // Derived values
  const todayMeds = medications.filter(m => m.frequency && !m.frequency.toLowerCase().includes('weekly'));
  const lowStockMeds = medications.filter(m => m.quantity != null && m.refillThreshold != null && m.quantity <= m.refillThreshold);
  const upcomingAppts = appointments
    .filter(a => new Date(a.dateTime || a.date_time) > new Date())
    .sort((a, b) => new Date(a.dateTime || a.date_time) - new Date(b.dateTime || b.date_time));
  const nextAppt = upcomingAppts[0] || null;
  const latestVital = journalData.vitals.length > 0 ? journalData.vitals[0] : null;

  // Simple health score
  const healthScore = Math.min(100, Math.max(0,
    100
    - (lowStockMeds.length * 10)
    - (journalData.symptoms.filter(s => s.severity >= 7).length * 15)
    + (journalData.vitals.length > 0 ? 5 : 0)
  ));

  // Activity feed
  const activities = [
    ...journalData.vitals.slice(0, 3).map(v => ({
      icon: '❤️', text: `Logged vital: ${v.type?.replace('_', ' ')} — ${v.value} ${v.unit}`,
      time: formatDate(v.recordedAt || v.recorded_at), accent: '#4F46E5',
    })),
    ...journalData.symptoms.slice(0, 2).map(s => ({
      icon: '🤒', text: `Reported symptom: ${s.symptom} (severity ${s.severity}/10)`,
      time: formatDate(s.recordedAt || s.recorded_at), accent: '#F59E0B',
    })),
    ...appointments.slice(0, 2).map(a => ({
      icon: '📅', text: `Appointment booked: ${a.title} with ${a.doctorName || a.doctor_name}`,
      time: formatDate(a.dateTime || a.date_time), accent: '#10B981',
    })),
  ].sort(() => 0).slice(0, 5);

  const navigate = (path) => window.location.href = path;

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(10px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
    }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #2563EB 100%)',
        borderRadius: '20px',
        padding: '2rem 2.5rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(79,70,229,0.3)',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '120px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {greet()} 👋
              </p>
              <h1 style={{ margin: '0.25rem 0 0.5rem', color: 'white', fontSize: '2rem', fontWeight: 800, lineHeight: 1.2 }}>
                {user.name || 'Welcome back'}
              </h1>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
                {loading
                  ? 'Loading your health summary…'
                  : `You have ${todayMeds.length} medication${todayMeds.length !== 1 ? 's' : ''} scheduled today.${lowStockMeds.length > 0 ? ` ⚠️ ${lowStockMeds.length} running low.` : ' Everything looks good!'}`
                }
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '0.75rem 1.25rem',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.25)',
            }}>
              📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              icon="💊"
              label="Medications Today"
              value={todayMeds.length}
              sub={lowStockMeds.length > 0 ? `${lowStockMeds.length} low stock` : 'All stocked up'}
              accent="#4F46E5"
              delay={0}
            />
            <StatCard
              icon="📅"
              label="Next Appointment"
              value={nextAppt ? formatDateShort(nextAppt.dateTime || nextAppt.date_time) : 'None'}
              sub={nextAppt ? (nextAppt.doctorName || nextAppt.doctor_name || nextAppt.title) : 'Book one now'}
              accent="#2563EB"
              delay={100}
            />
            <StatCard
              icon="❤️"
              label="Latest Vital"
              value={latestVital ? `${latestVital.value} ${latestVital.unit}` : '—'}
              sub={latestVital ? latestVital.type?.replace('_', ' ') : 'Log in Journal'}
              accent="#EF4444"
              delay={200}
            />
            <StatCard
              icon="📋"
              label="Journal Entries"
              value={journalData.vitals.length + journalData.symptoms.length}
              sub={`Last 7 days`}
              accent="#10B981"
              delay={300}
            />
          </>
        )}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Quick Actions */}
          <div style={{ background: 'white', borderRadius: '18px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(79,70,229,0.06)' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <QuickAction icon="💊" label="Medications" onClick={() => navigate('/medications')} accent="#4F46E5" />
              <QuickAction icon="📅" label="Book Appt." onClick={() => navigate('/appointments')} accent="#2563EB" />
              <QuickAction icon="❤️" label="Log Vital" onClick={() => navigate('/journal')} accent="#EF4444" />
              <QuickAction icon="💬" label="AI Chat" onClick={() => navigate('/chat')} accent="#7C3AED" />
              <QuickAction icon="👥" label="Caregivers" onClick={() => navigate('/caregivers')} accent="#10B981" />
            </div>
          </div>

          {/* Activity Feed */}
          <div style={{ background: 'white', borderRadius: '18px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(79,70,229,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Recent Activity</h3>
              <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>Last 7 days</span>
            </div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[1, 2, 3].map(i => <SkeletonCard key={i} height={48} />)}
              </div>
            ) : activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</div>
                <p style={{ margin: 0 }}>No recent activity. Start logging your health!</p>
              </div>
            ) : (
              activities.map((a, i) => (
                <ActivityItem key={i} icon={a.icon} text={a.text} time={a.time} accent={a.accent} />
              ))
            )}
          </div>

          {/* Upcoming Appointments */}
          <div style={{ background: 'white', borderRadius: '18px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(79,70,229,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Upcoming Appointments</h3>
              <a href="/appointments" style={{ fontSize: '0.8rem', color: '#4F46E5', fontWeight: 600, textDecoration: 'none' }}>View all →</a>
            </div>
            {loading ? (
              <SkeletonCard height={70} />
            ) : upcomingAppts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#9CA3AF', background: '#F9FAFB', borderRadius: '12px' }}>
                <p style={{ margin: 0 }}>📅 No upcoming appointments.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {upcomingAppts.slice(0, 3).map((appt, idx) => (
                  <div key={appt.id || idx} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.85rem 1rem', background: '#F9FAFB', borderRadius: '12px',
                    borderLeft: '4px solid #2563EB',
                  }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>{appt.title}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>👨‍⚕️ {appt.doctorName || appt.doctor_name}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontWeight: 700, color: '#2563EB', fontSize: '0.85rem' }}>{formatDate(appt.dateTime || appt.date_time)}</p>
                      {appt.location && <p style={{ margin: 0, fontSize: '0.75rem', color: '#9CA3AF' }}>📍 {appt.location}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Health Score */}
          <div style={{
            background: 'white', borderRadius: '18px', padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(79,70,229,0.06)', textAlign: 'center',
          }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Health Score</h3>
            {loading ? <SkeletonCard height={130} /> : <HealthScoreRing score={healthScore} />}
            {!loading && (
              <p style={{ margin: '0.75rem 0 0', fontSize: '0.78rem', color: '#9CA3AF' }}>
                Based on vitals, symptoms & medications
              </p>
            )}
          </div>

          {/* Medications Summary */}
          <div style={{ background: 'white', borderRadius: '18px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(79,70,229,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Medications</h3>
              <a href="/medications" style={{ fontSize: '0.8rem', color: '#4F46E5', fontWeight: 600, textDecoration: 'none' }}>Manage →</a>
            </div>
            {loading ? (
              <SkeletonCard height={100} />
            ) : medications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#9CA3AF' }}>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>No medications added yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {medications.slice(0, 4).map((med, i) => {
                  const isLow = med.quantity != null && med.refillThreshold != null && med.quantity <= med.refillThreshold;
                  return (
                    <div key={med.id || i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.6rem 0.85rem', background: isLow ? '#FEF2F2' : '#F9FAFB',
                      borderRadius: '10px', borderLeft: `3px solid ${isLow ? '#EF4444' : '#4F46E5'}`,
                    }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: '#111827' }}>{med.name}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280' }}>{med.dosage} · {med.frequency}</p>
                      </div>
                      {isLow && (
                        <span style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '99px' }}>
                          LOW
                        </span>
                      )}
                    </div>
                  );
                })}
                {medications.length > 4 && (
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#9CA3AF', textAlign: 'center' }}>
                    +{medications.length - 4} more
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Recent Vitals */}
          <div style={{ background: 'white', borderRadius: '18px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(79,70,229,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Recent Vitals</h3>
              <a href="/journal" style={{ fontSize: '0.8rem', color: '#4F46E5', fontWeight: 600, textDecoration: 'none' }}>Log →</a>
            </div>
            {loading ? (
              <SkeletonCard height={90} />
            ) : journalData.vitals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#9CA3AF' }}>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>No vitals recorded yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {journalData.vitals.slice(0, 3).map((v, i) => (
                  <div key={v.id || i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0.85rem', background: '#F9FAFB', borderRadius: '10px',
                  }}>
                    <span style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 600 }}>
                      {v.type?.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4F46E5' }}>
                      {v.value} <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9CA3AF' }}>{v.unit}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
