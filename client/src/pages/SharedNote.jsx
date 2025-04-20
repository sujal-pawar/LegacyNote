import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FaCalendarAlt, FaSpinner, FaArrowLeft, FaLock, FaExclamationTriangle, FaExclamationCircle, FaShare, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaImage, FaVideo, FaMusic, FaFileAlt, FaFile, FaDownload } from 'react-icons/fa';
import { showSuccessToast, showErrorToast, showInfoToast } from '../utils/toast';
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

  // Add handleShareClick function to fix the reference error
  const handleShareClick = () => {
    const currentUrl = window.location.href;
    
    // Check if browser supports the navigator.clipboard API
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl)
        .then(() => {
          showSuccessToast('Link copied to clipboard!');
        })
        .catch((err) => {
          console.error('Failed to copy link:', err);
          showErrorToast('Failed to copy link to clipboard');
        });
    } else {
      // Fallback for browsers that don't support clipboard API
      try {
        const tempInput = document.createElement('input');
        tempInput.value = currentUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showSuccessToast('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link:', err);
        showErrorToast('Failed to copy link to clipboard');
      }
    }
  };

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
    let fileUrl;
    
    // Check if the file path is already a complete URL (Cloudinary)
    const isCloudinaryUrl = file.filePath && (file.filePath.startsWith('http://') || file.filePath.startsWith('https://'));

    // For Cloudinary URLs, use the URL directly, otherwise build a path with the API base URL
    fileUrl = isCloudinaryUrl
      ? file.filePath
      : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}/${file.filePath}`;

    // Extract file type from MIME type
    const fileType = file.fileType ? file.fileType.split('/')[0] : 'unknown';
    
    // For images
    if (file.fileType && file.fileType.startsWith('image/') || fileType === 'image') {
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
    if (file.fileType && file.fileType.startsWith('video/') || fileType === 'video') {
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
    if (file.fileType && file.fileType.startsWith('audio/') || fileType === 'audio') {
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
      <div className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center mb-2">
          {getFileIcon(file.fileType)}
          <span className="text-gray-700 dark:text-gray-300 truncate max-w-[240px]">
            {file.fileName} ({(file.fileSize / (1024 * 1024)).toFixed(2)} MB)
          </span>
        </div>
        
        {file.fileType.includes('pdf') && (
          <div className="relative mb-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">PDF Preview:</p>
            <iframe 
              src={`${fileUrl}#toolbar=0&navpanes=0`}
              className="w-full h-64 border border-gray-200 dark:border-gray-700 rounded"
              title={`Preview of ${file.fileName}`}
            />
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2">
          <a 
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg shadow text-sm flex items-center justify-center"
            onClick={(e) => {
              // For non-viewable files, force download
              if (file.fileType.includes('pdf') || 
                  file.fileType.includes('doc') || 
                  file.fileType.includes('xls') || 
                  file.fileType.includes('ppt') ||
                  file.fileType === 'application/octet-stream') {
                e.preventDefault();
                const downloadLink = document.createElement('a');
                downloadLink.href = fileUrl;
                downloadLink.download = file.fileName;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
              }
            }}
          >
            <FaDownload className="mr-1" /> Download File
          </a>
          
          {(file.fileType.includes('doc') || file.fileType.includes('xls') || file.fileType.includes('ppt')) && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-0 italic">
              *This file type requires download to view
            </p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 transition-colors duration-200">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <FaSpinner className="animate-spin text-4xl text-indigo-600 dark:text-indigo-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading time capsule...</p>
          </div>
        </div>
      </div>
    );
  }

  if (notAvailableYet && availableDate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 transition-colors duration-200">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <FaLock className="text-5xl text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
              Time Capsule Not Available Yet
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
              This time capsule is scheduled to be opened on:
            </p>
            
            <div className="inline-block bg-indigo-50 dark:bg-indigo-900/30 px-6 py-4 rounded-lg mb-6 text-center">
              <p className="text-xl font-semibold text-indigo-800 dark:text-indigo-300">
                {availableDate && format(availableDate, 'MMMM d, yyyy')}
              </p>
              <p className="text-lg text-indigo-700 dark:text-indigo-400">
                {availableDate && format(availableDate, 'h:mm a')}
              </p>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
              Please come back after this date to view the contents of this time capsule.
            </p>
            
            <Link to="/" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center">
              <FaArrowLeft className="mr-2" /> Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 transition-colors duration-200">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <FaExclamationTriangle className="text-5xl text-amber-500 dark:text-amber-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
              Unable to Access Time Capsule
            </h1>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6 max-w-lg mx-auto text-left">
              <p className="text-red-700 dark:text-red-400 font-medium mb-2">{error}</p>
              {errorDetails && (
                <p className="text-red-600 dark:text-red-300 text-sm">{errorDetails}</p>
              )}
            </div>
            <div className="max-w-lg mx-auto text-gray-600 dark:text-gray-400 mb-6 text-sm">
              <p className="mb-2">This could happen for several reasons:</p>
              <ul className="list-disc pl-5 text-left">
                <li>The link might be incorrect or expired</li>
                <li>The time capsule may have been deleted</li>
                <li>You may not have permission to view this time capsule</li>
              </ul>
            </div>
            <Link to="/" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center">
              <FaArrowLeft className="mr-2" /> Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const goToHomepage = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 transition-colors duration-200">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 break-words">
              {note.title}
            </h1>
            
            {/* Metadata and actions */}
            <div className="flex flex-wrap items-center gap-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg flex items-center">
                <FaCalendarAlt className="mr-1.5" />
                <span>
                  {note.deliveredAt 
                    ? `Opened on ${format(new Date(note.deliveredAt), 'MMMM d, yyyy')}`
                    : `Opened on ${format(new Date(), 'MMMM d, yyyy')}`}
                </span>
              </div>              
            </div>
            
            {/* Note content */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 mb-8 whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed shadow-sm border border-indigo-100 dark:border-indigo-800">
              {note.content}
            </div>
            
            {/* Media files section */}
            {note.mediaFiles && note.mediaFiles.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Attachments
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {note.mediaFiles.map((file, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800/50">
                      {file && file.filePath ? renderMediaPreview(file) : (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm text-center">
                          File information is incomplete
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Footer with call to action */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-900/20 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Create Your Own Time Capsule
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Want to create your own time capsule to send to the future?
                </p>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-block transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedNote;
