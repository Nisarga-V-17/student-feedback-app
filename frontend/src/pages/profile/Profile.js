import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import axios from '../../utils/api';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    address: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.put('/profile', formData);
      setMessage('Profile updated successfully!');
      // Update local user data if needed
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating profile');
    }
    
    setLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await axios.put('/profile/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error changing password');
    }
    
    setLoading(false);
  };

  return (
    <div>
      <Navbar />
      
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Profile Settings</h1>

        {message && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '1rem', 
            backgroundColor: message.includes('Error') ? '#f8d7da' : '#d4edda',
            color: message.includes('Error') ? '#721c24' : '#155724',
            border: '1px solid',
            borderRadius: '4px'
          }}>
            {message}
          </div>
        )}

        {/* Profile Update Form */}
        <div style={{ marginBottom: '3rem', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h2>Update Profile Information</h2>
          <form onSubmit={handleProfileSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Full Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleProfileChange}
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Email:</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', backgroundColor: '#f8f9fa' }}
              />
              <small>Email cannot be changed</small>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Phone Number:</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleProfileChange}
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Date of Birth:</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleProfileChange}
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Address:</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleProfileChange}
                rows="3"
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: loading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Password Change Form */}
        <div style={{ padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Current Password:</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>New Password:</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              />
              <small>Must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character</small>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Confirm New Password:</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: loading ? '#ccc' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;