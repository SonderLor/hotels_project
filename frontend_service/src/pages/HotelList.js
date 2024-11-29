import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HotelsAPI } from '../api';

const HotelList = () => {
    const [hotels, setHotels] = useState([]);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await HotelsAPI.get('/hotels-app/hotels/');
                setHotels(response.data);
            } catch (error) {
                console.error('Failed to fetch hotels:', error);
            }
        };

        fetchHotels();
    }, []);

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Hotels</h1>
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
                                <p className="card-text">
                                    {hotel.city}, {hotel.country}
                                </p>
                                {hotel.rating && (
                                    <p className="card-text">Rating: {hotel.rating} / 5</p>
                                )}
                                <Link to={`/hotels/${hotel.id}`} className="btn btn-primary">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HotelList;
