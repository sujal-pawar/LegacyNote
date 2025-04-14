import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUserCircle, FaClock, FaLock, FaSignOutAlt, FaHome, FaPlus } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi';
import DarkModeToggle from './DarkModeToggle';

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
    <nav className="bg-gradient-to-r from-indigo-900 to-indigo-600 to-indigo-500 text-white">
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
                className="px-3 py-2 rounded-md text-md text-white font-medium flex items-center hover:bg-gray-100 hover:text-indigo-900 transition-colors duration-200"
              >
                <FaHome className="mr-1" /> Home
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-3 py-2 rounded-md text-md text-white font-medium flex items-center hover:bg-gray-100 hover:text-indigo-900 transition-colors duration-200"
                  >
                    <FaUserCircle className="mr-1" /> Dashboard
                  </Link>
                  <Link
                    to="/create-note"
                    className="px-3 py-2 rounded-md text-md text-white font-medium flex items-center hover:bg-gray-100 hover:text-indigo-900 transition-colors duration-200"
                  >
                    <FaPlus className="mr-1" /> New Note
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-white text-md font-medium flex items-center btn-primary"
                  >
                    <FaSignOutAlt className="mr-1" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-2 text-white rounded-md text-md font-medium flex items-center hover:bg-gray-100 hover:text-indigo-900 transition-colors duration-200"
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
              <DarkModeToggle />
            </div>
          </div>

          {/* Mobile header controls */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* Dark Mode Toggle - Now beside hamburger menu */}
            <div className="flex items-center justify-center">
              <DarkModeToggle />
            </div>
            
            {/* Hamburger Menu Button */}
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <div className={`space-y-1 transition-transform duration-300 ${isMenuOpen ? 'transform rotate-45' : ''}`}>
                <span
                  className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${isMenuOpen ? 'transform translate-y-2 rotate-45' : ''}`}
                ></span>
                <span
                  className={`block h-0.5 w-6 bg-white transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}
                ></span>
                <span
                  className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${isMenuOpen ? 'transform -translate-y-1 -rotate-45' : ''}`}
                ></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gradient-to-r from-indigo-900 to-indigo-600 to-indigo-500 ">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base text-white font-medium flex items-center hover:bg-indigo-700 dark:hover:bg-gray-700 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaHome className="mr-2" /> Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-white rounded-md text-base font-medium hover:bg-indigo-700 dark:hover:bg-gray-700 flex items-center transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUserCircle className="mr-2" /> Dashboard
                </Link>
                <Link
                  to="/create-note"
                  className="block px-3 py-2 text-white rounded-md text-base font-medium hover:bg-indigo-700 dark:hover:bg-gray-700 flex items-center transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaPlus className="mr-2" /> New Note
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-red-300 text-left px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 dark:hover:bg-gray-700 flex items-center transition-colors duration-200"
                >
                  <FaSignOutAlt className="mr-2" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white flex items-center hover:bg-indigo-700 dark:hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaLock className="mr-2" /> Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white flex items-center hover:bg-indigo-700  transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUserCircle className="mr-2" /> Sign Up
                </Link>
              </>
            )}
          </div>
          <hr className="border-indigo-700 dark:border-gray-700" />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
