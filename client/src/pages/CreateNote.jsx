import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { FaCalendarAlt, FaEnvelope, FaUser, FaLock, FaArrowLeft, FaFile, FaTimes, FaImage, FaVideo, FaMusic, FaFileAlt, FaPlus, FaUserFriends } from 'react-icons/fa';
import { notesAPI } from '../api/api';
import api from '../api/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const CreateNote = () => {
  const navigate = useNavigate();
  const [includeRecipients, setIncludeRecipients] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileErrors, setFileErrors] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
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

  // Wrap validation in try/catch to prevent crashes
  let safeValidationSchema;
  try {
    safeValidationSchema = Yup.object({
      title: Yup.string()
        .required('Title is required')
        .max(100, 'Title must be less than 100 characters'),
      content: Yup.string()
        .required('Content is required'),
      deliveryDate: Yup.date()
        .required('Delivery date is required')
        .min(new Date(new Date().setHours(0, 0, 0, 0)), 'Delivery date cannot be in the past'),
      deliveryTime: Yup.string()
        .required('Delivery time is required')
        .test(
          'valid-time',
          'Please enter a valid time',
          value => Boolean(value && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value))
        ),
      isPublic: Yup.boolean(),
      recipients: Yup.array().of(
        Yup.object().shape({
          name: Yup.string()
            .required('Name is required'),
          email: Yup.string()
            .email('Invalid email')
            .required('Email is required'),
        })
      )
      .test(
        'recipients-validation',
        'At least one recipient is required when sending to recipients',
        function(value, context) {
          // Get includeRecipients from context
          const { includeRecipients } = this.options.context || {};
          
          // If sending to recipients is enabled, require at least one valid recipient
          if (includeRecipients) {
            return value && value.length >= 1;
          }
          
          // Otherwise, no validation needed
          return true;
        }
      )
      .test(
        'max-recipients',
        'Maximum of 10 recipients allowed',
        function(value) {
          return !value || value.length <= 10;
        }
      ),
    })
    .test(
      'at-least-one-checkbox',
      'Please select at least one: make public or send to someone',
      function (values) {
        const { isPublic } = values;
        const { includeRecipients } = this.options.context || {};
        return isPublic || includeRecipients;
      }
    )
    .test(
      'future-date-time',
      'The combined date and time must be in the future',
      function (values) {
        const { deliveryDate, deliveryTime } = values;
        if (!deliveryDate || !deliveryTime) return true;
        
        const now = new Date();
        const selectedDateTime = new Date(deliveryDate);
        
        try {
          const [hours, minutes] = deliveryTime.split(':');
          selectedDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
          
          // Allow up to 2 minutes leeway for form submission time
          now.setMinutes(now.getMinutes() + 2);
          return selectedDateTime >= now;
        } catch (error) {
          console.error('Time validation error:', error);
          return true;
        }
      }
    );
  } catch (error) {
    console.error('Error setting up validation schema:', error);
    // Fallback to a basic schema if the main one fails
    safeValidationSchema = Yup.object({
      title: Yup.string().required('Title is required'),
      content: Yup.string().required('Content is required'),
      deliveryDate: Yup.date().required('Delivery date is required'),
      deliveryTime: Yup.string().required('Delivery time is required')
    });
  }

  // Get today's date in YYYY-MM-DD format for the date input min value
  const today = new Date().toISOString().split('T')[0];
  
  // Get current time in HH:MM format for initial value if user selects today
  const getCurrentTime = () => {
    const now = new Date();
    // Add 5 minutes to current time to ensure we're in the future
    now.setMinutes(now.getMinutes() + 5);
    return now.toTimeString().substring(0, 5); // Extract HH:MM
  };

  // Form initial values
  const initialValues = {
    title: '',
    content: '',
    deliveryDate: today,
    deliveryTime: getCurrentTime(),
    isPublic: false,
    recipients: [{ name: '', email: '' }],
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate files
    let errors = '';
    let totalSize = 0;
    
    // Calculate current total size of already selected files
    selectedFiles.forEach(file => {
      totalSize += file.size;
    });
    
    // Check file size and type
    const validFiles = files.filter(file => {
      // Add this file's size to total
      totalSize += file.size;
      
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
    
    // Check total size of all files (15MB max total)
    if (totalSize > 15 * 1024 * 1024) {
      errors = `Total file size exceeds 15MB. Please reduce the size or number of files.`;
      return;
    }
    
    if (errors) {
      setFileErrors(errors);
      return;
    }
    
    // Check total number of files
    if (selectedFiles.length + validFiles.length > 5) {
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

  // Get file icon based on MIME type
  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <FaImage />;
    if (mimeType.startsWith('video/')) return <FaVideo />;
    if (mimeType.startsWith('audio/')) return <FaMusic />;
    if (mimeType.startsWith('application/pdf')) return <FaFileAlt />;
    return <FaFile />;
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (submitting) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add note data to FormData
      formData.append('title', values.title);
      formData.append('content', values.content);
      formData.append('deliveryDate', new Date(values.deliveryDate).toISOString());
      formData.append('isPublic', values.isPublic);
      formData.append('exactTimeDelivery', 'true'); // Always enable exact time delivery
      
      // Add recipients if they're included
      if (includeRecipients && values.recipients.length > 0) {
        formData.append('recipients', JSON.stringify(values.recipients));
      }
      
      // Add files to FormData - limit to smaller chunks if many files
      if (selectedFiles.length > 0) {
        // Process files in smaller batches if needed
        selectedFiles.forEach((file, index) => {
          formData.append('mediaFiles', file);
          // Update progress as files are added
          setUploadProgress(Math.round((index + 1) / selectedFiles.length * 50)); // First 50% is prep
        });
      }

      // Add upload progress tracking
      const config = {
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };

      const response = await notesAPI.createNote(formData, config);
      
      // Show success toast
      showSuccessToast('Note created successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Note creation error details:', err);
      
      let errorMessage = 'Failed to create note';
      
      if (err.response) {
        // Server responded with an error
        errorMessage = err.response.data?.error || err.response.data?.message || 'Server error';
        console.error('Server error response:', err.response.data);
      } else if (err.request) {
        // Request was made but no response
        errorMessage = 'Network error - no response from server';
        console.error('Network error - no response received');
      } else {
        // Error in request setup
        errorMessage = err.message || 'Error preparing request';
        console.error('Request error:', err.message);
      }
      
      setSubmitError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 max-sm:py-8 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Back to Dashboard
            </button>
          </div>

          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">
            Create New Note
          </h1>

          <Formik
            initialValues={initialValues}
            validationSchema={safeValidationSchema}
            onSubmit={handleSubmit}
            validateOnChange={false}
            validateOnBlur={true}
            validationContext={{ includeRecipients }}
          >
            {({ isSubmitting, errors, values, touched, handleSubmit: formikHandleSubmit }) => (
              <Form className="space-y-6" onSubmit={(e) => {
                // Add extra validation logging to help debug validation issues
                if (Object.keys(errors).length > 0) {
                  // console.log('Form validation errors:', errors);
                }
                formikHandleSubmit(e);
              }}>
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
                    className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[200px]"
                    placeholder="Write your note here..."
                  />
                  <ErrorMessage 
                    name="content" 
                    component="div" 
                    className="text-sm text-red-500 dark:text-red-400 mt-1" 
                  />
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Media Attachments (max 5 files, 5MB each)
                  </label>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                    Note: File uploads may take a bit longer on our deployed server. Please be patient and don't refresh the page.
                  </p>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 dark:border-gray-600 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center p-6">
                        <FaFile className="w-8 h-8 text-gray-500 dark:text-gray-400 mb-2" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
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
                  {selectedFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Selected Files ({selectedFiles.length}/5)
                      </h4>
                      <ul className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <li 
                            key={index} 
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center">
                              <span className="mr-2 text-gray-600 dark:text-gray-400">
                                {getFileIcon(file.type)}
                              </span>
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[240px]">
                                {file.name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <FaTimes />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <div className="flex items-center">
                      <FaCalendarAlt className="w-4 h-4 mr-2" /> Delivery Date and Time
                    </div>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Field
                        type="date"
                        name="deliveryDate"
                        id="deliveryDate"
                        className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        min={today}
                      />
                      <ErrorMessage 
                        name="deliveryDate" 
                        component="div" 
                        className="text-sm text-red-500 dark:text-red-400 mt-1" 
                      />
                    </div>
                    <div>
                      <Field
                        type="time"
                        name="deliveryTime"
                        id="deliveryTime"
                        className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <ErrorMessage 
                        name="deliveryTime" 
                        component="div" 
                        className="text-sm text-red-500 dark:text-red-400 mt-1" 
                      />
                    </div>
                  </div>
                  <ErrorMessage 
                    name="future-date-time" 
                    component="div" 
                    className="text-sm text-red-500 dark:text-red-400 mt-1" 
                  />
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                    <p>
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">✓</span> Same-day delivery is available! Just select today's date and a time at least 5 minutes in the future.
                    </p>
                    <p>
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">⏰</span> <strong>Precise timing:</strong> Your note will be delivered exactly at the specified time - not a minute earlier!
                    </p>
                    <p>
                      A delivery confirmation email will be sent once your note is delivered.
                    </p>
                  </div>
                </div>

                {/* Checkbox for public */}
                <div>
                  <label className="flex items-center cursor-pointer text-gray-700 dark:text-gray-300">
                    <Field
                      type="checkbox"
                      name="isPublic"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 mr-2"
                    />
                    <span>Make this note public (can be shared with others)</span>
                  </label>
                </div>

                {/* Checkbox for recipients */}
                <div>
                  <label className="flex items-center cursor-pointer text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={includeRecipients}
                      onChange={() => setIncludeRecipients(!includeRecipients)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 mr-2"
                    />
                    <span>Send this note to recipients</span>
                  </label>
                  {errors['at-least-one-checkbox'] && !includeRecipients && !values.isPublic && (
                  <div className="text-sm text-red-500 dark:text-red-400 mt-1">
                    {errors['at-least-one-checkbox']}
                  </div>
                )}
                </div>

                {includeRecipients && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                        <FaUserFriends className="mr-2" /> Recipients ({values.recipients.length}/10)
                      </h3>
                    </div>
                    
                    <FieldArray name="recipients">
                      {({ remove, push }) => (
                    <div className="space-y-4">
                          {values.recipients.map((recipient, index) => (
                            <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Recipient #{index + 1}</span>
                                {values.recipients.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="text-red-500 dark:text-red-400 hover:text-red-700 text-sm flex items-center"
                                  >
                                    <FaTimes className="mr-1" /> Remove
                                  </button>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                                  <label htmlFor={`recipients.${index}.name`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <div className="flex items-center">
                                      <FaUser className="w-4 h-4 mr-2" /> Name
                          </div>
                        </label>
                        <Field
                          type="text"
                                    name={`recipients.${index}.name`}
                                    id={`recipients.${index}.name`}
                          className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter name"
                                  />
                                  {touched.recipients && 
                                   touched.recipients[index] && 
                                   errors.recipients && 
                                   errors.recipients[index] && 
                                   errors.recipients[index].name && (
                                    <div className="text-sm text-red-500 dark:text-red-400 mt-1">
                                      {errors.recipients[index].name}
                                    </div>
                                  )}
                      </div>

                      <div>
                                  <label htmlFor={`recipients.${index}.email`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <div className="flex items-center">
                                      <FaEnvelope className="w-4 h-4 mr-2" /> Email
                          </div>
                        </label>
                        <Field
                          type="email"
                                    name={`recipients.${index}.email`}
                                    id={`recipients.${index}.email`}
                          className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter email"
                                  />
                                  {touched.recipients && 
                                   touched.recipients[index] && 
                                   errors.recipients && 
                                   errors.recipients[index] && 
                                   errors.recipients[index].email && (
                                    <div className="text-sm text-red-500 dark:text-red-400 mt-1">
                                      {errors.recipients[index].email}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {values.recipients.length < 10 && (
                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={() => push({ name: '', email: '' })}
                                className="w-full py-2 px-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-colors flex justify-center items-center"
                              >
                                <FaPlus className="mr-2" /> Add Another Recipient
                              </button>
                            </div>
                          )}
                          
                          {errors.recipients && typeof errors.recipients === 'string' && (
                            <div className="text-sm text-red-500 dark:text-red-400 mt-2">
                              {errors.recipients}
                            </div>
                          )}
                      </div>
                      )}
                    </FieldArray>
                    
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      <p>The note will be sent to all recipients on the scheduled delivery date.</p>
                    </div>
                  </div>
                )}

                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center text-gray-800 dark:text-gray-200">
                    <FaLock className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" /> Security Information
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your note will be encrypted and securely stored. It will only be accessible on or after the delivery date.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || submitting}
                    className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                  >
                    {isSubmitting || submitting ? 'Creating Note...' : 'Create Note'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                
                {(isSubmitting || submitting) && isUploading && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {uploadProgress < 50 ? 'Preparing files...' : 'Uploading files...'}
                      {uploadProgress === 100 ? ' Complete!' : ''}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {submitError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    <p className="font-medium">Error creating note:</p>
                    <p>{submitError}</p>
                    <p className="text-sm mt-1">Try again or contact support if the problem persists.</p>
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default CreateNote;
