import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FaCalendarAlt, FaEdit, FaEnvelope, FaShare, FaTrash, FaSpinner, FaArrowLeft, FaLock, FaImage, FaVideo, FaMusic, FaFileAlt, FaFile, FaUserFriends, FaClock, FaDownload, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import { notesAPI } from '../api/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const ViewNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const res = await notesAPI.getNote(id);
        setNote(res.data.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch note. It may have been deleted or you may not have permission to view it.');
        showErrorToast('Failed to fetch note');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);
  
  // Add live countdown timer for pending notes
  useEffect(() => {
    if (!note || note.isDelivered || new Date(note.deliveryDate) <= new Date()) {
      return;
    }
    
    // Start the countdown timer
    const timer = setInterval(() => {
      const now = new Date();
      const deliveryDate = new Date(note.deliveryDate);
      const timeRemaining = deliveryDate - now;
      
      // If delivery time has passed, refresh the note data
      if (timeRemaining <= 0) {
        clearInterval(timer);
        setCountdown(null);
        // Refresh note data after delivery time has passed
        setTimeout(() => {
          notesAPI.getNote(id).then(res => {
            setNote(res.data.data);
          }).catch(err => {
            console.error('Failed to refresh note data:', err);
          });
        }, 5000); // Wait 5 seconds to allow server to process
        return;
      }
      
      // Calculate countdown components
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
      
      // Format countdown display
      let countdownText = '';
      if (days > 0) {
        countdownText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      } else if (hours > 0) {
        countdownText = `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        countdownText = `${minutes}m ${seconds}s`;
      } else {
        countdownText = `${seconds}s`;
      }
      
      setCountdown(countdownText);
    }, 1000);
    
    // Clean up the timer
    return () => clearInterval(timer);
  }, [note, id]);

  const handleDeleteNote = async () => {
    if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      try {
        await notesAPI.deleteNote(id);
        showSuccessToast('Note deleted successfully');
        navigate('/dashboard');
      } catch (err) {
        showErrorToast('Failed to delete note');
      }
    }
  };

  const handleShareNote = async () => {
    try {
      const res = await notesAPI.shareNote(id);
      const shareableLink = res.data.data.shareableLink;
      
      // Copy to clipboard
      navigator.clipboard.writeText(shareableLink);
      
      showSuccessToast('Shareable link copied to clipboard');
      
      // Update the note in the state to reflect it's now shared
      setNote({ ...note, isPublic: true, shareableLink });
    } catch (err) {
      showErrorToast('Failed to share note');
    }
  };

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
    // Check if the file path is already a complete URL (Cloudinary)
    const isCloudinaryUrl = file.filePath && (file.filePath.startsWith('http://') || file.filePath.startsWith('https://'));
    
    // For Cloudinary URLs, use the URL directly, otherwise build a path with the API base URL
    const fileUrl = isCloudinaryUrl 
      ? file.filePath 
      : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}/${file.filePath}`;
    
    // For images
    if (file.fileType.startsWith('image/')) {
      return (
        <div className="relative">
          <img 
            src={fileUrl} 
            alt={file.fileName} 
            className="w-full h-auto rounded-lg max-h-96 object-contain" 
            onError={(e) => {
              console.error('Image failed to load:', fileUrl);
              e.target.onerror = null;
              e.target.src = '/placeholder-image.png'; // Fallback image
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
    if (file.fileType.startsWith('video/')) {
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
    if (file.fileType.startsWith('audio/')) {
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

  // Get note status (for display in UI)
  const getNoteStatus = () => {
    if (!note) return null;

    const now = new Date();
    const deliveryDate = new Date(note.deliveryDate);
    const isPending = new Date(note.deliveryDate) > new Date();

    // Calculate time remaining
    const timeRemaining = deliveryDate - now;
    const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const secondsRemaining = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    // For indicating very close delivery times
    const isWithinHour = hoursRemaining < 1 && hoursRemaining >= 0 && minutesRemaining >= 0;
    const isWithinMinute = minutesRemaining < 1 && minutesRemaining >= 0 && secondsRemaining >= 0;

    if (note.isDelivered) {
      return {
        status: 'delivered',
        label: 'Delivered',
        badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        message: note.deliveredAt 
          ? `This note was successfully delivered on ${format(new Date(note.deliveredAt), 'MMMM d, yyyy')} at ${format(new Date(note.deliveredAt), 'h:mm a')}.`
          : 'This note has been successfully delivered.'
      };
    } else if (deliveryDate > now) {
      // Show detailed time for notes with exact time delivery
      if (note.exactTimeDelivery) {
        let timeLabel = 'Pending Delivery';
        let message = '';
        
        if (isWithinMinute) {
          timeLabel = `Delivery in ${secondsRemaining} second${secondsRemaining !== 1 ? 's' : ''}`;
          message = `This note will be delivered in less than a minute.`;
        } else if (isWithinHour) {
          timeLabel = `Delivery in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}`;
          message = `This note will be delivered in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}.`;
        } else if (daysRemaining < 1) {
          timeLabel = `Delivery in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}`;
          message = `This note will be delivered in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''} and ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}.`;
        } else {
          timeLabel = `Delivery in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;
          message = `This note will be delivered on ${format(deliveryDate, 'MMMM d, yyyy')} at ${format(deliveryDate, 'h:mm a')}.`;
        }
        
        return {
          status: 'pending',
          label: timeLabel,
          badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
          message: message
        };
      }
      
      return {
        status: 'pending',
        label: 'Pending Delivery',
        badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        message: `This note will be delivered on ${format(deliveryDate, 'MMMM d, yyyy')}.`
      };
    } else {
      // If past delivery date but not marked as delivered yet
      const processingTime = Math.abs(Math.floor((now - deliveryDate) / (1000 * 60)));
      
      return {
        status: 'processing',
        label: 'Processing',
        badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        message: processingTime < 10 
          ? `This note is being processed for delivery now.` 
          : `This note is taking longer than expected to deliver. It was scheduled for ${format(deliveryDate, 'h:mm a')}.`
      };
    }
  };
  
  const statusInfo = getNoteStatus();

  return (
    <div className="min-h-screen py-10 max-sm:py-5 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-5 sm:p-8 rounded-xl shadow-lg">
          <div className="mb-4 sm:mb-6">
            <Link 
              to="/dashboard" 
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center w-auto inline-flex text-sm sm:text-base"
            >
              <FaArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6 gap-2 sm:gap-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 break-words pr-2">
              {note.title}
              {note.exactTimeDelivery && (
                <span className="mt-2 ml-0 sm:ml-3 text-xs sm:text-sm bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-1 rounded-full inline-flex items-center">
                  <FaClock className="mr-1" /> Exact Time
                </span>
              )}
            </h1>
            <div className="mt-2 sm:mt-0">
              <span className={`${statusInfo.badgeColor} px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap`}>
                {statusInfo.label}
              </span>
            </div>
          </div>

          {/* Add countdown timer for pending notes */}
          {!note.isDelivered && new Date(note.deliveryDate) > new Date() && countdown && (
            <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-center">
              <div className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Countdown to delivery:</div>
              <div className="text-xl sm:text-2xl font-bold text-indigo-700 dark:text-indigo-400 tabular-nums">
                {countdown}
              </div>
            </div>
          )}

          <div className="mb-4 sm:mb-6 flex flex-wrap items-start text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            <FaCalendarAlt className="mr-2 mt-1 flex-shrink-0" />
            <span className="flex-1">
              {note.exactTimeDelivery ? (
                <>
                  Delivery: {format(new Date(note.deliveryDate), 'MMM d, yyyy')} at {format(new Date(note.deliveryDate), 'h:mm a')}
                  {isDelivered && note.deliveredAt && (
                    <span className="block sm:inline sm:ml-2 text-green-600 dark:text-green-400 mt-1 sm:mt-0">
                      (Delivered: {format(new Date(note.deliveredAt), 'MMM d, yyyy')} at {format(new Date(note.deliveredAt), 'h:mm a')})
                    </span>
                  )}
                </>
              ) : (
                <>
                  Delivery Date: {format(new Date(note.deliveryDate), 'MMMM d, yyyy')}
                  {isDelivered && note.deliveredAt && (
                    <span className="block sm:inline sm:ml-2 text-green-600 dark:text-green-400 mt-1 sm:mt-0">
                      (Delivered: {format(new Date(note.deliveredAt), 'MMM d, yyyy')})
                    </span>
                  )}
                </>
              )}
            </span>
          </div>

          {/* Display legacy single recipient */}
          {!note.recipients && note.recipient && note.recipient.email && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Recipient</h3>
              <div className="flex items-center text-sm sm:text-base text-gray-700 dark:text-gray-300">
                <FaEnvelope className="mr-2 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <span className="break-words">
                  {note.recipient.name} ({note.recipient.email})
                </span>
              </div>
            </div>
          )}

          {/* Display multiple recipients if available */}
          {note.recipients && note.recipients.length > 0 && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center mb-3">
                <FaUserFriends className="mr-2 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Recipients ({note.recipients.length})
                </h3>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {note.recipients.map((recipient, index) => (
                  <div key={index} className="flex items-start sm:items-center text-sm sm:text-base text-gray-700 dark:text-gray-300 p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <FaEnvelope className="mr-2 mt-1 sm:mt-0 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                    <span className="break-words">
                      {recipient.name} ({recipient.email})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-2 flex items-center">
              <FaLock className="mr-2 text-gray-600 dark:text-gray-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                This note is {note.isPublic ? 'public and can be shared' : 'private'} and is encrypted for security.
              </span>
            </div>
            
            {/* Add shareable link display section when available */}
            {note.isPublic && note.shareableLink && (
              <div className="p-3 sm:p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mb-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="flex items-center">
                    <FaShare className="mr-2 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-300">
                      Shareable Link:
                    </span>
                  </div>
                  <div className="flex-1 w-full flex items-center">
                    <input
                      type="text"
                      readOnly
                      value={note.shareableLink}
                      className="flex-1 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-l-md py-1 px-2 w-full text-gray-700 dark:text-gray-300"
                      onClick={(e) => e.target.select()}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(note.shareableLink);
                        showSuccessToast('Link copied to clipboard!');
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm py-1 px-3 rounded-r-md flex items-center"
                    >
                      <FaShare className="mr-1" /> Copy
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Add delivery status info when processing */}
            {!note.isDelivered && new Date(note.deliveryDate) <= new Date() && (
              <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-2 flex items-start sm:items-center">
                <FaSpinner className="animate-spin mr-2 mt-1 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium">Note is being processed for delivery</p>
                  <p>
                    {note.exactTimeDelivery 
                      ? `This note was scheduled with exact time delivery for ${format(new Date(note.deliveryDate), 'MMMM d, yyyy')} at ${format(new Date(note.deliveryDate), 'h:mm a')} and is now being processed.`
                      : `The note was scheduled for ${format(new Date(note.deliveryDate), 'MMMM d, yyyy')} and is being processed.`
                    } 
                    This typically takes 2-5 minutes. Refresh this page to check delivery status.
                  </p>
                </div>
              </div>
            )}
            
            {/* Add delivery confirmation message */}
            {note.isDelivered ? (
              <div className="flex items-center text-green-600 dark:text-green-400 mb-4">
                <FaCheckCircle className="mr-2" />
                Note was delivered on {format(new Date(note.deliveredAt || note.deliveryDate), 'MMMM d, yyyy')}
                {note.exactTimeDelivery && ` at ${format(new Date(note.deliveredAt || note.deliveryDate), 'h:mm a')}`}
              </div>
            ) : new Date(note.deliveryDate) <= new Date() ? (
              <div className="flex items-center text-blue-600 dark:text-blue-400 mb-4">
                <FaInfoCircle className="mr-2" />
                {note.exactTimeDelivery 
                  ? `This note was scheduled for ${format(new Date(note.deliveryDate), 'MMMM d, yyyy')} at ${format(new Date(note.deliveryDate), 'h:mm a')} and is being processed for delivery.`
                  : `This note was scheduled for ${format(new Date(note.deliveryDate), 'MMMM d, yyyy')} and is being processed for delivery.`}
              </div>
            ) : (
              <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-2 flex items-start sm:items-center">
                <FaClock className="mr-2 mt-1 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
                  <p className="font-medium">Scheduled for future delivery</p>
                  <p className="break-words">
                    This note is scheduled for {format(new Date(note.deliveryDate), 'MMM d, yyyy')} 
                    {note.exactTimeDelivery ? ` at ${format(new Date(note.deliveryDate), 'h:mm a')}` : ''}.
                    {statusInfo.status === 'pending' && ` (${statusInfo.label})`}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6 p-4 sm:p-6 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-sm sm:text-base overflow-auto">
            {note.content}
          </div>

          {/* Media files section */}
          {note.mediaFiles && note.mediaFiles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Attachments ({note.mediaFiles.length})</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
                If any media doesn't display correctly, you can use the download buttons to access files directly.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {note.mediaFiles.map((file, index) => (
                  <div key={index} className="p-3 sm:p-4 border rounded-lg dark:border-gray-600">
                    {file && file.filePath ? renderMediaPreview(file) : (
                      <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                        <p className="text-yellow-700 dark:text-yellow-400 mb-2 text-sm">
                          File information is incomplete or missing
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions Button Group - Keep these at bottom for mobile friendly access */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-start items-stretch sm:items-center mt-6">
            {/* Edit button - only for undelivered notes */}
            {!isDelivered && isPending && (
              <Link
                to={`/edit-note/${note._id}`}
                className="btn btn-primary flex items-center justify-center"
              >
                <FaEdit className="mr-2" /> Edit Note
              </Link>
            )}
            
            {/* Share button - can be disabled based on status */}
            <button
              onClick={handleShareNote}
              disabled={!note.isPublic && isDelivered}
              title={note.isPublic 
                ? "Copy the shareable link to your clipboard" 
                : "Make this note public and generate a shareable link that anyone can access"}
              className={`btn ${
                note.isPublic ? 'btn-secondary' : 'btn-outline'
              } flex items-center justify-center ${
                !note.isPublic && isDelivered ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FaShare className="mr-2" /> {note.isPublic ? 'Copy Link to Clipboard' : 'Make Public & Generate Link'}
            </button>
            
            {/* Delete button - only for undelivered notes */}
            {!isDelivered && (
              <button
                onClick={handleDeleteNote}
                className="btn btn-danger flex items-center justify-center"
              >
                <FaTrash className="mr-2" /> Delete Note
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewNote;
