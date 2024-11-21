import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LogoutPage = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        console.log('[LogoutPage] Logging out...');
        logout();
        console.log('[LogoutPage] Tokens removed');
        navigate('/');
    };

    return (
        <div className="container text-center mt-5">
            <h2>Are you sure you want to log out?</h2>
            <div className="mt-3">
                <button className="btn btn-danger me-2" onClick={handleLogout}>
                    Yes, log out
                </button>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default LogoutPage;
