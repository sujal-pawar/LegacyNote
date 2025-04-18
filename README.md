# LegacyNote - Secure Digital Time Capsule Platform

LegacyNote is a full-stack web application that allows users to create, store, protect, and schedule delivery of long-term notes, messages, and documents. It's designed to serve as a digital time capsule, ensuring your words stand the test of time and are delivered precisely when you intend.

![LegacyNote Platform](https://placeholder-for-legacynote-screenshot.png)

## 🚀 Features

- **Time Capsule Notes**: Create and schedule notes that will be delivered at specific dates in the future
- **Recipient Management**: Send notes to multiple recipients with email notification
- **Media Support**: Attach images and files to your notes
- **Secure Email Verification**: OTP-based email verification system
- **Rich Text Editing**: Format your notes with a comprehensive editor
- **Mobile Responsive**: Fully responsive design that works on all devices
- **Dark Mode Support**: Toggle between light and dark themes
- **Secure Authentication**: JWT-based authentication with Google OAuth integration
- **User Dashboard**: Manage all your notes from a central dashboard
- **Sharing Functionality**: Generate shareable links for your notes

## 🛠️ Tech Stack

### Frontend
- React 19
- React Router v6
- Formik & Yup for form validation
- Tailwind CSS for styling
- React Toastify for notifications
- Google OAuth integration

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Nodemailer for email services
- Cloudinary for media storage
- Agenda.js for scheduled tasks

## 📁 Project Structure

```
legacynote/
├── client/                      
│   ├── public/                  
│   └── src/
│       ├── api/                 
│       ├── assets/              
│       ├── components/          
│       │   ├── Navbar.jsx       
│       │   ├── Footer.jsx       
│       │   ├── PrivateRoute.jsx 
│       │   └── ...
│       ├── contexts/            
│       │   ├── AuthContext.jsx  
│       │   └── ThemeContext.jsx 
│       ├── pages/               
│       │   ├── Dashboard.jsx    
│       │   ├── Login.jsx        
│       │   ├── Register.jsx     
│       │   ├── CreateNote.jsx   
│       │   ├── ViewNote.jsx     
│       │   ├── EditNote.jsx     
│       │   ├── VerifyEmail.jsx  
│       │   └── ...
│       ├── routes/              
│       ├── utils/               
│       ├── App.jsx              
│       └── main.jsx             
│
├── server/                      
│   ├── config/                  
│   ├── controllers/             
│   ├── middleware/              
│   ├── models/                  
│   ├── routes/                  
│   ├── services/                
│   ├── utils/                   
│   ├── .env                     
│   ├── .env.example             
│   └── index.js                 
│
└── package.json                 
```

## 🔧 Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Setting Up the Project

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/legacynote.git
cd legacynote
```

#### 2. Install Root Dependencies for Combined Start Command
```bash
# From the root directory
npm install
```

#### 3. Set Up the Backend Server
```bash
cd server

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env
```

Edit the `.env` file with your specific configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/legacynote
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=30d
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
EMAIL_FROM=noreply@legacynote.com
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:5173
```

#### 4. Set Up the Frontend
```bash
cd ../client

# Install dependencies
npm install
```

#### 5. Install All Dependencies at Once (Alternative)
```bash
# From the root directory
npm run install-all
```

### 6. Running the Application

#### One-Command Startup (Start both client and server)
```bash
# From the root directory
npm start
```

This will concurrently start:
- The backend server on http://localhost:5000
- The frontend development server on http://localhost:5173

#### Start Backend Only
```bash
cd server
npm run dev
```

#### Start Frontend Only
```bash
cd client
npm run dev
```

## 📱 Mobile-First Approach

LegacyNote is designed with a mobile-first approach:
- Responsive design for all screen sizes
- Different navigation behavior for mobile vs desktop
- Touch-friendly controls and interactions
- Conditional navbar rendering based on device size

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- HTTP-only cookies for token storage
- CORS protection
- Email verification for new accounts
- OAuth integration for secure third-party login
- Encrypted note content

## 🧩 Key Components

### Authentication Flow
- User registration with email verification
- Secure login with JWT tokens
- Password reset functionality
- Google OAuth integration

### Note Management
- Creation, editing, and deletion of notes
- Future delivery scheduling
- Media file attachments
- Recipient management

### User Interface
- Responsive design across devices
- Dark/light theme toggle
- Toast notifications for user feedback
- Loading states and error handling

## 🌐 Deployment

### Deploying the Backend
The backend can be deployed to services like:
- Heroku
- Digital Ocean
- AWS
- Railway

### Deploying the Frontend
The frontend can be deployed to:
- Vercel
- Netlify
- Firebase Hosting

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Agenda.js](https://github.com/agenda/agenda)
- [JWT](https://jwt.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Formik](https://formik.org/)
- [React Toastify](https://fkhadra.github.io/react-toastify/)

---

Made with ❤️ by Your Team