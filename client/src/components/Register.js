import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LocationPicker from './LocationPicker';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'donor',
        latitude: '',
        longitude: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLocationSelect = (lat, lng) => {
        setFormData({
            ...formData,
            latitude: lat,
            longitude: lng
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await axios.post('/api/auth/register', formData);
            setSuccess('Registration successful! Redirecting to login...');

            // Redirect to login page after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow">
                        <div className="card-body">
                            <h2 className="text-center mb-4">Register</h2>

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

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength="6"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="role" className="form-label">Role</label>
                                    <select
                                        className="form-select"
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="donor">Donor</option>
                                        <option value="pickup">Pickup</option>
                                    </select>
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
                                            Registering...
                                        </>
                                    ) : (
                                        'Register'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register; 