import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HotelsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const UpdateHotelPage = () => {
    const { user } = useAuth();
    const { hotel_id } = useParams();
    const navigate = useNavigate();
    const [hotelTypes, setHotelTypes] = useState([]);
    const [formData, setFormData] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [newImages, setNewImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    useEffect(() => {
        if (user?.role !== 'staff') {
            navigate('/login');
        }

        const fetchHotelDetails = async () => {
            try {
                const [hotelRes, typesRes] = await Promise.all([
                    HotelsAPI.get(`/hotels-app/hotels/${hotel_id}/`),
                    HotelsAPI.get('/hotels-app/types/'),
                ]);
                setFormData(hotelRes.data);
                setHotelTypes(typesRes.data);
                setExistingImages(hotelRes.data.images || []);
            } catch (error) {
                console.error('Failed to fetch hotel details or types:', error);
            }
        };

        fetchHotelDetails();
    }, [user, hotel_id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePreviewChange = (e) => {
        setPreviewImage(e.target.files[0]);
    };

    const handleNewImagesChange = (e) => {
        setNewImages(Array.from(e.target.files));
    };

    const handleDeleteImage = async (imageId) => {
        try {
            await HotelsAPI.delete(`/hotels-app/hotels/${hotel_id}/delete-images/${imageId}/`);
            setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
        } catch (error) {
            console.error('Failed to delete image:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('address', formData.address);
        formDataToSend.append('city', formData.city);
        formDataToSend.append('country', formData.country);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('type', formData.type);
        
        if (previewImage) {
            formDataToSend.append('preview_image', previewImage);
        }

        await HotelsAPI.put(`/hotels-app/hotels/${hotel_id}/`, formDataToSend, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (newImages.length > 0) {
            const imagesPayload = new FormData();
            newImages.forEach((image) => {
                imagesPayload.append('images', image);
            });

            await HotelsAPI.post(`/hotels-app/hotels/${hotel_id}/upload-images/`, imagesPayload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }
        navigate(`/hotels/user/${hotel_id}`);
    };

    if (!formData) return <div>Loading...</div>;

    return (
        <div className="container mt-5">
            <h1>Update Hotel</h1>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
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
                    <label htmlFor="address" className="form-label">Address</label>
                    <textarea
                        id="address"
                        name="address"
                        className="form-control"
                        value={formData.address}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>
                <div className="mb-3">
                    <label htmlFor="city" className="form-label">City</label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        className="form-control"
                        value={formData.city}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="country" className="form-label">Country</label>
                    <input
                        type="text"
                        id="country"
                        name="country"
                        className="form-control"
                        value={formData.country}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        className="form-control"
                        value={formData.description}
                        onChange={handleChange}
                    ></textarea>
                </div>
                <div className="mb-3">
                    <label htmlFor="type" className="form-label">Type</label>
                    <select
                        id="type"
                        name="type"
                        className="form-select"
                        value={formData.type || ''}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Type</option>
                        {hotelTypes.map((type) => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </select>
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
                <button type="submit" className="btn btn-primary">Update Hotel</button>
            </form>
        </div>
    );
};

export default UpdateHotelPage;
