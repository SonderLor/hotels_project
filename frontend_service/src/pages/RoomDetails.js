import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HotelsAPI } from '../api';

const RoomDetails = () => {
    const { hotel_id, room_id } = useParams();
    const [room, setRoom] = useState(null);

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

    if (!room) return <div>Loading...</div>;

    return (
        <div className="container mt-5">
            <h1 className="mb-4">{room.name}</h1>
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

            <Link to={`/hotels/${hotel_id}`} className="btn btn-secondary">
                Back to Hotel
            </Link>
        </div>
    );
};

export default RoomDetails;
