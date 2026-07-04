import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        title: '',
        date_time: '',
        doctor_name: '',
        location: '',
        notes: ''
    });

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/appointments');
            setAppointments(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            setError('Could not load appointments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAppointments(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/appointments', form);
            setShowForm(false);
            setForm({ title: '', date_time: '', doctor_name: '', location: '', notes: '' });
            fetchAppointments();
        } catch (e) {
            setError('Failed to create appointment.');
        }
    };

    const formatDate = (dt) => {
        if (!dt) return '';
        return new Date(dt).toLocaleString('en-IN', {
            dateStyle: 'medium', timeStyle: 'short'
        });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 className="page-title" style={{ margin: 0 }}>Appointments</h1>
                <button className="button" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ New Appointment'}
                </button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {showForm && (
                <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                    <h3 style={{ marginTop: 0 }}>Book Appointment</h3>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <input
                            placeholder="Title e.g. Regular Checkup"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            required
                            style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
                        />
                        <input
                            type="datetime-local"
                            value={form.date_time}
                            onChange={e => setForm({ ...form, date_time: e.target.value + ':00' })}
                            required
                            style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
                        />
                        <input
                            placeholder="Doctor Name"
                            value={form.doctor_name}
                            onChange={e => setForm({ ...form, doctor_name: e.target.value })}
                            required
                            style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
                        />
                        <input
                            placeholder="Location (optional)"
                            value={form.location}
                            onChange={e => setForm({ ...form, location: e.target.value })}
                            style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
                        />
                        <textarea
                            placeholder="Notes (optional)"
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            rows={2}
                            style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
                        />
                        <button type="submit" className="button">Book Appointment</button>
                    </form>
                </div>
            )}

            {loading ? (
                <p>Loading appointments...</p>
            ) : appointments.length === 0 ? (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                    No upcoming appointments. Book one via chat or the form above.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {appointments.map((appt, idx) => (
                        <div key={appt.id || idx} className="card" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 0.25rem' }}>{appt.title}</h3>
                                    <p style={{ margin: '0 0 0.25rem', color: '#555' }}>
                                        👨‍⚕️ {appt.doctorName || appt.doctor_name}
                                    </p>
                                    {appt.location && (
                                        <p style={{ margin: '0 0 0.25rem', color: '#555' }}>📍 {appt.location}</p>
                                    )}
                                    {appt.notes && (
                                        <p style={{ margin: '0', color: '#777', fontSize: '0.9rem' }}>📝 {appt.notes}</p>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right', minWidth: '140px' }}>
                                    <p style={{ margin: '0', fontWeight: 'bold', color: '#3b82f6' }}>
                                        {formatDate(appt.dateTime || appt.date_time)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
