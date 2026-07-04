import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Caregivers() {
    const [caregivers, setCaregivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [inviting, setInviting] = useState(false);
    const [form, setForm] = useState({ name: '', email: '' });
    const [revokingId, setRevokingId] = useState(null);

    const fetchCaregivers = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/caregivers');
            setCaregivers(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            setError('Could not load caregivers.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCaregivers(); }, []);

    const handleInvite = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        setInviting(true);
        try {
            const res = await axios.post('/api/caregivers/invite', form);
            setSuccess(res.data.message || 'Caregiver invited successfully!');
            setForm({ name: '', email: '' });
            setShowForm(false);
            fetchCaregivers();
        } catch (e) {
            const msg = e.response?.data?.error || 'Failed to invite caregiver.';
            setError(msg);
        } finally {
            setInviting(false);
        }
    };

    const handleRevoke = async (id, name) => {
        if (!window.confirm(`Remove ${name} as a caregiver?`)) return;
        setRevokingId(id);
        try {
            await axios.delete(`/api/caregivers/${id}`);
            setCaregivers(prev => prev.filter(c => c.id !== id));
            setSuccess(`${name}'s access has been revoked.`);
            setTimeout(() => setSuccess(''), 4000);
        } catch (e) {
            setError('Failed to revoke access.');
        } finally {
            setRevokingId(null);
        }
    };

    const formatDate = (dt) => {
        if (!dt) return '';
        return new Date(dt).toLocaleDateString('en-IN', { dateStyle: 'medium' });
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 className="page-title" style={{ margin: '0 0 0.25rem' }}>Caregivers</h1>
                    <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}>
                        Invite trusted people to view your health records (read-only).
                    </p>
                </div>
                <button className="button" onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}>
                    {showForm ? 'Cancel' : '+ Invite Caregiver'}
                </button>
            </div>

            {/* Info card */}
            <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.3rem' }}>🔒</span>
                <div>
                    <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: '#3730A3', fontSize: '0.9rem' }}>Read-Only Access</p>
                    <p style={{ margin: 0, color: '#4338CA', fontSize: '0.82rem' }}>
                        Caregivers can view your appointments, medications, and journal entries. They cannot make any changes.
                        An email with login credentials will be sent to them automatically.
                    </p>
                </div>
            </div>

            {error && <p style={{ color: '#EF4444', marginBottom: '1rem' }}>⚠️ {error}</p>}
            {success && (
                <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#065F46', fontWeight: 500 }}>
                    ✓ {success}
                </div>
            )}

            {/* Invite Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: '1.75rem', padding: '1.75rem' }}>
                    <h3 style={{ marginTop: 0, color: '#4F46E5' }}>Invite a Caregiver</h3>
                    <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Caregiver Name *</label>
                                <input
                                    placeholder="e.g. Priya Sharma"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Email Address *</label>
                                <input
                                    type="email"
                                    placeholder="caregiver@email.com"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                        <p style={{ margin: '0', fontSize: '0.82rem', color: '#6B7280' }}>
                            📧 We'll email the caregiver their login credentials. They can log in at the Caregiver login option on the login page.
                        </p>
                        <button type="submit" className="button" disabled={inviting}>
                            {inviting ? 'Sending Invitation...' : '📨 Send Invitation'}
                        </button>
                    </form>
                </div>
            )}

            {/* Caregivers List */}
            {loading ? (
                <p style={{ color: '#6B7280' }}>Loading caregivers...</p>
            ) : caregivers.length === 0 ? (
                <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: '#9CA3AF' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                    <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: '#6B7280' }}>No caregivers linked yet</p>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Invite a family member or caregiver to help monitor your health.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h3 style={{ margin: '0 0 0.75rem', color: '#374151' }}>Active Caregivers ({caregivers.length})</h3>
                    {caregivers.map((cg) => (
                        <div key={cg.id} className="card" style={{ padding: '1.25rem', marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontWeight: 700, fontSize: '1.1rem'
                                }}>
                                    {cg.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 0.15rem', fontWeight: 600, color: '#111827' }}>{cg.name}</p>
                                    <p style={{ margin: '0 0 0.15rem', fontSize: '0.85rem', color: '#6B7280' }}>{cg.email}</p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#9CA3AF' }}>
                                        🔒 Read-only access · Added {formatDate(cg.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleRevoke(cg.id, cg.name)}
                                disabled={revokingId === cg.id}
                                style={{ background: '#FEE2E2', color: '#B91C1C', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                            >
                                {revokingId === cg.id ? 'Revoking...' : 'Revoke Access'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#6B7280', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.03em' };
const inputStyle = { width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', background: '#FAFAFA' };
