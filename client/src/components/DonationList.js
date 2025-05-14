import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DonationList = () => {
    const [donations, setDonations] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        try {
            const response = await axios.get('/api/donations');
            setDonations(response.data.donations);
        } catch (err) {
            setError('Failed to fetch donations. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status, expirationTime) => {
        const now = new Date();
        const expiration = new Date(expirationTime);

        if (status === 'claimed') {
            return <span className="badge bg-secondary">Claimed</span>;
        }

        if (now > expiration) {
            return <span className="badge bg-danger">Expired</span>;
        }

        return <span className="badge bg-success">Available</span>;
    };

    const formatDateTime = (dateTimeString) => {
        return new Date(dateTimeString).toLocaleString();
    };

    if (isLoading) {
        return (
            <div className="text-center mt-4">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger mt-4" role="alert">
                {error}
            </div>
        );
    }

    if (donations.length === 0) {
        return (
            <div className="alert alert-info mt-4" role="alert">
                No donations found. Start by creating a new donation!
            </div>
        );
    }

    return (
        <div className="mt-4">
            <h3 className="mb-3">Your Donations</h3>
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
                                <td>
                                    <span className="text-capitalize">
                                        {donation.category.replace('_', ' ')}
                                    </span>
                                </td>
                                <td>{donation.quantity}</td>
                                <td>{formatDateTime(donation.expirationTime)}</td>
                                <td>{getStatusBadge(donation.status, donation.expirationTime)}</td>
                                <td>
                                    <small className="text-muted">
                                        {donation.latitude.toFixed(4)}, {donation.longitude.toFixed(4)}
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