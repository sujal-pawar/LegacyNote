import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FaCalendarAlt, FaEdit, FaEnvelope, FaShare, FaTrash, FaSpinner, FaArrowLeft, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { notesAPI } from '../api/api';

const ViewNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const res = await notesAPI.getNote(id);
        setNote(res.data.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch note. It may have been deleted or you may not have permission to view it.');
        toast.error('Failed to fetch note');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  const handleDeleteNote = async () => {
    if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      try {
        await notesAPI.deleteNote(id);
        toast.success('Note deleted successfully');
        navigate('/dashboard');
      } catch (err) {
        toast.error('Failed to delete note');
      }
    }
  };

  const handleShareNote = async () => {
    try {
      const res = await notesAPI.shareNote(id);
      const shareableLink = res.data.data.shareableLink;
      
      // Copy to clipboard
      navigator.clipboard.writeText(shareableLink);
      
      toast.success('Shareable link copied to clipboard');
      
      // Update the note in the state to reflect it's now shared
      setNote({ ...note, isPublic: true, shareableLink });
    } catch (err) {
      toast.error('Failed to share note');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <FaSpinner className="animate-spin text-3xl text-indigo-600 dark:text-indigo-400 mr-2" />
          <span>Loading note...</span>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen py-16 max-sm:py-8 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="flex items-center text-red-600 dark:text-red-400 mb-4">
              <h1 className="text-2xl font-bold">Error</h1>
            </div>
            <p className="mb-6 text-gray-700 dark:text-gray-300">{error || 'Failed to load note'}</p>
            <Link 
              to="/dashboard" 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center w-auto inline-flex"
            >
              <FaArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isDelivered = note.isDelivered;
  const isPending = new Date(note.deliveryDate) > new Date();
  const hasRecipient = note.recipient && note.recipient.email;

  // Determine badge class based on status
  const getBadgeClass = () => {
    if (isDelivered) {
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium";
    } else if (isPending) {
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded-full text-xs font-medium";
    } else {
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full text-xs font-medium";
    }
  };

  return (
    <div className="min-h-screen py-16 max-sm:py-8 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <div className="mb-6">
            <Link 
              to="/dashboard" 
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center w-auto inline-flex"
            >
              <FaArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
          </div>

          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{note.title}</h1>
            <div>
              <span className={getBadgeClass()}>
                {isDelivered ? 'Delivered' : isPending ? 'Pending' : 'Processing'}
              </span>
            </div>
          </div>

          <div className="mb-6 flex items-center text-gray-600 dark:text-gray-400">
            <FaCalendarAlt className="mr-2" />
            <span>
              Delivery Date: {format(new Date(note.deliveryDate), 'MMMM d, yyyy')}
              {isDelivered && ` (Delivered on ${format(new Date(note.deliveredAt), 'MMMM d, yyyy')})`}
            </span>
          </div>

          {hasRecipient && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Recipient</h3>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <FaEnvelope className="mr-2 text-gray-600 dark:text-gray-400" />
                <span>
                  {note.recipient.name} ({note.recipient.email})
                </span>
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-2 flex items-center">
              <FaLock className="mr-2 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                This note is {note.isPublic ? 'public and can be shared' : 'private'} and is encrypted for security.
              </span>
            </div>
          </div>

          <div className="mb-8 p-6 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg whitespace-pre-wrap text-gray-800 dark:text-gray-200">
            {note.content}
          </div>

          <div className="flex flex-wrap gap-3">
            {!isDelivered && (
              <Link
                to={`/edit-note/${note._id}`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center"
              >
                <FaEdit className="mr-2" /> Edit Note
              </Link>
            )}
            
            <button
              onClick={handleShareNote}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center"
            >
              <FaShare className="mr-2" /> Share Note
            </button>
            
            <button
              onClick={handleDeleteNote}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center"
            >
              <FaTrash className="mr-2" /> Delete Note
            </button>
          </div>

          {note.shareableLink && (
            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Shareable Link</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <input
                  type="text"
                  value={note.shareableLink}
                  className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  readOnly
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(note.shareableLink);
                    toast.success('Link copied to clipboard');
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors whitespace-nowrap"
                >
                  Copy Link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewNote;
