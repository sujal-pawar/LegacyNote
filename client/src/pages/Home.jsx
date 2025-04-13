import { Link } from 'react-router-dom';
import { FaClock, FaLock, FaEnvelope, FaUserClock, FaCalendarAlt, FaRegClock } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-indigo-900 to-indigo-600 to-indigo-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Secure Digital Time Capsules for Your Most Important Messages
              </h1>
              <p className="text-xl mb-8">
                Create, encrypt, and schedule the delivery of notes and messages to your future self
                or loved ones. LegacyNote ensures your words stand the test of time.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="btn bg-white text-indigo-600 hover:bg-white px-6 py-3"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="btn bg-white text-indigo-600 hover:bg-white px-6 py-3"
                    >
                      Get Started
                    </Link>
                    <Link
                      to="/login"
                      className="btn border-2 text-white hover:bg-white hover:text-indigo-600 px-6 py-3"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="bg-white rounded-lg shadow-xl p-6 mx-auto max-w-md">
                  <div className="flex items-center mb-4">
                    <FaClock className="text-indigo-600 text-2xl m-2" />
                    <h3 className="text-lg font-semibold text-gray-800 ">
                      Message to Future Self
                    </h3>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-md text-gray-800 mb-4">
                    <p className="mb-2">Dear Future Me,</p>
                    <p className="mb-2">
                      Today I'm setting a goal to achieve in the next 5 years. Remember why you
                      started this journey and stay committed to your dreams.
                    </p>
                    <p>- Your Past Self</p>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span className="flex items-center">
                      <FaCalendarAlt className="mr-1" /> Delivery: June 15, 2028
                    </span>
                    <span className="flex items-center">
                      <FaLock className="mr-1" /> End-to-End Encrypted
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Preserve Your Legacy Through Time
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              LegacyNote provides a secure platform for creating time-locked messages that matter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-indigo-600 mb-4">
                <FaLock className="text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">End-to-End Security</h3>
              <p className="text-gray-600">
                Your notes are encrypted before storage, ensuring that only intended recipients can
                access them when the time comes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-indigo-600 mb-4">
                <FaRegClock className="text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Future Delivery</h3>
              <p className="text-gray-600">
                Schedule your messages to be delivered days, months, or even years into the future
                with our reliable timing system.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-indigo-600 mb-4">
                <FaEnvelope className="text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Meaningful Connection</h3>
              <p className="text-gray-600">
                Create a bridge between present and future, allowing your thoughts and feelings to
                transcend time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Time Capsule, Your Purpose
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                <p className="text-gray-600">
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
                <p className="text-gray-600">
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
                <p className="text-gray-600">
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
                <p className="text-gray-600">
                  Document your current goals and ambitions, then receive them years later to reflect
                  on your journey and achievements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-indigo-900 to-indigo-600 to-indigo-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Create Your Legacy?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Start preserving your thoughts and messages for the future. It only takes a minute to
            begin.
          </p>
          {isAuthenticated ? (
            <Link
              to="/create-note"
              className="btn bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 rounded-md font-medium"
            >
              Create Your First Note
            </Link>
          ) : (
            <Link
              to="/register"
              className="btn bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 rounded-md font-medium"
            >
              Get Started For Free
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home; 