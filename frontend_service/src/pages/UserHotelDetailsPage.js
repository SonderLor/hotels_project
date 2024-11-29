import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { HotelsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const UserHotelDetailsPage = () => {
    const { user } = useAuth();
    const { hotel_id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);

    useEffect(() => {
        if (user?.role !== 'staff') {
            navigate('/login');
        }

        const fetchHotelDetails = async () => {
            try {
                const response = await HotelsAPI.get(`/hotels-app/hotels/${hotel_id}/`);
                setHotel(response.data);
            } catch (error) {
                console.error('Failed to fetch hotel details:', error);
            }
        };

        fetchHotelDetails();
    }, [user, hotel_id, navigate]);

    const handleUpdateHotel = () => {
        navigate(`/hotels/${hotel_id}/update`);
    };

    const handleDeleteHotel = async (hotel_id) => {
        try {
            await HotelsAPI.delete(`/hotels-app/hotels/${hotel_id}/`);
            navigate('/hotels/user');
        } catch (error) {
            console.error('Failed to delete hotel:', error);
        }
    };

    const handleCreateRoom = () => {
        navigate(`/hotels/${hotel_id}/rooms/create`);
    };

    const handleViewRoom = (room_id) => {
        navigate(`/hotels/user/${hotel_id}/rooms/${room_id}`);
    };

    const handleUpdateRoom = (room_id) => {
        navigate(`/hotels/${hotel_id}/rooms/${room_id}/update`);
    };

    const handleDeleteRoom = async (room_id) => {
        try {
            await HotelsAPI.delete(`/rooms-app/rooms/${room_id}/`);
            setHotel((prevHotel) => ({
                ...prevHotel,
                rooms: prevHotel.rooms.filter((room) => room.id !== room_id),
            }));
        } catch (error) {
            console.error('Failed to delete room:', error);
        }
    };

    if (!hotel) return <div>Loading...</div>;

    return (
        <div className="container mt-5">
            <h1>{hotel.name}</h1>
            <p>{hotel.description}</p>
            <p><strong>Address:</strong> {hotel.address}</p>
            <p><strong>City:</strong> {hotel.city}</p>
            <p><strong>Country:</strong> {hotel.country}</p>
            <p><strong>Type:</strong> {hotel.type}</p>
            <p><strong>Rating:</strong> {hotel.rating || 'Not rated yet'}</p>
            
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

            <div className="d-flex gap-2">
                <button 
                    onClick={handleUpdateHotel} 
                    className="btn btn-warning"
                >
                    Update Hotel
                </button>
                <button
                    onClick={() => handleDeleteHotel(hotel.id)}
                    className="btn btn-danger"
                >
                    Delete Hotel
                </button>
            </div>
            <h2 className="mt-4">Rooms</h2>
            <button onClick={handleCreateRoom} className="btn btn-primary mb-4">
                Add New Room
            </button>
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
                                <p>Price: ${room.price_per_night}</p>
                                
                                <div className="d-flex flex-column gap-2">
                                    <button
                                        onClick={() => handleViewRoom(room.id)}
                                        className="btn btn-secondary"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => handleUpdateRoom(room.id)}
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
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className='mb-4'>
                <Link to={`/hotels/user`} className="btn btn-secondary">
                    Back to Hotels List
                </Link>
            </div>
        </div>
    );
};

export default UserHotelDetailsPage;
