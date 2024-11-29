import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthAPI } from '../api';

const RegistrationPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        passwordRepeat: '',
        role: 'active',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.passwordRepeat) {
            setError('Passwords do not match.');
            return;
        } 

        try {
            await AuthAPI.post('users/', {
                email: formData.email,
                username: formData.username,
                password: formData.password,
                role: formData.role,
            });
            navigate('/login');
        } catch (err) {
            setError('Registration failed.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
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
                <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select
                        name="role"
                        className="form-select"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value="active">User</option>
                        <option value="staff">Tenant</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-success">
                    Register
                </button>
            </form>
        </div>
    );
};

export default RegistrationPage;
