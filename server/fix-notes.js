require('dotenv').config();
const mongoose = require('mongoose');
const Note = require('./models/Note');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Find and fix notes with delivery issues
const fixNotes = async () => {
  try {
    // Find notes that are undelivered
    const undeliveredNotes = await Note.find({ isDelivered: false })
      .select('+encryptedContent +accessKey');
    
    console.log(`Found ${undeliveredNotes.length} undelivered notes`);
    
    // Loop through each note and check for delivery issues
    for (const note of undeliveredNotes) {
      console.log(`Checking note ${note._id} (${note.title})`);
      
      let needsSave = false;
      let issues = [];
      
      // Check if note has recipients
      if ((!note.recipients || note.recipients.length === 0) && 
          (!note.recipient || !note.recipient.email)) {
        issues.push('No recipients defined');
        
        // Make the note public by default if it has no recipients
        if (!note.isPublic) {
          note.isPublic = true;
          needsSave = true;
          issues.push('Set to public');
        }
        
        // Generate shareable link if missing
        if (!note.shareableLink) {
          note.generateShareableLink();
          needsSave = true;
          issues.push('Generated shareable link');
        }
      }
      
      // Check if delivery date is in the past and note is ready for delivery
      const now = new Date();
      const deliveryDate = new Date(note.deliveryDate);
      
      if (deliveryDate <= now) {
        issues.push('Delivery date has passed');
        
        // If note has issues and is ready for delivery, mark as delivered
        if (issues.length > 0 && !note.isDelivered) {
          note.isDelivered = true;
          note.deliveredAt = new Date();
          needsSave = true;
          issues.push('Marked as delivered');
        }
      }
      
      // Save changes if needed
      if (needsSave) {
        await note.save();
        console.log(`Fixed note ${note._id}: ${issues.join(', ')}`);
      } else if (issues.length > 0) {
        console.log(`Note ${note._id} has issues but no changes made: ${issues.join(', ')}`);
      } else {
        console.log(`Note ${note._id} appears to be fine`);
      }
    }
    
    console.log('Note fix process completed');
  } catch (error) {
    console.error('Error fixing notes:', error);
  }
};

// Run the script
const main = async () => {
  await connectDB();
  await fixNotes();
  
  // Disconnect from MongoDB
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
};

main().catch(error => {
  console.error('Script error:', error);
  process.exit(1);
}); 