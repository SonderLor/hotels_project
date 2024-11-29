import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { AuthAPI } from '../api';
import {jwtDecode} from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));
    const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token'));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh_token'));
    const [user, setUser] = useState(accessToken ? jwtDecode(accessToken) : null);

    const decodeToken = (token) => {
        try {
            return jwtDecode(token);
        } catch (error) {
            console.error('Failed to decode token:', error);
            return null;
        }
    };

    const login = useCallback((access, refresh) => {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        setAccessToken(access);
        setRefreshToken(refresh);
        setIsLoggedIn(true);
        setUser(decodeToken(access));
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setAccessToken(null);
        setRefreshToken(null);
        setIsLoggedIn(false);
        setUser(null);
    }, []);

    const isTokenExpired = (token) => {
        if (!token) return true;
        try {
            const { exp } = jwtDecode(token);
            return exp * 1000 <= Date.now();
        } catch (error) {
            console.error('Invalid token:', error);
            return true;
        }
    };

    const refreshTokens = useCallback(async () => {
        if (!refreshToken) {
            console.warn('No refresh token available. Logging out...');
            logout();
            return;
        }

        try {
            const response = await AuthAPI.post('token/refresh/', {
                refresh: refreshToken,
            });

            const { access, refresh } = response.data;
            login(access, refresh);
            console.log('Tokens refreshed successfully.');
        } catch (error) {
            console.error('Failed to refresh tokens:', error);
            logout();
        }
    }, [refreshToken, login, logout]);

    useEffect(() => {
        const checkAndRefreshToken = async () => {
            if (isTokenExpired(accessToken)) {
                console.log('Access token expired. Attempting to refresh...');
                await refreshTokens();
            } else if (accessToken) {
                setUser(decodeToken(accessToken));
            }
        };

        checkAndRefreshToken();

        const intervalId = setInterval(checkAndRefreshToken, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [accessToken, refreshTokens]);

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
