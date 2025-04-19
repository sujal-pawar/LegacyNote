# LegacyNote - Secure Digital Time Capsule Platform

LegacyNote is a full-stack web application that allows users to create, store, protect, and schedule delivery of long-term notes, messages, and documents. It's designed to serve as a digital time capsule, ensuring your words stand the test of time and are delivered precisely when you intend.

## 🚀 Features

- **Time Capsule Notes**: Create and schedule notes that will be delivered at specific dates in the future
- **Recipient Management**: Send notes to multiple recipients with email notification
- **Media Support**: Attach images and files to your notes
- **Image Optimization**: Automatic image optimization via Cloudinary to reduce file size by up to 90% without quality loss
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
- Cloudinary for media storage and image optimization
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

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name

# Client URL
FRONTEND_URL=http://localhost:5173
```

#### 4. Set Up Cloudinary for Image Optimization

1. Sign up for a free Cloudinary account at [https://cloudinary.com/signup](https://cloudinary.com/signup)
2. After signing up, go to your Cloudinary Dashboard to find your cloud name, API key, and API secret
3. Add these credentials to your `.env` file
4. For optimal image optimization, configure your upload presets:
   - Go to Settings > Upload in your Cloudinary dashboard
   - Create a new upload preset with the following settings:
     - Delivery type: Auto
     - Quality: Auto
     - Format: Auto
     - Responsive breakpoints: Enabled
   - Note the preset name and add it to your code configuration

```javascript
// Example configuration in your server code
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});
```

#### 5. Set Up the Frontend
```bash
cd ../client

# Install dependencies
npm install
```

#### 6. Install All Dependencies at Once (Alternative)
```bash
# From the root directory
npm run install-all
```

### 7. Running the Application

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

## 📸 Media Management & Optimization

LegacyNote uses Cloudinary for advanced media management, providing:

### Image Optimization
- **Automatic Format Selection**: Converts images to WebP, JPEG, AVIF based on browser support
- **Responsive Sizing**: Automatically resizes images based on device screen size
- **Quality Optimization**: Intelligently adjusts image quality to reduce file size (up to 90%)
- **Lazy Loading**: Images load only when they enter the viewport for faster page loads

### Implementation
Images uploaded through the application are processed with Cloudinary's optimization pipeline:

```javascript
// Example of how images are optimized in the application
new CloudinaryImage("user_uploaded_image.jpg")
  .resize(scale().width(1000))    // Resize to appropriate dimensions
  .delivery(quality(auto()))      // Auto-select optimal quality
  .delivery(format(auto()));      // Auto-select optimal format (WebP/AVIF/JPEG)
```

#### Server Implementation
```javascript
// Example upload middleware with optimization settings
const upload = multer({
  storage: cloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'legacynote_uploads',
      resource_type: 'auto',
      transformation: [
        { width: 2000, crop: "limit" },  // Limit maximum width while preserving aspect ratio
        { quality: "auto" },             // Auto-optimize quality
        { fetch_format: "auto" }         // Auto-select best format
      ]
    }
  })
});

// In your route handler
router.post('/upload', upload.single('media'), (req, res) => {
  // Image is automatically optimized and uploaded to Cloudinary
  // req.file.path contains the optimized image URL
  res.json({ 
    url: req.file.path,
    publicId: req.file.filename
  });
});
```

#### Client Implementation
```jsx
// In your React component
import React, { useState } from 'react';
import { Image } from 'cloudinary-react';

const OptimizedImage = ({ publicId }) => {
  return (
    <Image
      cloudName={process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}
      publicId={publicId}
      width="auto"
      responsive
      dpr="auto"
      crop="scale"
      responsiveUseBreakpoints="true"
      loading="lazy"
    />
  );
};

const MediaUpload = () => {
  const [mediaUrl, setMediaUrl] = useState('');
  const [publicId, setPublicId] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('media', file);
    
    const response = await fetch('/api/notes/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    setMediaUrl(data.url);
    setPublicId(data.publicId);
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      {publicId && <OptimizedImage publicId={publicId} />}
    </div>
  );
};
```

### Benefits
- **Faster Loading**: Optimized images load significantly faster, improving user experience
- **Lower Bandwidth**: Reduced file sizes mean less data transfer for users
- **Storage Efficiency**: Original files are preserved while serving optimized versions
- **Adaptive Delivery**: Different devices receive appropriately sized images

### Media Storage
- Secure, cloud-based storage for all attached files
- CDN delivery for fast global access to media files
- Automatic backup and redundancy for uploaded content

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
- [Cloudinary](https://cloudinary.com/) - For media optimization and storage
- [Multer](https://github.com/expressjs/multer) - For file uploads

---

Made with ❤️ by Your Team
