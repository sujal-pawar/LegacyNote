import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FaCalendarAlt, FaEdit, FaEnvelope, FaShare, FaTrash, FaSpinner, FaArrowLeft, FaLock, FaImage, FaVideo, FaMusic, FaFileAlt, FaFile, FaUserFriends, FaClock, FaDownload } from 'react-icons/fa';
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
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              {note.title}
              {note.exactTimeDelivery && (
                <span className="ml-3 text-sm bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 px-3 py-1 rounded-full inline-flex items-center">
                  <FaClock className="mr-1" /> Exact Time Delivery
                </span>
              )}
            </h1>
            <div>
              <span className={`${statusInfo.badgeColor} px-2 py-1 rounded-full text-xs font-medium`}>
                {statusInfo.label}
              </span>
            </div>
          </div>

          {/* Add countdown timer for pending notes */}
          {!note.isDelivered && new Date(note.deliveryDate) > new Date() && countdown && (
            <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-center">
              <div className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Countdown to delivery:</div>
              <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 tabular-nums">
                {countdown}
              </div>
            </div>
          )}

          <div className="mb-6 flex items-center text-gray-600 dark:text-gray-400">
            <FaCalendarAlt className="mr-2" />
            <span>
              {note.exactTimeDelivery ? (
                <>
                  Delivery Date/Time: {format(new Date(note.deliveryDate), 'MMMM d, yyyy')} at exactly {format(new Date(note.deliveryDate), 'h:mm:ss a')}
                  {isDelivered && note.deliveredAt && (
                    <span className="ml-2 text-green-600 dark:text-green-400">
                      (Delivered on {format(new Date(note.deliveredAt), 'MMMM d, yyyy')} at {format(new Date(note.deliveredAt), 'h:mm:ss a')})
                    </span>
                  )}
                </>
              ) : (
                <>
                  Delivery Date: {format(new Date(note.deliveryDate), 'MMMM d, yyyy')}
                  {isDelivered && note.deliveredAt && (
                    <span className="ml-2 text-green-600 dark:text-green-400">
                      (Delivered on {format(new Date(note.deliveredAt), 'MMMM d, yyyy')})
                    </span>
                  )}
                </>
              )}
            </span>
          </div>

          {/* Display legacy single recipient */}
          {!note.recipients && note.recipient && note.recipient.email && (
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

          {/* Display multiple recipients if available */}
          {note.recipients && note.recipients.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center mb-3">
                <FaUserFriends className="mr-2 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Recipients ({note.recipients.length})
                </h3>
              </div>
              <div className="space-y-2">
                {note.recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center text-gray-700 dark:text-gray-300 p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <FaEnvelope className="mr-2 text-gray-600 dark:text-gray-400" />
                    <span>
                      {recipient.name} ({recipient.email})
                    </span>
                  </div>
                ))}
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
            
            {/* Add delivery status info when processing */}
            {!note.isDelivered && new Date(note.deliveryDate) <= new Date() && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-2 flex items-center">
                <FaSpinner className="animate-spin mr-2 text-blue-600 dark:text-blue-400" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium">Note is being processed for delivery</p>
                  <p>The exact delivery time has passed. The note is being processed for delivery, which typically takes 2-5 minutes. 
                  This delay is normal as the system prepares and sends out email notifications securely.</p>
                  <p className="mt-1">You can refresh this page in a few minutes to see updated delivery status. 
                  Media files will be accessible once processing is complete.</p>
                </div>
              </div>
            )}
            
            {/* Add delivery confirmation message */}
            {note.isDelivered ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mb-2 flex items-center">
                <FaClock className="mr-2 text-green-600 dark:text-green-400" />
                <div className="text-sm text-green-700 dark:text-green-300">
                  <p className="font-medium">Note successfully delivered!</p>
                  <p>
                    This note was delivered on {format(new Date(note.deliveredAt), 'MMMM d, yyyy')} at {format(new Date(note.deliveredAt), 'h:mm:ss a')}.
                    {note.recipients && note.recipients.length > 0 ? 
                      ' Email notifications have been sent to all recipients.' : 
                      ' All specified delivery actions have been completed.'}
                  </p>
                </div>
              </div>
            ) : new Date(note.deliveryDate) <= new Date() ? (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-2 flex items-center">
                <FaSpinner className="animate-spin mr-2 text-blue-600 dark:text-blue-400" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium">Note is being processed for delivery</p>
                  <p>The note was scheduled for {format(new Date(note.deliveryDate), 'h:mm:ss a')} and is being processed for delivery. 
                  This typically takes 2-5 minutes. You can refresh this page to check delivery status.</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-2 flex items-center">
                <FaClock className="mr-2 text-yellow-600 dark:text-yellow-400" />
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  <p className="font-medium">Scheduled for future delivery</p>
                  <p>
                    This note is scheduled to be delivered on {format(new Date(note.deliveryDate), 'MMMM d, yyyy')} at exactly {format(new Date(note.deliveryDate), 'h:mm:ss a')}.
                    {statusInfo.status === 'pending' && ` (${statusInfo.label})`}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mb-8 p-6 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg whitespace-pre-wrap text-gray-800 dark:text-gray-200">
            {note.content}
          </div>

          {/* After note content section, before actions */}
          {note.mediaFiles && note.mediaFiles.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Attachments ({note.mediaFiles.length})</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                If any media doesn't display correctly, you can use the download buttons to access files directly. For shared notes, you may need to wait until processing completes.
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
            
            {!note.isDelivered && !(note.deliveryDate && new Date() > new Date(note.deliveryDate)) && (
              <button
                onClick={handleDeleteNote}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center"
              >
                <FaTrash className="mr-2" /> Delete Note
              </button>
            )}
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
                    showSuccessToast('Link copied to clipboard');
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
