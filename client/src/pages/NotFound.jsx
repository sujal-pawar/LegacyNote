import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200 py-16 px-4">
      <div className="max-w-2xl mx-auto text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <FaExclamationTriangle className="text-6xl text-yellow-500 dark:text-yellow-400 mx-auto mb-6" />
        <h1 className="text-5xl font-bold mb-4 text-gray-800 dark:text-gray-200">404</h1>
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Page Not Found</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <Link 
          to="/" 
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors inline-flex items-center"
        >
          <FaHome className="mr-2" /> Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
