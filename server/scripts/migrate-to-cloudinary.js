/**
 * Migration Script: Migrate local files to Cloudinary
 * 
 * This script finds all notes in the database that have local file paths
 * and migrates the files to Cloudinary, updating the database records.
 * 
 * Usage: node scripts/migrate-to-cloudinary.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { migrateFileToCloudinary } = require('../utils/cloudinaryHelper');
const Note = require('../models/Note');
const connectDB = require('../config/db');

// Configuration
const DRY_RUN = process.env.DRY_RUN === 'true'; // Set to true to test without saving changes
const BATCH_SIZE = 10; // Number of notes to process at once

async function migrateFiles() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Connected to database successfully.');

    // Find all notes with media files
    const notesWithFiles = await Note.find({ 
      'mediaFiles.0': { $exists: true } 
    }).populate('user', 'id');

    console.log(`Found ${notesWithFiles.length} notes with media files.`);
    
    if (DRY_RUN) {
      console.log('DRY RUN MODE: No changes will be saved.');
    }

    let migratedCount = 0;
    let errorCount = 0;

    // Process notes in batches
    for (let i = 0; i < notesWithFiles.length; i += BATCH_SIZE) {
      const batch = notesWithFiles.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${i/BATCH_SIZE + 1} of ${Math.ceil(notesWithFiles.length/BATCH_SIZE)}`);
      
      // Process each note in the batch
      for (const note of batch) {
        try {
          console.log(`\nProcessing note: ${note._id}`);
          const userId = note.user ? note.user.id || note.user : 'unknown';
          let filesChanged = false;
          
          // Process each media file in the note
          for (let i = 0; i < note.mediaFiles.length; i++) {
            const file = note.mediaFiles[i];
            
            // Check if the file is stored locally (not in Cloudinary)
            if (file.filePath && !file.filePath.includes('cloudinary.com')) {
              console.log(`Migrating file: ${file.fileName}`);
              
              // Ensure the file path is correct
              const filePath = path.isAbsolute(file.filePath) 
                ? file.filePath 
                : path.join(__dirname, '..', file.filePath);
              
              // Check if file exists
              if (!fs.existsSync(filePath)) {
                console.error(`  ❌ File not found: ${filePath}`);
                errorCount++;
                continue;
              }
              
              // Migrate file to Cloudinary
              const result = await migrateFileToCloudinary(filePath, userId);
              
              if (result.success) {
                console.log(`  ✅ File migrated: ${result.url}`);
                
                // Update file information in the note
                if (!DRY_RUN) {
                  note.mediaFiles[i].filePath = result.url;
                  filesChanged = true;
                }
                
                migratedCount++;
              } else {
                console.error(`  ❌ Migration failed: ${result.error}`);
                errorCount++;
              }
            } else {
              console.log(`File already in Cloudinary or has remote URL: ${file.fileName}`);
            }
          }
          
          // Save the note if files were changed
          if (filesChanged && !DRY_RUN) {
            await note.save();
            console.log(`Note ${note._id} updated with new file paths.`);
          }
        } catch (noteError) {
          console.error(`Error processing note ${note._id}:`, noteError);
          errorCount++;
        }
      }
    }

    console.log('\n===== Migration Summary =====');
    console.log(`Total notes processed: ${notesWithFiles.length}`);
    console.log(`Files migrated: ${migratedCount}`);
    console.log(`Errors: ${errorCount}`);
    
    if (DRY_RUN) {
      console.log('\nThis was a DRY RUN. No changes were saved to the database.');
      console.log('Run again without DRY_RUN=true to apply changes.');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run the migration
migrateFiles().catch(console.error); 