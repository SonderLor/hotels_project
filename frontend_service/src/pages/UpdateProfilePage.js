import React, { useState, useEffect } from 'react';
import { Spinner, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ProfilesAPI } from '../api';
import { useAuth } from '../context/AuthContext';

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
    const { accessToken } = useAuth();

    useEffect(() => {
        const fetchProfile = async () => {
            console.log('[UpdateProfilePage] Fetching current profile...');
            try {
                const response = await ProfilesAPI.get('current/', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
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
    }, [accessToken]);

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

        const data = new FormData();
        for (const key in formData) {
            data.append(key, formData[key]);
        }

        try {
            await ProfilesAPI.put(`api/${profile.id}/`, data, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/form-data',
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
                <Form.Group className="mb-3">
                    <Form.Label>Profile Picture</Form.Label>
                    <Form.Control
                        type="file"
                        name="profile_picture"
                        onChange={(e) => setFormData({ ...formData, profile_picture: e.target.files[0] })}
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
