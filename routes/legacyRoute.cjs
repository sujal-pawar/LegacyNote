const express = require('express');
const multer = require('multer');
const LegacyNote = require('../models/LegacyNote.cjs');
const nodemailer = require('nodemailer');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Route to create a legacy note
router.post('/create', upload.array('media', 5), async (req, res) => {
  try {
    const { name, email, message, deliveryDate } = req.body;
    const mediaFiles = req.files.map(file => file.path);

    // Save the LegacyNote to DB
    const legacyNote = new LegacyNote({
      name,
      email,
      message,
      deliveryDate,
      media: mediaFiles,
    });

    await legacyNote.save();

    // Send email to the user
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'LegacyNote Submission Confirmation',
      text: `Dear ${name}, your LegacyNote has been successfully submitted!`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.status(201).json({ message: 'LegacyNote created and email sent!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong!' });
  }
});

module.exports = router;
