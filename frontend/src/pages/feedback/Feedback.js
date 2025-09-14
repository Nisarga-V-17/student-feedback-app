import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import axios from '../../utils/api';

const Feedback = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    courseId: '',
    rating: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchFeedbacks();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/admin/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get('/feedback');
      setFeedbacks(response.data.feedback);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('/feedback', formData);
      alert('Feedback submitted successfully!');
      setFormData({ courseId: '', rating: '', message: '' });
      fetchFeedbacks();
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting feedback');
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <Navbar />
      
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h1>Feedback Management</h1>

        {/* Submit Feedback Form */}
        {user?.role === 'student' && (
          <div style={{ marginBottom: '3rem', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2>Submit New Feedback</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Course:</label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label>Rating (1-5):</label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
                >
                  <option value="">Select rating</option>
                  {[1, 2, 3, 4, 5].map(rating => (
                    <option key={rating} value={rating}>{rating} ★</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label>Message:</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
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
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        )}

        {/* Feedback List */}
        <div>
          <h2>{user?.role === 'admin' ? 'All Feedback' : 'My Feedback'}</h2>
          {feedbacks.length === 0 ? (
            <p>No feedback submitted yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {feedbacks.map(feedback => (
                <div key={feedback._id} style={{ 
                  padding: '1rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px' 
                }}>
                  <h4>{feedback.course?.name} ({feedback.course?.code})</h4>
                  <p>Rating: {feedback.rating} ★</p>
                  <p>{feedback.message}</p>
                  <small>Submitted on: {new Date(feedback.createdAt).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;