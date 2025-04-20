import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaShare, FaCalendarAlt, FaSpinner, FaClock, FaEnvelope, FaFilter, FaSearch } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { notesAPI } from '../api/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Function to determine if a note is ready for delivery
  const isReadyForDelivery = (note) => {
    const currentDate = new Date();
    const deliveryDate = new Date(note.deliveryDate);
    
    // Only consider a note ready for delivery when current time exceeds the scheduled time
    return !note.isDelivered && currentDate.getTime() > deliveryDate.getTime();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        when: "beforeChildren" 
      }
    },
    exit: { opacity: 0 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const res = await notesAPI.getNotes();
        setNotes(res.data.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch notes. Please try again later.');
        showErrorToast('Failed to fetch notes');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleDeleteNote = async (id) => {
    if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      try {
        await notesAPI.deleteNote(id);
        setNotes(notes.filter(note => note._id !== id));
        showSuccessToast('Note deleted successfully');
      } catch (err) {
        showErrorToast('Failed to delete note');
      }
    }
  };

  const handleShareNote = async (id) => {
    try {
      const res = await notesAPI.shareNote(id);
      const shareableLink = res.data.data.shareableLink;
      
      // Copy to clipboard
      navigator.clipboard.writeText(shareableLink);
      
      showSuccessToast('Shareable link copied to clipboard');
      
      // Update the note in the state to reflect it's now shared
      setNotes(notes.map(note => 
        note._id === id ? { ...note, isPublic: true, shareableLink } : note
      ));
    } catch (err) {
      showErrorToast('Failed to share note');
    }
  };

  // Get delivery status for a note
  const getDeliveryStatus = (note) => {
    const now = new Date();
    const deliveryDate = new Date(note.deliveryDate);
    const isDelivered = note.isDelivered;
    
    // Calculate time difference for display
    const timeRemaining = deliveryDate - now;
    const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const secondsRemaining = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    // For indicating very close delivery times
    const isWithinHour = hoursRemaining < 1 && hoursRemaining >= 0 && minutesRemaining >= 0;
    const isWithinMinute = minutesRemaining < 1 && minutesRemaining >= 0 && secondsRemaining >= 0;
    
    if (isDelivered) {
      return {
        status: 'delivered',
        label: 'Delivered',
        badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        deliveryTime: note.deliveredAt ? 
          `Delivered: ${format(new Date(note.deliveredAt), 'MMM d')} at ${format(new Date(note.deliveredAt), 'h:mm:ss a')}` : 
          `Delivered`
      };
    } else if (deliveryDate > now) {
      // Show detailed time for notes with exact time delivery
      if (note.exactTimeDelivery) {
        let timeLabel = 'Pending';
        let deliveryTime = '';
        
        if (isWithinMinute) {
          timeLabel = `${secondsRemaining}s`;
          deliveryTime = `Delivers in ${secondsRemaining} second${secondsRemaining !== 1 ? 's' : ''}`;
        } else if (isWithinHour) {
          timeLabel = `${minutesRemaining}m`;
          deliveryTime = `Delivers in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}`;
        } else if (daysRemaining < 1) {
          timeLabel = `${hoursRemaining}h ${minutesRemaining}m`;
          deliveryTime = `Delivers in ${hoursRemaining}h ${minutesRemaining}m`;
        } else {
          timeLabel = `${daysRemaining}d ${hoursRemaining}h`;
          deliveryTime = `Delivers in ${daysRemaining}d ${hoursRemaining}h`;
        }
        
        return {
          status: 'pending',
          label: timeLabel,
          badgeClass: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
          deliveryTime: `Scheduled: ${format(deliveryDate, 'MMM d')} at ${format(deliveryDate, 'h:mm:ss a')} (${deliveryTime})`
        };
      }
      
      return {
        status: 'pending',
        label: 'Pending',
        badgeClass: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        deliveryTime: `Scheduled: ${format(deliveryDate, 'MMM d, yyyy')}`
      };
    } else {
      // For processing notes - delivery time has passed but not marked as delivered yet
      return {
        status: 'processing',
        label: 'Processing',
        badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        deliveryTime: note.exactTimeDelivery ? 
          `Scheduled: ${format(deliveryDate, 'MMMM d, yyyy')} at ${format(deliveryDate, 'h:mm a')} (Processing)` :
          `Scheduled: ${format(deliveryDate, 'MMM d, yyyy')} (Processing)`
      };
    }
  };

  // Filter notes based on search term and status filter
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    const { status } = getDeliveryStatus(note);
    return matchesSearch && status === filterStatus;
  });

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="min-h-screen py-16 px-6 max-sm:px-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
    >
      <div className="container mx-auto">
        {/* Header Section */}
        <motion.div 
          variants={headerVariants}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-200">Welcome <span className='text-indigo-500'>{user?.name?.split(' ')[0]}!</span> </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your time capsule notes here.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/create-note" 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center justify-center"
                >
                  <FaPlus className="mr-2" /> Create New Note
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/self-message" 
                  className="px-4 py-2 bg-purple-600 text-white hover:text-white rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 disabled:opacity-50 dark:bg-purple-700 dark:hover:bg-purple-600 transition-colors flex items-center justify-center"
                >
                  <FaEnvelope className="mr-2" /> Message to Self
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-shrink-0 flex items-center">
              <span className="mr-2 text-gray-600 dark:text-gray-400 flex items-center">
                <FaFilter className="mr-1" /> Filter:
              </span>
              <select
                className="border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Notes</option>
                <option value="delivered">Delivered</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Notes Section */}
        {loading ? (
          <motion.div 
            variants={itemVariants}
            className="flex justify-center items-center my-12 text-gray-700 dark:text-gray-300"
          >
            <FaSpinner className="animate-spin text-3xl text-indigo-500 mr-2" />
            <span>Loading your notes...</span>
          </motion.div>
        ) : error ? (
          <motion.div 
            variants={itemVariants}
            className="p-4 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-lg"
          >
            {error}
          </motion.div>
        ) : filteredNotes.length === 0 ? (
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center"
          >
            {searchTerm || filterStatus !== 'all' ? (
              <>
                <FaSearch className="text-5xl text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">No Matching Notes</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  We couldn't find any notes matching your search criteria. Try adjusting your filters.
                </p>
                <button 
                  onClick={() => {setSearchTerm(''); setFilterStatus('all');}}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors inline-block"
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <FaClock className="text-5xl text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">No Notes Yet</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You haven't created any time capsule notes yet. Start creating your legacy by adding your first note.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/create-note" 
                    className="px-4 py-2 bg-indigo-600 text-white  hover:text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors inline-block"
                  >
                    Create Your First Note
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredNotes.map(note => {
              const { status, label, badgeClass, deliveryTime } = getDeliveryStatus(note);
              
              return (
                <motion.div
                  key={note._id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 border border-indigo-200 dark:border-indigo-800`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        {note.title}
                        {note.exactTimeDelivery && (
                          <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-1 rounded-full">
                            Exact Time
                          </span>
                        )}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>{label}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {note.content ? note.content.substring(0, 150) + (note.content.length > 150 ? '...' : '') : 'No content available'}
                    </p>
                    <div className="flex flex-col items-start space-y-1">
                      <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="text-blue-600 dark:text-blue-400" />
                        <span className="text-sm dark:text-gray-400 py-3 font-medium">
                          {note.isDelivered ? (
                            <span>Delivered on {format(new Date(note.deliveryDate), 'MMMM d, yyyy')}</span>
                          ) : isReadyForDelivery(note) ? (
                            <span className="text-orange-600 dark:text-orange-400">Processing delivery...</span>
                          ) : (
                            <span>
                              Scheduled for {format(new Date(note.deliveryDate), 'MMMM d, yyyy')}
                              {note.exactTimeDelivery && ` at ${format(new Date(note.deliveryDate), 'h:mm a')}`}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                          to={`/view-note/${note._id}`}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center text-sm"
                        >
                          View
                        </Link>
                      </motion.div>
                      
                      {!note.isDelivered && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Link
                            to={`/edit-note/${note._id}`}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800/40 flex items-center text-sm"
                          >
                            <FaEdit className="mr-1" /> Edit
                          </Link>
                        </motion.div>
                      )}
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleShareNote(note._id)}
                        className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-800/40 flex items-center text-sm"
                      >
                        <FaShare className="mr-1" /> Share
                      </motion.button>
                      
                      {!note.isDelivered && !(note.deliveryDate && new Date() > new Date(note.deliveryDate)) && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteNote(note._id)}
                          className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-800/40 flex items-center text-sm"
                        >
                          <FaTrash className="mr-1" /> Delete
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
