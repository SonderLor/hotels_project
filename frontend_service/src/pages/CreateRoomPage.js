import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HotelsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const CreateRoomPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { hotel_id } = useParams();

    const [roomTypes, setRoomTypes] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        price_per_night: '',
        is_available: true,
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [additionalImages, setAdditionalImages] = useState([]);

    useEffect(() => {
        if (user?.role !== 'staff') {
            navigate('/login');
        }

        const fetchRoomTypes = async () => {
            try {
                const response = await HotelsAPI.get('/rooms-app/types/');
                setRoomTypes(response.data);
            } catch (error) {
                console.error('Failed to fetch room types:', error);
            }
        };

        fetchRoomTypes();
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handlePreviewImageChange = (e) => {
        setPreviewImage(e.target.files[0]);
    };

    const handleAdditionalImagesChange = (e) => {
        setAdditionalImages([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = new FormData();
            Object.entries(formData).forEach(([key, value]) => payload.append(key, value));
            payload.append('hotel', hotel_id);
            if (previewImage) {
                payload.append('preview_image', previewImage);
            }
            const response = await HotelsAPI.post('/rooms-app/rooms/', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const room_id = response.data.id;

            if (additionalImages.length > 0) {
                const imagesPayload = new FormData();
                additionalImages.forEach((image) => {
                    imagesPayload.append('images', image);
                });
    
                await HotelsAPI.post(`/rooms-app/rooms/${room_id}/upload-images/`, imagesPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            
            navigate(`/hotels/user/${hotel_id}`);
        } catch (error) {
            console.error('Failed to create room:', error);
        }
    };

    return (
        <div className="container mt-5">
            <h1>Create Room</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Room Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="type" className="form-label">Room Type</label>
                    <select
                        id="type"
                        name="type"
                        className="form-select"
                        value={formData.type}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Room Type</option>
                        {roomTypes.map((type) => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="price_per_night" className="form-label">Price per Night</label>
                    <input
                        type="number"
                        id="price_per_night"
                        name="price_per_night"
                        className="form-control"
                        value={formData.price_per_night}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-check mb-3">
                    <input
                        type="checkbox"
                        id="is_available"
                        name="is_available"
                        className="form-check-input"
                        checked={formData.is_available}
                        onChange={handleChange}
                    />
                    <label htmlFor="is_available" className="form-check-label">Available</label>
                </div>
                <div className="mb-3">
                    <label htmlFor="previewImage" className="form-label">Preview Image</label>
                    <input
                        type="file"
                        id="previewImage"
                        className="form-control"
                        onChange={handlePreviewImageChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="additionalImages" className="form-label">Additional Images</label>
                    <input
                        type="file"
                        id="additionalImages"
                        className="form-control"
                        multiple
                        onChange={handleAdditionalImagesChange}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Create Room</button>
            </form>
        </div>
    );
};

export default CreateRoomPage;
