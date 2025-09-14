import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      backgroundColor: '#343a40',
      padding: '1rem',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', marginRight: '1rem' }}>
          Student Feedback Portal
        </Link>
        {user && (
          <>
            <Link to="/feedback" style={{ color: 'white', textDecoration: 'none', marginRight: '1rem' }}>
              Feedback
            </Link>
            <Link to="/profile" style={{ color: 'white', textDecoration: 'none', marginRight: '1rem' }}>
              Profile
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" style={{ color: 'white', textDecoration: 'none', marginRight: '1rem' }}>
                Admin
              </Link>
            )}
          </>
        )}
      </div>
      
      {user ? (
        <div>
          <span style={{ marginRight: '1rem' }}>Welcome, {user.name}</span>
          <button 
            onClick={handleLogout}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <div>
          <Link to="/login" style={{ color: 'white', textDecoration: 'none', marginRight: '1rem' }}>
            Login
          </Link>
          <Link to="/signup" style={{ color: 'white', textDecoration: 'none' }}>
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;