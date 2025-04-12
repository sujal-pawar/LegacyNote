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
      <div className="container mx-auto py-8 flex justify-center items-center">
        <FaSpinner className="animate-spin text-3xl text-primary-color mr-2" />
        <span>Loading note...</span>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center text-red-600 mb-4">
            <h1 className="text-2xl font-bold">Error</h1>
          </div>
          <p className="mb-6">{error || 'Failed to load note'}</p>
          <Link to="/dashboard" className="btn btn-primary flex items-center w-auto inline-flex">
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isDelivered = note.isDelivered;
  const isPending = new Date(note.deliveryDate) > new Date();
  const hasRecipient = note.recipient && note.recipient.email;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6">
          <Link to="/dashboard" className="text-primary-color hover:underline flex items-center w-auto inline-flex">
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
        </div>

        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold">{note.title}</h1>
          <div>
            {isDelivered ? (
              <span className="note-badge badge-delivered">Delivered</span>
            ) : isPending ? (
              <span className="note-badge badge-pending">Pending</span>
            ) : (
              <span className="note-badge badge-pending">Processing</span>
            )}
          </div>
        </div>

        <div className="mb-6 flex items-center text-gray-600">
          <FaCalendarAlt className="mr-2" />
          <span>
            Delivery Date: {format(new Date(note.deliveryDate), 'MMMM d, yyyy')}
            {isDelivered && ` (Delivered on ${format(new Date(note.deliveredAt), 'MMMM d, yyyy')})`}
          </span>
        </div>

        {hasRecipient && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Recipient</h3>
            <div className="flex items-center">
              <FaEnvelope className="mr-2 text-gray-600" />
              <span>
                {note.recipient.name} ({note.recipient.email})
              </span>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="p-4 bg-gray-50 rounded-md mb-2 flex items-center">
            <FaLock className="mr-2 text-gray-600" />
            <span className="text-sm text-gray-600">
              This note is {note.isPublic ? 'public and can be shared' : 'private'} and is encrypted for security.
            </span>
          </div>
        </div>

        <div className="mb-8 p-6 bg-white border rounded-md whitespace-pre-wrap">
          {note.content}
        </div>

        <div className="flex flex-wrap gap-3">
          {!isDelivered && (
            <Link
              to={`/edit-note/${note._id}`}
              className="btn btn-outline flex items-center"
            >
              <FaEdit className="mr-2" /> Edit Note
            </Link>
          )}
          
          <button
            onClick={handleShareNote}
            className="btn btn-secondary flex items-center"
          >
            <FaShare className="mr-2" /> Share Note
          </button>
          
          <button
            onClick={handleDeleteNote}
            className="btn btn-danger flex items-center"
          >
            <FaTrash className="mr-2" /> Delete Note
          </button>
        </div>

        {note.shareableLink && (
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Shareable Link</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                type="text"
                value={note.shareableLink}
                className="form-control flex-grow"
                readOnly
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(note.shareableLink);
                  toast.success('Link copied to clipboard');
                }}
                className="btn btn-primary whitespace-nowrap"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewNote; 