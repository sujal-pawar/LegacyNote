const nodemailer = require('nodemailer');

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.message - Email message
 */
exports.sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.EMAIL_FROM}`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(message);
};

/**
 * Send a note delivery email
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.note - Note object
 * @param {String} options.accessUrl - URL to access the note
 */
exports.sendNoteEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.EMAIL_FROM}`,
    to: options.email,
    subject: options.subject || 'Your LegacyNote has been delivered',
    html: `
      <h1>Your LegacyNote from the past has arrived!</h1>
      <p>A note titled "${options.note.title}" has been delivered to you.</p>
      <p>You can view this note by clicking the link below:</p>
      <a href="${options.accessUrl}">View Your Note</a>
      <p>This link will allow you to securely access the note.</p>
      <p>Thank you for using LegacyNote!</p>
    `,
  };

  await transporter.sendMail(message);
}; 