import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { HotelsAPI, BookingsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const RoomDetails = () => {
    const { hotel_id, room_id } = useParams();
    const [room, setRoom] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                const response = await HotelsAPI.get(`/rooms-app/rooms/${room_id}/`);
                setRoom(response.data);
            } catch (error) {
                console.error('Failed to fetch room details:', error);
            }
        };

        fetchRoomDetails();
    }, [room_id]);

    const handleBooking = async () => {
        if (!startDate || !endDate) {
            setError('Please select both start and end dates.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const userId = user.user_id;
            await BookingsAPI.post('/', {
                user_id: userId,
                room_id: room.id,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                status: "active",
            });
            navigate('/profile');
        } catch (err) {
            setError('Failed to book the room. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!room) return <div>Loading...</div>;

    return (
        <div className="container mt-5">
            <h1 className="mb-4">{room.name}</h1>
            <p>Type: {room.type}</p>
            <p>Price per night: ${room.price_per_night}</p>
            <p>{room.is_available ? 'Available' : 'Not Available'}</p>
            <p>Total Bookings: {room.total_bookings}</p>

            <h2 className="mt-4">Gallery</h2>
            {room?.images && room.images.length > 0 ? (
                <div className="d-flex flex-wrap">
                    {room.images.map((image) => (
                        <div key={image.id} className="m-2">
                            <img
                                src={image.image}
                                alt={`Room ${room.name}`}
                                className="img-thumbnail"
                                style={{ maxWidth: '150px' }}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <p>No images available for this room.</p>
            )}

            <div className="mt-4">
                <h2>Book this Room</h2>
                <div className="d-flex gap-3">
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        placeholderText="Start Date"
                        className="form-control"
                    />
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        placeholderText="End Date"
                        className="form-control"
                        minDate={startDate}
                    />
                </div>
                {error && <p className="text-danger mt-2">{error}</p>}
                <button
                    className="btn btn-primary mt-3"
                    onClick={handleBooking}
                    disabled={loading}
                >
                    {loading ? 'Booking...' : 'Book Now'}
                </button>
            </div>

            <Link to={`/hotels/${hotel_id}`} className="btn btn-secondary mt-4">
                Back to Hotel
            </Link>
        </div>
    );
};

export default RoomDetails;
