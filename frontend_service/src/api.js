import axios from 'axios';

const log = (message, data) => {
    console.log(`[API]: ${message}`, data || '');
};

const createAPI = (baseURL) => {
    const API = axios.create({ baseURL });

    API.interceptors.request.use((config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            log(`Attaching access token to headers for ${baseURL}`, token);
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }, (error) => {
        log(`Request error for ${baseURL}`, error);
        return Promise.reject(error);
    });

    API.interceptors.response.use(
        (response) => {
            log(`Response received from ${baseURL}`, response.data);
            return response;
        },
        async (error) => {
            log(`Response error from ${baseURL}`, error.response?.data || error);

            const originalRequest = error.config;
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const newAccessToken = await refreshAccessToken();
                    log(`Retrying original request with new access token for ${baseURL}`);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return API(originalRequest);
                } catch (err) {
                    log(`Failed to retry request after token refresh for ${baseURL}`, err);
                    throw err;
                }
            }
            return Promise.reject(error);
        }
    );

    return API;
};

export const AuthAPI = createAPI('http://localhost/api/auth/');
export const ProfilesAPI = createAPI('http://localhost/api/profiles/');
export const HotelsAPI = createAPI('http://localhost/api/hotels-rooms/');
export const BookingsAPI = createAPI('http://localhost/api/bookings/');

export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        log('No refresh token available');
        throw new Error('No refresh token available');
    }

    try {
        const response = await AuthAPI.post('token/refresh/', { refresh: refreshToken });
        log('Successfully refreshed token', response.data);
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        return response.data.access;
    } catch (error) {
        log('Failed to refresh token', error.response?.data || error);
        throw error;
    }
};

export const login = async (username, password) => {
    log('Attempting login', { username });
    const response = await AuthAPI.post('token/', { username, password });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    log('Login successful, tokens stored');
    return response;
};

export const register = (userData) => {
    log('Attempting registration', userData);
    return AuthAPI.post('api/users/', userData);
};
