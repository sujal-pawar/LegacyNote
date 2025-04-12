import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FaCalendarAlt, FaSpinner, FaArrowLeft, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import { notesAPI } from '../api/api';

const SharedNote = () => {
  const { id, accessKey } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notAvailableYet, setNotAvailableYet] = useState(false);
  const [availableDate, setAvailableDate] = useState(null);

  useEffect(() => {
    const fetchSharedNote = async () => {
      try {
        setLoading(true);
        const res = await notesAPI.getSharedNote(id, accessKey);
        setNote(res.data.data);
        setError(null);
        setNotAvailableYet(false);
      } catch (err) {
        if (err.response && err.response.status === 403 && err.response.data.availableOn) {
          setNotAvailableYet(true);
          setAvailableDate(new Date(err.response.data.availableOn));
        } else {
          setError('Failed to fetch note. It may have been deleted or the link may be invalid.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSharedNote();
  }, [id, accessKey]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center">
        <FaSpinner className="animate-spin text-3xl text-primary-color mr-2" />
        <span>Loading shared note...</span>
      </div>
    );
  }

  if (notAvailableYet && availableDate) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center text-yellow-600 mb-4">
            <FaExclamationTriangle className="text-3xl mr-3" />
            <h1 className="text-2xl font-bold">Not Available Yet</h1>
          </div>
          <p className="mb-6">
            This note is scheduled to be delivered on {format(availableDate, 'MMMM d, yyyy')} and is not available for viewing yet.
          </p>
          <Link to="/" className="btn btn-primary flex items-center w-auto inline-flex">
            <FaArrowLeft className="mr-2" /> Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center text-red-600 mb-4">
            <FaExclamationTriangle className="text-3xl mr-3" />
            <h1 className="text-2xl font-bold">Error</h1>
          </div>
          <p className="mb-6">{error || 'Failed to load shared note'}</p>
          <Link to="/" className="btn btn-primary flex items-center w-auto inline-flex">
            <FaArrowLeft className="mr-2" /> Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6">
          <Link to="/" className="text-primary-color hover:underline flex items-center w-auto inline-flex">
            <FaArrowLeft className="mr-2" /> Go to Homepage
          </Link>
        </div>

        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold">{note.title}</h1>
          {note.isDelivered && (
            <span className="note-badge badge-delivered">Delivered</span>
          )}
        </div>

        <div className="mb-6 flex items-center text-gray-600">
          <FaCalendarAlt className="mr-2" />
          <span>
            Created for delivery on: {format(new Date(note.deliveryDate), 'MMMM d, yyyy')}
          </span>
        </div>

        <div className="mb-6">
          <div className="p-4 bg-gray-50 rounded-md mb-2 flex items-center">
            <FaLock className="mr-2 text-gray-600" />
            <span className="text-sm text-gray-600">
              This is a securely shared note that was encrypted for privacy.
            </span>
          </div>
        </div>

        <div className="mb-8 p-6 bg-white border rounded-md whitespace-pre-wrap">
          {note.content}
        </div>

        <div className="p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-gray-700">
            This note was shared with you using LegacyNote, a secure digital time capsule platform. 
            Want to create your own time capsule messages? <Link to="/register" className="text-primary-color hover:underline">Sign up</Link> for a free account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedNote; 