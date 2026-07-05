import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VITAL_TYPES = [
    { value: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg', icon: '❤️' },
    { value: 'blood_sugar', label: 'Blood Sugar', unit: 'mg/dL', icon: '🩸' },
    { value: 'weight', label: 'Weight', unit: 'kg', icon: '⚖️' },
    { value: 'heart_rate', label: 'Heart Rate', unit: 'bpm', icon: '💓' },
    { value: 'temperature', label: 'Temperature', unit: '°C', icon: '🌡️' },
];

const formatDate = (dt) => {
    if (!dt) return '';
    return new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

export default function Journal() {
    const [activeTab, setActiveTab] = useState('history');
    const [history, setHistory] = useState({ vitals: [], symptoms: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [days, setDays] = useState(7);

    // Vitals form
    const [vitalForm, setVitalForm] = useState({
        type: 'blood_pressure', value: '', unit: 'mmHg',
        recorded_at: new Date().toISOString().slice(0, 16)
    });

    // Symptom form
    const [symptomForm, setSymptomForm] = useState({
        symptom: '', severity: 5, notes: ''
    });

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/journal?days=${days}`);
            const data = res.data;
            // records MCP returns { vitals: [...], symptoms: [...] }
            // or may return a list — handle both
            if (data && data.vitals !== undefined) {
                setHistory({ vitals: data.vitals || [], symptoms: data.symptoms || [] });
            } else if (Array.isArray(data)) {
                // fallback: split by type if flat array
                setHistory({ vitals: data.filter(d => d.type), symptoms: data.filter(d => d.symptom) });
            } else {
                setHistory({ vitals: [], symptoms: [] });
            }
        } catch (e) {
            setError('Could not load health history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, [days]);

    const handleVitalTypeChange = (type) => {
        const vt = VITAL_TYPES.find(v => v.value === type);
        setVitalForm({ ...vitalForm, type, unit: vt ? vt.unit : '' });
    };

    const handleLogVital = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        try {
            await axios.post('/api/journal/vitals', {
                type: vitalForm.type,
                value: parseFloat(vitalForm.value),
                unit: vitalForm.unit,
                recorded_at: vitalForm.recorded_at + ':00'
            });
            setSuccess('Vital logged successfully!');
            setVitalForm({ ...vitalForm, value: '' });
            setTimeout(() => setSuccess(''), 3000);
            if (activeTab === 'history') fetchHistory();
        } catch (e) {
            setError('Failed to log vital.');
        }
    };

    const handleLogSymptom = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        try {
            await axios.post('/api/journal/symptoms', {
                symptom: symptomForm.symptom,
                severity: parseInt(symptomForm.severity),
                notes: symptomForm.notes
            });
            setSuccess('Symptom logged successfully!');
            setSymptomForm({ symptom: '', severity: 5, notes: '' });
            setTimeout(() => setSuccess(''), 3000);
            if (activeTab === 'history') fetchHistory();
        } catch (e) {
            setError('Failed to log symptom.');
        }
    };

    const severityColor = (s) => {
        if (s <= 3) return '#10B981';
        if (s <= 6) return '#F59E0B';
        return '#EF4444';
    };

    return (
        <div>
            <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>Health Journal</h1>

            {error && <p style={{ color: '#EF4444', marginBottom: '1rem' }}>{error}</p>}
            {success && <p style={{ color: '#10B981', marginBottom: '1rem' }}>{success}</p>}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #E5E7EB' }}>
                {['history', 'vitals', 'symptoms'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); if (tab === 'history') fetchHistory(); }}
                        style={{
                            padding: '0.6rem 1.25rem',
                            border: 'none',
                            borderBottom: activeTab === tab ? '2px solid #4F46E5' : '2px solid transparent',
                            background: 'none',
                            cursor: 'pointer',
                            fontWeight: activeTab === tab ? 700 : 400,
                            color: activeTab === tab ? '#4F46E5' : '#6B7280',
                            marginBottom: '-2px',
                            fontSize: '0.95rem',
                            textTransform: 'capitalize'
                        }}
                    >
                        {tab === 'history' ? '📋 History' : tab === 'vitals' ? '❤️ Log Vital' : '🤒 Log Symptom'}
                    </button>
                ))}
            </div>

            {/* History Tab */}
            {activeTab === 'history' && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                        <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Show last</span>
                        {[7, 14, 30].map(d => (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                style={{
                                    padding: '0.3rem 0.75rem',
                                    borderRadius: '99px',
                                    border: `1.5px solid ${days === d ? '#4F46E5' : '#E5E7EB'}`,
                                    background: days === d ? '#EEF2FF' : 'white',
                                    color: days === d ? '#4F46E5' : '#6B7280',
                                    cursor: 'pointer',
                                    fontWeight: days === d ? 700 : 400,
                                    fontSize: '0.85rem'
                                }}
                            >
                                {d} days
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <p style={{ color: '#6B7280' }}>Loading health history...</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            {/* Vitals */}
                            <div>
                                <h3 style={{ marginTop: 0, color: '#374151' }}>Vitals</h3>
                                {history.vitals.length === 0 ? (
                                    <div className="card" style={{ padding: '1.5rem', textAlign: 'center', color: '#9CA3AF' }}>
                                        No vitals logged yet.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {history.vitals.map((v, i) => {
                                            const vt = VITAL_TYPES.find(t => t.value === v.type) || {};
                                            return (
                                                <div key={v.id || i} className="card" style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ fontWeight: 600 }}>{vt.icon} {vt.label || v.type}</span>
                                                        <span style={{ color: '#4F46E5', fontWeight: 700 }}>{v.value} {v.unit}</span>
                                                    </div>
                                                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#9CA3AF' }}>
                                                        {formatDate(v.recordedAt || v.recorded_at)}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Symptoms */}
                            <div>
                                <h3 style={{ marginTop: 0, color: '#374151' }}>Symptoms</h3>
                                {history.symptoms.length === 0 ? (
                                    <div className="card" style={{ padding: '1.5rem', textAlign: 'center', color: '#9CA3AF' }}>
                                        No symptoms logged yet.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {history.symptoms.map((s, i) => (
                                            <div key={s.id || i} className="card" style={{ padding: '1rem', borderLeft: `4px solid ${severityColor(s.severity)}` }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: 600 }}>🤒 {s.symptom}</span>
                                                    <span style={{
                                                        background: severityColor(s.severity) + '22',
                                                        color: severityColor(s.severity),
                                                        fontSize: '0.75rem', fontWeight: 700,
                                                        padding: '0.2rem 0.5rem', borderRadius: '99px'
                                                    }}>
                                                        Severity {s.severity}/10
                                                    </span>
                                                </div>
                                                {s.notes && <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#6B7280' }}>{s.notes}</p>}
                                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#9CA3AF' }}>
                                                    {formatDate(s.recordedAt || s.recorded_at)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Log Vital Tab */}
            {activeTab === 'vitals' && (
                <div className="card" style={{ padding: '1.75rem', maxWidth: '480px' }}>
                    <h3 style={{ marginTop: 0, color: '#4F46E5' }}>Log a Vital Sign</h3>
                    <form onSubmit={handleLogVital} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Vital Type</label>
                            <select
                                value={vitalForm.type}
                                onChange={e => handleVitalTypeChange(e.target.value)}
                                style={inputStyle}
                            >
                                {VITAL_TYPES.map(v => (
                                    <option key={v.value} value={v.value}>{v.icon} {v.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Value ({vitalForm.unit})</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder={`Enter ${vitalForm.unit}`}
                                value={vitalForm.value}
                                onChange={e => setVitalForm({ ...vitalForm, value: e.target.value })}
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Recorded At</label>
                            <input
                                type="datetime-local"
                                value={vitalForm.recorded_at}
                                onChange={e => setVitalForm({ ...vitalForm, recorded_at: e.target.value })}
                                style={inputStyle}
                            />
                        </div>
                        <button type="submit" className="button">Log Vital</button>
                    </form>
                </div>
            )}

            {/* Log Symptom Tab */}
            {activeTab === 'symptoms' && (
                <div className="card" style={{ padding: '1.75rem', maxWidth: '480px' }}>
                    <h3 style={{ marginTop: 0, color: '#4F46E5' }}>Log a Symptom</h3>
                    <form onSubmit={handleLogSymptom} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Symptom</label>
                            <input
                                placeholder="e.g. Headache, Fatigue, Nausea"
                                value={symptomForm.symptom}
                                onChange={e => setSymptomForm({ ...symptomForm, symptom: e.target.value })}
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Severity: {symptomForm.severity}/10</label>
                            <input
                                type="range" min="1" max="10"
                                value={symptomForm.severity}
                                onChange={e => setSymptomForm({ ...symptomForm, severity: e.target.value })}
                                style={{ width: '100%', accentColor: severityColor(symptomForm.severity) }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9CA3AF' }}>
                                <span>Mild</span><span>Moderate</span><span>Severe</span>
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Notes (optional)</label>
                            <textarea
                                placeholder="Any additional details..."
                                value={symptomForm.notes}
                                onChange={e => setSymptomForm({ ...symptomForm, notes: e.target.value })}
                                rows={3}
                                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                            />
                        </div>
                        <button type="submit" className="button">Log Symptom</button>
                    </form>
                </div>
            )}
        </div>
    );
}

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#6B7280', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.03em' };
const inputStyle = { width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', background: '#FAFAFA' };
