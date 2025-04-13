import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaCalendarCheck } from 'react-icons/fa';
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
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link to="/dashboard" className="text-primary-color hover:underline flex items-center w-auto inline-flex">
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <SelfMessageForm onSuccess={handleSuccess} />
          
          {showSuccessMessage && (
            <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <span className="flex items-center">
                <FaCalendarCheck className="mr-2" />
                Message scheduled successfully!
              </span>
            </div>
          )}
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
              <FaEnvelope className="mr-2" />
              Your Scheduled Messages
            </h2>
            
            {loading ? (
              <p className="text-gray-600">Loading your messages...</p>
            ) : selfMessages.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>You haven't scheduled any messages to yourself yet.</p>
                <p className="mt-2 text-sm">Use the form to send a message to your future self!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selfMessages.map(message => (
                  <div key={message._id} className="border border-gray-200 rounded-md p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg text-primary-color">{message.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        message.isDelivered 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {message.isDelivered ? 'Delivered' : 'Scheduled'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {message.content}
                    </p>
                    
                    <div className="mt-2 text-xs text-gray-500 flex justify-between">
                      <span>
                        Created: {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                      <span>
                        Delivery: {new Date(message.deliveryDate).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="mt-2">
                      <Link 
                        to={`/view-note/${message._id}`} 
                        className="text-sm text-primary-color hover:underline"
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
  );
};

export default SelfMessage; 