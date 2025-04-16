import { Link } from 'react-router-dom';
import { FaClock, FaLock, FaEnvelope, FaUserClock, FaCalendarAlt, FaRegClock, FaShieldAlt, FaHeart, FaUsers } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="">
      {/* Hero Section */}
      <section className="relative py-20 max-sm:py-6 bg-gradient-to-r from-indigo-900 to-indigo-600 to-indigo-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row items-center justify-between gap-12"
          >
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Secure Digital Time Capsules for Your Most Important Messages
              </h1>
              <p className="text-xl mb-8 text-indigo-100">
                Create, encrypt, and schedule the delivery of notes and messages to your future self
                or loved ones. LegacyNote ensures your words stand the test of time.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="btn bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-lg font-semibold transform hover:scale-105 transition-transform"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="btn bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-lg font-semibold transform hover:scale-105 transition-transform"
                    >
                      Get Started
                    </Link>
                    <Link
                      to="/login"
                      className="btn border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-3 rounded-lg font-semibold transform hover:scale-105 transition-transform"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="md:w-1/2"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-white/20">
                <div className="flex items-center mb-4">
                  <FaClock className="text-2xl text-indigo-300 mr-2" />
                  <h3 className="text-xl font-semibold text-white">
                    Message to Future Self
                  </h3>
                </div>
                <div className="bg-white/20 p-4 rounded-lg text-white mb-4">
                  <p className="mb-2">Dear Future Me,</p>
                  <p className="mb-2">
                    Today I'm setting a goal to achieve in the next 5 years. Remember why you
                    started this journey and stay committed to your dreams.
                  </p>
                  <p>- Your Past Self</p>
                </div>
                <div className="flex justify-between text-sm text-indigo-200">
                  <span className="flex items-center">
                    <FaCalendarAlt className="mr-1" /> Delivery: June 15, 2028
                  </span>
                  <span className="flex items-center">
                    <FaLock className="mr-1" /> End-to-End Encrypted
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      
      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 dark:text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Preserve Your Legacy Through Time
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              LegacyNote provides a secure platform for creating time-locked messages that matter.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-indigo-600 dark:text-indigo-400 mb-4">
                <FaShieldAlt className="text-4xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">End-to-End Security</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your notes are encrypted before storage, ensuring that only intended recipients can
                access them when the time comes.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-indigo-600 dark:text-indigo-400 mb-4">
                <FaRegClock className="text-4xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Future Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Schedule your messages to be delivered days, months, or even years into the future
                with our reliable timing system.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-indigo-600 dark:text-indigo-400 mb-4">
                <FaHeart className="text-4xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Meaningful Connection</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create a bridge between present and future, allowing your thoughts and feelings to
                transcend time.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 bg-white dark:bg-gray-800 dark:text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Your Time Capsule, Your Purpose
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover the many ways LegacyNote can help preserve your thoughts, wisdom, and
              memories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-100 rounded-full p-3 mr-4">
                <FaUserClock className="text-indigo-600 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Letters to Your Future Self</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Document your current thoughts, goals, and dreams, then schedule them to arrive at
                  a meaningful future date.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-100 rounded-full p-3 mr-4">
                <FaCalendarAlt className="text-indigo-600 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Anniversary & Birthday Messages</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Prepare heartfelt messages for loved ones to receive on special dates, even if
                  you're not there to deliver them in person.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-100 rounded-full p-3 mr-4">
                <FaEnvelope className="text-indigo-600 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Life Wisdom & Memories</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Pass down important life lessons, family history, or personal stories to future
                  generations.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-100 rounded-full p-3 mr-4">
                <FaClock className="text-indigo-600 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Long-Term Goal Tracking</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Document your current goals and ambitions, then receive them years later to reflect
                  on your journey and achievements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 dark:text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">About LegacyNote</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We're dedicated to helping you preserve your thoughts, memories, and messages for the future.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 rounded-full p-3 mr-4">
                  <FaUsers className="text-indigo-600 dark:text-indigo-400 text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Our Mission</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    To provide a secure and reliable platform for preserving your most important messages
                    and ensuring they reach their intended recipients at the perfect moment.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 rounded-full p-3 mr-4">
                  <FaShieldAlt className="text-indigo-600 dark:text-indigo-400 text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Security First</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We prioritize your privacy and security, using industry-standard encryption to protect
                    your messages until they're ready to be delivered.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-r from-indigo-900 to-indigo-600 to-indigo-500 rounded-xl p-8 text-white"
            >
              <h3 className="text-2xl font-bold mb-4">Why Choose LegacyNote?</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <FaShieldAlt className="text-indigo-300 mr-3 mt-1" />
                  <span>End-to-end encryption for all messages</span>
                </li>
                <li className="flex items-start">
                  <FaCalendarAlt className="text-indigo-300 mr-3 mt-1" />
                  <span>Flexible delivery scheduling</span>
                </li>
                <li className="flex items-start">
                  <FaEnvelope className="text-indigo-300 mr-3 mt-1" />
                  <span>Share with multiple recipients</span>
                </li>
                <li className="flex items-start">
                  <FaUserClock className="text-indigo-300 mr-3 mt-1" />
                  <span>Perfect for future self-messages</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-900 to-indigo-600 to-indigo-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-6">Ready to Create Your Legacy?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-indigo-100">
              Start preserving your thoughts and messages for the future. It only takes a minute to
              begin.
            </p>
            {isAuthenticated ? (
              <Link
                to="/create-note"
                className="btn bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-lg font-semibold transform hover:scale-105 transition-transform"
              >
                Create Your First Note
              </Link>
            ) : (
              <Link
                to="/register"
                className="btn bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-lg font-semibold transform hover:scale-105 transition-transform"
              >
                Get Started For Free
              </Link>
            )}
          </motion.div>
        </div>
      </section><hr />
    </div>
  );
};

export default Home; 