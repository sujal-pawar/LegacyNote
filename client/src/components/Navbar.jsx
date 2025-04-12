import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUserCircle, FaClock, FaLock, FaSignOutAlt, FaHome, FaPlus } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-500 to-indigo-600 to-indigo-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 scroll-m-1">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="font-bold text-2xl text-white flex items-center">                
                LegacyNote
              </Link>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:ml-6">
            <div className="flex space-x-4">
              <Link
                to="/"
                className="px-3 py-2 rounded-md text-md text-white font-medium flex items-center hover:bg-gray-100"
              >
                <FaHome className="mr-1" /> Home
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-3 py-2 rounded-md text-md text-white font-medium flex items-center hover:bg-gray-100"
                  >
                    <FaUserCircle className="mr-1" /> Dashboard
                  </Link>
                  <Link
                    to="/create-note"
                    className="px-3 py-2 rounded-md text-md text-white font-medium flex items-center hover:bg-gray-100"
                  >
                    <FaPlus className="mr-1" /> New Note
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-red-400 text-md font-medium flex items-center hover:bg-gray-100"
                  >
                    <FaSignOutAlt className="mr-1" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-2 text-white rounded-md text-md font-medium flex items-center hover:bg-gray-100"
                  >
                    <FaLock className="mr-1" /> Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-2 rounded-md btn hover:text-gray-200 btn-primary flex items-center"
                  >
                    <FaUserCircle className="mr-1" /> Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              <GiHamburgerMenu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base text-white font-medium hover:bg-gray-100 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaHome className="mr-2" /> Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-white rounded-md text-base font-medium hover:bg-gray-100 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUserCircle className="mr-2" /> Dashboard
                </Link>
                <Link
                  to="/create-note"
                  className="block px-3 py-2 text-white rounded-md text-base font-medium hover:bg-gray-100 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaPlus className="mr-2" /> New Note
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-red-300 text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 flex items-center"
                >
                  <FaSignOutAlt className="mr-2" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaLock className="mr-2" /> Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-primary-color text-white flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUserCircle className="mr-2" /> Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 