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
import EmotionalCarousel from '../components/EmotionalCarousel';



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
      src: image1,
      alt: 'Graduation celebration',
      title: 'Graduation Day Surprise',
      quote: "When I graduated from college, I thought the day would be bittersweet without my father, who had passed away when I was 15. But then, a letter arrived—written by him years earlier. He had planned for this moment, leaving words of pride and encouragement that made me feel his presence. It was as if he was there, cheering me on, reminding me of his unwavering belief in me. That message turned my tears of sorrow into tears of joy.",
      author: '— Jamie, 23',
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
    {
      src: image6,
      alt: 'Retirement reflections',
      title: 'Retirement Reflections',
      quote: "On my retirement day, I opened a time capsule I had created at 25. Inside was a letter filled with youthful dreams and ambitions. Reflecting on my career, I realized how many of those aspirations I had achieved. It was a profound moment of gratitude, recognizing the growth and accomplishments over the decades.",
      author: '— Robert, 65',
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

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-black dark:text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Preserve Your Legacy Through Time
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              LegacyNote provides a secure platform for creating time-locked messages that matter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-black p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">              <div className="text-indigo-600 dark:text-indigo-400 mb-4">
              <FaShieldAlt className="text-4xl" />
            </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">End-to-End Security</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your notes are encrypted before storage, ensuring that only intended recipients can
                access them when the time comes.
              </p>
            </div>

            <div className="bg-white dark:bg-black p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">              <div className="text-indigo-600 dark:text-indigo-400 mb-4">
              <FaRegClock className="text-4xl" />
            </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Future Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Schedule your messages to be delivered days, months, or even years into the future
                with our reliable timing system.
              </p>
            </div>

            <div className="bg-white dark:bg-black p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">              <div className="text-indigo-600 dark:text-indigo-400 mb-4">
              <FaHeart className="text-4xl" />
            </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Meaningful Connection</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create a bridge between present and future, allowing your thoughts and feelings to
                transcend time.
              </p>
            </div>
          </div>
        </div>
      </section>            

      {/* Use Cases Section */}
      <section className="py-16 bg-white dark:bg-black dark:text-white">
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
      {/* MacbookScroll Demo Section - Hidden on mobile */}
      <div className="w-full hidden md:block">
        <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading presentation...</div>}>
          {React.createElement(lazy(() => import('../components/MacbookScrollDemo')))}
        </Suspense>
      </div>

      {/* Emotional Deliveries Carousel */}
      <div className="overflow-hidden">
        <EmotionalCarousel stories={emotionalStories} />
      </div>

      {/* Timeline Showcase */}
      <section className="py-20 bg-white dark:bg-black overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">From Creation to Delivery</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Follow the journey of your messages from inception to their meaningful delivery
            </p>
          </div>

          <div className="relative timeline-container">
            {/* Timeline line with animation */}
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
              className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 transform md:-translate-x-1/2 bg-gradient-to-b from-indigo-300 via-indigo-500 to-indigo-700 dark:from-indigo-700 dark:via-indigo-600 dark:to-indigo-900"
            ></motion.div>

            {/* Timeline items container */}
            <div className="space-y-28 md:space-y-32 relative">
              {/* Item 1 - Message Creation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className="relative pl-12 md:pl-0 md:pr-16">
                  {/* Circle indicator with pulse animation */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="absolute left-0 top-0 md:left-auto md:right-0 md:translate-x-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold z-10 shadow-lg"
                  >
                    <div className="relative">
                      1
                      <div className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-30"></div>
                    </div>
                  </motion.div>
                  <div className="md:text-right">
                    <motion.h3
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="text-xl md:text-2xl font-semibold mb-3 text-gray-900 dark:text-white"
                    >
                      Message Creation
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="text-gray-600 dark:text-gray-300 mb-4"
                    >
                      Users craft their heartfelt messages and select delivery dates.
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/40 dark:to-indigo-900/10 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                      <p className="text-gray-700 dark:text-gray-300 italic">
                        "Dear future me, today I'm starting my journey toward my dream career. I hope by the time you read this, you've made progress and stayed true to our values."
                      </p>
                      <div className="mt-3 text-sm text-indigo-600 dark:text-indigo-300 font-medium">
                        Message created: April 19, 2025
                      </div>
                    </motion.div>
                  </div>
                </div>
                <div className="hidden md:block relative">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <img
                      src={image4}
                      alt="Creating a message"
                      className="w-4/5 max-h-64 object-cover rounded-lg shadow-lg"
                    />
                  </motion.div>
                </div>
              </div>

              {/* Item 2 - Secure Storage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className="hidden md:block relative">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <img
                      src={image8}
                      alt="Secure encryption"
                      className="w-4/5 max-h-64 object-cover rounded-lg shadow-lg"
                    />
                  </motion.div>
                </div>
                <div className="relative pl-12 md:pl-16">
                  {/* Circle indicator with pulse animation */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="absolute left-0 top-0 max-sm:top-[14px] md:left-0 transform -translate-y-1/2 md:-translate-x-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold z-10 shadow-lg"
                  >
                    <div className="relative">
                      2
                      <div className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-30"></div>
                    </div>
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-xl md:text-2xl font-semibold mb-3 text-gray-900 dark:text-white"
                  >
                    Secure Storage
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-gray-600 dark:text-gray-300 mb-4"
                  >
                    Messages are encrypted and safely stored until their delivery date.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/40 dark:to-indigo-900/10 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex items-center mb-3">
                      <FaLock className="text-indigo-600 dark:text-indigo-400 mr-2" />
                      <span className="font-medium text-gray-800 dark:text-gray-200">End-to-End Encrypted</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      Your message is securely encrypted with military-grade protocols. Only the intended recipient will be able to access it when the time comes.
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Item 3 - The Wait */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className="relative pl-12 md:pl-0 md:pr-16">
                  {/* Circle indicator with pulse animation */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="absolute left-0 top-0 max-sm:top-[14px] md:left-auto md:right-0 transform -translate-y-1/2 md:translate-x-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold z-10 shadow-lg"
                  >
                    <div className="relative">
                      3
                      <div className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-30"></div>
                    </div>
                  </motion.div>
                  <div className="md:text-right">
                    <motion.h3
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="text-xl md:text-2xl font-semibold mb-3 text-gray-900 dark:text-white"
                    >
                      The Wait
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="text-gray-600 dark:text-gray-300 mb-4"
                    >
                      Time passes as the message waits for its perfect moment to arrive.
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/40 dark:to-indigo-900/10 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="flex justify-center mb-3">
                        <FaRegClock className="text-3xl text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-center">
                        <span className="font-medium">3 years, 2 months, 15 days</span> until delivery
                      </p>
                      <motion.div
                        className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-3 overflow-hidden"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        <motion.div
                          className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: '35%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.7 }}
                        ></motion.div>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
                <div className="hidden md:block relative">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <img
                      src={image9}
                      alt="Waiting period"
                      className="w-4/5 max-h-64 object-cover rounded-lg shadow-lg"
                    />
                  </motion.div>
                </div>
              </div>

              {/* Item 4 - Delivery Moment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className="hidden md:block relative">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <img
                      src={image6}
                      alt="Message delivery"
                      className="w-4/5 max-h-64 object-cover rounded-lg shadow-lg"
                    />
                  </motion.div>
                </div>
                <div className="relative pl-12 md:pl-16">
                  {/* Circle indicator with pulse animation */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="absolute left-0 top-0 max-sm:top-[14px] md:left-0 transform -translate-y-1/2 md:-translate-x-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold z-10 shadow-lg"
                  >
                    <div className="relative">
                      4
                      <div className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-30"></div>
                    </div>
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-xl md:text-2xl font-semibold mb-3 text-gray-900 dark:text-white"
                  >
                    Delivery Moment
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-gray-600 dark:text-gray-300 mb-4"
                  >
                    The emotional moment when recipients open their time capsule messages.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/40 dark:to-indigo-900/10 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="border-l-4 border-indigo-500 pl-4 mb-4">
                      <p className="text-gray-700 dark:text-gray-300 italic">
                        "Opening my father's message on my wedding day brought tears to my eyes. His wisdom and love reached across time to be with me on my special day."
                      </p>
                      <p className="mt-2 font-medium text-indigo-600 dark:text-indigo-300">— Michael, 32</p>
                    </div>
                    <div className="flex items-center justify-center">
                      <FaEnvelope className="text-indigo-600 dark:text-indigo-400 mr-2" />
                      <span className="text-gray-700 dark:text-gray-300">Delivered: June 12, 2028</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-gray-50 dark:bg-black dark:text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">About LegacyNote</h2>
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
      <section className="py-20 bg-gradient-to-r from-indigo-900 via-indigo-700 to-indigo-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <div>            <h2 className="text-3xl font-bold mb-6">Ready to Create Your Legacy?</h2>
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
          </div>
        </div>
      </section><hr />
    </div>
  );
};

export default Home; 