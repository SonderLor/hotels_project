import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Spinner, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const UpdateProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        bio: '',
        birth_date: '',
        location: '',
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            console.log('[UpdateProfilePage] Fetching current profile...');
            try {
                const response = await axios.get('http://localhost:8002/profiles/current/', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    },
                });
                const fetchedProfile = response.data;
                console.log('[UpdateProfilePage] Profile fetched:', fetchedProfile);
                setProfile(fetchedProfile);
                setFormData({
                    bio: fetchedProfile.bio || '',
                    birth_date: fetchedProfile.birth_date || '',
                    location: fetchedProfile.location || '',
                });
            } catch (err) {
                console.error('[UpdateProfilePage] Error fetching profile:', err);
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`[UpdateProfilePage] Updating field ${name}:`, value);
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('[UpdateProfilePage] Submitting updated profile data:', formData);

        try {
            await axios.put(`http://localhost:8002/profiles/api/${profile.id}/`, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('[UpdateProfilePage] Profile updated successfully');
            navigate('/profile', { state: { successMessage: 'Profile updated successfully!' } });
        } catch (err) {
            console.error('[UpdateProfilePage] Error updating profile:', err);
            navigate('/profile', { state: { errorMessage: 'Failed to update profile.' } });
        }
    };

    if (loading) return <Spinner animation="border" variant="primary" />;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Update Profile</h1>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Bio</Form.Label>
                    <Form.Control
                        type="text"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Birth Date</Form.Label>
                    <Form.Control
                        type="date"
                        name="birth_date"
                        value={formData.birth_date}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Save Changes
                </Button>
            </Form>
        </div>
    );
};

export default UpdateProfilePage;
