import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api';

const RegistrationPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        passwordRepeat: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('[RegistrationPage] Form submitted with data:', formData);

        if (formData.password !== formData.passwordRepeat) {
            console.warn('[RegistrationPage] Passwords do not match');
            setError('Passwords do not match.');
            return;
        }

        try {
            console.log('[RegistrationPage] Sending registration request...');
            await register({
                email: formData.email,
                username: formData.username,
                password: formData.password,
            });
            console.log('[RegistrationPage] Registration successful');
            navigate('/login');
        } catch (err) {
            console.error('[RegistrationPage] Registration error:', err);
            setError('Registration failed.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`[RegistrationPage] Updating field ${name}:`, value);
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div className="container mt-5">
            <h2>Registration</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                        type="text"
                        name="username"
                        className="form-control"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        name="password"
                        className="form-control"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Repeat Password</label>
                    <input
                        type="password"
                        name="passwordRepeat"
                        className="form-control"
                        value={formData.passwordRepeat}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-success">
                    Register
                </button>
            </form>
        </div>
    );
};

export default RegistrationPage;
