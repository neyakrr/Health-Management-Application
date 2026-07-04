import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TABS = ['Appointments', 'Medications', 'Journal'];

const formatDate = (dt) => {
    if (!dt) return '';
    return new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

const MOOD_OPTIONS = [
    { value: 'great', label: '😄 Great', color: '#10B981' },
    { value: 'good',  label: '🙂 Good',  color: '#34D399' },
    { value: 'okay',  label: '😐 Okay',  color: '#F59E0B' },
    { value: 'poor',  label: '😕 Poor',  color: '#F97316' },
    { value: 'bad',   label: '😞 Bad',   color: '#EF4444' },
];
const getMoodInfo = (mood) => MOOD_OPTIONS.find(m => m.value === mood) || MOOD_OPTIONS[2];

export default function CaregiverDashboard({ onLogout }) {
    const [activeTab, setActiveTab] = useState('Appointments');
    const [appointments, setAppointments] = useState([]);
    const [medications, setMedications] = useState([]);
    const [journal, setJournal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            setError('');
            try {
                const [apptRes, medRes, journalRes] = await Promise.all([
                    axios.get('/api/appointments').catch(() => ({ data: [] })),
                    axios.get('/api/medications').catch(() => ({ data: [] })),
                    axios.get('/api/journal').catch(() => ({ data: [] })),
                ]);
                setAppointments(Array.isArray(apptRes.data) ? apptRes.data : []);
                setMedications(Array.isArray(medRes.data) ? medRes.data : []);
                setJournal(Array.isArray(journalRes.data) ? journalRes.data : []);
            } catch (e) {
                setError('Could not load patient data.');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: '#F3F4F6' }}>
            {/* Top bar */}
            <div style={{
                background: 'white', borderBottom: '1px solid #E5E7EB',
                padding: '0.875rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#4F46E5' }}>Health Concierge</span>
                    <span style={{
                        background: '#EEF2FF', color: '#4F46E5', fontSize: '0.72rem', fontWeight: 700,
                        padding: '0.2rem 0.65rem', borderRadius: '99px', letterSpacing: '0.05em'
                    }}>CAREGIVER VIEW</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#6B7280' }}>
                        👤 {user.name || user.email}
                    </span>
                    <button
                        onClick={onLogout}
                        style={{ background: '#F3F4F6', color: '#374151', border: '1.5px solid #E5E7EB', padding: '0.4rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
                {/* Read-only notice */}
                <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '10px', padding: '0.75rem 1.25rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>👁️</span>
                    <p style={{ margin: 0, color: '#78350F', fontSize: '0.88rem', fontWeight: 500 }}>
                        You are viewing this patient's health data in <strong>read-only</strong> mode. You cannot make any changes.
                    </p>
                </div>

                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>
                    Patient Health Overview
                </h1>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'white', padding: '0.4rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1, padding: '0.6rem', border: 'none', borderRadius: '8px', cursor: 'pointer',
                                fontWeight: 600, fontSize: '0.9rem',
                                background: activeTab === tab ? '#4F46E5' : 'transparent',
                                color: activeTab === tab ? 'white' : '#6B7280',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab === 'Appointments' ? '📅 ' : tab === 'Medications' ? '💊 ' : '📔 '}{tab}
                        </button>
                    ))}
                </div>

                {error && <p style={{ color: '#EF4444' }}>{error}</p>}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>Loading patient data...</div>
                ) : (
                    <>
                        {/* Appointments Tab */}
                        {activeTab === 'Appointments' && (
                            <div>
                                <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    {appointments.length} upcoming appointment{appointments.length !== 1 ? 's' : ''}
                                </p>
                                {appointments.length === 0 ? (
                                    <EmptyState icon="📅" text="No upcoming appointments." />
                                ) : appointments.map((appt, idx) => (
                                    <div key={appt.id || idx} className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 0.25rem' }}>{appt.title}</h3>
                                            <p style={{ margin: '0 0 0.2rem', color: '#4B5563' }}>👨‍⚕️ {appt.doctorName || appt.doctor_name}</p>
                                            {appt.location && <p style={{ margin: '0 0 0.2rem', color: '#4B5563' }}>📍 {appt.location}</p>}
                                            {appt.notes && <p style={{ margin: 0, color: '#9CA3AF', fontSize: '0.85rem' }}>📝 {appt.notes}</p>}
                                        </div>
                                        <p style={{ fontWeight: 700, color: '#4F46E5', margin: 0, minWidth: '140px', textAlign: 'right' }}>
                                            {formatDate(appt.dateTime || appt.date_time)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Medications Tab */}
                        {activeTab === 'Medications' && (
                            <div>
                                <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    {medications.length} active medication{medications.length !== 1 ? 's' : ''}
                                </p>
                                {medications.length === 0 ? (
                                    <EmptyState icon="💊" text="No active medications." />
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                        {medications.map((med, idx) => {
                                            const isLow = med.quantity != null && med.refillThreshold != null && med.quantity <= med.refillThreshold;
                                            return (
                                                <div key={med.id || idx} className="card" style={{ padding: '1.25rem', borderTop: `3px solid ${isLow ? '#EF4444' : '#4F46E5'}`, marginBottom: 0 }}>
                                                    <h3 style={{ margin: '0 0 0.25rem' }}>{med.name}</h3>
                                                    <p style={{ margin: '0 0 0.5rem', color: '#4F46E5', fontWeight: 600 }}>{med.dosage}</p>
                                                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: '#6B7280' }}>🕐 {med.frequency}</p>
                                                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: '#6B7280' }}>🍽️ {med.foodInstructions || med.food_instructions}</p>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: isLow ? '#B91C1C' : '#6B7280', fontWeight: isLow ? 600 : 400 }}>
                                                        💊 {med.quantity} pills remaining{isLow ? ' ⚠️' : ''}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Journal Tab */}
                        {activeTab === 'Journal' && (
                            <div>
                                <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    {journal.length} journal entr{journal.length !== 1 ? 'ies' : 'y'}
                                </p>
                                {journal.length === 0 ? (
                                    <EmptyState icon="📔" text="No journal entries yet." />
                                ) : journal.map((entry) => {
                                    const mood = getMoodInfo(entry.mood);
                                    return (
                                        <div key={entry.id} className="card" style={{ padding: '1.25rem', borderLeft: `4px solid ${mood.color}`, marginBottom: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                                                <h3 style={{ margin: 0, fontSize: '1rem' }}>{entry.title}</h3>
                                                <span style={{ background: mood.color + '22', color: mood.color, fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '99px' }}>
                                                    {mood.label}
                                                </span>
                                            </div>
                                            <p style={{ margin: '0 0 0.5rem', color: '#4B5563', fontSize: '0.9rem', lineHeight: 1.6 }}>{entry.content}</p>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#9CA3AF' }}>📅 {formatDate(entry.createdAt)}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function EmptyState({ icon, text }) {
    return (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: '#9CA3AF', background: 'white', borderRadius: '12px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{icon}</div>
            <p style={{ margin: 0 }}>{text}</p>
        </div>
    );
}
