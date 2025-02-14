const express = require('express');
const multer = require('multer');
const LegacyNote = require('../models/LegacyNote.cjs');
const nodemailer = require('nodemailer');
// const path = require('path');
require('dotenv').config();

const router = express.Router();

// Set up storage for multer to save files in the 'uploads' directory
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, './uploads/');
  },
  filename: (_, file, cb) => {
    // Generate a unique filename using the current timestamp and original file name
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Initialize multer with storage configuration and file validation
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (_, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Route to create a legacy note
router.post('/create', upload.array('media', 5), async (req, res) => {
  try {
    // Get form data from the request body and files from the request
    const { name, email, message, deliveryDate } = req.body;
    const mediaFiles = req.files ? req.files.map(file => file.path) : [];

    // Create a new LegacyNote instance with form data and media paths
    const legacyNote = new LegacyNote({
      name,
      email,
      message,
      deliveryDate,
      media: mediaFiles, // Store file paths of the uploaded media
    });

    // Save the LegacyNote to the database
    await legacyNote.save();

    // Set up the email transporter to send a confirmation email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Define the email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'LegacyNote Submission Confirmation 🌟',
      text: `Dear ${name},\n\nThank you for submitting your LegacyNote! 
      🌟\n\nWe have successfully received your message and media files.
      Your note will be delivered on the specified date: ${deliveryDate}.\n\n
      We appreciate your trust in us to deliver your heartfelt message.
      If you have any questions or need further assistance, please feel free to reach out to us.\n\nBest regards,\n
      The LegacyNote Team 💌`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    // Send a success response to the client
    res.status(201).json({ message: 'LegacyNote created and email sent!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong!' });
  }
});

module.exports = router;
