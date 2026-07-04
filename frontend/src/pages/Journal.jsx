import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MOOD_OPTIONS = [
    { value: 'great', label: '😄 Great', color: '#10B981' },
    { value: 'good',  label: '🙂 Good',  color: '#34D399' },
    { value: 'okay',  label: '😐 Okay',  color: '#F59E0B' },
    { value: 'poor',  label: '😕 Poor',  color: '#F97316' },
    { value: 'bad',   label: '😞 Bad',   color: '#EF4444' },
];

const getMoodInfo = (mood) => MOOD_OPTIONS.find(m => m.value === mood) || MOOD_OPTIONS[2];

const formatDate = (dt) => {
    if (!dt) return '';
    return new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

export default function Journal() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ title: '', content: '', mood: 'okay' });
    const [deletingId, setDeletingId] = useState(null);

    const fetchEntries = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/journal');
            setEntries(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            setError('Could not load journal entries.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEntries(); }, []);

    const resetForm = () => {
        setForm({ title: '', content: '', mood: 'okay' });
        setEditingId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingId) {
                await axios.put(`/api/journal/${editingId}`, form);
            } else {
                await axios.post('/api/journal', form);
            }
            resetForm();
            fetchEntries();
        } catch (e) {
            setError('Failed to save entry.');
        }
    };

    const handleEdit = (entry) => {
        setForm({ title: entry.title, content: entry.content, mood: entry.mood || 'okay' });
        setEditingId(entry.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this journal entry?')) return;
        setDeletingId(id);
        try {
            await axios.delete(`/api/journal/${id}`);
            setEntries(prev => prev.filter(e => e.id !== id));
        } catch (e) {
            setError('Failed to delete entry.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 className="page-title" style={{ margin: 0 }}>Health Journal</h1>
                <button className="button" onClick={() => { setShowForm(!showForm); if (editingId) resetForm(); setError(''); }}>
                    {showForm ? 'Cancel' : '+ New Entry'}
                </button>
            </div>

            {error && <p style={{ color: '#EF4444', marginBottom: '1rem' }}>{error}</p>}

            {/* Entry Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: '1.75rem', padding: '1.75rem' }}>
                    <h3 style={{ marginTop: 0, color: '#4F46E5' }}>{editingId ? 'Edit Entry' : 'New Journal Entry'}</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Title</label>
                            <input
                                placeholder="How are you feeling today?"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Notes</label>
                            <textarea
                                placeholder="Write about your symptoms, how you feel, any concerns..."
                                value={form.content}
                                onChange={e => setForm({ ...form, content: e.target.value })}
                                rows={5}
                                required
                                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Mood</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {MOOD_OPTIONS.map(m => (
                                    <button
                                        key={m.value}
                                        type="button"
                                        onClick={() => setForm({ ...form, mood: m.value })}
                                        style={{
                                            padding: '0.4rem 0.9rem',
                                            borderRadius: '99px',
                                            border: `2px solid ${form.mood === m.value ? m.color : '#E5E7EB'}`,
                                            background: form.mood === m.value ? m.color + '22' : 'white',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: form.mood === m.value ? 700 : 400,
                                            color: form.mood === m.value ? m.color : '#6B7280',
                                            transition: 'all 0.15s'
                                        }}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button type="submit" className="button">
                            {editingId ? 'Save Changes' : 'Save Entry'}
                        </button>
                    </form>
                </div>
            )}

            {/* Entry List */}
            {loading ? (
                <p style={{ color: '#6B7280' }}>Loading journal entries...</p>
            ) : entries.length === 0 ? (
                <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: '#9CA3AF' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📔</div>
                    <p style={{ margin: 0 }}>No journal entries yet. Start writing about your health journey.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {entries.map((entry) => {
                        const mood = getMoodInfo(entry.mood);
                        return (
                            <div key={entry.id} className="card" style={{ padding: '1.5rem', borderLeft: `4px solid ${mood.color}`, marginBottom: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{entry.title}</h3>
                                            <span style={{
                                                background: mood.color + '22',
                                                color: mood.color,
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '99px'
                                            }}>
                                                {mood.label}
                                            </span>
                                        </div>
                                        <p style={{ margin: '0 0 0.75rem', color: '#4B5563', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                            {entry.content}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#9CA3AF' }}>
                                            📅 {formatDate(entry.createdAt)}
                                            {entry.updatedAt !== entry.createdAt && ` · Edited ${formatDate(entry.updatedAt)}`}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                                        <button
                                            onClick={() => handleEdit(entry)}
                                            style={{ background: '#EEF2FF', color: '#4F46E5', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            disabled={deletingId === entry.id}
                                            style={{ background: '#FEE2E2', color: '#B91C1C', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                                        >
                                            {deletingId === entry.id ? '...' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
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
