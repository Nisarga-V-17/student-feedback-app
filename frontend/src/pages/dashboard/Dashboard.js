import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <Navbar />
      
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Welcome to Student Feedback Portal</h1>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem', 
          marginTop: '2rem' 
        }}>
          {/* Student Features */}
          {user?.role === 'student' && (
            <>
              <div style={{ 
                padding: '2rem', 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                textAlign: 'center' 
              }}>
                <h3>Submit Feedback</h3>
                <p>Provide feedback on your courses</p>
                <Link to="/feedback">
                  <button style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '1rem'
                  }}>
                    Submit Feedback
                  </button>
                </Link>
              </div>

              <div style={{ 
                padding: '2rem', 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                textAlign: 'center' 
              }}>
                <h3>View My Feedback</h3>
                <p>See all feedback you've submitted</p>
                <Link to="/feedback">
                  <button style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '1rem'
                  }}>
                    View Feedback
                  </button>
                </Link>
              </div>
            </>
          )}

          {/* Admin Features */}
          {user?.role === 'admin' && (
            <>
              <div style={{ 
                padding: '2rem', 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                textAlign: 'center' 
              }}>
                <h3>Admin Dashboard</h3>
                <p>Manage students and view analytics</p>
                <Link to="/admin">
                  <button style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '1rem'
                  }}>
                    Admin Panel
                  </button>
                </Link>
              </div>

              <div style={{ 
                padding: '2rem', 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                textAlign: 'center' 
              }}>
                <h3>Manage Courses</h3>
                <p>Add, edit, or remove courses</p>
                <Link to="/admin/courses">
                  <button style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#ffc107',
                    color: 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '1rem'
                  }}>
                    Manage Courses
                  </button>
                </Link>
              </div>
            </>
          )}

          {/* Common Features */}
          <div style={{ 
            padding: '2rem', 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h3>Profile Settings</h3>
            <p>Update your personal information</p>
            <Link to="/profile">
              <button style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '1rem'
              }}>
                Edit Profile
              </button>
            </Link>
          </div>
        </div>

        {/* User Info */}
        <div style={{ 
          marginTop: '3rem', 
          padding: '1.5rem', 
          border: '1px solid #eee', 
          borderRadius: '8px',
          backgroundColor: '#f8f9fa'
        }}>
          <h3>Your Information</h3>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
          <p><strong>User ID:</strong> {user?.id}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;