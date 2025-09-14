const express = require('express');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const Course = require('../models/Course');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', auth, admin, async (req, res) => {
  try {
    const totalFeedback = await Feedback.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    
    // Get average ratings per course
    const averageRatings = await Feedback.aggregate([
      {
        $group: {
          _id: '$course',
          averageRating: { $avg: '$rating' },
          feedbackCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $unwind: '$course'
      },
      {
        $project: {
          courseName: '$course.name',
          courseCode: '$course.code',
          averageRating: { $round: ['$averageRating', 2] },
          feedbackCount: 1
        }
      }
    ]);
    
    res.json({
      totalFeedback,
      totalStudents,
      averageRatings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
});

// Get all students with pagination
router.get('/students', auth, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments({ role: 'student' });
    
    res.json({
      students,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalStudents: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching students' });
  }
});

// Block/unblock student
router.put('/students/:id/block', auth, admin, async (req, res) => {
  try {
    const { isBlocked } = req.body;
    
    const student = await User.findById(req.params.id);
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    student.isBlocked = isBlocked;
    await student.save();
    
    res.json({
      message: `Student ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        isBlocked: student.isBlocked
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating student status' });
  }
});

// Delete student
router.delete('/students/:id', auth, admin, async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Delete all feedback from this student
    await Feedback.deleteMany({ student: req.params.id });
    
    // Delete the student
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting student' });
  }
});

// Export feedback to CSV
router.get('/export-feedback', auth, admin, async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('course', 'name code')
      .populate('student', 'name email')
      .sort({ createdAt: -1 });
    
    // Convert to CSV format
    let csv = 'Date,Student Name,Student Email,Course,Rating,Message\n';
    
    feedback.forEach(item => {
      const date = new Date(item.createdAt).toLocaleDateString();
      const studentName = item.student.name.replace(/,/g, ' ');
      const studentEmail = item.student.email;
      const courseName = item.course.name.replace(/,/g, ' ');
      const rating = item.rating;
      const message = item.message.replace(/,/g, ' ').replace(/\n/g, ' ');
      
      csv += `${date},${studentName},${studentEmail},${courseName},${rating},${message}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=feedback-export.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server error while exporting feedback' });
  }
});

// Get all courses
router.get('/courses', auth, admin, async (req, res) => {
  try {
    const courses = await Course.find().sort({ name: 1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching courses' });
  }
});

// Add new course
router.post('/courses', auth, admin, async (req, res) => {
  try {
    const { name, code, description } = req.body;
    
    const course = new Course({
      name,
      code: code.toUpperCase(),
      description
    });
    
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Course with this name or code already exists' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while adding course' });
  }
});

// Update course
router.put('/courses/:id', auth, admin, async (req, res) => {
  try {
    const { name, code, description } = req.body;
    
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    course.name = name || course.name;
    course.code = code ? code.toUpperCase() : course.code;
    course.description = description || course.description;
    
    await course.save();
    res.json(course);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Course with this name or code already exists' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while updating course' });
  }
});

// Delete course
router.delete('/courses/:id', auth, admin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if there's any feedback for this course
    const feedbackCount = await Feedback.countDocuments({ course: req.params.id });
    
    if (feedbackCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete course with existing feedback. Delete the feedback first.' 
      });
    }
    
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting course' });
  }
});

module.exports = router;