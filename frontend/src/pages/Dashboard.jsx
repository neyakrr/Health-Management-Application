import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/dashboard/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (loading) return <div>Loading dashboard...</div>;
  if (!data) return <div>Failed to load data.</div>;

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <div className="card">
        <h2>Welcome back, {user.name || 'User'}</h2>
        <p>Your health is on track. You have {data.medications?.length || 0} medications to take today.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3>Next Appointment</h3>
          {data.nextAppointment ? (
            <p>{data.nextAppointment.title} - {data.nextAppointment.date}</p>
          ) : (
            <p>No upcoming appointments.</p>
          )}
        </div>
        <div className="card">
          <h3>Recent Vitals</h3>
          {data.vitals ? (
            <p>Blood Pressure: {data.vitals.bloodPressure} ({data.vitals.status})</p>
          ) : (
            <p>No vitals recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}
