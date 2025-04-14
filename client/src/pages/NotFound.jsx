import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <FaExclamationTriangle className="text-6xl text-yellow-500 mx-auto mb-6" />
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-6">Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-8">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <Link to="/" className="btn btn-primary hover:text-white inline-flex items-center">
           Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 