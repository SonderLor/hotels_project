import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8001/auth/',
});

const log = (message, data) => {
    console.log(`[API]: ${message}`, data || '');
};

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        log('Attaching access token to headers', token);
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    log('Request error', error);
    return Promise.reject(error);
});

export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        log('No refresh token available');
        throw new Error('No refresh token available');
    }

    try {
        const response = await axios.post('http://localhost:8001/auth/token/refresh/', { refresh: refreshToken });
        log('Successfully refreshed token', response.data);
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        return response.data.access;
    } catch (error) {
        log('Failed to refresh token', error.response?.data || error);
        throw error;
    }
};

API.interceptors.response.use(
    (response) => {
        log('Response received', response.data);
        return response;
    },
    async (error) => {
        log('Response error', error.response?.data || error);

        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const newAccessToken = await refreshAccessToken();
                log('Retrying original request with new access token');
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return API(originalRequest);
            } catch (err) {
                log('Failed to retry request after token refresh', err);
                throw err;
            }
        }
        return Promise.reject(error);
    }
);

export const login = async (username, password) => {
    log('Attempting login', { username });
    const response = await API.post('token/', { username, password });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    log('Login successful, tokens stored');
    return response;
};

export const register = (userData) => {
    log('Attempting registration', userData);
    return API.post('api/users/', userData);
};

export default API;
