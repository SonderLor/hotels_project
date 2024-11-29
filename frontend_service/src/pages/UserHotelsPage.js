import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HotelsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const UserHotelsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [hotels, setHotels] = useState([]);

    useEffect(() => {
        if (user?.role !== 'staff') {
            navigate('/login');
        }

        const fetchHotels = async () => {
            try {
                const response = await HotelsAPI.get('/hotels-app/user/');
                setHotels(response.data);
            } catch (error) {
                console.error('Failed to fetch user hotels:', error);
            }
        };

        fetchHotels();
    }, [user, navigate]);

    const handleCreateHotel = () => {
        navigate('/hotels/create');
    };

    const handleViewHotel = (hotel_id) => {
        navigate(`/hotels/user/${hotel_id}`);
    };

    const handleUpdateHotel = (hotel_id) => {
        navigate(`/hotels/${hotel_id}/update`);
    };

    const handleDeleteHotel = async (hotel_id) => {
        try {
            await HotelsAPI.delete(`/hotels-app/hotels/${hotel_id}/`);
            setHotels(hotels.filter((hotel) => hotel.id !== hotel_id));
        } catch (error) {
            console.error('Failed to delete hotel:', error);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Your Hotels</h1>
            <button onClick={handleCreateHotel} className="btn btn-primary mb-4">
                Add New Hotel
            </button>
            <div className="row">
                {hotels.map((hotel) => (
                    <div className="col-md-4 mb-4" key={hotel.id}>
                        <div className="card">
                            {hotel.preview_image && (
                                <img
                                    src={hotel.preview_image}
                                    alt={`${hotel.name} Preview`}
                                    className="card-img-top"
                                />
                            )}
                            <div className="card-body">
                                <h5 className="card-title">{hotel.name}</h5>
                                <p className="card-text">{hotel.city}, {hotel.country}</p>
                                <div className="d-flex flex-column gap-2">
                                    <button
                                        onClick={() => handleViewHotel(hotel.id)}
                                        className="btn btn-secondary"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => handleUpdateHotel(hotel.id)}
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
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserHotelsPage;
