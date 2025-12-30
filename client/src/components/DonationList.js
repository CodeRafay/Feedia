import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DonationList = ({ showAll = false }) => {
    const [donations, setDonations] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDonations();
    }, [showAll]);

    const fetchDonations = async () => {
        try {
            const endpoint = showAll ? '/api/donations' : '/api/donations/my';
            const response = await axios.get(endpoint);
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

    if (donations.length === 0) {
        return (
            <div className={showAll ? 'container mt-4' : 'mt-4'}>
                <div className="alert alert-info" role="alert">
                    {showAll 
                        ? 'No donations available at the moment. Check back later!'
                        : 'No donations found. Start by creating a new donation!'}
                </div>
            </div>
        );
    }

    return (
        <div className={showAll ? 'container mt-4' : 'mt-4'}>
            <h3 className="mb-3">{showAll ? 'Available Donations' : 'Your Donations'}</h3>
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
        </div>
    );
};

export default DonationList; 