const Agenda = require('agenda');
const Note = require('../models/Note');
const User = require('../models/User');
const { sendNoteEmail } = require('../utils/email');

// Helper function to get the frontend URL with fallback
const getFrontendUrl = () => {
  return process.env.FRONTEND_URL || 'http://localhost:5173';
};

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
    })
    .select('+encryptedContent +accessKey')
    .populate('user', 'name email'); // Populate user information to get sender name

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
          } else {
            // Check if the existing link has the undefined issue
            if (note.shareableLink.includes('undefined/')) {
              // Fix the URL by regenerating it
              const frontendUrl = getFrontendUrl();
              const accessKey = note.accessKey || Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
              note.accessKey = accessKey;
              note.shareableLink = `${frontendUrl}/shared-note/${note._id}/${accessKey}`;
              console.log(`Fixed invalid shareable link for note ${note._id}: ${note.shareableLink}`);
            }
          }
          
          // Get sender name for the email
          const senderName = note.user.name || 'Someone';
          
          // Send email notification
          await sendNoteEmail({
            email: note.recipient.email,
            note: note,
            accessUrl: note.shareableLink,
            senderName: senderName
          });
          
          console.log(`Email sent to ${note.recipient.email} for note ${note._id} from ${senderName}`);
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
    
    // Schedule the job to run every minute
    await agenda.every('1 minute', 'check notes for delivery');
    console.log('Scheduled note delivery checks every minute');
  } catch (err) {
    console.error('Error starting scheduler:', err);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  await agenda.stop();
  process.exit(0);
}); 