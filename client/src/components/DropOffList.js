import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DropOffList = () => {
    const [dropOffs, setDropOffs] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState(null);

    useEffect(() => {
        fetchDropOffs();
    }, []);

    const fetchDropOffs = async () => {
        try {
            const response = await axios.get('/api/dropoffs');
            setDropOffs(response.data.dropOffs);
        } catch (err) {
            setError('Failed to fetch drop-off points. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewLocation = (dropOff) => {
        setSelectedLocation(dropOff);
    };

    const handleCloseMap = () => {
        setSelectedLocation(null);
    };

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

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Drop-Off Points</h2>

            {dropOffs.length === 0 ? (
                <div className="alert alert-info" role="alert">
                    No drop-off points found.
                </div>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {dropOffs.map((dropOff) => (
                        <div key={dropOff._id} className="col">
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">{dropOff.name}</h5>
                                    <p className="card-text">
                                        <i className="bi bi-geo-alt me-2"></i>
                                        {dropOff.address}
                                    </p>
                                    <p className="card-text">
                                        <small className="text-muted">
                                            <i className="bi bi-geo me-2"></i>
                                            {dropOff.location.latitude.toFixed(4)}, {dropOff.location.longitude.toFixed(4)}
                                        </small>
                                    </p>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleViewLocation(dropOff)}
                                    >
                                        <i className="bi bi-map me-2"></i>
                                        View on Map
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Map Modal */}
            {selectedLocation && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{selectedLocation.name}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCloseMap}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <p className="mb-1">
                                        <i className="bi bi-geo-alt me-2"></i>
                                        {selectedLocation.address}
                                    </p>
                                    <p className="text-muted mb-3">
                                        <small>
                                            <i className="bi bi-geo me-2"></i>
                                            {selectedLocation.location.latitude.toFixed(4)}, {selectedLocation.location.longitude.toFixed(4)}
                                        </small>
                                    </p>
                                </div>
                                <div
                                    className="map-container"
                                    style={{ height: '400px', width: '100%', borderRadius: '0.375rem' }}
                                >
                                    <iframe
                                        title="Drop-off Location"
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        style={{ border: 0, borderRadius: '0.375rem' }}
                                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&q=${selectedLocation.location.latitude},${selectedLocation.location.longitude}`}
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCloseMap}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Backdrop */}
            {selectedLocation && (
                <div
                    className="modal-backdrop fade show"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                ></div>
            )}
        </div>
    );
};

export default DropOffList; 