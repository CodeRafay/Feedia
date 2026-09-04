import React, { useState, useEffect, useCallback } from 'react';
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
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [userRoleFilter, setUserRoleFilter] = useState('');
    const [usersLoading, setUsersLoading] = useState(false);
    const [donations, setDonations] = useState([]);
    const [donationStatusFilter, setDonationStatusFilter] = useState('');
    const [donationsLoading, setDonationsLoading] = useState(false);
    const [dropOffs, setDropOffs] = useState([]);
    const [dropOffForm, setDropOffForm] = useState({
        name: '',
        address: '',
        latitude: '',
        longitude: ''
    });
    const [editingDropOffId, setEditingDropOffId] = useState(null);
    const [dropOffLoading, setDropOffLoading] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            const response = await axios.get('/api/admin/stats');
            setStats(response.data);
        } catch (err) {
            setError('Failed to fetch statistics. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            setUsersLoading(true);
            const response = await axios.get('/api/admin/users', {
                params: {
                    role: userRoleFilter || undefined
                }
            });
            setUsers(response.data.users || []);
        } catch (err) {
            setError('Failed to load users.');
        } finally {
            setUsersLoading(false);
        }
    }, [userRoleFilter]);

    const updateUserRole = async (userId, role) => {
        setMessage('');
        setError('');
        try {
            await axios.put(`/api/admin/users/${userId}/role`, { role });
            setMessage('User role updated.');
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to update user role.');
        }
    };

    const removeUser = async (userId) => {
        setMessage('');
        setError('');
        try {
            await axios.delete(`/api/admin/users/${userId}`);
            setMessage('User removed.');
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to delete user.');
        }
    };

    const fetchAdminDonations = useCallback(async () => {
        try {
            setDonationsLoading(true);
            const response = await axios.get('/api/admin/donations', {
                params: {
                    status: donationStatusFilter || undefined
                }
            });
            setDonations(response.data.donations || []);
        } catch (err) {
            setError('Failed to load donations.');
        } finally {
            setDonationsLoading(false);
        }
    }, [donationStatusFilter]);

    const fetchDropOffs = useCallback(async () => {
        try {
            setDropOffLoading(true);
            const response = await axios.get('/api/dropoffs');
            setDropOffs(response.data.dropOffs || []);
        } catch (err) {
            setError('Failed to load drop-off points.');
        } finally {
            setDropOffLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('userRole');
        if (!token || role !== 'admin') {
            navigate('/login');
            return;
        }

        fetchStats();
    }, [navigate, fetchStats]);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'donations') {
            fetchAdminDonations();
        } else if (activeTab === 'dropoffs') {
            fetchDropOffs();
        }
    }, [activeTab, fetchAdminDonations, fetchDropOffs, fetchUsers]);

    const handleDropOffSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        const payload = {
            name: dropOffForm.name.trim(),
            address: dropOffForm.address.trim(),
            latitude: Number(dropOffForm.latitude),
            longitude: Number(dropOffForm.longitude)
        };

        try {
            if (editingDropOffId) {
                await axios.put(`/api/admin/dropoffs/${editingDropOffId}`, payload);
                setMessage('Drop-off updated successfully.');
            } else {
                await axios.post('/api/admin/dropoffs', payload);
                setMessage('Drop-off created successfully.');
            }
            setDropOffForm({ name: '', address: '', latitude: '', longitude: '' });
            setEditingDropOffId(null);
            fetchDropOffs();
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to save drop-off.');
        }
    };

    const startDropOffEdit = (dropOff) => {
        setEditingDropOffId(dropOff._id);
        setDropOffForm({
            name: dropOff.name,
            address: dropOff.address,
            latitude: dropOff.location.latitude,
            longitude: dropOff.location.longitude
        });
    };

    const deleteDropOff = async (dropOffId) => {
        setMessage('');
        setError('');
        try {
            await axios.delete(`/api/admin/dropoffs/${dropOffId}`);
            setMessage('Drop-off deleted.');
            fetchDropOffs();
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to delete drop-off.');
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
            {message && (
                <div className="alert alert-success" role="alert">
                    {message}
                </div>
            )}

            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'donations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('donations')}
                    >
                        Donations
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'dropoffs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dropoffs')}
                    >
                        Drop-Off Points
                    </button>
                </li>
            </ul>

            {activeTab === 'overview' && (
                <>
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
                </>
            )}

            {activeTab === 'users' && (
                <div className="card">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                            <h5 className="mb-0">Manage Users</h5>
                            <div className="d-flex align-items-center gap-2">
                                <select
                                    className="form-select"
                                    style={{ minWidth: '180px' }}
                                    value={userRoleFilter}
                                    onChange={(e) => setUserRoleFilter(e.target.value)}
                                >
                                    <option value="">All Roles</option>
                                    <option value="donor">Donors</option>
                                    <option value="pickup">Pickup</option>
                                    <option value="admin">Admins</option>
                                </select>
                                <button className="btn btn-outline-secondary btn-sm" onClick={fetchUsers}>
                                    Refresh
                                </button>
                            </div>
                        </div>
                        {usersLoading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-success" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : users.length === 0 ? (
                            <p className="text-muted mb-0">No users found.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Joined</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user._id}>
                                                <td>{user.name}</td>
                                                <td><small>{user.email}</small></td>
                                                <td>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={user.role}
                                                        onChange={(e) => updateUserRole(user._id, e.target.value)}
                                                    >
                                                        <option value="donor">Donor</option>
                                                        <option value="pickup">Pickup</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <small>{new Date(user.createdAt).toLocaleDateString()}</small>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => removeUser(user._id)}
                                                    >
                                                        Delete
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

            {activeTab === 'donations' && (
                <div className="card">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                            <h5 className="mb-0">Donations</h5>
                            <div className="d-flex align-items-center gap-2">
                                <select
                                    className="form-select"
                                    style={{ minWidth: '180px' }}
                                    value={donationStatusFilter}
                                    onChange={(e) => setDonationStatusFilter(e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="available">Available</option>
                                    <option value="picked_up">Picked Up</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="expired">Expired</option>
                                </select>
                                <button className="btn btn-outline-secondary btn-sm" onClick={fetchAdminDonations}>
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {donationsLoading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-success" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : donations.length === 0 ? (
                            <p className="text-muted mb-0">No donations found.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Food Type</th>
                                            <th>Category</th>
                                            <th>Status</th>
                                            <th>Donor</th>
                                            <th>Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {donations.map((donation) => (
                                            <tr key={donation._id}>
                                                <td>{donation.foodType}</td>
                                                <td className="text-capitalize">{donation.category?.replace('_', ' ')}</td>
                                                <td>
                                                    <span className={`badge bg-${
                                                        donation.status === 'available' ? 'success' :
                                                        donation.status === 'picked_up' ? 'info' :
                                                        donation.status === 'delivered' ? 'primary' : 'danger'
                                                    }`}>
                                                        {donation.status}
                                                    </span>
                                                </td>
                                                <td>{donation.donorId?.name || 'N/A'}</td>
                                                <td><small>{new Date(donation.createdAt).toLocaleDateString()}</small></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'dropoffs' && (
                <div className="row g-4">
                    <div className="col-md-5">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title mb-3">{editingDropOffId ? 'Edit Drop-Off' : 'Add Drop-Off'}</h5>
                                <form className="row g-3" onSubmit={handleDropOffSubmit}>
                                    <div className="col-12">
                                        <label className="form-label">Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={dropOffForm.name}
                                            onChange={(e) => setDropOffForm({ ...dropOffForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Address</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={dropOffForm.address}
                                            onChange={(e) => setDropOffForm({ ...dropOffForm, address: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Latitude</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={dropOffForm.latitude}
                                            onChange={(e) => setDropOffForm({ ...dropOffForm, latitude: e.target.value })}
                                            required
                                            min="-90"
                                            max="90"
                                            step="any"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Longitude</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={dropOffForm.longitude}
                                            onChange={(e) => setDropOffForm({ ...dropOffForm, longitude: e.target.value })}
                                            required
                                            min="-180"
                                            max="180"
                                            step="any"
                                        />
                                    </div>
                                    <div className="col-12 d-flex gap-2">
                                        <button type="submit" className="btn btn-success">
                                            {editingDropOffId ? 'Update' : 'Create'}
                                        </button>
                                        {editingDropOffId && (
                                            <button
                                                type="button"
                                                className="btn btn-link"
                                                onClick={() => { setEditingDropOffId(null); setDropOffForm({ name: '', address: '', latitude: '', longitude: '' }); }}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-7">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="mb-0">Drop-Off Points</h5>
                                    <button className="btn btn-outline-secondary btn-sm" onClick={fetchDropOffs}>Refresh</button>
                                </div>
                                {dropOffLoading ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-success" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : dropOffs.length === 0 ? (
                                    <p className="text-muted mb-0">No drop-off points available.</p>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-striped align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Address</th>
                                                    <th>Location</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dropOffs.map((dropOff) => (
                                                    <tr key={dropOff._id}>
                                                        <td>{dropOff.name}</td>
                                                        <td>{dropOff.address}</td>
                                                        <td>
                                                            <small>{dropOff.location.latitude.toFixed(4)}, {dropOff.location.longitude.toFixed(4)}</small>
                                                        </td>
                                                        <td>
                                                            <div className="btn-group btn-group-sm" role="group">
                                                                <button className="btn btn-outline-primary" onClick={() => startDropOffEdit(dropOff)}>
                                                                    Edit
                                                                </button>
                                                                <button className="btn btn-outline-danger" onClick={() => deleteDropOff(dropOff._id)}>
                                                                    Delete
                                                                </button>
                                                            </div>
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
            )}
        </div>
    );
};

export default AdminDashboard;
