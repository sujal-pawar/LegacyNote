import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaCalendarCheck, FaSpinner, FaFile } from 'react-icons/fa';
import SelfMessageForm from '../components/SelfMessageForm';
import { notesAPI } from '../api/api';
import { useAuth } from '../contexts/AuthContext';

const SelfMessage = () => {
  const { user } = useAuth();
  const [selfMessages, setSelfMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Fetch user's self-messages
  useEffect(() => {
    const fetchSelfMessages = async () => {
      try {
        setLoading(true);
        const res = await notesAPI.getNotes();
        
        // Filter notes that are sent to self (recipient email matches user email)
        const selfNotes = res.data.data.filter(note => 
          note.recipient && 
          note.recipient.email === user?.email
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setSelfMessages(selfNotes);
      } catch (error) {
        console.error('Error fetching self messages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSelfMessages();
    }
  }, [user]);

  // Handle successful message scheduling
  const handleSuccess = () => {
    // Show success message
    setShowSuccessMessage(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
    
    // Refresh the list of self-messages
    if (user) {
      setLoading(true);
      notesAPI.getNotes()
        .then(res => {
          const selfNotes = res.data.data.filter(note => 
            note.recipient && 
            note.recipient.email === user?.email
          ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          setSelfMessages(selfNotes);
        })
        .catch(err => console.error('Error refreshing self messages:', err))
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className="min-h-screen py-16 max-sm:py-8 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link 
              to="/dashboard" 
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-200">
            Message Your Future Self
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                  Create a Time Capsule Message
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Send a message to your future self. Set a date when you want to receive it.
                </p>
                
                <SelfMessageForm onSuccess={handleSuccess} />
                
                {showSuccessMessage && (
                  <div className="mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-4 rounded-lg shadow-md flex items-center">
                    <FaCalendarCheck className="mr-3 text-xl flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white">Message scheduled successfully!</p>
                      <p className="text-sm text-green-100">Your future self will be notified on the specified date.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                  <FaEnvelope className="mr-2" />
                  Your Scheduled Messages
                </h2>
                
                {loading ? (
                  <div className="flex justify-center items-center py-12 text-gray-700 dark:text-gray-300">
                    <FaSpinner className="animate-spin text-xl text-indigo-600 dark:text-indigo-400 mr-2" />
                    <span>Loading your messages...</span>
                  </div>
                ) : selfMessages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p>You haven't scheduled any messages to yourself yet.</p>
                    <p className="mt-2 text-sm">Use the form to send a message to your future self!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selfMessages.map(message => (
                      <div 
                        key={message._id} 
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-700"
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg text-indigo-600 dark:text-indigo-400">{message.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            message.isDelivered 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {message.isDelivered ? 'Delivered' : 'Scheduled'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {message.content}
                        </p>
                        
                        {/* Display media files badge if present */}
                        {message.mediaFiles && message.mediaFiles.length > 0 && (
                          <div className="mt-2 flex items-center">
                            <span className="inline-flex items-center text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-full">
                              <FaFile className="mr-1" /> 
                              {message.mediaFiles.length} {message.mediaFiles.length === 1 ? 'attachment' : 'attachments'}
                            </span>
                          </div>
                        )}
                        
                        <div className="mt-3 text-xs text-gray-500 dark:text-gray-500 flex justify-between">
                          <span>
                            Created: {new Date(message.createdAt).toLocaleDateString()}
                          </span>
                          <span>
                            Delivery: {new Date(message.deliveryDate).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="mt-3">
                          <Link 
                            to={`/view-note/${message._id}`} 
                            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelfMessage;
