import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import axios from '../../utils/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchStudents();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/admin/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/admin/students');
      setStudents(response.data.students);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  const handleBlockUnblock = async (studentId, isCurrentlyBlocked) => {
    try {
      await axios.put(`/admin/students/${studentId}/block`, {
        isBlocked: !isCurrentlyBlocked
      });
      alert(`Student ${isCurrentlyBlocked ? 'unblocked' : 'blocked'} successfully!`);
      fetchStudents(); // Refresh the list
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating student status');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student? This will also delete all their feedback.')) {
      return;
    }

    try {
      await axios.delete(`/admin/students/${studentId}`);
      alert('Student deleted successfully!');
      fetchStudents(); // Refresh the list
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting student');
    }
  };

  const exportFeedback = async () => {
    try {
      const response = await axios.get('/admin/export-feedback', {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'feedback-export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      alert('Feedback exported successfully!');
    } catch (error) {
      alert('Error exporting feedback');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Admin Dashboard</h1>

        {/* Statistics */}
        {dashboardData && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1rem', 
            marginBottom: '2rem' 
          }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#007bff', color: 'white', borderRadius: '8px' }}>
              <h3>Total Feedback</h3>
              <p style={{ fontSize: '2rem', margin: 0 }}>{dashboardData.totalFeedback}</p>
            </div>
            
            <div style={{ padding: '1.5rem', backgroundColor: '#28a745', color: 'white', borderRadius: '8px' }}>
              <h3>Registered Students</h3>
              <p style={{ fontSize: '2rem', margin: 0 }}>{dashboardData.totalStudents}</p>
            </div>
            
            <div style={{ padding: '1.5rem', backgroundColor: '#ffc107', color: 'black', borderRadius: '8px' }}>
              <h3>Average Ratings</h3>
              <p style={{ fontSize: '2rem', margin: 0 }}>
                {dashboardData.averageRatings.length > 0 ? 
                 dashboardData.averageRatings[0].averageRating : '0'} ★
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ marginBottom: '2rem' }}>
          <button 
            onClick={exportFeedback}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '1rem'
            }}
          >
            Export Feedback to CSV
          </button>
        </div>

        {/* Students Management */}
        <div style={{ marginBottom: '2rem' }}>
          <h2>Student Management</h2>
          {students.length === 0 ? (
            <p>No students found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '1rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '1rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '1rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '1rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student._id}>
                      <td style={{ padding: '1rem', border: '1px solid #dee2e6' }}>{student.name}</td>
                      <td style={{ padding: '1rem', border: '1px solid #dee2e6' }}>{student.email}</td>
                      <td style={{ padding: '1rem', border: '1px solid #dee2e6' }}>
                        <span style={{ 
                          color: student.isBlocked ? '#dc3545' : '#28a745',
                          fontWeight: 'bold'
                        }}>
                          {student.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', border: '1px solid #dee2e6' }}>
                        <button
                          onClick={() => handleBlockUnblock(student._id, student.isBlocked)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: student.isBlocked ? '#28a745' : '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '0.5rem'
                          }}
                        >
                          {student.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student._id)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
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

        {/* Course Ratings */}
        {dashboardData?.averageRatings && dashboardData.averageRatings.length > 0 && (
          <div>
            <h2>Course Ratings</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {dashboardData.averageRatings.map(course => (
                <div key={course.courseCode} style={{ 
                  padding: '1rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{course.courseName}</h4>
                    <p style={{ margin: 0, color: '#666' }}>{course.courseCode}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {course.averageRating} ★
                    </p>
                    <small>{course.feedbackCount} feedback entries</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;