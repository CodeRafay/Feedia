import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DonationList from './DonationList';
import LocationPicker from './LocationPicker';
import DOMPurify from 'dompurify';

const DonorDashboard = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        foodType: '',
        category: '',
        quantity: '',
        expirationTime: '',
        latitude: '',
        longitude: '',
        image: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('userRole');
        if (!token || role !== 'donor') {
            navigate('/login');
        }
    }, [navigate]);

    const sanitizeText = (value) => DOMPurify.sanitize(value || '', { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    const sanitizeUrl = (value) => DOMPurify.sanitize(value || '', {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        ALLOWED_URI_REGEXP: /^(?:https?|blob|data):/i
    });

    const handleChange = (e) => {
        const value = sanitizeText(e.target.value);
        setFormData({
            ...formData,
            [e.target.name]: value
        });
    };

    const handleLocationSelect = (lat, lng) => {
        const latitude = Number(lat);
        const longitude = Number(lng);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return;
        }

        setFormData({
            ...formData,
            latitude,
            longitude
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            const safePreview = sanitizeUrl(previewUrl);
            setImagePreview(safePreview);
        }
    };

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post('/api/uploads', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data.url;
        } catch (error) {
            throw new Error('Failed to upload image');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            let uploadedImageUrl = '';
            if (selectedImage) {
                uploadedImageUrl = await uploadImage(selectedImage);
            }

            const latitude = Number(formData.latitude);
            const longitude = Number(formData.longitude);
            const quantity = Number(formData.quantity);

            const donationData = {
                foodType: sanitizeText(formData.foodType),
                category: sanitizeText(formData.category),
                quantity: Number.isFinite(quantity) ? quantity : 0,
                expirationTime: sanitizeText(formData.expirationTime),
                latitude: Number.isFinite(latitude) ? latitude : undefined,
                longitude: Number.isFinite(longitude) ? longitude : undefined,
                image: sanitizeUrl(uploadedImageUrl || formData.image)
            };

            await axios.post('/api/donations', donationData);
            setSuccess('Donation created successfully!');
            setFormData({
                foodType: '',
                category: '',
                quantity: '',
                expirationTime: '',
                latitude: '',
                longitude: '',
                image: ''
            });
            setSelectedImage(null);
            setImagePreview('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create donation');
        } finally {
            setIsLoading(false);
        }
    };

    const sanitizedError = sanitizeText(error);
    const sanitizedSuccess = sanitizeText(success);

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Donor Dashboard</h2>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {sanitizedError}
                </div>
            )}

            {success && (
                <div className="alert alert-success" role="alert">
                    {sanitizedSuccess}
                </div>
            )}

            <div className="row">
                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title mb-4">Create New Donation</h5>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="foodType" className="form-label">Food Type</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="foodType"
                                        name="foodType"
                                        value={formData.foodType}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="category" className="form-label">Category</label>
                                    <select
                                        className="form-select"
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        <option value="hot_meal">Hot Meal</option>
                                        <option value="packaged">Packaged</option>
                                        <option value="raw_ingredients">Raw Ingredients</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="quantity" className="form-label">Quantity</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="quantity"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="expirationTime" className="form-label">Expiration Time</label>
                                    <input
                                        type="datetime-local"
                                        className="form-control"
                                        id="expirationTime"
                                        name="expirationTime"
                                        value={formData.expirationTime}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="image" className="form-label">Food Image (Optional)</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    {imagePreview && (
                                        <div className="mt-2">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="img-thumbnail"
                                                style={{ maxHeight: '200px' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <LocationPicker
                                    onLocationSelect={handleLocationSelect}
                                    initialLat={formData.latitude}
                                    initialLng={formData.longitude}
                                />

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Donation'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <DonationList />
                </div>
            </div>
        </div>
    );
};

export default DonorDashboard; 
