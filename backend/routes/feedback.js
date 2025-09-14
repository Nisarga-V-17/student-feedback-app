const express = require('express');
const Feedback = require('../models/Feedback');
const Course = require('../models/Course');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all feedback (with pagination and filtering)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let filter = {};
    
    // If user is student, only show their feedback
    if (req.user.role === 'student') {
      filter.student = req.user._id;
    }
    
    // Filter by course if provided
    if (req.query.course) {
      filter.course = req.query.course;
    }
    
    // Filter by rating if provided
    if (req.query.rating) {
      filter.rating = req.query.rating;
    }
    
    const feedback = await Feedback.find(filter)
      .populate('course', 'name code')
      .populate('student', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Feedback.countDocuments(filter);
    
    res.json({
      feedback,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalFeedback: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching feedback' });
  }
});

// Submit feedback
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit feedback' });
    }
    
    const { courseId, rating, message } = req.body;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if student already submitted feedback for this course
    const existingFeedback = await Feedback.findOne({
      student: req.user._id,
      course: courseId
    });
    
    if (existingFeedback) {
      return res.status(400).json({ message: 'You have already submitted feedback for this course' });
    }
    
    const feedback = new Feedback({
      student: req.user._id,
      course: courseId,
      rating,
      message
    });
    
    await feedback.save();
    
    // Populate the course and student details in the response
    await feedback.populate('course', 'name code');
    await feedback.populate('student', 'name email');
    
    res.status(201).json(feedback);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while submitting feedback' });
  }
});

// Update feedback
router.put('/:id', auth, async (req, res) => {
  try {
    const { rating, message } = req.body;
    
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Check if user owns this feedback or is admin
    if (feedback.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this feedback' });
    }
    
    feedback.rating = rating || feedback.rating;
    feedback.message = message || feedback.message;
    
    await feedback.save();
    
    await feedback.populate('course', 'name code');
    await feedback.populate('student', 'name email');
    
    res.json(feedback);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while updating feedback' });
  }
});

// Delete feedback
router.delete('/:id', auth, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Check if user owns this feedback or is admin
    if (feedback.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this feedback' });
    }
    
    await Feedback.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting feedback' });
  }
});

module.exports = router;