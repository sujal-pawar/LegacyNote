import React, { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaLock, FaEnvelope, FaUserClock, FaCalendarAlt, FaRegClock, FaShieldAlt, FaHeart, FaUsers } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import image1 from '../assets/images/1.jpg';
import image2 from '../assets/images/2.jpg';
import image3 from '../assets/images/3.jpg';
import image4 from '../assets/images/4.png';
import image5 from '../assets/images/5.jpg';
import image6 from '../assets/images/6.jpg';
import image7 from '../assets/images/7.jpg';
import image8 from '../assets/images/8.jpg'
import image9 from '../assets/images/9.png'
import image11 from '../assets/images/11.png'
import EmotionalCarousel from '../components/EmotionalCarousel';
import TimelineDemo from '../components/ui/timeline-demo';
import { IconLoader, IconLoader2 } from '@tabler/icons-react';



const Home = () => {
  const { isAuthenticated } = useAuth();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };


  const emotionalStories = [

    {
      src: image3,
      alt: 'New parent encouragement',
      title: 'New Parent Encouragement',
      quote: "The day our first child was born was overwhelming with joy and anxiety. Amidst the chaos, we received a message we had written to ourselves on our wedding day, envisioning our future family. Reading our past hopes and dreams while holding our newborn brought everything full circle. It was a poignant reminder of our journey and the love that had grown between us.",
      author: '— Michael, 34',
    },
    {
      src: image5,
      alt: 'Health milestone',
      title: 'Health Milestone Message',
      quote: "After a grueling battle with cancer, I found a letter I had written to myself before treatment began. It spoke of hope, strength, and the will to fight. Reading it post-recovery was an emotional release, acknowledging the pain endured and the victory achieved. It was a testament to my journey and the power of self-belief.",
      author: '— Priya, 42',
    },
    {
      src: image2,
      alt: 'Wedding day message',
      title: 'Wedding Day Wisdom',
      quote: "On the morning of my wedding, I felt a pang of sadness knowing my grandmother couldn't attend due to her health. Just before I walked down the aisle, I received a voice message she had recorded months prior. Her voice, filled with love and sage advice, enveloped me. She spoke of love's endurance and the importance of patience and understanding. Hearing her words gave me strength and made me feel she was right there beside me.",
      author: '— Sarah, 31',
    },
    {
      src: image4,
      alt: 'First job success',
      title: 'First Job Pep Talk',
      quote: "Starting my first job was nerve-wracking. As I sat at my new desk, a scheduled email popped up—a note from my college self. It was filled with dreams, aspirations, and a reminder of my resilience. Reading it reignited my confidence and reminded me of the passion that led me here. It was the pep talk I didn't know I needed.",
      author: '— Ayesha, 27',
    },

  ];


  const TimelineItem = ({ position, number, title, description, delay, children }) => {
    const { scrollYProgress } = useScroll({
      offset: ["start end", "end start"]
    });

    const isRight = position === "right";

    return (
      <motion.div
        initial={{ opacity: 0, x: isRight ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: delay || 0 }}
        className={`relative ${isRight ? 'md:text-right md:pr-12' : 'md:pl-12'}`}
      >
        <div
          className={`absolute ${isRight ? 'right-0' : 'left-0'} top-0 transform 
          ${isRight ? 'translate-x-1/2' : '-translate-x-1/2'} -translate-y-1/2 
          ${isRight ? 'md:translate-x-6' : 'md:-translate-x-6'} 
          w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold`}
        >
          {number}
        </div>
        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {description}
        </p>
        {children}
      </motion.div>
    );
  };


  return (
    <div className="w-full overflow-x-hidden">
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
              </div>            </div>
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

      {/* MacbookScroll Demo Section - Hidden on mobile */}
      <div className="w-full hidden md:block bg-white dark:bg-black">
        <Suspense fallback={<div className="h-96 flex items-center justify-center dark:bg-black text-gray-700 dark:text-gray-300"><IconLoader2 className="animate-spin" /></div>}>
          {React.createElement(lazy(() => import('../components/MacbookScrollDemo')))}
        </Suspense>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-black dark:text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Preserve Your Legacy Through Time
            </h2>
            <div className="w-40 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-sm mx-auto my-4 relative right-1"></div>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              LegacyNote provides a secure platform for creating time-locked messages that matter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-950 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 dark:border-indigo-400 group">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl inline-block mb-6 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-800/30 transition-all duration-300">
                  <FaShieldAlt className="text-4xl text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">End-to-End Security</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your notes are encrypted before storage, ensuring that only intended recipients can
                  access them when the time comes.
                </p>
              </div>

            <div className="bg-white dark:bg-gray-950 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 dark:border-indigo-400 group">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl inline-block mb-6 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-800/30 transition-all duration-300">
                  <FaRegClock className="text-4xl text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Future Delivery</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Schedule your messages to be delivered days, months, or even years into the future
                  with our reliable timing system.
                </p>
              </div>

            <div className="bg-white dark:bg-gray-950 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 dark:border-indigo-400 group">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl inline-block mb-6 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-800/30 transition-all duration-300">
                  <FaHeart className="text-4xl text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Meaningful Connection</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Create a bridge between present and future, allowing your thoughts and feelings to
                  transcend time.
                </p>
              </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-black dark:text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Your Time Capsule, Your Purpose
            </h2>
            <div className="w-40 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-sm mx-auto my-4 relative right-6"></div>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover the many ways LegacyNote can help preserve your thoughts, wisdom, and
              memories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white dark:bg-gray-950 border dark:border-indigo-900  rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex items-start group">
                <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 rounded-xl p-4 mr-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <FaUserClock className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Letters to Your Future Self</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Document your current thoughts, goals, and dreams, then schedule them to arrive at
                    a meaningful future date.
                  </p>
                </div>
              </div>

            <div className="bg-white dark:bg-gray-950 border dark:border-indigo-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex items-start group">
                <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 rounded-xl p-4 mr-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <FaCalendarAlt className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Anniversary & Birthday Messages</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Prepare heartfelt messages for loved ones to receive on special dates, even if
                    you're not there to deliver them in person.
                  </p>
                </div>
              </div>

            <div className="bg-white dark:bg-gray-950 border dark:border-indigo-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex items-start group">
                <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 rounded-xl p-4 mr-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <FaEnvelope className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Life Wisdom & Memories</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Pass down important life lessons, family history, or personal stories to future
                    generations.
                  </p>
                </div>
              </div>

            <div className="bg-white dark:bg-gray-950 border dark:border-indigo-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex items-start group">
                <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 rounded-xl p-4 mr-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <FaClock className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Long-Term Goal Tracking</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Document your current goals and ambitions, then receive them years later to reflect
                    on your journey and achievements.
                  </p>
                </div>
              </div>
          </div>
        </div>
      </section>     
      
      {/* Timeline Showcase */}
      <section className="py-6 bg-white dark:bg-black overflow-hidden">
        <div className="container mx-auto px-4">        
          {/* Modern Timeline Component */}
          <TimelineDemo />
        </div>
      </section>

      {/* Emotional Deliveries Carousel
      <div className="overflow-hidden">
        <EmotionalCarousel stories={emotionalStories} />
      </div> */}

      {/* About Us Section */}
      <section className="py-20 bg-gray-50 dark:bg-black dark:text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6">About LegacyNote</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We're dedicated to helping you preserve your thoughts, memories, and messages for the future.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">              <div className="flex items-start">
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
            </div>

            <div className="bg-gradient-to-r from-indigo-900 via-indigo-700 to-indigo-500 rounded-xl p-8 text-white">              <h3 className="text-2xl font-bold mb-4">Why Choose LegacyNote?</h3>
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
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 dark:bg-black dark:text-white">
        <div className="container mx-auto px-4 text-center">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Create Your Legacy?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto dark:text-indigo-100">
              Start preserving your thoughts and messages for the future. It only takes a minute to
              begin.
            </p>
            {isAuthenticated ? (
              
              <Link
                to="/create-note"
                className="btn border border-indigo-600 dark:border-indigo-500 bg-white dark:bg-indigo-950 text-indigo-600 dark:text-indigo-100 hover:bg-indigo-100 dark:hover:bg-indigo-900 px-8 py-3 rounded-xl font-semibold transition-all duration-200 ease-in-out hover:scale-105 shadow-sm hover:shadow-md"
              >
                Create Your First Note
              </Link>
            ) : (
              <Link
                to="/register"
                className="btn border border-indigo-600 dark:border-indigo-500 bg-white dark:bg-indigo-950 text-indigo-600 dark:text-indigo-100 hover:bg-indigo-100 dark:hover:bg-indigo-900 px-8 py-3 rounded-xl font-semibold transition-all duration-200 ease-in-out hover:scale-105 shadow-sm hover:shadow-md"
              >
                Get Started For Free
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;