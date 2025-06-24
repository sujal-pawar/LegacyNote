import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaPaperPlane, FaEnvelope, FaHeading, FaAlignLeft, FaCalendarAlt, FaFile, FaTimes, FaImage, FaVideo, FaMusic, FaFileAlt, FaPlus } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import DateTimePicker from './DateTimePicker';
import { notesAPI } from '../api/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * Self Message Form Component
 * Allows users to compose and schedule messages to themselves
 */
const SelfMessageForm = ({ onSuccess }) => {
  const { user } = useAuth();
  const [dateTimeValue, setDateTimeValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
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
  
  // Validation schema for the form
  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Title is required')
      .max(100, 'Title must be less than 100 characters'),
    content: Yup.string()
      .required('Message content is required')
      .min(5, 'Message content must be at least 5 characters'),
    deliveryDateTime: Yup.date()
      .required('Delivery date and time are required')
      .min(new Date(), 'Delivery date and time must be in the future')
      .test(
        'is-within-limit',
        'Delivery date must be within the next 30 days',
        function(value) {
          if (!value) return true;
          const maxDate = new Date();
          maxDate.setDate(maxDate.getDate() + 30);
          return value <= maxDate;
        }
      )
  });

  // Initial values for the form
  const initialValues = {
    title: '',
    content: '',
    deliveryDateTime: '',
  };

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
  const handleSubmit = async (values, { resetForm }) => {
    try {
      setIsSubmitting(true);
      
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add note data to FormData
      formData.append('title', values.title);
      formData.append('content', values.content);
      formData.append('deliveryDate', values.deliveryDateTime);
      formData.append('isPublic', false);
      
      // Add the user as recipient to receive the email
      const recipientData = {
        name: user?.name || 'Me',
        email: user?.email
      };
      formData.append('recipient', JSON.stringify(recipientData));
      
      // Add files to FormData
      selectedFiles.forEach(file => {
        formData.append('mediaFiles', file);
      });

      // Call API to create the note
      await notesAPI.createNote(formData);
      
      const deliveryDate = new Date(values.deliveryDateTime);
      const formattedDate = deliveryDate.toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const formattedTime = deliveryDate.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      });

      showSuccessToast(`Message scheduled successfully! You'll receive it on ${formattedDate} at ${formattedTime}.`);
      resetForm();
      setDateTimeValue('');
      setSelectedFiles([]);
      
      // Call onSuccess callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (err) {
      showErrorToast(err.message || 'Failed to schedule message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-black rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
        <FaEnvelope className="mr-2 text-indigo-600 dark:text-indigo-400" />
        Schedule Message to Self
      </h2>
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, errors, touched }) => (
          <Form className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <div className="flex items-center">
                  <FaHeading className="w-4 h-4 mr-2" /> Title
                </div>
              </label>
              <Field
                type="text"
                name="title"
                id="title"
                className={`w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.title && touched.title ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder="Enter message title"
              />
              <ErrorMessage name="title" component="div" className="text-sm text-red-500 dark:text-red-400 mt-1" />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <div className="flex items-center">
                  <FaAlignLeft className="w-4 h-4 mr-2" /> Message Content
                </div>
              </label>
              <Field
                as="textarea"
                name="content"
                id="content"
                rows="6"
                className={`w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[150px] ${errors.content && touched.content ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder="What would you like to tell your future self?"
              />
              <ErrorMessage name="content" component="div" className="text-sm text-red-500 dark:text-red-400 mt-1" />
            </div>
            
            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Attach Files (Optional)
              </label>
              
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-700 dark:bg-black dark:border-gray-600 hover:bg-gray-100">
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
              
              {/* Selected files */}
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selected Files ({selectedFiles.length})
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
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Total files: {selectedFiles.length}/5
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <div className="flex items-center">
                  <FaCalendarAlt className="w-4 h-4 mr-2" /> Delivery Date & Time
                </div>
              </label>
              <DateTimePicker
                value={dateTimeValue}
                onChange={(value) => {
                  setDateTimeValue(value);
                  setFieldValue('deliveryDateTime', value);
                }}
                error={errors.deliveryDateTime && touched.deliveryDateTime}
                errorMessage={errors.deliveryDateTime}
                minDays={0}
                maxDays={30}
                className={`w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.deliveryDateTime && touched.deliveryDateTime ? 'border-red-500 dark:border-red-500' : ''}`}
              />
              {errors.deliveryDateTime && touched.deliveryDateTime && (
                <div className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.deliveryDateTime}</div>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                You can schedule messages up to 30 days in the future.
              </p>
            </div>

            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your message will be delivered to <span className="font-medium">{user?.email}</span> at the specified date and time.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span className="font-medium text-indigo-600 dark:text-indigo-400">⏰</span> <strong>Precise timing:</strong> Your message will be delivered exactly at the specified time - not a minute earlier!
              </p>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center justify-center"
              disabled={isSubmitting}
            >
              <FaPaperPlane className="mr-2" />
              {isSubmitting ? 'Scheduling...' : 'Schedule Message'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SelfMessageForm;
