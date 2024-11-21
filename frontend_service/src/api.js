import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8001/auth/',
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await axios.post('http://localhost:8001/auth/token/refresh/', { refresh: refreshToken });
    localStorage.setItem('accessToken', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
    return response.data.access;
};

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const newAccessToken = await refreshAccessToken();
                axios.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                return API(originalRequest);
            } catch (err) {
                console.error('Token refresh failed', err);
            }
        }
        return Promise.reject(error);
    }
);

export const login = (username, password) =>
    API.post('token/', { username, password });

export const register = (userData) =>
    API.post('register/', userData);

export default API;
