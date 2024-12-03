import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { HotelsAPI, BookingsAPI } from '../api';

const SearchRoomsPage = () => {
    const [searchCriteria, setSearchCriteria] = useState({
        hotel: '',
        country: '',
        city: '',
        type: '',
        name: '',
        priceMin: '',
        priceMax: '',
        isAvailable: '',
        sort: '',
        startDate: null,
        endDate: null,
    });
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const types = await HotelsAPI.get('/rooms-app/types/');
                setRoomTypes(types.data);
            } catch (error) {
                console.error('Failed to fetch room types:', error);
            }
        };

        fetchRoomTypes();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchCriteria((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name, date) => {
        setSearchCriteria((prev) => ({ ...prev, [name]: date }));
    };

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        try {
            if (searchCriteria.startDate !== null && searchCriteria.endDate !== null) {
                console.log(22222222222)
                const bookingsResponse = await BookingsAPI.get('/unavailable-rooms/', {
                    params: {
                        start_date: searchCriteria.startDate
                            ? searchCriteria.startDate.toISOString().split('T')[0]
                            : null,
                        end_date: searchCriteria.endDate
                            ? searchCriteria.endDate.toISOString().split('T')[0]
                            : null,
                    },
                });
        
                const unavailableRoomIds = bookingsResponse.data.unavailable_room_ids;
        
                const hotelsResponse = await HotelsAPI.post('/rooms-app/search-by-ids/', {
                    room_ids: unavailableRoomIds,
                    hotel: searchCriteria.hotel,
                    country: searchCriteria.country,
                    city: searchCriteria.city,
                    type: searchCriteria.type,
                    name: searchCriteria.name,
                    price_min: searchCriteria.priceMin,
                    price_max: searchCriteria.priceMax,
                    sort: searchCriteria.sort,
                });
                setRooms(hotelsResponse.data.rooms);
            }
            else {
                console.log(11111)
                const hotelsResponse = await HotelsAPI.get('/rooms-app/search/', {
                    params: {
                        hotel: searchCriteria.hotel,
                        country: searchCriteria.country,
                        city: searchCriteria.city,
                        type: searchCriteria.type,
                        name: searchCriteria.name,
                        price_min: searchCriteria.priceMin,
                        price_max: searchCriteria.priceMax,
                        sort: searchCriteria.sort,
                    }
                });
                setRooms(hotelsResponse.data);
            } 
        } catch (err) {
            setError('Failed to load rooms. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div className="container mt-5">
            <h1>Search Rooms</h1>
            <div className="mb-4">
                <div className="row g-3">
                    <div className="col-md-3">
                        <input
                            type="text"
                            name="hotel"
                            placeholder="Hotel Name"
                            className="form-control"
                            value={searchCriteria.hotel}
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
                            name="city"
                            placeholder="City"
                            className="form-control"
                            value={searchCriteria.city}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div className="row g-3 mt-3">
                    <div className="col-md-3">
                        <select
                            name="type"
                            className="form-select"
                            value={searchCriteria.type}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Room Type</option>
                            {roomTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <input
                            type="text"
                            name="name"
                            placeholder="Room Name"
                            className="form-control"
                            value={searchCriteria.name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="col-md-3">
                        <DatePicker
                            selected={searchCriteria.startDate}
                            onChange={(date) => handleDateChange('startDate', date)}
                            placeholderText="Start Date"
                            className="form-control"
                            dateFormat="yyyy-MM-dd"
                        />
                    </div>
                    <div className="col-md-3">
                        <DatePicker
                            selected={searchCriteria.endDate}
                            onChange={(date) => handleDateChange('endDate', date)}
                            placeholderText="End Date"
                            className="form-control"
                            dateFormat="yyyy-MM-dd"
                            minDate={searchCriteria.startDate}
                        />
                    </div>
                </div>
                <div className="row g-3 mt-3">
                    <div className="col-md-3">
                        <input
                            type="number"
                            name="priceMin"
                            placeholder="Min Price"
                            className="form-control"
                            value={searchCriteria.priceMin}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="col-md-3">
                        <input
                            type="number"
                            name="priceMax"
                            placeholder="Max Price"
                            className="form-control"
                            value={searchCriteria.priceMax}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="col-md-3">
                        <select
                            name="sort"
                            className="form-select"
                            value={searchCriteria.sort}
                            onChange={handleInputChange}
                        >
                            <option value="">Sort by Price</option>
                            <option value="price_per_night">Price: Low to High</option>
                            <option value="-price_per_night">Price: High to Low</option>
                        </select>
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
                {rooms.map((room) => (
                    <div key={room.id} className="col-md-4 mb-4">
                        <div className="card">
                            {room.preview_image && (
                                <img
                                    src={room.preview_image}
                                    alt={room.name}
                                    className="card-img-top"
                                />
                            )}
                            <div className="card-body">
                                <h5 className="card-title">{room.name}</h5>
                                <p>Hotel: {room.hotel.name}</p>
                                <p>Type: {room.type}</p>
                                <p>Price per night: ${room.price_per_night}</p>
                                <p>Availability: {room.is_available ? 'Available' : 'Unavailable'}</p>
                                <Link
                                    to={`/hotels/${room.hotel.id}/rooms/${room.id}`}
                                    className="btn btn-primary w-100"
                                >
                                    View Room
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchRoomsPage;
