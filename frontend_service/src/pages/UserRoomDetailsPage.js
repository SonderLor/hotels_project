import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { HotelsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const UserRoomDetailsPage = () => {
    const { user } = useAuth();
    const { hotel_id, room_id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);

    useEffect(() => {
        if (user?.role !== 'staff') {
            navigate('/login');
        }

        const fetchRoomDetails = async () => {
            try {
                const response = await HotelsAPI.get(`/rooms-app/rooms/${room_id}/`);
                setRoom(response.data);
            } catch (error) {
                console.error('Failed to fetch room details:', error);
            }
        };

        fetchRoomDetails();
    }, [user, room_id, navigate]);

    const handleUpdateRoom = () => {
        navigate(`/hotels/${hotel_id}/rooms/${room_id}/update`);
    };
    
    const handleDeleteRoom = async (room_id) => {
        try {
            await HotelsAPI.delete(`/rooms-app/rooms/${room_id}/`);
            navigate(`/hotels/user/${hotel_id}`);
        } catch (error) {
            console.error('Failed to delete room:', error);
        }
    };

    if (!room) return <div>Loading...</div>;

    return (
        <div className="container mt-5">
            <h1>{room.name}</h1>
            <p>Type: {room.type}</p>
            <p>Price per night: ${room.price_per_night}</p>
            <p>{room.is_available ? 'Available' : 'Not Available'}</p>

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

            <div className="d-flex gap-2">
                <button 
                    onClick={handleUpdateRoom} 
                    className="btn btn-warning"
                >
                    Update Room
                </button>
                <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="btn btn-danger"
                >
                    Delete Room
                </button>
            </div>
            <div className='mt-4'>
                <Link to={`/hotels/user/${hotel_id}`} className="btn btn-secondary">
                    Back to Hotel
                </Link>
            </div>
        </div>
    );
};

export default UserRoomDetailsPage;
