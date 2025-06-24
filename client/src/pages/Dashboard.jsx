import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaShare, FaCalendarAlt, FaSpinner, FaClock, FaEnvelope, FaFilter, FaSearch, FaExclamationCircle } from 'react-icons/fa';
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
          `Delivered: ${format(new Date(note.deliveredAt), 'MMMM d, yyyy')}${note.exactTimeDelivery ? ` at ${format(new Date(note.deliveredAt), 'h:mm a')}` : ''}` : 
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
        badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
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
      className="min-h-screen py-16 px-6 max-sm:px-4 bg-gradient-to-br from-indigo-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 transition-colors duration-200"
    >
      <div className="container mx-auto">
        {/* Header Section */}
        <motion.div 
          variants={headerVariants}
          className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Welcome <span className="text-indigo-600 dark:text-indigo-400">{user?.name?.split(' ')[0]}!</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {user && `You have ${notes.length} time capsule${notes.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/create-note"
              className="px-4 py-2 bg-indigo-600 text-white hover:text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center justify-center shadow-sm"
            >
              <FaPlus className="mr-2" /> Create Time Capsule
            </Link>
          </div>
        </motion.div>
        
        {/* Search and Filter Bar */}
        <motion.div 
          variants={headerVariants}
          className="mb-6 bg-white dark:bg-black rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search your time capsules..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 whitespace-nowrap w-full sm:w-auto">
              <div className="flex items-center">
                <FaFilter className="mr-2 text-indigo-500 dark:text-indigo-400" />
                <span className="hidden sm:inline text-gray-600 dark:text-gray-400 mr-2">Filter:</span>
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="delivered">Delivered</option>
                <option value="processing">Processing</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Notes Section */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <FaSpinner className="animate-spin text-4xl text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800 text-center">
            <FaExclamationCircle className="text-3xl text-red-500 dark:text-red-400 mx-auto mb-3" />
            <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
            <button 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 mt-3"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : filteredNotes.length === 0 && searchTerm.length > 0 ? (
          <div className="text-center py-12 bg-white dark:bg-black rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <FaSearch className="text-5xl text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No results found</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              We couldn't find any time capsules matching "{searchTerm}". 
              Try a different search term or clear your filters.
            </p>
            <button 
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-black rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="max-w-md mx-auto">
              <FaCalendarAlt className="text-5xl text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No time capsules yet</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create your first time capsule and schedule it for future delivery.
              </p>
              <Link 
                to="/create-note" 
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <FaPlus className="inline mr-2" /> Create Your First Time Capsule
              </Link>
            </div>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredNotes.map((note) => {
              const deliveryStatus = getDeliveryStatus(note);
              const isReadyOnly = isReadyForDelivery(note);
              return (
                <motion.div
                  key={note._id}
                  variants={itemVariants}
                  className="bg-white dark:bg-black rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full flex flex-col transition-all hover:shadow-md"
                >
                  <div className="p-5">
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${deliveryStatus.badgeClass}`}>
                          {deliveryStatus.label}
                        </span>
                        <div className="flex gap-1 text-gray-500 dark:text-gray-400">
                          {note.isPublic && (
                            <span title="Public note" className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded flex items-center">
                              <FaShare className="mr-1" /> Shared
                            </span>
                          )}
                          {note.recipients && note.recipients.length > 0 && (
                            <span title={`${note.recipients.length} recipients`} className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded flex items-center">
                              <FaEnvelope className="mr-1" /> {note.recipients.length}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">
                        {note.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-grow">
                        {note.content}
                      </p>
                      
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center">
                        <FaCalendarAlt className="mr-1.5" /> 
                        {deliveryStatus.deliveryTime}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-auto">
                        <Link
                          to={`/view-note/${note._id}`}
                          className="flex-grow px-4 py-2 text-center rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-800/40 text-indigo-700 dark:text-indigo-300 transition-colors"
                        >
                          View Details
                        </Link>
                        {!note.isDelivered && (
                          <div className="flex gap-1">
                            {!isReadyOnly && (
                              <Link
                                to={`/edit-note/${note._id}`}
                                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                                title="Edit"
                              >
                                <FaEdit />
                              </Link>
                            )}
                            <button
                              onClick={() => handleDeleteNote(note._id)}
                              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-800/40 text-red-700 dark:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                            {note.isPublic && note.shareableLink && (
                              <button
                                onClick={() => handleShareNote(note._id)}
                                className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-800/40 text-indigo-700 dark:text-indigo-300 transition-colors"
                                title="Copy share link"
                              >
                                <FaShare />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
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
