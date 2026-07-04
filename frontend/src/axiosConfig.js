import axios from 'axios';

// Set base URL so all axios calls go to the Spring Boot backend
axios.defaults.baseURL = 'http://localhost:8080';

// Attach the JWT from localStorage to every outgoing request automatically.
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// If the backend ever returns 401/403 (expired or invalid token), clear storage
// so the user doesn't get stuck in a broken logged-in state.
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);