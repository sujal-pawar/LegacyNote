const nodemailer = require('nodemailer');

// Helper function to get the frontend URL with fallback
const getFrontendUrl = () => {
  return process.env.FRONTEND_URL || 'http://localhost:5173';
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.message - Email message
 */
exports.sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const message = {
    from: `LegacyNote <${process.env.EMAIL_USERNAME}>`,
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
 * @param {String} options.subject - Email subject (optional)
 * @param {Object} options.note - Note object
 * @param {String} options.accessUrl - URL to access the note
 * @param {String} options.senderName - Name of the person who sent the note
 */
exports.sendNoteEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Include sender name in the subject if provided
  const senderName = options.senderName || 'Someone';
  const subject = options.subject || `A LegacyNote from ${senderName} has been delivered to you`;

  // Ensure we have a valid URL, check if the accessUrl already contains the frontend URL
  let accessUrl = options.accessUrl;
  if (accessUrl && !accessUrl.startsWith('http')) {
    // If it's a relative path, prepend the frontend URL
    const frontendUrl = getFrontendUrl();
    accessUrl = `${frontendUrl}${accessUrl.startsWith('/') ? '' : '/'}${accessUrl}`;
  }

  const message = {
    from: `LegacyNote <${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: subject,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your LegacyNote Has Arrived</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 650px;
            margin: 0 auto;
            padding: 0;
            background-color: #f9fafb;
          }
          .container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 40px;
            margin: 20px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #4f46e5;
            margin-bottom: 10px;
          }
          h1 {
            color: #1f2937;
            font-size: 32px;
            margin-bottom: 25px;
            text-align: center;
            line-height: 1.3;
          }
          p {
            font-size: 18px;
            margin-bottom: 20px;
            color: #4b5563;
          }
          .note-title {
            font-weight: bold;
            color: #4f46e5;
          }
          .sender-name {
            font-weight: bold;
            color: #4f46e5;
          }
          .button-container {
            text-align: center;
            margin: 35px 0;
          }
          .button {
            display: inline-block;
            background-color: #4f46e5;
            color: white !important;
            padding: 15px 30px;
            text-align: center;
            text-decoration: none;
            font-size: 20px;
            font-weight: 600;
            border-radius: 8px;
            transition: background-color 0.3s;
          }
          .button:hover {
            background-color: #4338ca;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 16px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">LegacyNote</div>
          </div>
          
          <h1>Your LegacyNote has arrived!</h1>
          
          <p>Hello,</p>
          
          <p>A special message from <span class="sender-name">${senderName}</span> titled "<span class="note-title">${options.note.title}</span>" has been delivered to you today.</p>
          
          <p>This moment was planned by ${senderName} in advance, and now the time has come for you to receive this message.</p>
          
          <div class="button-container">
            <a href="${accessUrl}" class="button">View Your LegacyNote</a>
          </div>
          
          <p>This secure link will take you directly to your note. Take a moment to reflect on the thoughts ${senderName} wanted to share with you today.</p>
          
          <div class="footer">
            <p>Thank you for using LegacyNote!</p>
            <p>Connecting people through time.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
  
  await transporter.sendMail(message);
};

/**
 * Send a note creation confirmation email
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {Object} options.note - Note object
 * @param {Object} options.user - User who created the note
 */
exports.sendNoteCreationConfirmation = async (options) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Format the delivery date for display
  const deliveryDate = new Date(options.note.deliveryDate);
  const formattedDate = deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Get frontend URL with fallback
  const frontendUrl = getFrontendUrl();
  const dashboardUrl = `${frontendUrl}/dashboard`;

  const message = {
    from: `LegacyNote <${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: `Your LegacyNote "${options.note.title}" has been scheduled`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your LegacyNote Has Been Scheduled</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 650px;
            margin: 0 auto;
            padding: 0;
            background-color: #f9fafb;
          }
          .container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 40px;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #4f46e5;
            margin-bottom: 10px;
          }
          h1 {
            color: #1f2937;
            font-size: 32px;
            margin-bottom: 25px;
            text-align: center;
            line-height: 1.3;
          }
          p {
            font-size: 18px;
            margin-bottom: 20px;
            color: #4b5563;
          }
          .highlight {
            font-weight: bold;
            color: #4f46e5;
          }
          .date-box {
            background-color: #f3f4f6;
            border-radius: 8px;
            padding: 15px;
            margin: 25px 0;
            text-align: center;
          }
          .date {
            font-size: 22px;
            font-weight: bold;
            color: #4f46e5;
          }
          .button-container {
            text-align: center;
            margin: 35px 0;
          }
          .button {
            display: inline-block;
            background-color: #4f46e5;
            color: white !important;
            padding: 15px 30px;
            text-align: center;
            text-decoration: none;
            font-size: 20px;
            font-weight: 600;
            border-radius: 8px;
            transition: background-color 0.3s;
          }
          .button:hover {
            background-color: #4338ca;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 16px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">LegacyNote</div>
          </div>
          
          <h1>Your Note Has Been Scheduled!</h1>
          
          <p>Hello ${options.user.name},</p>
          
          <p>Your LegacyNote titled "<span class="highlight">${options.note.title}</span>" has been successfully created and scheduled for delivery.</p>
          
          <div class="date-box">
            <p>Scheduled Delivery Date:</p>
            <p class="date">${formattedDate}</p>
          </div>
          
          ${options.note.recipient && options.note.recipient.email ? 
            `<p>This note will be delivered to <span class="highlight">${options.note.recipient.name || options.note.recipient.email}</span> on the scheduled date.</p>` : 
            `<p>This note will be available to you on the scheduled date.</p>`
          }
          
          <p>Your note content has been securely encrypted and stored in our system. The content of your note is not included in this email for security reasons.</p>
          
          <div class="button-container">
            <a href="${dashboardUrl}" class="button">View Your Dashboard</a>
          </div>
          
          <p>You can always view, edit, or delete this note from your dashboard before its delivery date.</p>
          
          <div class="footer">
            <p>Thank you for using LegacyNote!</p>
            <p>Connecting people through time.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
  
  await transporter.sendMail(message);
}; 