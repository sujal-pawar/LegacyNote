# LegacyNote - Digital Time Capsule Platform

<div align="center">
  
  <img src="client/src/assets/logo.png" alt="LegacyNote Logo" width="180" />
  
  <p><strong>Create digital time capsules that deliver your messages exactly when you want them to.</strong></p>
  
</div>

## 📋 Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Security Features](#security-features)
- [Contributors](#contributors)
- [License](#license)

## 🔍 Overview

LegacyNote is a sophisticated full-stack application that allows users to create encrypted time capsule messages with scheduled delivery dates. Whether it's a future birthday message, personal milestone, or legacy message, LegacyNote ensures your words are preserved and delivered exactly when intended.

## ✨ Key Features

- **Scheduled Message Delivery**: Set specific dates and times for message delivery
- **End-to-End Encryption**: All message content is encrypted using AES-256 for privacy and security
- **Media Attachments**: Include images, videos, documents, and audio files with your messages
- **Multiple Recipients**: Send to one or multiple email recipients 
- **Recipient Notifications**: Automatic email notifications when messages are delivered
- **Self-Messages**: Schedule messages to yourself as future reminders or reflections
- **Public/Private Toggle**: Choose to make messages shareable or private
- **Email Verification**: OTP verification system for account security
- **Google Authentication**: Single-sign on with Google account
- **Responsive Design**: Fully optimized for all device sizes from mobile to desktop
- **Dark Mode Support**: Toggle between light and dark themes

## 💻 Technology Stack

### Frontend
- React 19.0.0
- React Router DOM 6.30.0
- Tailwind CSS 3.3.3
- React Toastify 11.0.5
- @react-oauth/google for Google authentication
- Formik & Yup for form validation
- Date-fns 4.1.0 for date manipulation
- Framer Motion 12.6.5 for animations
- Vite 6.2.0 for development and building

### Backend
- Node.js
- Express.js 4.18.2
- MongoDB 8.13.2 with Mongoose ODM
- JWT Authentication (jsonwebtoken 9.0.2)
- Nodemailer 6.10.1 for email services
- Cloudinary for media storage
- Crypto-js 4.2.0 for encryption
- Agenda.js 5.0.0 for task scheduling
- Helmet 8.1.0 for security headers

## 🏗️ Architecture

LegacyNote employs a modern, decoupled architecture:

### Client Application
- Single-page React application with component-based architecture
- Context API for global state management
- Custom hooks for reusable logic
- Responsive design with Tailwind CSS

### Server API
- RESTful API built with Express
- MVC architecture with controllers, models, and routes
- Middleware for authentication, error handling, and request validation
- Robust error handling and logging

### Data Flow
1. User interactions trigger API requests from the client
2. Server authenticates and validates requests
3. Controllers process business logic and interact with database models
4. Responses are formatted and returned to the client
5. Task scheduler monitors for notes due for delivery
6. Email service sends notifications when notes are delivered

## 🚀 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (Atlas account)
- npm or yarn
- Google OAuth API credentials (for Google authentication)
- Cloudinary account (for media storage)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/legacynote.git
   cd legacynote
   ```

2. **Server Setup**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Client Setup**
   ```bash
   cd ../client
   npm install
   ```

4. **Database Setup**
   - Create a MongoDB Atlas account and cluster
   - Update MONGODB_URI in server/.env with your connection string

5. **Start Development Environment**
   ```bash
   # Start the server (from server directory)
   npm run dev
   
   # Start the client (from client directory)
   npm run dev
   ```

## 📝 Usage

### Development Environment

**Run Backend Only**
```bash
cd server
npm run dev
```
The server will start on http://localhost:5000 with nodemon for auto-reloading.

**Run Frontend Only**
```bash
cd client
npm run dev
```
The development server will start on http://localhost:5173 with hot module replacement.

### Scheduler Status

When the server starts, the note delivery scheduler will initialize and display:
```
[SCHEDULER] INFO: Note Delivery Scheduler running...
[SCHEDULER] INFO: Scheduled note delivery checks every minute
```

This indicates the background process is properly monitoring the database for notes that need to be delivered.

### Key Application Workflows

1. **User Registration & Authentication**
   - Register with email and password or Google OAuth
   - Verify email with OTP
   - Login to access dashboard

2. **Creating a Time Capsule Note**
   - Fill in recipient details, delivery date, and content
   - Attach media files if desired
   - Select public/private status
   - Submit and confirm scheduling

3. **Managing Notes**
   - View all notes from dashboard
   - Edit or delete notes before delivery date
   - Generate shareable links for public notes
   - Track delivery status

4. **Note Delivery Process**
   - System monitors for notes reaching delivery date
   - Recipient receives email notification
   - Recipient can access note via secure link
   - Original creator can see delivery confirmation

## 🌐 Deployment

### Current Deployment Configuration

Our application is hosted using the following services:

1. **MongoDB Atlas** for database hosting
   - Provides robust cloud database storage
   - Automatic backups and scaling
   - Global distribution for reduced latency

2. **Backend Hosting on Render**
   - Node.js application hosted on Render's web service
   - Automatic deployments from GitHub repository
   - Built-in SSL/TLS certificates and HTTPS support
   - Horizontal scaling capabilities as needed

3. **Frontend Hosting on Vercel**
   - React application deployed on Vercel's platform
   - Automatic deployments from GitHub repository
   - Global CDN for fast content delivery
   - Built-in analytics and performance monitoring

### Environment Configuration
- Set NODE_ENV=production in Render environment settings
- Configure all environment variables in Render dashboard
- Set secure MongoDB connection string with network restrictions
- Add CORS configuration to allow requests from Vercel domain

### Build & Deploy

#### Render Backend Deployment
- Connect your GitHub repository to Render
- Configure as a Web Service with Node.js runtime
- Set build command: `npm install`
- Set start command: `npm start`
- Add all environment variables in the Render dashboard

#### Vercel Frontend Deployment
- Connect your GitHub repository to Vercel
- Configure as a Vite/React project
- Add `vercel.json` to handle client-side routing:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```
- Add environment variables in the Vercel dashboard

## ⚙️ Environment Variables

### Server Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | production |
| MONGODB_URI | MongoDB connection | mongodb+srv://user:pass@cluster.mongodb.net/legacynote |
| JWT_SECRET | JWT signing secret | your-secret-key |
| JWT_EXPIRE | JWT expiration | 30d |
| EMAIL_USERNAME | SMTP email | your-email@gmail.com |
| EMAIL_PASSWORD | SMTP password | your-app-password |
| FRONTEND_URL | Client URL | https://yourdomain.com |
| ENCRYPTION_KEY | Encryption key | your-encryption-key |
| CLOUDINARY_CLOUD_NAME | Cloudinary name | your-cloud-name |
| CLOUDINARY_API_KEY | Cloudinary key | your-api-key |
| CLOUDINARY_API_SECRET | Cloudinary secret | your-api-secret |
| CLOUDINARY_UPLOAD_FOLDER | Cloudinary folder | legacy_note_uploads |

### Client Variables

| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | https://api.yourdomain.com/api |
| VITE_GOOGLE_CLIENT_ID | Google OAuth ID | your-google-client-id.apps.googleusercontent.com |

## 🔒 Security Features

- **Data Encryption**: All note content is encrypted with AES-256
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **JWT Authentication**: Short-lived tokens with refresh mechanism
- **CSRF Protection**: Token validation for cross-site request forgery protection
- **XSS Prevention**: Content Security Policy via Helmet
- **Email Verification**: Required for account security
- **Secure File Handling**: Validation and sanitization of uploaded files
- **Cloudinary Secure URLs**: HTTPS-only media delivery

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<p align="center">
  Made with ❤️ by the LegacyNote Team
</p>
