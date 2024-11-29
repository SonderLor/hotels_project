import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HotelsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const UpdateRoomPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { hotel_id, room_id } = useParams();
    const [roomTypes, setRoomTypes] = useState([]);
    const [formData, setFormData] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [newImages, setNewImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    useEffect(() => {
        if (user?.role !== 'staff') {
            navigate('/login');
        }

        const fetchRoomData = async () => {
            try {
                const [roomRes, typesRes] = await Promise.all([
                    HotelsAPI.get(`/rooms-app/rooms/${room_id}/`),
                    HotelsAPI.get('/rooms-app/types/'),
                ]);
                setFormData(roomRes.data);
                setRoomTypes(typesRes.data);
                setExistingImages(roomRes.data.images || []);
            } catch (error) {
                console.error('Failed to fetch room or types:', error);
            }
        };

        fetchRoomData();
    }, [user, hotel_id, room_id, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handlePreviewChange = (e) => {
        setPreviewImage(e.target.files[0]);
    };

    const handleNewImagesChange = (e) => {
        setNewImages(Array.from(e.target.files));
    };

    const handleDeleteImage = async (imageId) => {
        try {
            await HotelsAPI.delete(`/rooms-app/rooms/${room_id}/delete-images/${imageId}/`);
            setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
        } catch (error) {
            console.error('Failed to delete image:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('price_per_night', formData.price_per_night);
        formDataToSend.append('is_available', formData.is_available);
        formDataToSend.append('type', formData.type);

        if (previewImage) {
            formDataToSend.append('preview_image', previewImage);
        }

        await HotelsAPI.put(`/rooms-app/rooms/${room_id}/`, formDataToSend, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (newImages.length > 0) {
            const imagesPayload = new FormData();
            newImages.forEach((image) => {
                imagesPayload.append('images', image);
            });

            await HotelsAPI.post(`/rooms-app/rooms/${room_id}/upload-images/`, imagesPayload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }
        navigate(`/hotels/user/${hotel_id}/rooms/${room_id}`);
    };

    if (!formData) return <div>Loading...</div>;

    return (
        <div className="container mt-5">
            <h1>Update Room</h1>
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
                        value={formData.type || ''}
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
                    <label htmlFor="preview_image" className="form-label">Preview Image</label>
                    <input
                        type="file"
                        id="preview_image"
                        name="preview_image"
                        className="form-control"
                        accept="image/*"
                        onChange={handlePreviewChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="new_images" className="form-label">Add More Images</label>
                    <input
                        type="file"
                        id="new_images"
                        name="new_images"
                        className="form-control"
                        accept="image/*"
                        multiple
                        onChange={handleNewImagesChange}
                    />
                </div>
                <div className="mb-3">
                    <h5>Existing Images</h5>
                    <div className="row">
                        {existingImages.map((image) => (
                            <div className="col-md-3 mb-3" key={image.id}>
                                <img
                                    src={image.image}
                                    alt="Hotel"
                                    className="img-thumbnail"
                                    style={{ width: '100%', height: 'auto' }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-danger mt-2"
                                    onClick={() => handleDeleteImage(image.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <button type="submit" className="btn btn-primary">Update Room</button>
            </form>
        </div>
    );
};

export default UpdateRoomPage;
