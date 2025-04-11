const Agenda = require('agenda');
const Note = require('../models/Note');
const { sendNoteEmail } = require('../utils/email');

// Initialize Agenda
const agenda = new Agenda({
  db: { address: process.env.MONGODB_URI, collection: 'jobs' },
  processEvery: '1 minute', // Check for jobs every minute
});

// Define job to check for notes to deliver
agenda.define('check notes for delivery', async (job) => {
  try {
    console.log('Running note delivery check...');
    
    // Find notes that should be delivered and haven't been delivered yet
    const currentDate = new Date();
    const notesToDeliver = await Note.find({
      deliveryDate: { $lte: currentDate },
      isDelivered: false,
    }).select('+encryptedContent');

    console.log(`Found ${notesToDeliver.length} notes to deliver`);

    // Process each note
    for (const note of notesToDeliver) {
      try {
        // Decrypt content before sending
        note.content = note.decryptContent();
        
        // If a recipient email is set, send an email
        if (note.recipient && note.recipient.email) {
          // Generate a shareable link if not already generated
          if (!note.shareableLink) {
            note.generateShareableLink();
          }
          
          // Send email notification
          await sendNoteEmail({
            email: note.recipient.email,
            note: note,
            accessUrl: note.shareableLink,
          });
          
          console.log(`Email sent to ${note.recipient.email} for note ${note._id}`);
        }
        
        // Mark as delivered
        note.isDelivered = true;
        note.deliveredAt = new Date();
        
        await note.save();
        console.log(`Note ${note._id} marked as delivered`);
      } catch (noteError) {
        console.error(`Error processing note ${note._id}:`, noteError);
      }
    }
  } catch (err) {
    console.error('Error in note delivery job:', err);
  }
});

// Start scheduler
exports.startScheduler = async () => {
  try {
    // Start agenda
    await agenda.start();
    console.log('Note delivery scheduler started');
    
    // Schedule the job to run every hour
    await agenda.every('1 hour', 'check notes for delivery');
    console.log('Scheduled note delivery checks every hour');
  } catch (err) {
    console.error('Error starting scheduler:', err);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  await agenda.stop();
  process.exit(0);
}); 