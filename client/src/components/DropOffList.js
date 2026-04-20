import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const DropOffList = () => {
    const [dropOffs, setDropOffs] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [maxDistance, setMaxDistance] = useState(10);
    const [usingNearby, setUsingNearby] = useState(false);

    const fetchDropOffs = useCallback(async (useNearby = false) => {
        try {
            setIsLoading(true);
            let response;

            if (useNearby && latitude !== '' && longitude !== '') {
                response = await axios.post('/api/dropoffs/nearby', {
                    latitude: Number(latitude),
                    longitude: Number(longitude),
                    maxDistance: Number(maxDistance) || 10
                });
                setUsingNearby(true);
            } else {
                response = await axios.get('/api/dropoffs');
                setUsingNearby(false);
            }

            setDropOffs(response.data.dropOffs);
        } catch (err) {
            setError('Failed to fetch drop-off points. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [latitude, longitude, maxDistance]);

    useEffect(() => {
        fetchDropOffs();
    }, [fetchDropOffs]);

    const handleNearbySearch = () => {
        if (latitude === '' || longitude === '') {
            setError('Please provide latitude and longitude to search nearby drop-offs.');
            return;
        }
        setError('');
        fetchDropOffs(true);
    };

    const useMyLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude.toFixed(6));
                setLongitude(position.coords.longitude.toFixed(6));
                setError('');
            },
            () => setError('Unable to retrieve your location. Please enter coordinates manually.'),
            { timeout: 8000 }
        );
    };

    const resetFilters = () => {
        setLatitude('');
        setLongitude('');
        setUsingNearby(false);
        setError('');
        fetchDropOffs(false);
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

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                        <h5 className="mb-0">Find Nearby Drop-Off Points</h5>
                        <div>
                            <button className="btn btn-outline-secondary btn-sm me-2" onClick={useMyLocation}>
                                Use My Location
                            </button>
                            <button className="btn btn-link btn-sm" onClick={resetFilters} disabled={!usingNearby && !latitude && !longitude}>
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
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
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
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
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
                        Search Nearby
                    </button>
                    {usingNearby && (
                        <p className="text-muted small mt-2 mb-0">
                            Showing drop-off points near your selected coordinates.
                        </p>
                    )}
                </div>
            </div>

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
