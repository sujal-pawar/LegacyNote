import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FaPlus, FaEdit, FaTrash, FaShare, FaCalendarAlt, FaSpinner, FaClock, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { notesAPI } from '../api/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const res = await notesAPI.getNotes();
        setNotes(res.data.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch notes. Please try again later.');
        toast.error('Failed to fetch notes');
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
        toast.success('Note deleted successfully');
      } catch (err) {
        toast.error('Failed to delete note');
      }
    }
  };

  const handleShareNote = async (id) => {
    try {
      const res = await notesAPI.shareNote(id);
      const shareableLink = res.data.data.shareableLink;
      
      // Copy to clipboard
      navigator.clipboard.writeText(shareableLink);
      
      toast.success('Shareable link copied to clipboard');
      
      // Update the note in the state to reflect it's now shared
      setNotes(notes.map(note => 
        note._id === id ? { ...note, isPublic: true, shareableLink } : note
      ));
    } catch (err) {
      toast.error('Failed to share note');
    }
  };

  // Function to determine delivery status
  const getDeliveryStatus = (note) => {
    const now = new Date();
    const deliveryDate = new Date(note.deliveryDate);
    
    if (note.isDelivered) {
      return { status: 'delivered', label: 'Delivered', badgeClass: 'badge-delivered' };
    } else if (deliveryDate > now) {
      return { status: 'pending', label: 'Pending', badgeClass: 'badge-pending' };
    } else {
      return { status: 'processing', label: 'Processing', badgeClass: 'badge-pending' };
    }
  };

  return (
    <div className="container mx-auto px-10 py-8 max-sm:px-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Notes</h1>
          <p className="text-gray-600">
            Welcome back, <span className='text-indigo-500'>{user?.name?.split(' ')[0]}!</span> Manage your time capsule notes here.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
          <Link to="/create-note" className="btn btn-primary hover:text-white flex items-center justify-center">
            <FaPlus className="mr-2" /> Create New Note
          </Link>
          <Link to="/self-message" className="btn btn-secondary hover:text-white flex items-center justify-center">
            <FaEnvelope className="mr-2" /> Message to Self
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center my-12">
          <FaSpinner className="animate-spin text-3xl text-primary-color mr-2" />
          <span>Loading your notes...</span>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : notes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FaClock className="text-5xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Notes Yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't created any time capsule notes yet. Start creating your legacy by adding your first note.
          </p>
          <Link to="/create-note" className="btn btn-primary">
            Create Your First Note
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => {
            const { status, label, badgeClass } = getDeliveryStatus(note);
            
            return (
              <div key={note._id} className="bg-white rounded-lg shadow-md overflow-hidden note-card">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{note.title}</h3>
                    <span className={`note-badge ${badgeClass}`}>{label}</span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {note.content ? note.content.substring(0, 150) + (note.content.length > 150 ? '...' : '') : 'No content available'}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <FaCalendarAlt className="mr-1" />
                    <span>
                      Delivery: {format(new Date(note.deliveryDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/view-note/${note._id}`}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center text-sm"
                    >
                      View
                    </Link>
                    {!note.isDelivered && (
                      <Link
                        to={`/edit-note/${note._id}`}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center text-sm"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </Link>
                    )}
                    <button
                      onClick={() => handleShareNote(note._id)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 flex items-center text-sm"
                    >
                      <FaShare className="mr-1" /> Share
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center text-sm"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 