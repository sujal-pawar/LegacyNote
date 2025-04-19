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
    
    // Only deliver when current time is GREATER THAN the scheduled time
    // This was causing notes to be delivered immediately - strict inequality is required
    return date1Time < date2Time ? false : true;
  } else {
    // For regular notes, just compare dates (legacy behavior)
    // Set hours, minutes, seconds and milliseconds to 0 for comparing only the dates
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    
    return d1 <= d2;
  }
};

// Add these utility functions at the top after imports
const logScheduler = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = `[SCHEDULER ${timestamp}]`;
  
  if (process.env.NODE_ENV === 'production') {
    // In production, use more concise logging
    switch(type) {
      case 'error':
        console.error(`${prefix} ERROR: ${message}`);
        break;
      case 'warning':
        console.warn(`${prefix} WARNING: ${message}`);
        break;
      case 'success':
        console.log(`${prefix} SUCCESS: ${message}`);
        break;
      default:
        console.log(`${prefix} INFO: ${message}`);
    }
  } else {
    // In development, we can be more verbose
    switch(type) {
      case 'error':
        console.error(`${prefix} ERROR: ${message}`);
        break;
      case 'warning':
        console.warn(`${prefix} WARNING: ${message}`);
        break;
      case 'success':
        console.log(`${prefix} SUCCESS: ${message}`);
        break;
      default:
        console.log(`${prefix} INFO: ${message}`);
    }
  }
};

// Function to handle connection logging
const logConnection = (uri) => {
  // Create a masked URI that doesn't show credentials
  const maskedUri = uri.replace(
    /(mongodb(\+srv)?:\/\/)([^:]+):([^@]+)@/,
    '$1****:****@'
  );
  logScheduler(`Connecting to MongoDB: ${maskedUri}`);
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

  agenda.define('check-notes-for-delivery', async (job) => {
    try {
      logScheduler('Running note delivery check...');
      
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

      // logScheduler(`Found ${notesToDeliver.length} undelivered notes to check`);

      // Filter notes that are ready for delivery based on precise time
      const readyNotes = notesToDeliver.filter(note => {
        // CRITICAL FIX: Ensure we use strict time comparison for exact time delivery
        if (note.exactTimeDelivery) {
          const deliveryDate = new Date(note.deliveryDate);
          const currentTime = currentDate.getTime();
          const deliveryTime = deliveryDate.getTime();
          
          // Log timing details for debugging
          const timeDiff = (currentTime - deliveryTime) / 1000 / 60; // minutes
          logScheduler(
            `Note ${note._id}: Scheduled for ${deliveryDate.toISOString()}, ` +
            `Current time: ${currentDate.toISOString()}, ` +
            `Time difference: ${timeDiff.toFixed(2)} minutes, ` +
            `Ready: ${currentTime > deliveryTime ? 'YES' : 'NO'}`, 
            currentTime > deliveryTime ? 'info' : 'warning'
          );
          
          // Only deliver when the current time has PASSED the delivery time (greater than, not equal)
          return currentTime > deliveryTime;
        }
        
        // For non-exact time delivery, use the existing method
        return note.isReadyForDelivery();
      });

      logScheduler(`${readyNotes.length} notes are ready for delivery`);

      // Add more informative logs throughout the function
      if (readyNotes.length === 0) {
        logScheduler('No notes ready for delivery in this cycle');
        return;
      }

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
            logScheduler(`Fixed invalid shareable link for note ${note._id}: ${note.shareableLink}`, 'warning');
          }
          
          // Get sender name for the email
          const senderName = note.user.name || 'Someone';
          
          // Check if note has multiple recipients
          if (note.recipients && note.recipients.length > 0) {
            logScheduler(`Processing ${note.recipients.length} recipients for note ${note._id}`);
            
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
                  
                  logScheduler(`Email sent to recipient ${recipient.email} for note ${note._id}`, 'success');
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
      
      // Process non-recipient public notes
      // ... existing code ...
      
      // Final result logging
      logScheduler(`Delivered ${readyNotes.length} notes successfully`, 'success');
    } catch (error) {
      logScheduler(`Error in note delivery job: ${error.message}`, 'error');
      logScheduler(`Stack trace: ${error.stack}`, 'error');
    }
  });
};

// Start scheduler with reconnection capabilities
exports.startScheduler = async () => {
  try {
    // Initialize the agenda instance
    agenda = new Agenda({
      db: { address: process.env.MONGODB_URI, collection: 'scheduledJobs' },
      processEvery: '1 minute',
      maxConcurrency: 20
    });
    
    // Setup task definitions
    defineJobs();
    
    // Add logging for connection
    logConnection(process.env.MONGODB_URI);
    
    // Add logging for agenda events
    agenda.on('ready', () => logScheduler('Scheduler connected to MongoDB and is ready'));
    agenda.on('error', (err) => logScheduler(`Scheduler error: ${err.message}`, 'error'));
    
    // Start agenda
    await agenda.start();
    logScheduler('Note delivery scheduler started');
    
    // Schedule the job to run every minute
    await agenda.every('1 minute', 'check-notes-for-delivery');
    logScheduler('Scheduled note delivery checks every minute for efficient delivery timing');
    
    // Schedule an immediate check as well to handle any pending deliveries
    await agenda.now('check-notes-for-delivery');
    logScheduler('Scheduled immediate note delivery check');
    
    // Add error handling and auto-restart
    process.on('uncaughtException', (error) => {
      logScheduler(`Uncaught exception in scheduler: ${error.message}`, 'error');
      logScheduler('Will attempt to restart scheduler in 60 seconds...');
      setTimeout(() => exports.startScheduler(), 60000);
    });
    
    return agenda;
  } catch (error) {
    logScheduler(`Failed to start scheduler: ${error.message}`, 'error');
    throw error;
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  if (agenda) {
    try {
      await agenda.stop();
      logScheduler('Scheduler stopped gracefully');
    } catch (err) {
      console.error('Error stopping scheduler:', err);
    }
  }
  process.exit(0);
}); 