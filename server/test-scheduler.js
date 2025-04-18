require('dotenv').config();
const Agenda = require('agenda');

// Initialize Agenda with direct connection logging
const agenda = new Agenda({
  db: { 
    address: process.env.MONGODB_URI, 
    collection: 'test_jobs',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  processEvery: '10 seconds',
});

// Log MongoDB URI (with password masked for security)
const mongoUri = process.env.MONGODB_URI || '';
const maskedUri = mongoUri.replace(/:([^@]+)@/, ':***@');
console.log(`Connecting to MongoDB: ${maskedUri}`);

// Define a simple test job
agenda.define('test job', async (job) => {
  console.log('Test job is running!', new Date());
  console.log('Job data:', job.attrs.data);
});

// Start the scheduler
const start = async () => {
  try {
    // Connect and start processing jobs
    await agenda.start();
    console.log('Agenda started successfully');

    // Schedule a test job to run every 10 seconds
    await agenda.every('10 seconds', 'test job', { testData: 'This is a test' });
    console.log('Test job scheduled to run every 10 seconds');

    // Also schedule a one-time job to run immediately
    await agenda.now('test job', { immediateJob: true });
    console.log('Immediate test job scheduled');
  } catch (error) {
    console.error('Failed to start Agenda:', error);
  }
};

// Start the test
start();

// Keep the process running
console.log('Test script is now running. Press Ctrl+C to exit.'); 