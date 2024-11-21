import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutPage = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="container text-center mt-5">
            <h2>Вы действительно хотите выйти?</h2>
            <div className="mt-3">
                <button className="btn btn-danger me-2" onClick={handleLogout}>
                    Да, выйти
                </button>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    Отмена
                </button>
            </div>
        </div>
    );
};

export default LogoutPage;
