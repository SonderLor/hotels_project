import React, {createContext, useState, useContext, useEffect} from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({children}) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));
    const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token'));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh_token'));

    const login = (access, refresh) => {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        setAccessToken(access);
        setRefreshToken(refresh);
        setIsLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setAccessToken(null);
        setRefreshToken(null);
        setIsLoggedIn(false);
    };

    const isTokenExpired = (token) => {
        if (!token) return true;
        try {
            const {exp} = jwtDecode(token);
            return exp * 1000 <= Date.now();
        } catch (error) {
            console.error('Invalid token:', error);
            return true;
        }
    };

    const refreshTokens = async () => {
        if (!refreshToken) {
            console.warn('No refresh token available. Logging out...');
            logout();
            return;
        }

        try {
            const response = await axios.post('http://localhost:8001/auth/token/refresh/', {
                refresh: refreshToken,
            });

            const {access, refresh} = response.data;
            login(access, refresh);
            console.log('Tokens refreshed successfully.');
        } catch (error) {
            console.error('Failed to refresh tokens:', error);
            logout();
        }
    };

    useEffect(() => {
        const checkAndRefreshToken = async () => {
            if (isTokenExpired(accessToken)) {
                console.log('Access token expired. Attempting to refresh...');
                await refreshTokens();
            }
        };

        checkAndRefreshToken();

        const intervalId = setInterval(checkAndRefreshToken, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [accessToken, refreshToken]);

    return (
        <AuthContext.Provider value={{isLoggedIn, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};
