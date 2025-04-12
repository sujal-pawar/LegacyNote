# LegacyNote - Secure Digital Time Capsule Platform

LegacyNote is a full-stack web application that allows users to create, store, protect, and schedule delivery of long-term notes, messages, and documents. It's designed to serve as a digital time capsule, ensuring your words stand the test of time and are delivered precisely when you intend.

## Features

- **Long-Term Note Storage:** Create and save personal notes, letters, or documents with robust encryption.
- **Future Delivery Scheduler:** Schedule notes for delivery in the future (up to 10+ years).
- **End-to-End Security:** All notes are encrypted for maximum security and privacy.
- **User Authentication:** Secure JWT-based authentication system.
- **Shareable Notes:** Generate special links to share your notes with others.
- **Email Notifications:** Automatic email delivery when notes are released.

## Tech Stack

- **Frontend:** React.js with React Router
- **Backend:** Node.js + Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT-based authentication
- **Scheduler:** Agenda.js for timed note delivery
- **Encryption:** AES encryption for note content

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14+)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/legacynote.git
cd legacynote
```

### 2. Backend Setup

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create a .env file and add your configuration
# You can use the .env.example as a template
cp .env.example .env
```

Edit the `.env` file to include your specific configuration:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/legacynote
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=30d
ENCRYPTION_KEY=your_encryption_key_change_in_production
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
EMAIL_FROM=noreply@legacynote.com
```

### 3. Frontend Setup

```bash
# Navigate to the client directory
cd ../client

# Install dependencies
npm install
```

### 4. Running the Application

#### Start the Backend Server

```bash
# From the server directory
npm run dev
```

This will start the server on http://localhost:5000.

#### Start the Frontend Development Server

```bash
# From the client directory
npm run dev
```

This will start the React app on http://localhost:5173.

## Usage

1. **Registration/Login:** Create an account or log in with your credentials.
2. **Create Notes:** Write and schedule your notes for future delivery.
3. **Dashboard:** Manage all your created notes from one place.
4. **Sharing:** Generate special links to share specific notes with others.

## Deployment

For production deployment, consider:
- Using environment variables for all secrets
- Setting up proper HTTPS
- Implementing additional security measures
- Using a production-grade MongoDB setup

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Agenda.js](https://github.com/agenda/agenda)
- [JWT](https://jwt.io/)
- [CryptoJS](https://github.com/brix/crypto-js) 