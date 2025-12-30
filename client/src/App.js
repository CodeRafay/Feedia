import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import DonorDashboard from './components/DonorDashboard';
import PickupDashboard from './components/PickupDashboard';
import AdminDashboard from './components/AdminDashboard';
import DropOffList from './components/DropOffList';
import DonationList from './components/DonationList';

// Configure axios base URL based on environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_BASE_URL;

// Home component
const Home = () => (
  <div className="container mt-5">
    <div className="row justify-content-center">
      <div className="col-md-10">
        <div className="text-center mb-5">
          <h1 className="display-4 text-success">Welcome to Feedia</h1>
          <p className="lead text-muted">
            Connecting food donors, pickup services, and beneficiaries to reduce waste and fight hunger.
          </p>
        </div>
        
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body text-center">
                <div className="display-4 text-success mb-3">🍲</div>
                <h5 className="card-title">For Donors</h5>
                <p className="card-text text-muted">
                  List surplus food from your restaurant, hotel, or home. Help reduce food waste.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body text-center">
                <div className="display-4 text-success mb-3">🚚</div>
                <h5 className="card-title">For Pickup Services</h5>
                <p className="card-text text-muted">
                  Volunteer to collect and deliver food donations to those in need.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body text-center">
                <div className="display-4 text-success mb-3">❤️</div>
                <h5 className="card-title">For Beneficiaries</h5>
                <p className="card-text text-muted">
                  Access food from nearby drop-off points. View real-time availability.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-5">
          <Link to="/register" className="btn btn-success btn-lg me-3">Get Started</Link>
          <Link to="/dropoffs" className="btn btn-outline-success btn-lg">View Drop-Off Points</Link>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    if (token) {
      setIsAuthenticated(true);
      setUserRole(role);
      setUserName(name || '');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName('');
    delete axios.defaults.headers.common['Authorization'];
  };

  const handleLoginSuccess = (token, role, name) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', name || '');
    setIsAuthenticated(true);
    setUserRole(role);
    setUserName(name || '');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case 'donor':
        return '/donor/dashboard';
      case 'pickup':
        return '/pickup/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-success">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            🌱 Feedia
          </Link>
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
              <li className="nav-item">
                <Link className="nav-link" to="/donations">Available Donations</Link>
              </li>
              {isAuthenticated && (
                <li className="nav-item">
                  <Link className="nav-link" to={getDashboardLink()}>Dashboard</Link>
                </li>
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
                <>
                  <li className="nav-item">
                    <span className="nav-link text-light">
                      {userName && `Welcome, ${userName}`} ({userRole})
                    </span>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-link nav-link" onClick={handleLogout}>Logout</button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/login" 
          element={
            !isAuthenticated 
              ? <Login onLoginSuccess={handleLoginSuccess} /> 
              : <Navigate to={getDashboardLink()} />
          } 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register /> : <Navigate to="/" />} 
        />
        <Route 
          path="/donor/dashboard" 
          element={
            isAuthenticated && userRole === 'donor' 
              ? <DonorDashboard /> 
              : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/pickup/dashboard" 
          element={
            isAuthenticated && userRole === 'pickup' 
              ? <PickupDashboard /> 
              : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            isAuthenticated && userRole === 'admin' 
              ? <AdminDashboard /> 
              : <Navigate to="/login" />
          } 
        />
        <Route path="/dropoffs" element={<DropOffList />} />
        <Route path="/donations" element={<DonationList showAll={true} />} />
      </Routes>
    </Router>
  );
}

export default App;
