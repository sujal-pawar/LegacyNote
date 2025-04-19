import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FaCalendarAlt, FaSpinner, FaArrowLeft, FaLock, FaExclamationTriangle, FaExclamationCircle, FaShare, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaImage, FaVideo, FaMusic, FaFileAlt, FaFile, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { notesAPI } from '../api/api';
import { motion } from 'framer-motion';

const SharedNote = () => {
  const { id, accessKey } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [notAvailableYet, setNotAvailableYet] = useState(false);
  const [availableDate, setAvailableDate] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchSharedNote = async () => {
      try {
        // Validate the parameters before making the request
        if (!id || !accessKey) {
          setError('Invalid link parameters');
          setErrorDetails('The link appears to be incomplete or malformed');
          setLoading(false);
          return;
        }

        setLoading(true);
        const res = await notesAPI.getSharedNote(id, accessKey);
        setNote(res.data.data);
        setError(null);
        setErrorDetails(null);
        setNotAvailableYet(false);
      } catch (err) {
        console.error('Error fetching shared note:', err);

        // Handle specific error cases
        if (err.response) {
          // Handle not available yet case
          if (err.response.status === 403 && err.response.data.availableOn) {
            setNotAvailableYet(true);
            setAvailableDate(new Date(err.response.data.availableOn));
          } else {
            // Handle other API errors
            setError(err.response.data.error || 'Failed to fetch note');
            setErrorDetails(err.response.data.details || 'The note may have been deleted or the link may be invalid');
          }
        } else if (err.request) {
          // Handle network errors
          setError('Network error');
          setErrorDetails('Unable to connect to the server. Please check your internet connection and try again');
        } else {
          // Handle unexpected errors
          setError('Something went wrong');
          setErrorDetails('An unexpected error occurred while trying to access the note');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSharedNote();
  }, [id, accessKey]);

  // Get file icon based on MIME type
  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <FaImage className="mr-2" />;
    if (mimeType.startsWith('video/')) return <FaVideo className="mr-2" />;
    if (mimeType.startsWith('audio/')) return <FaMusic className="mr-2" />;
    if (mimeType.startsWith('application/pdf')) return <FaFileAlt className="mr-2" />;
    return <FaFile className="mr-2" />;
  };

  // Render media preview based on type
  const renderMediaPreview = (file) => {
    // Create a proper URL for the file
    let fileUrl = file.path;
    
    // Extract file type from MIME type
    const fileType = file.mimeType ? file.mimeType.split('/')[0] : 'unknown';
    
    // Check if the file path is already a complete URL (Cloudinary)
    const isCloudinaryUrl = file.filePath && (file.filePath.startsWith('http://') || file.filePath.startsWith('https://'));

    // For Cloudinary URLs, use the URL directly, otherwise build a path with the API base URL
    fileUrl = isCloudinaryUrl
      ? file.filePath
      : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${file.filePath}`;

    // For images
    if (fileType === 'image') {
      return (
        <div className="relative">
          <img
            src={fileUrl}
            alt={file.fileName}
            className="w-full h-auto rounded-lg max-h-96 object-contain"
            onError={(e) => {
              console.error('Image failed to load:', fileUrl);
              e.target.onerror = null;
              e.target.src = '/file-error.png';
              e.target.classList.add('bg-red-50', 'dark:bg-red-900/20', 'p-4');
            }}
          />
          <a
            href={fileUrl}
            className="absolute bottom-2 right-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg shadow text-sm flex items-center"
            target="_blank"
            rel="noopener noreferrer"
            download={file.fileName}
          >
            <FaDownload className="mr-1" /> Download
          </a>
        </div>
      );
    }

    // For video
    if (fileType === 'video') {
      return (
        <div className="relative">
          <video
            controls
            className="w-full h-auto rounded-lg max-h-96 object-contain"
            onError={(e) => {
              console.error('Video failed to load:', fileUrl);
              e.target.classList.add('hidden');
              e.target.parentNode.innerHTML += `
                <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                  <p class="text-red-700 dark:text-red-400 mb-2">Unable to play this video</p>
                  <a href="${fileUrl}" class="text-indigo-600 hover:text-indigo-500 flex items-center justify-center" target="_blank" rel="noopener noreferrer" download="${file.fileName}">
                    <span class="mr-1">⬇️</span> Download Video Instead
                  </a>
                </div>
              `;
            }}
          >
            <source src={fileUrl} type={file.fileType} />
            Your browser does not support the video tag.
          </video>
          <a
            href={fileUrl}
            className="absolute bottom-2 right-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg shadow text-sm flex items-center"
            target="_blank"
            rel="noopener noreferrer"
            download={file.fileName}
          >
            <FaDownload className="mr-1" /> Download
          </a>
        </div>
      );
    }

    // For audio
    if (fileType === 'audio') {
      return (
        <div>
          <audio
            controls
            className="w-full mb-2"
            onError={(e) => {
              console.error('Audio failed to load:', fileUrl);
              e.target.classList.add('hidden');
              e.target.parentNode.innerHTML += `
                <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                  <p class="text-red-700 dark:text-red-400 mb-2">Unable to play this audio</p>
                  <a href="${fileUrl}" class="text-indigo-600 hover:text-indigo-500 flex items-center justify-center" target="_blank" rel="noopener noreferrer" download="${file.fileName}">
                    <span class="mr-1">⬇️</span> Download Audio Instead
                  </a>
                </div>
              `;
            }}
          >
            <source src={fileUrl} type={file.fileType} />
            Your browser does not support the audio tag.
          </audio>
          <a
            href={fileUrl}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg shadow text-sm flex items-center w-auto"
            target="_blank"
            rel="noopener noreferrer"
            download={file.fileName}
          >
            <FaDownload className="mr-1" /> Download Audio
          </a>
        </div>
      );
    }

    // For other files (documents, etc.)
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center mb-3 sm:mb-0">
          {getFileIcon(file.fileType)}
          <span className="text-gray-700 dark:text-gray-300 truncate max-w-[240px]">
            {file.fileName} ({(file.fileSize / (1024 * 1024)).toFixed(2)} MB)
          </span>
        </div>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg shadow text-sm flex items-center w-auto justify-center"
          download={file.fileName}
        >
          <FaDownload className="mr-1" /> Download File
        </a>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <FaSpinner className="animate-spin text-4xl text-primary-color mb-4" />
            <span className="text-lg text-gray-600 dark:text-gray-300">Loading your time capsule...</span>
          </motion.div>
        </div>
      </div>
    );
  }

  if (notAvailableYet && availableDate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto py-8 min-h-[60vh] flex items-center px-4"
        >
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-yellow-200 dark:border-yellow-700">
            <div className="flex items-center text-yellow-600 dark:text-yellow-400 mb-4">
              <FaExclamationTriangle className="text-4xl mr-3" />
              <h1 className="text-3xl font-bold">Time Capsule Not Yet Available</h1>
            </div>
            <p className="mb-6 text-lg text-gray-700 dark:text-gray-300">
              This time capsule is scheduled to be delivered on{' '}
              <span className="font-semibold text-yellow-700 dark:text-yellow-400">
                {format(availableDate, 'MMMM d, yyyy')}
              </span>
              . Please check back then to view its contents.
            </p>
            <Link
              to="/"
              className="btn btn-primary flex text-white hover:text-white items-center w-auto inline-flex transform hover:scale-105 transition-transform"
            >
              <FaArrowLeft className="mr-2" /> Return to Homepage
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto py-8 min-h-[60vh] flex items-center px-4"
        >
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-red-200 dark:border-red-700">
            <div className="flex items-center text-red-600 dark:text-red-400 mb-4">
              <FaExclamationCircle className="text-4xl mr-3" />
              <h1 className="text-3xl font-bold">Unable to Access Time Capsule</h1>
            </div>
            <p className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">{error || 'Failed to load shared note'}</p>
            {errorDetails && <p className="mb-6 text-gray-600 dark:text-gray-400">{errorDetails}</p>}
            <div className="mt-6">
              <Link
                to="/"
                className="btn btn-primary flex items-center w-auto inline-flex transform hover:scale-105 transition-transform"
              >
                <FaArrowLeft className="mr-2" /> Return to Homepage
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const goToHomepage = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5 dark:opacity-10"></div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto py-8 min-h-[60vh] px-4"
      >
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-900 to-indigo-600 to-indigo-500 p-6 text-white">          
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">              
              <div>                
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">{note.title}</h1>
                <div className="flex items-center text-white/90">
                  <FaCalendarAlt className="mr-2" />
                  <span>
                    Created for delivery on: {format(new Date(note.deliveryDate), 'MMMM d, yyyy')}
                  </span>
                  {note.isOwner && (
                    <div className="ml-3 bg-white/20 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Owner
                    </div>
                  )}
                </div>
                {note.sender && (
                  <div className="mt-2 text-white/90">
                    <span className="font-semibold">From: </span>
                    {note.sender.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800 flex items-center">
                <FaLock className="mr-3 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-700 dark:text-blue-300">
                  This is a securely shared time capsule that was encrypted for privacy.
                </span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600 whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed"
            >
              {note.content}
            </motion.div>

            {note.mediaFiles && note.mediaFiles.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Attachments ({note.mediaFiles.length})</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  If media files aren't displaying correctly, you can download them directly using the download buttons. If files are still processing, wait a few minutes and refresh the page.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {note.mediaFiles.map((file, index) => (
                    <div key={index} className="p-4 border rounded-lg dark:border-gray-600">
                      {file && file.filePath ? renderMediaPreview(file) : (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                          <p className="text-yellow-700 dark:text-yellow-400 mb-2">
                            File information is incomplete or missing
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-primary-color/10 dark:from-indigo-900/30 dark:to-primary-color/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                This time capsule was shared with you using LegacyNote, a secure digital time capsule platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="btn btn-primary flex items-center justify-center transform hover:scale-105 transition-transform"
                >
                  Create Your Own Time Capsule
                </Link>
                <Link
                  to="/"
                  className="btn btn-outline flex items-center justify-center transform hover:scale-105 transition-transform"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SharedNote;
