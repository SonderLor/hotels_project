import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HotelsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const CreateHotelPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [hotelTypes, setHotelTypes] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        country: '',
        description: '',
        type: '',
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [additionalImages, setAdditionalImages] = useState([]);

    useEffect(() => {
        if (user?.role !== 'staff') {
            navigate('/login');
        }

        const fetchHotelTypes = async () => {
            try {
                const response = await HotelsAPI.get('/hotels-app/types/');
                setHotelTypes(response.data);
            } catch (error) {
                console.error('Failed to fetch hotel types:', error);
            }
        };

        fetchHotelTypes();
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
            payload.append('owner_id', user.user_id);
            if (previewImage) {
                payload.append('preview_image', previewImage);
            }
            const response = await HotelsAPI.post('/hotels-app/hotels/', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
    
            const hotel_id = response.data.id;

            if (additionalImages.length > 0) {
                const imagesPayload = new FormData();
                additionalImages.forEach((image) => {
                    imagesPayload.append('images', image);
                });
    
                await HotelsAPI.post(`/hotels-app/${hotel_id}/upload-images/`, imagesPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
    
            navigate('/hotels/user');
        } catch (error) {
            console.error('Failed to create hotel:', error);
        }
    };

    return (
        <div className="container mt-5">
            <h1>Create Hotel</h1>
            <form onSubmit={handleSubmit}>
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
                        value={formData.type}
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
                <button type="submit" className="btn btn-primary">Create Hotel</button>
            </form>
        </div>
    );
};

export default CreateHotelPage;
