import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('http://localhost:8002/profiles/current/', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    },
                });
                setProfile(response.data);
            } catch (err) {
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <Spinner animation="border" variant="primary" />;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Profile</h1>
            {profile ? (
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">Username: {profile.username}</h5>
                        <p className="card-text">
                            <strong>Bio:</strong> {profile.bio || 'No bio provided'}
                        </p>
                        <p className="card-text">
                            <strong>Birth Date:</strong> {profile.birth_date || 'Not specified'}
                        </p>
                        <p className="card-text">
                            <strong>Location:</strong> {profile.location || 'Not specified'}
                        </p>
                        {profile.profile_picture && (
                            <img
                                src={profile.profile_picture}
                                alt="Profile"
                                className="img-fluid rounded-circle"
                                style={{ maxWidth: '150px' }}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <p>No profile found</p>
            )}
        </div>
    );
};

export default ProfilePage;
