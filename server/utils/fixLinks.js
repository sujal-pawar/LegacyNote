/**
 * Utility script to fix any existing "undefined" links in the database
 * Run this script with: node server/utils/fixLinks.js
 */

const mongoose = require('mongoose');
require('dotenv').config();
const Note = require('../models/Note');

// Helper function to get the frontend URL with fallback
const getFrontendUrl = () => {
  return process.env.FRONTEND_URL || 'http://localhost:5173';
};

const fixLinks = async () => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all notes with undefined in their shareable links
    const invalidLinkNotes = await Note.find({
      shareableLink: { $regex: 'undefined/', $options: 'i' }
    }).select('+accessKey');

    console.log(`Found ${invalidLinkNotes.length} notes with invalid shareable links`);

    // Fix each note
    for (const note of invalidLinkNotes) {
      try {
        const frontendUrl = getFrontendUrl();
        
        // Use existing accessKey or generate a new one
        const accessKey = note.accessKey || Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        
        // Create the correct shareable link
        const oldLink = note.shareableLink;
        const newLink = `${frontendUrl}/shared-note/${note._id}/${accessKey}`;
        
        // Update directly in the database to avoid validation issues
        await Note.findByIdAndUpdate(
          note._id,
          { 
            $set: { 
              shareableLink: newLink, 
              accessKey: accessKey 
            } 
          },
          { 
            validateBeforeSave: false,
            new: true
          }
        );
        
        console.log(`Fixed link for note ${note._id}:`);
        console.log(`  Old: ${oldLink}`);
        console.log(`  New: ${newLink}`);
      } catch (noteError) {
        console.error(`Error fixing note ${note._id}:`, noteError);
      }
    }

    console.log('Finished fixing links');
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error fixing links:', error);
    process.exit(1);
  }
};

// Run the fix function
fixLinks(); 