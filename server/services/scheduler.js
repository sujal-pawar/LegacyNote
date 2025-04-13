const Agenda = require('agenda');
const Note = require('../models/Note');
const User = require('../models/User');
const { sendNoteEmail } = require('../utils/email');

// Helper function to get the frontend URL with fallback
const getFrontendUrl = () => {
  return process.env.FRONTEND_URL || 'http://localhost:5173';
};

// Helper function to compare dates ignoring seconds and milliseconds
// This provides a more precise delivery time for notes
const isSameOrBefore = (date1, date2) => {
  // Create copies to avoid modifying the original dates
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // Set seconds and milliseconds to 0 for comparing the dates up to minutes
  d1.setSeconds(0, 0);
  d2.setSeconds(0, 0);
  
  return d1 <= d2;
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
      isDelivered: false,
    })
    .select('+encryptedContent +accessKey')
    .populate('user', 'name email'); // Populate user information to get sender name

    console.log(`Found ${notesToDeliver.length} undelivered notes to check`);

    // Filter notes that are ready for delivery based on precise time
    const readyNotes = notesToDeliver.filter(note => {
      const deliveryDate = new Date(note.deliveryDate);
      return isSameOrBefore(deliveryDate, currentDate);
    });

    console.log(`${readyNotes.length} notes are ready for delivery`);

    // Process each note
    for (const note of readyNotes) {
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
          
          // Customize subject for self-messages
          let emailSubject = null;
          if (note.isSelfMessage || (note.user.email === note.recipient.email)) {
            emailSubject = `Your scheduled message "${note.title}" has arrived`;
          }
          
          // Send email notification
          await sendNoteEmail({
            email: note.recipient.email,
            note: note,
            accessUrl: note.shareableLink,
            senderName: senderName,
            subject: emailSubject
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