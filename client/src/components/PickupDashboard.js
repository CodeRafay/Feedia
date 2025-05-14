import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PickupDashboard = () => {
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [requestingPickup, setRequestingPickup] = useState(null);

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');

        if (!token || userRole !== 'pickup') {
            navigate('/login');
            return;
        }

        setIsAuthenticated(true);
        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        fetchAvailableDonations();
    }, [navigate]);

    const fetchAvailableDonations = async () => {
        try {
            const response = await axios.get('/api/donations?status=available');
            setDonations(response.data.donations);
        } catch (err) {
            setError('Failed to fetch available donations. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePickupRequest = async (donationId) => {
        setRequestingPickup(donationId);
        setError('');
        setSuccess('');

        try {
            await axios.post('/api/pickups', { donationId });
            setSuccess('Pickup request sent successfully!');
            // Refresh the donations list
            fetchAvailableDonations();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request pickup. Please try again.');
        } finally {
            setRequestingPickup(null);
        }
    };

    const formatDateTime = (dateTimeString) => {
        return new Date(dateTimeString).toLocaleString();
    };

    if (!isAuthenticated) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="card shadow">
                        <div className="card-body">
                            <h2 className="text-center mb-4">Available Donations</h2>

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success" role="alert">
                                    {success}
                                </div>
                            )}

                            {donations.length === 0 ? (
                                <div className="alert alert-info" role="alert">
                                    No available donations at the moment.
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-striped table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Food Type</th>
                                                <th>Category</th>
                                                <th>Quantity</th>
                                                <th>Expiration Time</th>
                                                <th>Location</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {donations.map((donation) => (
                                                <tr key={donation._id}>
                                                    <td>{donation.foodType}</td>
                                                    <td>
                                                        <span className="text-capitalize">
                                                            {donation.category.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td>{donation.quantity}</td>
                                                    <td>{formatDateTime(donation.expirationTime)}</td>
                                                    <td>
                                                        <small className="text-muted">
                                                            {donation.latitude.toFixed(4)}, {donation.longitude.toFixed(4)}
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => handlePickupRequest(donation._id)}
                                                            disabled={requestingPickup === donation._id}
                                                        >
                                                            {requestingPickup === donation._id ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                    Requesting...
                                                                </>
                                                            ) : (
                                                                'Request Pickup'
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PickupDashboard; 