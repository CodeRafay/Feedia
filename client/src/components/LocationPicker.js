import React, { useState, useEffect, useRef } from 'react';

const LocationPicker = ({ onLocationSelect, initialLat, initialLng }) => {
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const [manualLat, setManualLat] = useState(initialLat || '');
    const [manualLng, setManualLng] = useState(initialLng || '');
    const [error, setError] = useState('');
    const mapRef = useRef(null);
    const googleMapRef = useRef(null);

    useEffect(() => {
        // Load Google Maps script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
        script.async = true;
        script.defer = true;
        script.addEventListener('load', initializeMap);
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    const initializeMap = () => {
        if (!googleMapRef.current) return;

        const defaultLocation = { lat: 0, lng: 0 };
        const initialLocation = initialLat && initialLng
            ? { lat: parseFloat(initialLat), lng: parseFloat(initialLng) }
            : defaultLocation;

        const mapInstance = new window.google.maps.Map(googleMapRef.current, {
            center: initialLocation,
            zoom: 2,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
        });

        setMap(mapInstance);

        // Add click listener to map
        mapInstance.addListener('click', (e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            // Update marker
            if (marker) {
                marker.setPosition(e.latLng);
            } else {
                const newMarker = new window.google.maps.Marker({
                    position: e.latLng,
                    map: mapInstance,
                    draggable: true,
                });
                setMarker(newMarker);
            }

            // Update manual input fields
            setManualLat(lat.toFixed(6));
            setManualLng(lng.toFixed(6));

            // Notify parent component
            onLocationSelect(lat, lng);
        });
    };

    const handleManualLatChange = (e) => {
        const value = e.target.value;
        setManualLat(value);
        updateLocationFromManualInput(value, manualLng);
    };

    const handleManualLngChange = (e) => {
        const value = e.target.value;
        setManualLng(value);
        updateLocationFromManualInput(manualLat, value);
    };

    const updateLocationFromManualInput = (lat, lng) => {
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);

        if (!isNaN(latNum) && !isNaN(lngNum)) {
            if (latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180) {
                setError('');
                const newPosition = { lat: latNum, lng: lngNum };

                if (map) {
                    map.setCenter(newPosition);
                    if (marker) {
                        marker.setPosition(newPosition);
                    } else {
                        const newMarker = new window.google.maps.Marker({
                            position: newPosition,
                            map: map,
                            draggable: true,
                        });
                        setMarker(newMarker);
                    }
                }

                onLocationSelect(latNum, lngNum);
            } else {
                setError('Latitude must be between -90 and 90, and longitude between -180 and 180');
            }
        }
    };

    return (
        <div className="location-picker">
            <div className="mb-3">
                <label className="form-label">Select Location</label>
                <div
                    ref={googleMapRef}
                    className="map-container mb-3"
                    style={{ height: '300px', width: '100%', borderRadius: '0.375rem' }}
                />
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="latitude" className="form-label">Latitude</label>
                    <input
                        type="number"
                        className="form-control"
                        id="latitude"
                        value={manualLat}
                        onChange={handleManualLatChange}
                        step="any"
                        min="-90"
                        max="90"
                        placeholder="Enter latitude"
                    />
                </div>
                <div className="col-md-6 mb-3">
                    <label htmlFor="longitude" className="form-label">Longitude</label>
                    <input
                        type="number"
                        className="form-control"
                        id="longitude"
                        value={manualLng}
                        onChange={handleManualLngChange}
                        step="any"
                        min="-180"
                        max="180"
                        placeholder="Enter longitude"
                    />
                </div>
            </div>

            <div className="alert alert-info" role="alert">
                <small>
                    <i className="bi bi-info-circle me-2"></i>
                    Click on the map to select a location or enter coordinates manually.
                </small>
            </div>
        </div>
    );
};

export default LocationPicker; 