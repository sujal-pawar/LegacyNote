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
          
          <h1>Your LegacyNote from the past has arrived!</h1>
          
          <p>Hello,</p>
          
          <p>A special message from your past self titled "<span class="note-title">${options.note.title}</span>" has been delivered to you today.</p>
          
          <p>This moment was planned in advance, and now the time has come for you to receive this message.</p>
          
          <div class="button-container">
            <a href="${options.accessUrl}" class="button">View Your LegacyNote</a>
          </div>
          
          <p>This secure link will take you directly to your note. Take a moment to reflect on the thoughts your past self wanted to share with you today.</p>
          
          <div class="footer">
            <p>Thank you for using LegacyNote!</p>
            <p>Connecting your past, present, and future self.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
  

  await transporter.sendMail(message);
}; 