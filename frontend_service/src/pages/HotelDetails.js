import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Spinner, Alert } from 'react-bootstrap';
import { HotelsAPI, ProfilesAPI } from '../api';

const HotelDetails = () => {
    const { hotel_id } = useParams();
    const [hotel, setHotel] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHotelDetails = async () => {
            try {
                const response = await HotelsAPI.get(`/hotels-app/hotels/${hotel_id}/`);
                setHotel(response.data);
                const profileResponse = await ProfilesAPI.get(`profiles/${response.data.owner_id}/`);
                setProfile(profileResponse.data);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load hotel or owner profile');
            } finally {
                setLoading(false);
            }
        };

        fetchHotelDetails();
    }, [hotel_id]);

    if (loading) return <Spinner animation="border" variant="primary" />;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <div className="container mt-5">
            <h1 className="mb-4">{hotel.name}</h1>
            <p>{hotel.description}</p>
            <p>
                {hotel.city}, {hotel.country}
            </p>
            {hotel.type && <p>Type: {hotel.type}</p>}
            {hotel.rating && <p>Rating: {hotel.rating} / 5</p>}

            <h2 className="mt-4">Gallery</h2>
            {hotel?.images && hotel.images.length > 0 ? (
                <div className="d-flex flex-wrap">
                    {hotel.images.map((image) => (
                        <div key={image.id} className="m-2">
                            <img
                                src={image.image}
                                alt={`Hotel ${hotel.name}`}
                                className="img-thumbnail"
                                style={{ maxWidth: '150px' }}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <p>No images available for this hotel.</p>
            )}

            <h2 className="mt-4">Rooms</h2>
            <div className="row">
                {hotel.rooms.map((room) => (
                    <div className="col-md-4 mb-4" key={room.id}>
                        <div className="card">
                            {room.preview_image && (
                                <img
                                    src={room.preview_image}
                                    alt={`${room.name} Preview`}
                                    className="card-img-top"
                                />
                            )}
                            <div className="card-body">
                                <h5 className="card-title">{room.name}</h5>
                                <p className="card-text">Price: ${room.price_per_night}</p>
                                <Link to={`/hotels/${hotel.id}/rooms/${room.id}`} className="btn btn-primary">
                                    View Room
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <h2 className="mt-5">Owner Profile</h2>
            {profile ? (
                <div className="card mt-3">
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
                <p>No owner profile found</p>
            )}

            <div className="mt-4">
                <Link to={`/hotels`} className="btn btn-secondary">
                    Back to Hotels List
                </Link>
            </div>
        </div>
    );
};

export default HotelDetails;
