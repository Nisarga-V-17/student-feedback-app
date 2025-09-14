const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to database');

    // Clear existing data (optional - be careful in production!)
    // await User.deleteMany({});
    // await Course.deleteMany({});

    // Create admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@school.com' });
    if (!adminExists) {
      const adminUser = new User({
        name: 'System Administrator',
        email: 'admin@school.com',
        password: 'Admin123!', // This will be hashed by the pre-save hook
        role: 'admin'
      });
      await adminUser.save();
      console.log('Admin user created:', adminUser.email);
    }

    // Create sample courses if not exists
    const sampleCourses = [
      { name: 'Mathematics', code: 'MATH101', description: 'Introduction to Mathematics' },
      { name: 'Physics', code: 'PHYS101', description: 'Basic Physics Principles' },
      { name: 'Chemistry', code: 'CHEM101', description: 'Fundamental Chemistry' },
      { name: 'Computer Science', code: 'CS101', description: 'Introduction to Programming' },
      { name: 'English Literature', code: 'ENG101', description: 'Classic English Literature' },
      { name: 'History', code: 'HIST101', description: 'World History Overview' },
      { name: 'Biology', code: 'BIO101', description: 'Introduction to Biology' },
      { name: 'Economics', code: 'ECON101', description: 'Basic Economic Principles' }
    ];

    for (const courseData of sampleCourses) {
      const courseExists = await Course.findOne({ code: courseData.code });
      if (!courseExists) {
        const course = new Course(courseData);
        await course.save();
        console.log('Course created:', course.code);
      }
    }

    console.log('Sample data seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;