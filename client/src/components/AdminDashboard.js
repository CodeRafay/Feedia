import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalDonations: 0,
        totalPickups: 0,
        totalDropOffs: 0,
        usersByRole: {},
        donationsByStatus: {},
        recentDonations: [],
        recentUsers: []
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated as admin
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('userRole');
        if (!token || role !== 'admin') {
            navigate('/login');
            return;
        }

        fetchStats();
    }, [navigate]);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/admin/stats');
            setStats(response.data);
        } catch (err) {
            setError('Failed to fetch statistics. Please try again later.');
        } finally {
            setIsLoading(false);
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
            <h2 className="mb-4">Admin Dashboard</h2>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Statistics Cards */}
            <div className="row g-4 mb-5">
                <div className="col-md-3">
                    <div className="card bg-primary text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-subtitle mb-2 opacity-75">Total Users</h6>
                                    <h2 className="card-title mb-0">{stats.totalUsers}</h2>
                                </div>
                                <div className="display-4">👥</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-success text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-subtitle mb-2 opacity-75">Total Donations</h6>
                                    <h2 className="card-title mb-0">{stats.totalDonations}</h2>
                                </div>
                                <div className="display-4">🍲</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-warning text-dark h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-subtitle mb-2 opacity-75">Total Pickups</h6>
                                    <h2 className="card-title mb-0">{stats.totalPickups}</h2>
                                </div>
                                <div className="display-4">🚚</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-info text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-subtitle mb-2 opacity-75">Drop-Off Points</h6>
                                    <h2 className="card-title mb-0">{stats.totalDropOffs}</h2>
                                </div>
                                <div className="display-4">📍</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users by Role */}
            <div className="row g-4 mb-5">
                <div className="col-md-6">
                    <div className="card h-100">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Users by Role</h5>
                        </div>
                        <div className="card-body">
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    Donors
                                    <span className="badge bg-success rounded-pill">
                                        {stats.usersByRole?.donor || 0}
                                    </span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    Pickup Services
                                    <span className="badge bg-warning rounded-pill">
                                        {stats.usersByRole?.pickup || 0}
                                    </span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    Admins
                                    <span className="badge bg-primary rounded-pill">
                                        {stats.usersByRole?.admin || 0}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card h-100">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Donations by Status</h5>
                        </div>
                        <div className="card-body">
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    Available
                                    <span className="badge bg-success rounded-pill">
                                        {stats.donationsByStatus?.available || 0}
                                    </span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    Picked Up
                                    <span className="badge bg-info rounded-pill">
                                        {stats.donationsByStatus?.picked_up || 0}
                                    </span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    Delivered
                                    <span className="badge bg-primary rounded-pill">
                                        {stats.donationsByStatus?.delivered || 0}
                                    </span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    Expired
                                    <span className="badge bg-danger rounded-pill">
                                        {stats.donationsByStatus?.expired || 0}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="row g-4">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Recent Donations</h5>
                        </div>
                        <div className="card-body">
                            {stats.recentDonations?.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Food Type</th>
                                                <th>Category</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.recentDonations.map((donation) => (
                                                <tr key={donation._id}>
                                                    <td>{donation.foodType}</td>
                                                    <td className="text-capitalize">
                                                        {donation.category?.replace('_', ' ')}
                                                    </td>
                                                    <td>
                                                        <span className={`badge bg-${
                                                            donation.status === 'available' ? 'success' :
                                                            donation.status === 'picked_up' ? 'info' :
                                                            donation.status === 'delivered' ? 'primary' : 'danger'
                                                        }`}>
                                                            {donation.status?.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <small>
                                                            {new Date(donation.createdAt).toLocaleDateString()}
                                                        </small>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-muted mb-0">No recent donations</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Recent Users</h5>
                        </div>
                        <div className="card-body">
                            {stats.recentUsers?.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.recentUsers.map((user) => (
                                                <tr key={user._id}>
                                                    <td>{user.name}</td>
                                                    <td>
                                                        <small>{user.email}</small>
                                                    </td>
                                                    <td>
                                                        <span className={`badge bg-${
                                                            user.role === 'admin' ? 'primary' :
                                                            user.role === 'donor' ? 'success' : 'warning'
                                                        }`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <small>
                                                            {new Date(user.createdAt).toLocaleDateString()}
                                                        </small>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-muted mb-0">No recent users</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
