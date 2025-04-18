import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { FaCalendarAlt, FaEnvelope, FaUser, FaLock, FaSpinner, FaArrowLeft, FaFile, FaTimes, FaImage, FaVideo, FaMusic, FaFileAlt, FaPlus, FaUserFriends } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { notesAPI } from '../api/api';

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
        toast.error('Failed to fetch note');
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
      .min(new Date(), 'Delivery date must be in the future'),
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
      formData.append('isPublic', values.isPublic);
      
      // Add recipients if they're included
      if (includeRecipients && values.recipients && values.recipients.length > 0) {
        formData.append('recipients', JSON.stringify(values.recipients));
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
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notes/${id}`, {
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

      toast.success('Note updated successfully');
      navigate(`/view-note/${id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update note');
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
    <div className="min-h-screen py-16 max-sm:py-8 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <div className="flex items-center mb-6">
            <Link 
              to={`/view-note/${id}`} 
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Back to Note
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">
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
              <Form className="space-y-6">
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
                  
                  {/* Existing files */}
                  {existingFiles.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Existing Files ({existingFiles.length})
                      </h4>
                      <ul className="space-y-2 mb-4">
                        {existingFiles.map((file, index) => (
                          <li 
                            key={index} 
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center">
                              <span className="mr-2 text-gray-600 dark:text-gray-400">
                                {getFileIcon(file.fileType)}
                              </span>
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[240px]">
                                {file.fileName}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                ({(file.fileSize / (1024 * 1024)).toFixed(2)} MB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeExistingFile(index)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <FaTimes />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Upload new files */}
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
                  
                  {/* Selected new files */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Files ({selectedFiles.length})
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
                    Total files: {existingFiles.length + selectedFiles.length}/5
                  </p>
                </div>

                <div>
                  <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <div className="flex items-center">
                      <FaCalendarAlt className="w-4 h-4 mr-2" /> Delivery Date
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
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    This note will be available on or after this date.
                  </p>
                </div>

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
                    Your note will be re-encrypted when updated. It will only be accessible on or after the delivery date.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                  >
                    {isSubmitting ? 'Updating Note...' : 'Update Note'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/view-note/${id}`)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
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
