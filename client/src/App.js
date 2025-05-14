import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import DonorDashboard from './components/DonorDashboard';
import DonationList from './components/DonationList';
import PickupDashboard from './components/PickupDashboard';
import DropOffList from './components/DropOffList';

// Configure axios
axios.defaults.baseURL = 'http://localhost:5000';

// Placeholder components (to be implemented)
const Home = () => <div className="container mt-4"><h1>Home Page</h1></div>;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (token) {
      setIsAuthenticated(true);
      setUserRole(role);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand" to="/">Local Food Sharing</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/dropoffs">Drop-Off Points</Link>
              </li>
              {isAuthenticated && (
                <>
                  {userRole === 'donor' && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/donor/dashboard">Donor Dashboard</Link>
                    </li>
                  )}
                  {userRole === 'pickup' && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/pickup/dashboard">Pickup Dashboard</Link>
                    </li>
                  )}
                </>
              )}
            </ul>
            <ul className="navbar-nav">
              {!isAuthenticated ? (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">Login</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/register">Register</Link>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <button className="btn btn-link nav-link" onClick={handleLogout}>Logout</button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="/donor/dashboard" element={isAuthenticated && userRole === 'donor' ? <DonorDashboard /> : <Navigate to="/login" />} />
        <Route path="/pickup/dashboard" element={isAuthenticated && userRole === 'pickup' ? <PickupDashboard /> : <Navigate to="/login" />} />
        <Route path="/dropoffs" element={<DropOffList />} />
      </Routes>
    </Router>
  );
}

export default App;
