import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Spinner, Button, Alert, Table } from 'react-bootstrap';
import { ProfilesAPI, BookingsAPI, HotelsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [userBookings, setUserBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;

    useEffect(() => {
        const fetchProfileAndBookings = async () => {
            try {
                const profileResponse = await ProfilesAPI.get('current/');
                setProfile(profileResponse.data);
        
                const bookingsResponse = await BookingsAPI.get('user/');
                const bookingsData = bookingsResponse.data;
        
                const updatedBookings = await Promise.all(
                    bookingsData.map(async (booking) => {
                        try {
                            const roomResponse = await HotelsAPI.get(`/rooms-app/rooms/${booking.room_id}/`);
                            const roomData = roomResponse.data;
        
                            const hotelResponse = await HotelsAPI.get(`/hotels-app/hotels/${roomData.hotel.id}/`);
                            const hotelData = hotelResponse.data;
    
                            return {
                                ...booking,
                                room: roomData,
                                hotel: hotelData,
                            };
                        } catch (error) {
                            console.error(`Failed to fetch room or hotel for booking ID: ${booking.id}`, error);
                            return {
                                ...booking,
                                room: null,
                                hotel: null,
                            };
                        }
                    })
                );
                
                setBookings(updatedBookings);

                if (user?.role === 'staff') {
                    const userHotelsResponse = await HotelsAPI.get('/hotels-app/user/');
                    const userHotelsData = userHotelsResponse.data;
                    const roomIds = userHotelsData.flatMap(hotel => 
                        hotel.rooms.map(room => room.id)
                    );
    
                    const userBookingsResponse = await BookingsAPI.post('/get-by-room-id/', {
                        room_ids: roomIds
                    });
        
                    const userBookingsData = userBookingsResponse.data;
        
                    const updatedUserBookings = await Promise.all(
                        userBookingsData.map(async (booking) => {
                            const userResponse = await ProfilesAPI.get(`/${booking.user_id}/`);
                            const userData = userResponse.data;

                            const roomResponse = await HotelsAPI.get(`/rooms-app/rooms/${booking.room_id}/`);
                            const roomData = roomResponse.data;
        
                            const hotelResponse = await HotelsAPI.get(`/hotels-app/hotels/${roomData.hotel.id}/`);
                            const hotelData = hotelResponse.data;
    
                            return {
                                ...booking,
                                user: userData,
                                room: roomData,
                                hotel: hotelData
                            };
                        })
                    );
    
                    setUserBookings(updatedUserBookings);
                }
            } catch (err) {
                setError('Failed to load profile or bookings');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };        

        fetchProfileAndBookings();
    }, []);

    const handleUpdateClick = () => navigate('/profile/update');

    const handleCancelBooking = async (bookingId) => {
        try {
            await BookingsAPI.patch(`/${bookingId}/`, { status: 'cancelled' });
            setBookings((prev) =>
                prev.map((booking) =>
                    booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
                )
            );
        } catch (err) {
            console.error('Failed to cancel booking', err);
        }
    };

    const handleConfirmBooking = async (bookingId) => {
        try {
            await BookingsAPI.patch(`/${bookingId}/`, { status: 'confirmed' });
            setUserBookings((prevBookings) =>
                prevBookings.map((booking) =>
                    booking.id === bookingId ? { ...booking, status: 'confirmed' } : booking
                )
            );
        } catch (err) {
            console.error('Failed to confirm booking', err);
        }
    };
    
    const handleRejectBooking = async (bookingId) => {
        try {
            await BookingsAPI.patch(`/${bookingId}/`, { status: 'rejected' });
            setUserBookings((prevBookings) =>
                prevBookings.map((booking) =>
                    booking.id === bookingId ? { ...booking, status: 'rejected' } : booking
                )
            );
        } catch (err) {
            console.error('Failed to reject booking', err);
        }
    };

    if (loading) return <Spinner animation="border" variant="primary" />;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Profile</h1>
            {state?.successMessage && <Alert variant="success">{state.successMessage}</Alert>}
            {state?.errorMessage && <Alert variant="danger">{state.errorMessage}</Alert>}
            {profile && (
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">Username: {profile.username}</h5>
                        <p className="card-text"><strong>Bio:</strong> {profile.bio || 'No bio provided'}</p>
                        <p className="card-text"><strong>Birth Date:</strong> {profile.birth_date || 'Not specified'}</p>
                        <p className="card-text"><strong>Location:</strong> {profile.location || 'Not specified'}</p>
                        <p className="card-text"><strong>Total Bookings:</strong> {profile.total_bookings || '0'}</p>
                        {profile.profile_picture && (
                            <img
                                src={profile.profile_picture}
                                alt="Profile"
                                className="img-fluid rounded-circle"
                                style={{ maxWidth: '150px' }}
                            />
                        )}
                        <div className="mt-3">
                            <Button variant="primary" onClick={handleUpdateClick}>
                                Update Profile
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <h2 className="mt-5">My Bookings</h2>
            {bookings.length > 0 ? (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Hotel</th>
                            <th>Room</th>
                            <th>Booking Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking.id}>
                                <td>
                                    <div className="d-flex flex-column align-items-center">
                                        <img
                                            src={booking.hotel.preview_image}
                                            alt="Hotel Preview"
                                            style={{ width: '100px', height: 'auto' }}
                                        />
                                        <strong>{booking.hotel.name}</strong>
                                        <p>{booking.hotel.country}, {booking.hotel.city}</p>
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex flex-column align-items-center">
                                        <img
                                            src={booking.room.preview_image}
                                            alt="Room Preview"
                                            style={{ width: '100px', height: 'auto' }}
                                        />
                                        <strong>{booking.room.name}</strong>
                                        <p>{booking.room.type}</p>
                                        <p>${booking.room.price_per_night} per night</p>
                                    </div>
                                </td>
                                <td>
                                    <p><strong>Start Date:</strong> {booking.start_date}</p>
                                    <p><strong>End Date:</strong> {booking.end_date}</p>
                                    <p><strong>Total Price:</strong> ${booking.room.price_per_night * Math.ceil((new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24))}</p>
                                    <p><strong>Status:</strong> {booking.status}</p>
                                    {booking.status !== 'cancelled' && booking.status !== 'rejected' && (
                                        <Button variant="danger" size="sm" onClick={() => handleCancelBooking(booking.id)}>
                                            Cancel Booking
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p>No bookings found</p>
            )}
            {user?.role === 'staff' && (
                <>
                    <h2 className="mt-5">User Bookings for Your Hotels</h2>
                    {userBookings.length > 0 ? (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Hotel</th>
                                    <th>Room</th>
                                    <th>Booking Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userBookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td>
                                            <div className="d-flex flex-column align-items-center">
                                                <img
                                                    src={booking.hotel.preview_image}
                                                    alt="Hotel Preview"
                                                    style={{ width: '100px', height: 'auto' }}
                                                />
                                                <strong>{booking.hotel.name}</strong>
                                                <p>{booking.hotel.country}, {booking.hotel.city}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column align-items-center">
                                                <img
                                                    src={booking.room.preview_image}
                                                    alt="Room Preview"
                                                    style={{ width: '100px', height: 'auto' }}
                                                />
                                                <strong>{booking.room.name}</strong>
                                                <p>{booking.room.type}</p>
                                                <p>${booking.room.price_per_night} per night</p>
                                            </div>
                                        </td>
                                        <td>
                                            <p><strong>Start Date:</strong> {booking.start_date}</p>
                                            <p><strong>End Date:</strong> {booking.end_date}</p>
                                            <p><strong>Total Price:</strong> ${booking.room.price_per_night * Math.ceil((new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24))}</p>
                                            <p><strong>User:</strong> {booking.user.username}</p>
                                            <p><strong>Status:</strong> {booking.status}</p>
                                            {booking.status === 'active' && (
                                                <>
                                                    <Button variant="success" size="sm" onClick={() => handleConfirmBooking(booking.id)}>
                                                        Confirm
                                                    </Button>
                                                    <Button variant="danger" size="sm" onClick={() => handleRejectBooking(booking.id)}>
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <p>No bookings found for your hotels</p>
                    )}
                </>
            )}
        </div>
    );
};

export default ProfilePage;
