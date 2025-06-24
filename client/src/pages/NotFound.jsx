import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const NotFound = () => {
  const [timeLeft, setTimeLeft] = useState(10);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Redirect to home page when countdown reaches zero
      window.location.href = '/';
    }
  }, [timeLeft]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 dark:from-black dark:to-black transition-colors duration-200">
      <div className="container mx-auto py-16 px-6 max-sm:px-4">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto bg-white dark:bg-black rounded-2xl shadow-lg p-8 sm:p-12 border border-gray-200 dark:border-gray-700 text-center"
        >
          <motion.div 
            className="flex items-center justify-center mb-8"
            variants={itemVariants}
          >
            <div className="relative">
              <motion.div 
                className="w-32 h-32 bg-indigo-600 dark:bg-indigo-700 rounded-xl flex items-center justify-center shadow-lg"
                animate={pulseAnimation}
              >
                <FaExclamationTriangle className="text-white text-6xl" />
              </motion.div>
              <motion.div 
                className="absolute -right-4 -bottom-4 w-14 h-14 bg-red-500 dark:bg-red-600 rounded-xl flex items-center justify-center shadow-lg"
                animate={{
                  scale: [1, 1.1, 1],
                  transition: { duration: 1.5, repeat: Infinity }
                }}
              >
                <span className="text-white text-xl font-bold">404</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4"
          >
            Page Not Found
          </motion.h1>

          <motion.div 
            variants={itemVariants}
            className="h-1 w-40 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto mb-6"
          />          

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              to="/dashboard" 
              className="px-6 py-3 bg-indigo-600 text-white hover:text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center justify-center"
            >
              <FaHome className="mr-2" /> Back to Dashboard
            </Link>

            <Link 
              to="#"
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
            >
              <FaArrowLeft className="mr-2" /> Go Back
            </Link>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="mt-8 text-sm text-indigo-600 dark:text-indigo-400"
          >
            {timeLeft > 0 ? (
              <p>Returning to dashboard in {timeLeft} seconds...</p>
            ) : (
              <p className="animate-pulse">Redirecting...</p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
