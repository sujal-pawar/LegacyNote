import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { FaCalendarAlt, FaEnvelope, FaUser, FaLock, FaArrowLeft, FaFile, FaTimes, FaImage, FaVideo, FaMusic, FaFileAlt, FaPlus, FaUserFriends, FaSpinner } from 'react-icons/fa';
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
  const formRef = useRef(null);
  
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
    
    // Check if at least one option is selected
    if (!values.isPublic && !includeRecipients) {
      showErrorToast('Please select at least one: make public or send to recipients');
      setSubmitting(false);
      return;
    }
    
    setSubmitting(true);
    setIsUploading(true);
    setUploadProgress(0);
    
    // Debug log for isPublic value
    // console.log('Form submission started');
    // console.log('Form values:', values);
    // console.log('Checkbox state in form:', values.isPublic);
    // console.log('includeRecipients state:', includeRecipients);
    
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add note data to FormData
      formData.append('title', values.title);
      formData.append('content', values.content);
      
      // Properly combine date and time values to create an accurate delivery timestamp
      const deliveryDate = new Date(values.deliveryDate);
      if (values.deliveryTime) {
        const [hours, minutes] = values.deliveryTime.split(':');
        deliveryDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      }
      
      formData.append('deliveryDate', deliveryDate.toISOString());
      // Explicitly convert boolean to string "true" or "false" - server expects this format
      formData.append('isPublic', values.isPublic ? 'true' : 'false');
      
      // Debug log for what's being sent to server
      // console.log('Sending isPublic as:', values.isPublic ? 'true' : 'false');
      
      formData.append('exactTimeDelivery', 'true'); // Always enable exact time delivery
      
      // Add recipients if they're included
      if (includeRecipients && values.recipients.length > 0) {
        const recipientsJSON = JSON.stringify(values.recipients);
        formData.append('recipients', recipientsJSON);
        // console.log('Sending recipients:', recipientsJSON);
      }
      
      // Add files to FormData - limit to smaller chunks if many files
      if (selectedFiles.length > 0) {
        // console.log('Uploading files count:', selectedFiles.length);
        // Process files in smaller batches if needed
        selectedFiles.forEach((file, index) => {
          formData.append('mediaFiles', file);
          // Update progress as files are added
          setUploadProgress(Math.round((index + 1) / selectedFiles.length * 10)); // First 10% is prep
        });
      }

      // Log all form data keys being sent
      // console.log('FormData keys being sent:');
      // for (let key of formData.keys()) {
      //   console.log('- ' + key);
      // }

      // Add upload progress tracking
      const config = {
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Scale from 10-90% to leave room for prep and server processing
          setUploadProgress(10 + Math.round(percentCompleted * 0.8));
        }
      };

      // console.log('Sending API request...');
      const response = await notesAPI.createNote(formData, config);
      // console.log('API Response:', response.data);
      
      // Complete progress
      setUploadProgress(100);
      
      // Show success toast
      showSuccessToast('Note created successfully!');
      navigate('/dashboard');
    } catch (err) {
      // console.error('Note creation error details:', err);
      
      let errorMessage = 'Failed to create note';
      
      if (err.response) {
        // Server responded with an error
        errorMessage = err.response.data?.error || err.response.data?.message || 'Server error';
        // console.error('Server error response:', err.response.data);
        // console.error('Status code:', err.response.status);
        // console.error('Response headers:', err.response.headers);
      } else if (err.request) {
        // Request was made but no response
        errorMessage = 'Network error - no response from server';
        // console.error('Network error - no response received');
        // console.error('Request details:', err.request);
      } else {
        // Error in request setup
        errorMessage = err.message || 'Error preparing request';
        // console.error('Request error:', err.message);
      }
      
      setSubmitError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 transition-colors duration-200">
      {/* Top navigation bar */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center font-medium"
          >
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 hidden sm:block">
            Create New Time Capsule
          </h1>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={submitting}
              className="px-4 py-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm"
              onClick={() => {
                // Trigger form submission if the form reference exists
                if (formRef.current) {
                  formRef.current.handleSubmit();
                }
              }}
            >
              {submitting ? (
                <span className="flex items-center">
                  <FaSpinner className="animate-spin mr-2" /> 
                  Creating...
                </span>
              ) : 'Create Time Capsule'}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full">
        <Formik
          initialValues={initialValues}
          validationSchema={safeValidationSchema}
          onSubmit={handleSubmit}
          validateOnChange={false}
          validateOnBlur={true}
          validationContext={{ includeRecipients }}
          innerRef={formRef}
        >
          {({ isSubmitting, errors, values, touched }) => (
            <Form className="grid grid-cols-1 lg:grid-cols-3 gap-0" onSubmit={(e) => {
              // Add extra validation logging to help debug validation issues
              if (Object.keys(errors).length > 0) {
                // console.log('Form validation errors:', errors);
                return; // Don't submit if there are validation errors
              }
              
              // If required fields are missing, don't submit
              if (!values.title || !values.content || !values.deliveryDate) {
                showErrorToast('Please fill in all required fields');
                return;
              }
              
              // Manual submit rather than using formik submit
              e.preventDefault();
              handleSubmit(values, { 
                setSubmitting: () => {}, 
                resetForm: () => {} 
              });
            }}>
              {/* Main editor section - takes 2/3 of the width on large screens */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-81px)]">
                <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                  {/* Title field */}
                  <div>
                    <Field
                      type="text"
                      name="title"
                      id="title"
                      className="w-full px-3 py-4 text-3xl font-bold border-0 border-b border-gray-200 dark:border-gray-700 focus:ring-0 focus:border-indigo-500 rounded-none dark:bg-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Enter your time capsule title..."
                    />
                    <ErrorMessage 
                      name="title" 
                      component="div" 
                      className="text-sm text-red-500 dark:text-red-400 mt-1" 
                    />
                  </div>

                  {/* Content field */}
                  <div className="flex-grow">
                    <Field
                      as="textarea"
                      name="content"
                      id="content"
                      className="w-full px-3 py-3 border-0 rounded-lg dark:bg-gray-700/50 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[50vh] resize-none leading-relaxed"
                      placeholder="Write your message here... This will be sealed until the delivery date."
                    />
                    <ErrorMessage 
                      name="content" 
                      component="div" 
                      className="text-sm text-red-500 dark:text-red-400 mt-1" 
                    />
                  </div>

                  {/* Media attachments area */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                      <FaFile className="mr-2 text-indigo-500 dark:text-indigo-400" /> Media Attachments
                    </h3>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-4">
                      Attach up to 5 files (5MB each) to include in your time capsule
                    </p>
                    
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-indigo-200 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 dark:border-indigo-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all">
                        <div className="flex flex-col items-center justify-center p-6">
                          <FaFile className="w-8 h-8 text-indigo-500 dark:text-indigo-400 mb-2" />
                          <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
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
                      <p className="text-sm text-red-500 dark:text-red-400 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">{fileErrors}</p>
                    )}
                    
                    {selectedFiles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Selected Files ({selectedFiles.length}/5)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedFiles.map((file, index) => (
                            <div 
                              key={index} 
                              className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                            >
                              <div className="flex items-center">
                                <span className="mr-2 text-indigo-500 dark:text-indigo-400">
                                  {getFileIcon(file.type)}
                                </span>
                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[180px] sm:max-w-[240px]">
                                  {file.name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                  ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Settings sidebar - takes 1/3 of the width on large screens */}
              <div className="lg:col-span-1 bg-gray-50 dark:bg-gray-800/50 min-h-[calc(100vh-81px)] border-t lg:border-t-0 border-gray-200 dark:border-gray-700">
                <div className="p-4 sm:p-6 space-y-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Time Capsule Settings</h2>
                  
                  {/* Delivery date and time */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <div className="flex items-center">
                        <FaCalendarAlt className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" /> Delivery Date and Time
                      </div>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                      <div>
                        <Field
                          type="date"
                          name="deliveryDate"
                          id="deliveryDate"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <p className="flex items-center">
                        <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 rounded-full flex items-center justify-center mr-2">✓</span>
                        <span>Same-day delivery is available for time-sensitive messages</span>
                      </p>
                      <p className="text-xs mt-1">
                        A delivery confirmation email will be sent once your note is delivered.
                      </p>
                    </div>
                  </div>

                  {/* Visibility options */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">Visibility Options</h3>
                    
                    {/* Public checkbox */}
                    <div className="mb-3">
                      <label className="flex items-start p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Field
                          type="checkbox"
                          name="isPublic"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 mt-0.5 mr-3"
                        />
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-200">Make this note public</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Public notes can be shared with anyone who has the link
                          </p>
                        </div>
                      </label>
                    </div>
                    
                    {/* Recipients checkbox */}
                    <div>
                      <label className="flex items-start p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <input
                          type="checkbox"
                          checked={includeRecipients}
                          onChange={() => setIncludeRecipients(!includeRecipients)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 mt-0.5 mr-3"
                        />
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-200">Send to specific recipients</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Add email recipients to receive this note on the delivery date
                          </p>
                        </div>
                      </label>
                    </div>
                    
                    {/* Display validation error for requiring at least one option */}
                    {(!values.isPublic && !includeRecipients) && (
                      <div className="text-sm text-red-500 dark:text-red-400 p-3 mt-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                        Please select at least one: make public or send to recipients
                      </div>
                    )}
                  </div>

                  {/* Recipients section */}
                  {includeRecipients && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 flex items-center">
                          <FaUserFriends className="mr-2 text-indigo-500 dark:text-indigo-400" /> Recipients ({values.recipients.length}/10)
                        </h3>
                      </div>
                      
                      <FieldArray name="recipients">
                        {({ remove, push }) => (
                          <div className="space-y-3">
                            {values.recipients.map((recipient, index) => (
                              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Recipient #{index + 1}</span>
                                  {values.recipients.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => remove(index)}
                                      className="text-red-500 dark:text-red-400 hover:text-red-700 text-xs flex items-center"
                                    >
                                      <FaTimes className="mr-1" /> Remove
                                    </button>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-1 gap-3">
                                  <div>
                                    <label htmlFor={`recipients.${index}.name`} className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                      <div className="flex items-center">
                                        <FaUser className="w-3 h-3 mr-1" /> Name
                                      </div>
                                    </label>
                                    <Field
                                      type="text"
                                      name={`recipients.${index}.name`}
                                      id={`recipients.${index}.name`}
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                      placeholder="Enter name"
                                    />
                                    {touched.recipients && 
                                    touched.recipients[index] && 
                                    errors.recipients && 
                                    errors.recipients[index] && 
                                    errors.recipients[index].name && (
                                      <div className="text-xs text-red-500 dark:text-red-400 mt-1">
                                        {errors.recipients[index].name}
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <label htmlFor={`recipients.${index}.email`} className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                      <div className="flex items-center">
                                        <FaEnvelope className="w-3 h-3 mr-1" /> Email
                                      </div>
                                    </label>
                                    <Field
                                      type="email"
                                      name={`recipients.${index}.email`}
                                      id={`recipients.${index}.email`}
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                      placeholder="Enter email"
                                    />
                                    {touched.recipients && 
                                    touched.recipients[index] && 
                                    errors.recipients && 
                                    errors.recipients[index] && 
                                    errors.recipients[index].email && (
                                      <div className="text-xs text-red-500 dark:text-red-400 mt-1">
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
                                  className="w-full py-2 px-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-800/60 transition-colors flex justify-center items-center shadow-sm"
                                >
                                  <FaPlus className="mr-2" /> Add Another Recipient
                                </button>
                              </div>
                            )}
                            
                            {errors.recipients && typeof errors.recipients === 'string' && (
                              <div className="text-sm text-red-500 dark:text-red-400 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                {errors.recipients}
                              </div>
                            )}
                        </div>
                        )}
                      </FieldArray>
                      
                      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic">
                        <p>The note will be sent to all recipients on the scheduled delivery date.</p>
                      </div>
                    </div>
                  )}

                  {/* Security information */}
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 shadow-sm">
                    <h3 className="text-base font-medium mb-2 flex items-center text-gray-800 dark:text-gray-200">
                      <FaLock className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" /> Security Information
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your note will be encrypted and securely stored. It will only be accessible on or after the delivery date.
                    </p>
                  </div>
                  
                  {/* Mobile-only button */}
                  <div className="lg:hidden">
                    <button
                      type="button"
                      disabled={submitting}
                      className="w-full px-4 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm"
                      onClick={() => {
                        // Just trigger the form submission directly
                        if (formRef.current) {
                          formRef.current.handleSubmit();
                        }
                      }}
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center">
                          <FaSpinner className="animate-spin mr-2" /> 
                          Creating Time Capsule...
                        </span>
                      ) : 'Create Time Capsule'}
                    </button>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {submitting && (
        <div className="fixed top-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 z-50">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <FaSpinner className="animate-spin mr-2" />
              {uploadProgress < 10 ? 'Preparing data...' : 
                uploadProgress < 90 ? `Uploading files... ${uploadProgress}%` : 
                uploadProgress === 100 ? 'Upload complete! Redirecting...' : 
                'Processing your time capsule...'}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
              <div 
                className="bg-indigo-600 h-4 rounded-full transition-all duration-300 ease-in-out flex items-center justify-end"
                style={{ width: `${uploadProgress}%` }}
              >
                <span className="px-2 text-xs text-white">{uploadProgress}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {submitError && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg shadow-lg max-w-md z-50">
          <p className="font-medium">Error creating note:</p>
          <p>{submitError}</p>
          <p className="text-sm mt-1">Try again or contact support if the problem persists.</p>
        </div>
      )}
    </div>
  );
};

export default CreateNote;
