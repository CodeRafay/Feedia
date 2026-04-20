import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const DonationList = ({ showAll = false }) => {
    const [donations, setDonations] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [searchLat, setSearchLat] = useState('');
    const [searchLng, setSearchLng] = useState('');
    const [maxDistance, setMaxDistance] = useState(10);
    const [searchingNearby, setSearchingNearby] = useState(false);

    const fetchDonations = useCallback(async () => {
        setIsLoading(true);
        try {
            const canSearchNearby = showAll && searchLat !== '' && searchLng !== '';
            let response;

            if (canSearchNearby) {
                setSearchingNearby(true);
                response = await axios.get(`/api/donations/nearby/${searchLat}/${searchLng}`, {
                    params: { maxDistance }
                });
            } else {
                const endpoint = showAll ? '/api/donations' : '/api/donations/my';
                response = await axios.get(endpoint);
                setSearchingNearby(false);
            }

            setDonations(response.data.donations || []);
        } catch (err) {
            // If fetching personal donations fails, try all donations
            if (!showAll) {
                try {
                    const response = await axios.get('/api/donations');
                    setDonations(response.data.donations || []);
                } catch (fallbackErr) {
                    setError('Failed to fetch donations. Please try again later.');
                }
            } else {
                setError('Failed to fetch donations. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [showAll, searchLat, searchLng, maxDistance]);

    useEffect(() => {
        fetchDonations();
    }, [fetchDonations]);

    const useMyLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setSearchLat(position.coords.latitude.toFixed(6));
                setSearchLng(position.coords.longitude.toFixed(6));
                setError('');
            },
            () => {
                setError('Unable to retrieve your location. Please enter coordinates manually.');
            },
            { timeout: 8000 }
        );
    };

    const clearNearbyFilter = () => {
        setSearchLat('');
        setSearchLng('');
        setSearchingNearby(false);
        setError('');
        fetchDonations();
    };

    const getStatusBadge = (status, expirationTime) => {
        const now = new Date();
        const expiration = new Date(expirationTime);

        if (status === 'delivered') {
            return <span className="badge bg-primary">Delivered</span>;
        }

        if (status === 'picked_up') {
            return <span className="badge bg-info">Picked Up</span>;
        }

        if (status === 'expired' || now > expiration) {
            return <span className="badge bg-danger">Expired</span>;
        }

        return <span className="badge bg-success">Available</span>;
    };

    const getCategoryLabel = (category) => {
        const labels = {
            'hot_meal': 'Hot Meal',
            'packaged': 'Packaged',
            'raw_ingredients': 'Raw Ingredients',
            'perishable': 'Perishable',
            'non-perishable': 'Non-Perishable',
            'canned': 'Canned',
            'baked': 'Baked'
        };
        return labels[category] || category;
    };

    const formatDateTime = (dateTimeString) => {
        return new Date(dateTimeString).toLocaleString();
    };

    if (isLoading) {
        return (
            <div className="text-center mt-4">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className={showAll ? 'container mt-4' : 'mt-4'}>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="mb-0">{showAll ? 'Available Donations' : 'Your Donations'}</h3>
            </div>

            {showAll && (
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                            <h5 className="mb-0">Find Nearby Donations</h5>
                            <div>
                                <button className="btn btn-outline-secondary btn-sm me-2" onClick={useMyLocation}>
                                    Use My Location
                                </button>
                                <button className="btn btn-link btn-sm" onClick={clearNearbyFilter} disabled={!searchingNearby && !searchLat && !searchLng}>
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
                        <p className="text-muted small mt-3 mb-0">
                            {searchingNearby
                                ? 'Showing donations near your selected coordinates.'
                                : 'Enter coordinates to filter donations by proximity.'}
                        </p>
                    </div>
                </div>
            )}

            {donations.length === 0 ? (
                <div className="alert alert-info" role="alert">
                    {showAll 
                        ? 'No donations available at the moment. Check back later!'
                        : 'No donations found. Start by creating a new donation!'}
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
                            <th>Status</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        {donations.map((donation) => (
                            <tr key={donation._id}>
                                <td>{donation.foodType}</td>
                                <td>{getCategoryLabel(donation.category)}</td>
                                <td>{donation.quantity}</td>
                                <td>{formatDateTime(donation.expirationTime)}</td>
                                <td>{getStatusBadge(donation.status, donation.expirationTime)}</td>
                                <td>
                                    <small className="text-muted">
                                        {donation.location?.latitude?.toFixed(4) || 'N/A'}, 
                                        {donation.location?.longitude?.toFixed(4) || 'N/A'}
                                    </small>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}
        </div>
    );
};

export default DonationList; 
