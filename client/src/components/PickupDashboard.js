import React, { useState, useEffect, useCallback } from 'react';
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
    const [searchLat, setSearchLat] = useState('');
    const [searchLng, setSearchLng] = useState('');
    const [maxDistance, setMaxDistance] = useState(10);
    const [searchingNearby, setSearchingNearby] = useState(false);

    const fetchAvailableDonations = useCallback(async (useNearby = false) => {
        try {
            let response;
            const canSearchNearby = useNearby && searchLat !== '' && searchLng !== '';

            if (canSearchNearby) {
                setSearchingNearby(true);
                response = await axios.get(`/api/donations/nearby/${searchLat}/${searchLng}`, {
                    params: { maxDistance }
                });
            } else {
                response = await axios.get('/api/donations?status=available');
                setSearchingNearby(false);
            }

            setDonations(response.data.donations || []);
        } catch (err) {
            setError('Failed to fetch available donations. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [maxDistance, searchLat, searchLng]);

    const fetchMyPickups = useCallback(async () => {
        try {
            const response = await axios.get('/api/pickups/my');
            setMyPickups(response.data.pickups || []);
        } catch (err) {
            console.error('Failed to fetch pickups:', err);
        }
    }, []);

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
    }, [navigate, fetchAvailableDonations, fetchMyPickups]);

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

    const handleAcceptPickup = async (pickupId) => {
        try {
            await axios.put(`/api/pickups/${pickupId}`, { status: 'accepted' });
            setSuccess('Pickup accepted successfully.');
            fetchMyPickups();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to accept pickup.');
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

    const handleNearbySearch = () => {
        if (searchLat === '' || searchLng === '') {
            setError('Provide latitude and longitude to search nearby donations.');
            return;
        }
        setError('');
        fetchAvailableDonations(true);
    };

    const useMyLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setSearchLat(position.coords.latitude.toFixed(6));
                setSearchLng(position.coords.longitude.toFixed(6));
            },
            () => setError('Unable to retrieve your location. Please enter coordinates manually.'),
            { timeout: 8000 }
        );
    };

    const clearNearby = () => {
        setSearchLat('');
        setSearchLng('');
        setSearchingNearby(false);
        setError('');
        fetchAvailableDonations(false);
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

                        <div className="card border-0 bg-light mb-4">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                                    <h6 className="mb-0">Filter by Nearby Location</h6>
                                    <div>
                                        <button className="btn btn-outline-secondary btn-sm me-2" onClick={useMyLocation}>
                                            Use My Location
                                        </button>
                                        <button className="btn btn-link btn-sm" onClick={clearNearby} disabled={!searchingNearby && !searchLat && !searchLng}>
                                            Clear
                                        </button>
                                    </div>
                                </div>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label">Latitude</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={searchLat}
                                            onChange={(e) => setSearchLat(e.target.value)}
                                            min="-90"
                                            max="90"
                                            step="any"
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Longitude</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={searchLng}
                                            onChange={(e) => setSearchLng(e.target.value)}
                                            min="-180"
                                            max="180"
                                            step="any"
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Max Distance (km)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={maxDistance}
                                            onChange={(e) => setMaxDistance(Number(e.target.value) || 10)}
                                            min="1"
                                            max="500"
                                        />
                                    </div>
                                </div>
                                <button className="btn btn-primary mt-3" onClick={handleNearbySearch}>
                                    Search Nearby Donations
                                </button>
                                {searchingNearby && (
                                    <p className="text-muted small mt-2 mb-0">
                                        Showing donations close to your selected coordinates.
                                    </p>
                                )}
                            </div>
                        </div>

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
                                                    {pickup.status === 'pending' && (
                                                        <button
                                                            className="btn btn-outline-primary btn-sm me-2"
                                                            onClick={() => handleAcceptPickup(pickup._id)}
                                                        >
                                                            Accept
                                                        </button>
                                                    )}
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
