import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FaCalendarAlt, FaEdit, FaEnvelope, FaShare, FaTrash, FaSpinner, FaArrowLeft, FaLock, FaImage, FaVideo, FaMusic, FaFileAlt, FaFile, FaUserFriends, FaClock, FaDownload, FaCheckCircle } from 'react-icons/fa';
import { notesAPI } from '../api/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const ViewNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

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

  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      // First, make sure the note is public if it isn't already
      if (!note.isPublic) {
        // Add a direct API call to make the note public before sharing
        console.log('Note is not public, updating...');
        const publicUpdateRes = await fetch(`${import.meta.env.VITE_API_URL || 'https://legacy-note-backend.onrender.com/api'}/notes/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            isPublic: true
          })
        });
        
        if (!publicUpdateRes.ok) {
          throw new Error('Failed to make note public');
        }
        
        console.log('Note successfully made public');
      }
      
      const response = await notesAPI.shareNote(id);
      const { shareableLink } = response.data.data;
      
      setShareLink(shareableLink);
      setShareDialogOpen(true);
      
      // Update local state to reflect the note is now public
      setNote(prevNote => ({
        ...prevNote,
        isPublic: true,
        shareableLink
      }));
    } catch (error) {
      console.error('Error sharing note:', error);
      showErrorToast('Failed to share note. Please try again.');
    } finally {
      setIsSharing(false);
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

    // Check if there are recipients
    const hasRecipients = note.recipients && note.recipients.length > 0;
    const recipientCount = hasRecipients ? note.recipients.length : 0;
    
    let recipientInfo = '';
    if (hasRecipients) {
      recipientInfo = ` This note will be accessible to ${recipientCount} recipient${recipientCount > 1 ? 's' : ''} via email.`;
    }

    if (note.isDelivered) {
      return {
        status: 'delivered',
        label: 'Delivered',
        badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        message: note.deliveredAt 
          ? `This note was successfully delivered on ${format(new Date(note.deliveredAt), 'MMMM d, yyyy')} at ${format(new Date(note.deliveredAt), 'h:mm a')}.${recipientInfo}`
          : `This note has been successfully delivered.${recipientInfo}`
      };
    } else if (deliveryDate > now) {
      // Show detailed time for notes with exact time delivery
      if (note.exactTimeDelivery) {
        let timeLabel = 'Pending Delivery';
        let message = '';
        
        if (isWithinMinute) {
          timeLabel = `Delivery in ${secondsRemaining} second${secondsRemaining !== 1 ? 's' : ''}`;
          message = `This note will be delivered in less than a minute.${recipientInfo}`;
        } else if (isWithinHour) {
          timeLabel = `Delivery in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}`;
          message = `This note will be delivered in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}.${recipientInfo}`;
        } else if (daysRemaining < 1) {
          timeLabel = `Delivery in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}`;
          message = `This note will be delivered in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''} and ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}.${recipientInfo}`;
        } else {
          timeLabel = `Delivery in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;
          message = `This note will be delivered on ${format(deliveryDate, 'MMMM d, yyyy')} at ${format(deliveryDate, 'h:mm a')}.${recipientInfo}`;
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
        message: `This note will be delivered on ${format(deliveryDate, 'MMMM d, yyyy')}.${recipientInfo}`
      };
    } else {
      // If past delivery date but not marked as delivered yet
      const processingTime = Math.abs(Math.floor((now - deliveryDate) / (1000 * 60)));
      
      return {
        status: 'processing',
        label: 'Processing',
        badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
        message: processingTime < 10 
          ? `This note is being processed for delivery now ${note.exactTimeDelivery ? `(scheduled for ${format(deliveryDate, 'h:mm a')})` : ''}.${recipientInfo}` 
          : `This note is taking longer than expected to deliver. It was scheduled for ${format(deliveryDate, 'MMMM d, yyyy')} ${note.exactTimeDelivery ? `at ${format(deliveryDate, 'h:mm a')}` : ''}.${recipientInfo}`
      };
    }
  };
  
  const statusInfo = getNoteStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 transition-colors duration-200">
      {/* Top navigation bar */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link 
            to="/dashboard" 
            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center font-medium"
          >
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
          
          {!loading && !error && note && (
            <div className="hidden sm:flex items-center space-x-2">
              {note.isPublic && note.shareableLink && (
                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-3 py-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                >
                  <FaShare className="mr-1.5" /> Share Link
                </button>
              )}
              
              {!note.isDelivered && new Date() < new Date(note.deliveryDate) && (
                <Link
                  to={`/edit-note/${id}`}
                  className="inline-flex items-center px-3 py-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                >
                  <FaEdit className="mr-1.5 " /> Edit
                </Link>
              )}
              
              {!note.isDelivered && (
                <button
                  onClick={handleDeleteNote}
                  className="inline-flex items-center px-3 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                >
                  <FaTrash className="mr-1.5" /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-69px)] bg-gray-50 dark:bg-gray-900">
          <FaSpinner className="w-12 h-12 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-69px)] px-4 bg-gray-50 dark:bg-gray-900">
          <div className="text-red-500 dark:text-red-400 text-xl mb-4 p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">{error}</div>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Return to Dashboard
          </Link>
        </div>
      ) : !note ? null : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Main content section - takes 2/3 of the width on large screens */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-69px)]">
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
              {/* Title and Created Date */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  {note.title}
                </h1>
                <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                  <FaCalendarAlt className="mr-1.5" />
                  <span>Created on {format(new Date(note.createdAt), 'MMMM d, yyyy')}</span>
                </div>
              </div>

              {/* Note Content */}
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed shadow-sm border border-gray-100 dark:border-gray-700 min-h-[200px] text-lg">
                {note.content}
              </div>

              {/* Media Files Section */}
              {note.mediaFiles && note.mediaFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                    <FaFile className="mr-2 text-indigo-500 dark:text-indigo-400" /> 
                    Attachments ({note.mediaFiles.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {note.mediaFiles.map((file, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
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
              
              {/* Mobile Action Buttons */}
              <div className="flex flex-wrap gap-2 sm:hidden pt-4 border-t border-gray-200 dark:border-gray-700">
                {note.isPublic && note.shareableLink && (
                  <button
                    onClick={handleShare}
                    className="flex-grow px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center justify-center"
                  >
                    <FaShare className="mr-1.5" /> Share
                  </button>
                )}
                
                {!note.isDelivered && new Date() < new Date(note.deliveryDate) && (
                  <Link
                    to={`/edit-note/${id}`}
                    className="flex-grow px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center justify-center"
                  >
                    <FaEdit className="mr-1.5" /> Edit
                  </Link>
                )}
                
                {!note.isDelivered && (
                  <button
                    onClick={handleDeleteNote}
                    className="flex-grow px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-300 dark:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center justify-center"
                  >
                    <FaTrash className="mr-1.5" /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Info sidebar - takes 1/3 of the width on large screens */}
          <div className="lg:col-span-1 bg-gray-50 dark:bg-gray-800/50 min-h-[calc(100vh-69px)] border-t lg:border-t-0 border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Time Capsule Details</h2>
              
              {/* Delivery Status Card */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3">
                  {getNoteStatus().icon}
                  {getNoteStatus().text}
                </h3>
                
                <div className={`p-3 rounded-lg ${getNoteStatus().color}`}>
                  <div className="flex items-center mb-1">
                    {note.isDelivered ? (
                      <FaCheckCircle className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                    ) : (
                      <FaClock className="w-5 h-5 mr-2 text-amber-600 dark:text-amber-400" />
                    )}
                    <span className="font-medium dark:text-white">
                      {note.isDelivered ? 'Delivered' : 'Scheduled for'}
                    </span>
                  </div>
                  
                  <p className="text-sm ml-7 dark:text-gray-300">
                    {format(new Date(note.deliveryDate), 'MMMM d, yyyy h:mm a')}
                  </p>
                  
                  {countdown && (
                    <div className="mt-3 text-center font-mono font-bold p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 rounded">
                      Delivers in: {countdown}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Visibility Status */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3">Visibility</h3>
                
                <div className="flex items-start p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className={`flex-shrink-0 p-1.5 rounded-full ${note.isPublic ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    <FaLock className="w-4 h-4" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      {note.isPublic ? 'Public - Can be shared' : 'Private - For your eyes only'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {note.isPublic 
                        ? 'This note can be shared with anyone with the link.' 
                        : 'This note is only visible to you.'}
                    </p>
                  </div>
                </div>
                
                {note.isPublic && note.shareableLink && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Shareable Link:</div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                      <input 
                        type="text" 
                        value={note.shareableLink} 
                        readOnly 
                        className="w-full flex-grow py-2 px-3 text-xs sm:text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-r-none outline-none text-gray-700 dark:text-gray-300 truncate"
                      />
                      <button
                        onClick={handleShare}
                        className="w-full sm:w-auto px-3 py-2 bg-indigo-600 text-white rounded-lg sm:rounded-l-none hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300 flex items-center justify-center"
                      >
                        <FaShare className="w-4 h-4 mr-2 sm:mr-0" /> 
                        <span className="sm:hidden">Copy Link</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Recipients Card */}
              {note.recipients && note.recipients.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                    <FaUserFriends className="mr-2 text-indigo-500 dark:text-indigo-400" /> 
                    Recipients ({note.recipients.length})
                  </h3>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                    {note.recipients.map((recipient, index) => (
                      <div key={index} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          {recipient.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-2 overflow-hidden">
                          <p className="font-medium mb-[10px] text-gray-700 dark:text-gray-300 text-sm truncate">
                            {recipient.name}
                          </p>
                          <p className="text-xs text-gray-500 mb-[10px] dark:text-gray-400 truncate flex items-center">
                            <FaEnvelope className="mr-1 w-3 h-3" /> {recipient.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Security Info */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 shadow-sm">
                <h3 className="text-base font-medium mb-2 flex items-center text-gray-800 dark:text-gray-200">
                  <FaLock className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" /> Security Information
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {note.isDelivered 
                    ? 'This note has been unlocked and is now visible to all recipients.'
                    : 'This note is encrypted and will be delivered on the scheduled date.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Dialog */}
      {shareDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>
            <div className="inline-block w-full sm:max-w-lg align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all mx-4 sm:my-8 sm:align-middle">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">
                  Share your time capsule
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Use this link to share your time capsule with anyone. They can view it using this link.
                </p>
                <div className="mt-2">
                  <div className="flex flex-col sm:flex-row rounded-md shadow-sm gap-2 sm:gap-0">
                    <input
                      type="text"
                      readOnly
                      value={shareLink}
                      className="flex-1 w-full min-w-0 block px-3 py-2 rounded-md sm:rounded-r-none border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-xs sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(shareLink);
                        showSuccessToast('Link copied to clipboard!');
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border sm:border-l-0 border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md sm:rounded-l-none bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FaShare className="sm:hidden mr-2" /> Copy Link
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShareDialogOpen(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewNote;
