import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HotelsAPI } from '../api';

const SearchHotelsPage = () => {
    const [searchCriteria, setSearchCriteria] = useState({
        city: '',
        country: '',
        name: '',
        type__name: '',
        ratingMin: '',
        ratingMax: '',
    });
    const [hotels, setHotels] = useState([]);
    const [hotelTypes, setHotelTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHotelTypes = async () => {
            try {
                const types = await HotelsAPI.get('/hotels-app/types/');
                setHotelTypes(types.data);
            } catch (error) {
                console.error('Failed to fetch hotel types:', error);
            }
        };

        fetchHotelTypes();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchCriteria((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await HotelsAPI.get('/hotels-app/search/', {
                params: {
                    city: searchCriteria.city,
                    country: searchCriteria.country,
                    name: searchCriteria.name,
                    type__name: searchCriteria.type,
                    rating__gte: searchCriteria.ratingMin,
                    rating__lte: searchCriteria.ratingMax,
                },
            });
            setHotels(response.data);
        } catch (err) {
            setError('Failed to load hotels. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h1>Search Hotels</h1>
            <div className="mb-4">
                <div className="row g-3">
                    <div className="col-md-3">
                        <input
                            type="text"
                            name="city"
                            placeholder="City"
                            className="form-control"
                            value={searchCriteria.city}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="col-md-3">
                        <input
                            type="text"
                            name="country"
                            placeholder="Country"
                            className="form-control"
                            value={searchCriteria.country}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="col-md-3">
                        <input
                            type="text"
                            name="name"
                            placeholder="Hotel Name"
                            className="form-control"
                            value={searchCriteria.name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="col-md-3">
                        <select
                            name="type"
                            className="form-select"
                            value={searchCriteria.type}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Type</option>
                            {hotelTypes.map((type) => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="row g-3 mt-3">
                    <div className="col-md-3">
                        <input
                            type="number"
                            name="ratingMin"
                            placeholder="Min Rating"
                            className="form-control"
                            value={searchCriteria.ratingMin}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="col-md-3">
                        <input
                            type="number"
                            name="ratingMax"
                            placeholder="Max Rating"
                            className="form-control"
                            value={searchCriteria.ratingMax}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="col-md-3">
                        <button
                            className="btn btn-primary w-100"
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row">
                {hotels.map((hotel) => (
                    <div key={hotel.id} className="col-md-4 mb-4">
                        <div className="card">
                            {hotel.preview_image && (
                                <img
                                    src={hotel.preview_image}
                                    alt={hotel.name}
                                    className="card-img-top"
                                />
                            )}
                            <div className="card-body">
                                <h5 className="card-title">{hotel.name}</h5>
                                <p>{hotel.city}, {hotel.country}</p>
                                <p>Rating: {hotel.rating || 'Not rated yet'}</p>
                                <Link to={`/hotels/${hotel.id}`} className="btn btn-primary w-100">
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

export default SearchHotelsPage;
