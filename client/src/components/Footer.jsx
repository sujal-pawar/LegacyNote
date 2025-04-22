import { Link } from 'react-router-dom';
import { FaClock, FaGithub, FaTwitter, FaEnvelope, FaLinkedin, FaHeart, FaShieldAlt, FaLock, FaUserLock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-indigo-900 to-gray-900 dark:from-gray-900 dark:to-gray-950 text-white py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex text-white items-center font-bold text-2xl mb-4 group">
              <FaClock className="mr-2 text-indigo-500 dark:text-indigo-400 group-hover:rotate-12 transition-transform" />
              LegacyNote
            </Link>
            <p className="text-gray-300 dark:text-gray-400 mb-4 leading-relaxed">
              LegacyNote is a secure digital time capsule platform that allows you to store,
              protect, and deliver long-term notes, messages, and documents.
            </p>
            <div className="flex items-center text-sm text-gray-400">
              <FaShieldAlt className="mr-2 text-indigo-500 dark:text-indigo-400" />
              <span>End-to-End Encrypted</span>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-white dark:text-gray-200">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-200 flex items-center group"
                >
                  <span className="w-1 h-1 bg-indigo-500 dark:bg-indigo-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-200 flex items-center group"
                >
                  <span className="w-1 h-1 bg-indigo-500 dark:bg-indigo-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-200 flex items-center group"
                >
                  <span className="w-1 h-1 bg-indigo-500 dark:bg-indigo-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Register
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-200 flex items-center group"
                >
                  <span className="w-1 h-1 bg-indigo-500 dark:bg-indigo-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Pricing
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-white dark:text-gray-200">Features</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-400">
                <FaLock className="mr-2 text-indigo-500 dark:text-indigo-400" />
                Secure Storage
              </li>
              <li className="flex items-center text-gray-400">
                <FaClock className="mr-2 text-indigo-500 dark:text-indigo-400" />
                Scheduled Delivery
              </li>
              <li className="flex items-center text-gray-400">
                <FaUserLock className="mr-2 text-indigo-500 dark:text-indigo-400" />
                Private Sharing
              </li>
              <li className="flex items-center text-gray-400">
                <FaShieldAlt className="mr-2 text-indigo-500 dark:text-indigo-400" />
                End-to-End Encryption
              </li>
            </ul>
          </motion.div>

          {/* Connect Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-white dark:text-gray-200">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              <motion.a
                href="https://github.com/sujal-pawar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="GitHub"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaGithub size={24} />
              </motion.a>
              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Twitter"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaTwitter size={24} />
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/in/sujal-pawar/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="LinkedIn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaLinkedin size={24} />
              </motion.a>
              <motion.a
                href="mailto:legacynote2025@gmail.com"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Email"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaEnvelope size={24} />
              </motion.a>
            </div>
                  
          </motion.div>
        </div>

        <hr className="my-8 border-gray-800 dark:border-gray-700" />

        <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex flex-col max-sm:items-center " >
          <p className="text-sm text-gray-400 flex items-center">
            &copy; {currentYear} LegacyNote.
          </p>
          <p className="text-sm text-gray-400 flex items-center">
            Made with <FaHeart className="text-red-500 mx-1" /> by LegacyNote Team
          </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link
              to="/privacy"
              className="text-sm text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-200"
            >
              Terms of Service
            </Link>
            <Link
              to="/security"
              className="text-sm text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-200"
            >
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
