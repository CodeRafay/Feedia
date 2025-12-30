import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PickupDashboard = () => {
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [myPickups, setMyPickups] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [requestingPickup, setRequestingPickup] = useState(null);
    const [activeTab, setActiveTab] = useState('available');

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
        fetchMyPickups();
    }, [navigate]);

    const fetchAvailableDonations = async () => {
        try {
            const response = await axios.get('/api/donations?status=available');
            setDonations(response.data.donations || []);
        } catch (err) {
            setError('Failed to fetch available donations. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMyPickups = async () => {
        try {
            const response = await axios.get('/api/pickups/my');
            setMyPickups(response.data.pickups || []);
        } catch (err) {
            console.error('Failed to fetch pickups:', err);
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
            fetchMyPickups();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request pickup. Please try again.');
        } finally {
            setRequestingPickup(null);
        }
    };

    const handleCompletePickup = async (pickupId) => {
        try {
            await axios.put(`/api/pickups/${pickupId}`, { status: 'completed' });
            setSuccess('Pickup marked as completed!');
            fetchMyPickups();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to complete pickup.');
        }
    };

    const formatDateTime = (dateTimeString) => {
        return new Date(dateTimeString).toLocaleString();
    };

    const getCategoryLabel = (category) => {
        const labels = {
            'hot_meal': 'Hot Meal',
            'packaged': 'Packaged',
            'raw_ingredients': 'Raw Ingredients'
        };
        return labels[category] || category;
    };

    const getStatusBadge = (status) => {
        const badges = {
            'pending': 'warning',
            'accepted': 'info',
            'completed': 'success'
        };
        return badges[status] || 'secondary';
    };

    if (!isAuthenticated) {
        return null;
    }

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
            <h2 className="mb-4">Pickup Dashboard</h2>

            {error && (
                <div className="alert alert-danger alert-dismissible" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
            )}

            {success && (
                <div className="alert alert-success alert-dismissible" role="alert">
                    {success}
                    <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                </div>
            )}

            {/* Tab Navigation */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'available' ? 'active' : ''}`}
                        onClick={() => setActiveTab('available')}
                    >
                        Available Donations ({donations.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'my-pickups' ? 'active' : ''}`}
                        onClick={() => setActiveTab('my-pickups')}
                    >
                        My Pickups ({myPickups.length})
                    </button>
                </li>
            </ul>

            {/* Available Donations Tab */}
            {activeTab === 'available' && (
                <div className="card shadow">
                    <div className="card-body">
                        <h5 className="card-title mb-4">Available Donations</h5>

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
                                                <td>{getCategoryLabel(donation.category)}</td>
                                                <td>{donation.quantity}</td>
                                                <td>{formatDateTime(donation.expirationTime)}</td>
                                                <td>
                                                    <small className="text-muted">
                                                        {donation.location?.latitude?.toFixed(4) || 'N/A'}, 
                                                        {donation.location?.longitude?.toFixed(4) || 'N/A'}
                                                    </small>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-success btn-sm"
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
            )}

            {/* My Pickups Tab */}
            {activeTab === 'my-pickups' && (
                <div className="card shadow">
                    <div className="card-body">
                        <h5 className="card-title mb-4">My Pickups</h5>

                        {myPickups.length === 0 ? (
                            <div className="alert alert-info" role="alert">
                                You haven't requested any pickups yet.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Food Type</th>
                                            <th>Status</th>
                                            <th>Requested At</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myPickups.map((pickup) => (
                                            <tr key={pickup._id}>
                                                <td>{pickup.donationId?.foodType || 'N/A'}</td>
                                                <td>
                                                    <span className={`badge bg-${getStatusBadge(pickup.status)}`}>
                                                        {pickup.status}
                                                    </span>
                                                </td>
                                                <td>{formatDateTime(pickup.createdAt)}</td>
                                                <td>
                                                    {pickup.status === 'accepted' && (
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => handleCompletePickup(pickup._id)}
                                                        >
                                                            Mark Complete
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PickupDashboard; 