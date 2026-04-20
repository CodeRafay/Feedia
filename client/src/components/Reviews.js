import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const emptyForm = {
    revieweeId: '',
    donationId: '',
    pickupId: '',
    rating: 5,
    comment: '',
    type: 'donor_to_pickup'
};

const Reviews = () => {
    const navigate = useNavigate();
    const [givenReviews, setGivenReviews] = useState([]);
    const [receivedReviews, setReceivedReviews] = useState([]);
    const [formData, setFormData] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchReviews();
    }, [navigate]);

    const fetchReviews = async () => {
        try {
            setIsLoading(true);
            const [givenRes, receivedRes] = await Promise.all([
                axios.get('/api/reviews/my/given'),
                axios.get('/api/reviews/my/received')
            ]);
            setGivenReviews(givenRes.data.reviews || []);
            setReceivedReviews(receivedRes.data.reviews || []);
        } catch (err) {
            setError('Failed to load reviews. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const payload = {
            revieweeId: formData.revieweeId.trim(),
            donationId: formData.donationId.trim() || undefined,
            pickupId: formData.pickupId.trim() || undefined,
            rating: Number(formData.rating),
            comment: formData.comment.trim(),
            type: formData.type
        };

        try {
            if (editingId) {
                await axios.put(`/api/reviews/${editingId}`, {
                    rating: payload.rating,
                    comment: payload.comment
                });
                setMessage('Review updated successfully.');
            } else {
                await axios.post('/api/reviews', payload);
                setMessage('Review created successfully.');
            }
            setFormData(emptyForm);
            setEditingId(null);
            fetchReviews();
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to save review.');
        }
    };

    const startEdit = (review) => {
        setEditingId(review._id);
        setFormData({
            revieweeId: review.revieweeId?._id || '',
            donationId: review.donationId?._id || '',
            pickupId: review.pickupId?._id || '',
            rating: review.rating,
            comment: review.comment || '',
            type: review.type
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteReview = async (reviewId) => {
        setError('');
        setMessage('');
        try {
            await axios.delete(`/api/reviews/${reviewId}`);
            setMessage('Review deleted.');
            fetchReviews();
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to delete review.');
        }
    };

    if (isLoading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Reviews</h2>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            {message && (
                <div className="alert alert-success" role="alert">
                    {message}
                </div>
            )}

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">{editingId ? 'Edit Review' : 'Create Review'}</h5>
                        {editingId && (
                            <button className="btn btn-link btn-sm" onClick={() => { setEditingId(null); setFormData(emptyForm); }}>
                                Cancel edit
                            </button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">Reviewee User ID</label>
                            <input
                                type="text"
                                name="revieweeId"
                                className="form-control"
                                value={formData.revieweeId}
                                onChange={handleChange}
                                required={!editingId}
                                placeholder="Target user id"
                            />
                            <small className="text-muted">Use the user id for the person you are reviewing.</small>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Donation ID (optional)</label>
                            <input
                                type="text"
                                name="donationId"
                                className="form-control"
                                value={formData.donationId}
                                onChange={handleChange}
                                placeholder="Link to donation"
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Pickup ID (optional)</label>
                            <input
                                type="text"
                                name="pickupId"
                                className="form-control"
                                value={formData.pickupId}
                                onChange={handleChange}
                                placeholder="Link to pickup"
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Rating</label>
                            <select
                                name="rating"
                                className="form-select"
                                value={formData.rating}
                                onChange={handleChange}
                            >
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <option key={value} value={value}>{value}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Type</label>
                            <select
                                name="type"
                                className="form-select"
                                value={formData.type}
                                onChange={handleChange}
                            >
                                <option value="donor_to_pickup">Donor → Pickup</option>
                                <option value="pickup_to_donor">Pickup → Donor</option>
                                <option value="beneficiary_feedback">Beneficiary Feedback</option>
                            </select>
                        </div>
                        <div className="col-md-12">
                            <label className="form-label">Comment</label>
                            <textarea
                                name="comment"
                                className="form-control"
                                rows="3"
                                value={formData.comment}
                                onChange={handleChange}
                                maxLength={500}
                                placeholder="Share feedback (optional)"
                            />
                        </div>
                        <div className="col-12">
                            <button type="submit" className="btn btn-success">
                                {editingId ? 'Update Review' : 'Submit Review'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-md-6">
                    <div className="card h-100 shadow-sm">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Reviews I Received</h5>
                        </div>
                        <div className="card-body">
                            {receivedReviews.length === 0 ? (
                                <p className="text-muted mb-0">No one has reviewed you yet.</p>
                            ) : (
                                <ul className="list-group list-group-flush">
                                    {receivedReviews.map((review) => (
                                        <li key={review._id} className="list-group-item">
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <strong>Rating:</strong> {review.rating} / 5
                                                    <div className="text-muted small">
                                                        From: {review.reviewerId?.name || 'Unknown'} ({review.type.replace(/_/g, ' ')})
                                                    </div>
                                                    {review.comment && <p className="mb-1">{review.comment}</p>}
                                                </div>
                                                <div className="text-muted small">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card h-100 shadow-sm">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Reviews I Wrote</h5>
                        </div>
                        <div className="card-body">
                            {givenReviews.length === 0 ? (
                                <p className="text-muted mb-0">You have not written any reviews yet.</p>
                            ) : (
                                <ul className="list-group list-group-flush">
                                    {givenReviews.map((review) => (
                                        <li key={review._id} className="list-group-item">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <strong>Rating:</strong> {review.rating} / 5
                                                    <div className="text-muted small">
                                                        For: {review.revieweeId?.name || 'Unknown'} ({review.type.replace(/_/g, ' ')})
                                                    </div>
                                                    {review.comment && <p className="mb-2">{review.comment}</p>}
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <button className="btn btn-outline-primary" onClick={() => startEdit(review)}>
                                                            Edit
                                                        </button>
                                                        <button className="btn btn-outline-danger" onClick={() => deleteReview(review._id)}>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-muted small">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reviews;
