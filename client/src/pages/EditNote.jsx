import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { FaCalendarAlt, FaEnvelope, FaUser, FaLock, FaSpinner, FaArrowLeft, FaFile, FaTimes, FaImage, FaVideo, FaMusic, FaFileAlt, FaPlus, FaUserFriends } from 'react-icons/fa';
import { notesAPI } from '../api/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const EditNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [includeRecipients, setIncludeRecipients] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [fileErrors, setFileErrors] = useState('');
  
  // Max file size in bytes (5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  
  // Allowed file types
  const ALLOWED_FILE_TYPES = [
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    // Documents
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/ogg',
    // Video
    'video/mp4', 'video/webm', 'video/quicktime'
  ];

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const res = await notesAPI.getNote(id);
        const noteData = res.data.data;
        
        // Check if the note has multiple recipients
        if (noteData.recipients && noteData.recipients.length > 0) {
          setIncludeRecipients(true);
        }
        // Check if the note has a single recipient (legacy)
        else if (noteData.recipient && noteData.recipient.email) {
          setIncludeRecipients(true);
        }
        
        // Set existing files if any
        if (noteData.mediaFiles && noteData.mediaFiles.length > 0) {
          setExistingFiles(noteData.mediaFiles);
        }
        
        setNote(noteData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch note. It may have been deleted or you may not have permission to edit it.');
        showErrorToast('Failed to fetch note');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  // Validation schema
  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Title is required')
      .max(100, 'Title must be less than 100 characters'),
    content: Yup.string()
      .required('Content is required'),
    deliveryDate: Yup.date()
      .required('Delivery date is required')
      .min(new Date(new Date().setHours(0, 0, 0, 0)), 'Delivery date cannot be in the past'),
    isPublic: Yup.boolean(),
    recipients: Yup.array().of(
      Yup.object().shape({
        name: Yup.string()
          .required('Name is required'),
        email: Yup.string()
          .email('Invalid email')
          .required('Email is required'),
      })
    ).when('$includeRecipients', {
      is: true,
      then: Yup.array()
        .min(1, 'At least one recipient is required')
        .max(10, 'Maximum of 10 recipients allowed')
    }),
  }).test(
    'at-least-one-checkbox',
    'Please select at least one: make public or send to someone',
    function (values) {
      const { isPublic } = values;
      const { includeRecipients } = this.options.context || {};
      return isPublic || includeRecipients;
    }
  );

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate files
    let errors = '';
    
    // Check file size and type
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        errors = `${file.name} is too large. Maximum file size is 5MB.`;
        return false;
      }
      
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errors = `${file.name} has an unsupported file type.`;
        return false;
      }
      
      return true;
    });
    
    if (errors) {
      setFileErrors(errors);
      return;
    }
    
    // Check total number of files
    if (existingFiles.length + selectedFiles.length + validFiles.length > 5) {
      setFileErrors('Maximum 5 files can be uploaded.');
      return;
    }
    
    setFileErrors('');
    setSelectedFiles([...selectedFiles, ...validFiles]);
  };

  // Remove a file from the selected files
  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  // Remove an existing file
  const removeExistingFile = (index) => {
    const newFiles = [...existingFiles];
    newFiles.splice(index, 1);
    setExistingFiles(newFiles);
  };

  // Get file icon based on MIME type
  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <FaImage />;
    if (mimeType.startsWith('video/')) return <FaVideo />;
    if (mimeType.startsWith('audio/')) return <FaMusic />;
    if (mimeType.startsWith('application/pdf')) return <FaFileAlt />;
    return <FaFile />;
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add note data to FormData
      formData.append('title', values.title);
      formData.append('content', values.content);
      formData.append('deliveryDate', values.deliveryDate);
      formData.append('isPublic', values.isPublic ? 'true' : 'false');
      
      // Add recipients if they're included - ensure we're handling this properly
      if (includeRecipients && values.recipients && values.recipients.length > 0) {
        // Make sure recipients is stringified properly
        const recipientsJSON = JSON.stringify(values.recipients);
        formData.append('recipients', recipientsJSON);
        
        // Log for debugging
        console.log('Submitting recipients:', recipientsJSON);
      } else if (!includeRecipients) {
        // If recipients were disabled, explicitly send an empty array
        formData.append('recipients', JSON.stringify([]));
      }
      
      // Add preserved existing files
      if (existingFiles.length > 0) {
        formData.append('existingFiles', JSON.stringify(existingFiles));
      }
      
      // Add new files to FormData
      selectedFiles.forEach(file => {
        formData.append('mediaFiles', file);
      });

      // Custom API call with FormData
      const res = await fetch(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}/api/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update note');
      }

      showSuccessToast('Note updated successfully');
      navigate(`/view-note/${id}`);
    } catch (err) {
      showErrorToast(err.message || 'Failed to update note');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <FaSpinner className="w-12 h-12 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50 dark:bg-gray-900">
        <div className="text-red-500 dark:text-red-400 text-xl mb-4">{error}</div>
        <Link
          to="/dashboard"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  // Format date for input field
  const formattedDate = new Date(note.deliveryDate).toISOString().split('T')[0];
  
  // Prepare initial recipients
  let initialRecipients = [];
  
  // Check if the note has multiple recipients
  if (note.recipients && note.recipients.length > 0) {
    initialRecipients = note.recipients;
  } 
  // Otherwise check for a single recipient (legacy)
  else if (note.recipient && note.recipient.email) {
    initialRecipients = [{
      name: note.recipient.name || '',
      email: note.recipient.email
    }];
  } 
  // Default empty recipient
  else {
    initialRecipients = [{ name: '', email: '' }];
  }

  // Create initial values from the note
  const initialValues = {
    title: note.title,
    content: note.content,
    deliveryDate: formattedDate,
    isPublic: note.isPublic || false,
    recipients: initialRecipients,
  };

  return (
    <div className="min-h-screen py-6 max-sm:py-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="bg-white dark:bg-gray-800 p-5 sm:p-8 rounded-xl shadow-lg">
          <div className="flex items-center mb-4 md:mb-6">
            <Link 
              to={`/view-note/${id}`} 
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center text-sm md:text-base"
            >
              <FaArrowLeft className="mr-1 md:mr-2" /> Back to Note
            </Link>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-800 dark:text-gray-200">
            Edit Note
          </h1>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            validateOnChange={false}
            validateOnBlur={true}
            validationContext={{ includeRecipients }}
          >
            {({ isSubmitting, errors, values, touched }) => (
              <Form className="space-y-4 md:space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <Field
                    type="text"
                    name="title"
                    id="title"
                    className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter note title"
                  />
                  <ErrorMessage 
                    name="title" 
                    component="div" 
                    className="text-sm text-red-500 dark:text-red-400 mt-1" 
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content
                  </label>
                  <Field
                    as="textarea"
                    name="content"
                    id="content"
                    className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[150px] md:min-h-[200px]"
                    placeholder="Write your note here..."
                  />
                  <ErrorMessage 
                    name="content" 
                    component="div" 
                    className="text-sm text-red-500 dark:text-red-400 mt-1" 
                  />
                </div>

                {/* File Upload Section */}
                <div className="space-y-2 md:space-y-4">
                  <h3 className="text-base md:text-lg font-medium text-gray-800 dark:text-gray-200">
                    Attachments
                  </h3>
                  
                  {/* Existing files section */}
                  {existingFiles.length > 0 && (
                    <div className="mb-2 md:mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Files ({existingFiles.length})
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {existingFiles.map((file, index) => (
                          <div 
                            key={file._id || index} 
                            className="flex items-center justify-between p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center overflow-hidden">
                              {getFileIcon(file.fileType)}
                              <span className="ml-2 text-sm truncate max-w-[180px] md:max-w-[240px]">
                                {file.fileName}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeExistingFile(index)}
                              className="ml-2 flex-shrink-0 text-red-500 hover:text-red-700 p-1"
                              aria-label="Remove file"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 md:h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 dark:border-gray-600 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center p-4 md:p-6">
                        <FaFile className="w-6 h-6 md:w-8 md:h-8 text-gray-500 dark:text-gray-400 mb-1 md:mb-2" />
                        <p className="mb-1 md:mb-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Images, documents, audio, or video (max 5MB each)
                        </p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileSelect} 
                        multiple 
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.mp3,.wav,.mp4,.mov,.webm"
                      />
                    </label>
                  </div>
                  
                  {fileErrors && (
                    <p className="text-sm text-red-500 dark:text-red-400 mt-1">{fileErrors}</p>
                  )}
                  
                  {/* Selected new files */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 md:mt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Files to Upload ({selectedFiles.length})
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedFiles.map((file, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center overflow-hidden">
                              {getFileIcon(file.type)}
                              <span className="ml-2 text-sm truncate max-w-[180px] md:max-w-[240px]">
                                {file.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="ml-2 flex-shrink-0 text-red-500 hover:text-red-700 p-1"
                              aria-label="Remove file"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <div className="flex items-center">
                      <FaCalendarAlt className="w-4 h-4 mr-1 md:mr-2" /> Delivery Date
                    </div>
                  </label>
                  <Field
                    type="date"
                    name="deliveryDate"
                    id="deliveryDate"
                    className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <ErrorMessage 
                    name="deliveryDate" 
                    component="div" 
                    className="text-sm text-red-500 dark:text-red-400 mt-1" 
                  />
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    This note will be available on or after this date.
                  </p>
                </div>

                {/* Recipients Section */}
                <div className="my-4 md:my-6">
                  <div className="flex items-center mb-2 md:mb-4">
                    <label className="flex items-center cursor-pointer text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={includeRecipients}
                        onChange={(e) => setIncludeRecipients(e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 mr-2"
                      />
                      <span className="text-sm md:text-base">Include recipients</span>
                    </label>
                  </div>

                  {includeRecipients && (
                    <FieldArray name="recipients">
                      {({ remove, push }) => (
                        <div className="space-y-2">
                          <div className="flex items-center mb-1 md:mb-2">
                            <h3 className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200 flex items-center">
                              <FaUserFriends className="w-4 h-4 mr-1 md:mr-2" /> Recipients ({values.recipients.length}/10)
                            </h3>
                            <button
                              type="button"
                              onClick={() => push({ name: '', email: '' })}
                              className="ml-auto px-2 py-1 text-xs md:text-sm text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center"
                            >
                              <FaPlus className="mr-1" /> Add Recipient
                            </button>
                          </div>

                          {values.recipients.map((recipient, index) => (
                            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Recipient {index + 1}
                                </h4>
                                {values.recipients.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="text-red-500 hover:text-red-700 text-sm flex items-center"
                                  >
                                    <FaTimes className="mr-1" /> Remove
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                                <div>
                                  <div className="flex items-center mb-1">
                                    <FaUser className="w-3 h-3 mr-1 text-gray-500 dark:text-gray-400" />
                                    <label htmlFor={`recipients.${index}.name`} className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                      Name
                                    </label>
                                  </div>
                                  <Field
                                    name={`recipients.${index}.name`}
                                    placeholder="Recipient name"
                                    className="w-full px-3 py-2 text-sm border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                  />
                                  <ErrorMessage
                                    name={`recipients.${index}.name`}
                                    component="div"
                                    className="text-xs text-red-500 mt-1"
                                  />
                                </div>

                                <div>
                                  <div className="flex items-center mb-1">
                                    <FaEnvelope className="w-3 h-3 mr-1 text-gray-500 dark:text-gray-400" />
                                    <label htmlFor={`recipients.${index}.email`} className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                      Email
                                    </label>
                                  </div>
                                  <Field
                                    name={`recipients.${index}.email`}
                                    type="email"
                                    placeholder="email@example.com"
                                    className="w-full px-3 py-2 text-sm border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                  />
                                  <ErrorMessage
                                    name={`recipients.${index}.email`}
                                    component="div"
                                    className="text-xs text-red-500 mt-1"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {values.recipients.length < 10 && (
                            <div className="mt-3">
                              <button
                                type="button"
                                onClick={() => push({ name: '', email: '' })}
                                className="w-full py-2 px-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-colors flex items-center justify-center"
                              >
                                <FaPlus className="mr-2" /> Add Another Recipient
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </FieldArray>
                  )}
                </div>

                <div>
                  <label className="flex items-center cursor-pointer text-gray-700 dark:text-gray-300 text-sm md:text-base">
                    <Field
                      type="checkbox"
                      name="isPublic"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 mr-2"
                    />
                    <span>Make this note public (can be shared with others)</span>
                  </label>
                </div>

                <div className="p-3 md:p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mb-4 md:mb-6">
                  <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2 flex items-center text-gray-800 dark:text-gray-200">
                    <FaLock className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2 text-indigo-600 dark:text-indigo-400" /> Security Information
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    Your note will be re-encrypted when updated. It will only be accessible on or after the delivery date.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors text-sm md:text-base"
                  >
                    {isSubmitting ? 'Updating Note...' : 'Update Note'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/view-note/${id}`)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors text-sm md:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default EditNote;
