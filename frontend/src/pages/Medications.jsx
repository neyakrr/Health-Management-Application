import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FREQ_OPTIONS = ['Once daily', 'Twice daily', 'Three times daily', 'Every 8 hours', 'As needed', 'Weekly'];
const FOOD_OPTIONS = ['Take with food', 'Take without food', 'Take with water', 'Take on empty stomach', 'No restrictions'];
const MOOD_COLORS = { good: '#10B981', okay: '#F59E0B', poor: '#EF4444' };

export default function Medications() {
    const [medications, setMedications] = useState([]);
    const [refillAlerts, setRefillAlerts] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [loggingDose, setLoggingDose] = useState(null);
    const [form, setForm] = useState({
        name: '',
        dosage: '',
        frequency: 'Once daily',
        food_instructions: 'No restrictions',
        quantity: 30,
        refill_threshold: 7
    });

    const fetchMedications = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/medications');
            setMedications(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            setError('Could not load medications.');
        } finally {
            setLoading(false);
        }
    };

    const fetchRefillAlerts = async () => {
        try {
            const res = await axios.get('/api/medications/refill-alerts');
            if (res.data && res.data !== 'No refills needed.') {
                setRefillAlerts(res.data);
            }
        } catch (e) { /* silent */ }
    };

    useEffect(() => {
        fetchMedications();
        fetchRefillAlerts();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        try {
            await axios.post('/api/medications', {
                ...form,
                quantity: parseInt(form.quantity),
                refill_threshold: parseInt(form.refill_threshold)
            });
            setSuccess('Medication added successfully!');
            setShowForm(false);
            setForm({ name: '', dosage: '', frequency: 'Once daily', food_instructions: 'No restrictions', quantity: 30, refill_threshold: 7 });
            fetchMedications();
            fetchRefillAlerts();
        } catch (e) {
            setError('Failed to add medication.');
        }
    };

    const handleLogDose = async (med) => {
        setLoggingDose(med.id);
        try {
            await axios.post(`/api/medications/${med.id}/log-dose`, {
                taken_at: new Date().toISOString().replace('Z', '')
            });
            setSuccess(`Dose logged for ${med.name}!`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (e) {
            setError('Failed to log dose.');
        } finally {
            setLoggingDose(null);
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 className="page-title" style={{ margin: 0 }}>Medications</h1>
                <button className="button" onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}>
                    {showForm ? 'Cancel' : '+ Add Medication'}
                </button>
            </div>

            {/* Refill Alerts Banner */}
            {refillAlerts && (
                <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                    <span style={{ color: '#92400E', fontWeight: 500 }}>{refillAlerts}</span>
                </div>
            )}

            {error && <p style={{ color: '#EF4444', marginBottom: '1rem' }}>{error}</p>}
            {success && <p style={{ color: '#10B981', marginBottom: '1rem' }}>{success}</p>}

            {/* Add Medication Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1.25rem', color: '#4F46E5' }}>Add New Medication</h3>
                    <form onSubmit={handleAdd}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Medication Name *</label>
                                <input
                                    placeholder="e.g. Metformin"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Dosage *</label>
                                <input
                                    placeholder="e.g. 500mg"
                                    value={form.dosage}
                                    onChange={e => setForm({ ...form, dosage: e.target.value })}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Frequency</label>
                                <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} style={inputStyle}>
                                    {FREQ_OPTIONS.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Food Instructions</label>
                                <select value={form.food_instructions} onChange={e => setForm({ ...form, food_instructions: e.target.value })} style={inputStyle}>
                                    {FOOD_OPTIONS.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Quantity (pills)</label>
                                <input
                                    type="number" min="1"
                                    value={form.quantity}
                                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Refill Alert Threshold (pills left)</label>
                                <input
                                    type="number" min="1"
                                    value={form.refill_threshold}
                                    onChange={e => setForm({ ...form, refill_threshold: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                        <button type="submit" className="button" style={{ width: '100%' }}>Add Medication</button>
                    </form>
                </div>
            )}

            {/* Medication List */}
            {loading ? (
                <p style={{ color: '#6B7280' }}>Loading medications...</p>
            ) : medications.length === 0 ? (
                <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: '#9CA3AF' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💊</div>
                    <p style={{ margin: 0 }}>No medications added yet. Add one using the form above.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {medications.map((med, idx) => {
                        const isLow = med.quantity !== null && med.refillThreshold !== null && med.quantity <= med.refillThreshold;
                        return (
                            <div key={med.id || idx} className="card" style={{ padding: '1.5rem', position: 'relative', borderTop: `4px solid ${isLow ? '#EF4444' : '#4F46E5'}` }}>
                                {isLow && (
                                    <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: '#FEE2E2', color: '#B91C1C', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '99px' }}>
                                        LOW STOCK
                                    </span>
                                )}
                                <h3 style={{ margin: '0 0 0.25rem', color: '#111827' }}>{med.name}</h3>
                                <p style={{ margin: '0 0 0.75rem', color: '#4F46E5', fontWeight: 600, fontSize: '0.95rem' }}>{med.dosage}</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1rem' }}>
                                    <span style={tagStyle}>🕐 {med.frequency}</span>
                                    <span style={tagStyle}>🍽️ {med.foodInstructions || med.food_instructions || 'No instructions'}</span>
                                    <span style={{ ...tagStyle, color: isLow ? '#B91C1C' : '#374151' }}>
                                        💊 {med.quantity} pills remaining
                                    </span>
                                </div>
                                <button
                                    className="button"
                                    onClick={() => handleLogDose(med)}
                                    disabled={loggingDose === med.id}
                                    style={{ width: '100%', fontSize: '0.875rem', padding: '0.6rem' }}
                                >
                                    {loggingDose === med.id ? 'Logging...' : '✓ Log Dose Taken'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#6B7280', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.03em' };
const inputStyle = { width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', background: '#FAFAFA' };
const tagStyle = { fontSize: '0.85rem', color: '#374151' };
