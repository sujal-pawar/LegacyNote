const Agenda = require('agenda');
const Note = require('../models/Note');
const User = require('../models/User');
const { sendNoteEmail } = require('../utils/email');

// Helper function to get the frontend URL with fallback
const getFrontendUrl = () => {
  return process.env.FRONTEND_URL || 'http://localhost:5173';
};

// Helper function to compare dates with precision for exact delivery time
const isSameOrBefore = (date1, date2, exactTime = false) => {
  // Create copies to avoid modifying the original dates
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  if (exactTime) {
    // For exactTimeDelivery notes, compare with a small tolerance window
    // Convert both to timestamps for easy comparison
    const date1Time = d1.getTime();
    const date2Time = d2.getTime();
    
    // Consider "on time" if current time is within 30 seconds after scheduled time
    // or any time after the scheduled time
    return date1Time <= date2Time;
  } else {
    // For regular notes, just compare dates (legacy behavior)
    // Set hours, minutes, seconds and milliseconds to 0 for comparing only the dates
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    
    return d1 <= d2;
  }
};

// Initialize Agenda with improved error handling
let agenda = null;
const initializeAgenda = () => {
  // Check if we already have an agenda instance
  if (agenda) {
    try {
      // Try to gracefully disconnect if we're reinitializing
      agenda.stop();
    } catch (err) {
      console.error('Error stopping previous agenda instance:', err);
    }
  }

  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error('MONGODB_URI not set in environment variables');
    return null;
  }

  // Log connection attempt (mask password for security)
  const maskedUri = mongoURI.replace(/:([^@]+)@/, ':***@');
  // console.log(`Scheduler connecting to MongoDB: ${maskedUri}`);

  // Create new agenda instance with better mongo options
  agenda = new Agenda({
    db: { 
      address: mongoURI, 
      collection: 'jobs',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    },
    processEvery: '30 seconds', // Check for jobs every 30 seconds for more precise delivery
  });

  // // Add agenda monitoring
  // agenda.on('ready', () => console.log('Agenda connected to MongoDB and is ready'));
  // agenda.on('error', (err) => console.error('Agenda connection error:', err));

  return agenda;
};

// Define job to check for notes to deliver
const defineJobs = () => {
  if (!agenda) return;

  agenda.define('check notes for delivery', async (job) => {
    try {
      // console.log('Running note delivery check...');
      
      // Find notes that should be delivered and haven't been delivered yet
      const currentDate = new Date();
      let notesToDeliver;
      
      try {
        notesToDeliver = await Note.find({
          isDelivered: false,
        })
        .select('+encryptedContent +accessKey')
        .populate('user', 'name email'); // Populate user information to get sender name
      } catch (findError) {
        console.error('Failed to query notes from database:', findError);
        return;
      }

      // console.log(`Found ${notesToDeliver.length} undelivered notes to check`);

      // Filter notes that are ready for delivery based on precise time
      const readyNotes = notesToDeliver.filter(note => {
        const deliveryDate = new Date(note.deliveryDate);
        return isSameOrBefore(deliveryDate, currentDate, note.exactTimeDelivery);
      });

      // console.log(`${readyNotes.length} notes are ready for delivery`);

      // Process each note
      for (const note of readyNotes) {
        try {
          // Keep track of whether all emails were sent successfully
          let allEmailsSent = true;
          
          // Decrypt content before sending
          note.content = note.decryptContent();
          
          // Generate a shareable link if not already generated
          if (!note.shareableLink) {
            note.generateShareableLink();
          } else if (note.shareableLink.includes('undefined/')) {
            // Fix the URL by regenerating it
            const frontendUrl = getFrontendUrl();
            const accessKey = note.accessKey || Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
            note.accessKey = accessKey;
            note.shareableLink = `${frontendUrl}/shared-note/${note._id}/${accessKey}`;
            // console.log(`Fixed invalid shareable link for note ${note._id}: ${note.shareableLink}`);
          }
          
          // Get sender name for the email
          const senderName = note.user.name || 'Someone';
          
          // Check if note has multiple recipients
          if (note.recipients && note.recipients.length > 0) {
            // console.log(`Processing ${note.recipients.length} recipients for note ${note._id}`);
            
            // Track if any emails were attempted (to handle empty recipient lists)
            let emailsAttempted = false;
            
            // Send to each recipient
            for (const recipient of note.recipients) {
              if (recipient.email) {
                emailsAttempted = true;
                try {
                  // Customize subject for self-messages
                  let emailSubject = null;
                  if (note.isSelfMessage || (note.user.email === recipient.email)) {
                    emailSubject = `Your scheduled message "${note.title}" has arrived`;
                  }
                  
                  // Send email notification
                  await sendNoteEmail({
                    email: recipient.email,
                    note: note,
                    accessUrl: note.shareableLink,
                    senderName: senderName,
                    subject: emailSubject
                  });
                  
                  // console.log(`Email sent to recipient ${recipient.email} for note ${note._id} from ${senderName}`);
                } catch (emailError) {
                  console.error(`Failed to send email to ${recipient.email} for note ${note._id}:`, emailError);
                  allEmailsSent = false;
                }
              }
            }
            
            // If no emails were attempted (empty recipient list), set to false to prevent marking as delivered
            if (!emailsAttempted) {
              console.error(`Note ${note._id} has recipients array but no valid email addresses`);
              allEmailsSent = false;
            }
          }
          // Fall back to legacy single recipient
          else if (note.recipient && note.recipient.email) {
            try {
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
            } catch (emailError) {
              console.error(`Failed to send email to ${note.recipient.email} for note ${note._id}:`, emailError);
              allEmailsSent = false;
            }
          } else {
            // Check if this is a public note without recipients - these should still be marked as delivered
            if (note.isPublic) {
              console.log(`Note ${note._id} is public but has no recipients - will be marked as delivered anyway`);
              // Keep allEmailsSent as true for public notes with no recipients
              allEmailsSent = true;
            } 
            // Special case to fix specific notes that are stuck in the system
            else if (note._id.toString() === '68028fdaa635da0e48f452f2') {
              // console.log(`Force-delivering stuck note with ID ${note._id}`);
              allEmailsSent = true;
            }
            else {
              console.error(`Note ${note._id} has no recipients defined`);
              allEmailsSent = false;
            }
          }
          
          // Only mark as delivered if all emails were sent successfully
          if (allEmailsSent) {
            // Mark as delivered
            note.isDelivered = true;
            note.deliveredAt = new Date();
            
            await note.save();
            
            if (note.isPublic && (!note.recipients || note.recipients.length === 0) && (!note.recipient || !note.recipient.email)) {
              // console.log(`Note ${note._id} marked as delivered (shared publicly without recipients)`);
            } else {
              // console.log(`Note ${note._id} marked as delivered after successful email delivery`);
            }
          } else {
            console.error(`Note ${note._id} NOT marked as delivered due to email delivery issues`);
          }
        } catch (noteError) {
          console.error(`Error processing note ${note._id}:`, noteError);
        }
      }
    } catch (err) {
      console.error('Error in note delivery job:', err);
    }
  });
};

// Start scheduler with reconnection capabilities
exports.startScheduler = async () => {
  try {
    // Initialize the agenda instance
    const instance = initializeAgenda();
    if (!instance) {
      console.error('Failed to initialize agenda');
      return;
    }
    
    // Define the jobs
    defineJobs();
    
    // Start agenda
    await agenda.start();
    // console.log('Note delivery scheduler started');
    
    // Schedule the job to run every 30 seconds
    await agenda.every('30 seconds', 'check notes for delivery');
    // console.log('Scheduled note delivery checks every 30 seconds for precise delivery timing');
    
    // Schedule an immediate check as well to handle any pending deliveries
    await agenda.now('check notes for delivery');
    // console.log('Scheduled immediate note delivery check');
  } catch (err) {
    console.error('Error starting scheduler:', err);
    
    // Try to restart after a delay if there was an error
    // console.log('Will attempt to restart scheduler in 60 seconds...');
    setTimeout(exports.startScheduler, 60000);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  if (agenda) {
    try {
      await agenda.stop();
      console.log('Scheduler stopped gracefully');
    } catch (err) {
      console.error('Error stopping scheduler:', err);
    }
  }
  process.exit(0);
}); 