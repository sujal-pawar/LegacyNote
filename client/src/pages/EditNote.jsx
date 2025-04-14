import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaEnvelope, FaUser, FaLock, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { notesAPI } from '../api/api';

const EditNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [includeRecipient, setIncludeRecipient] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.3 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const res = await notesAPI.getNote(id);
        const noteData = res.data.data;
        
        // Check if the note has a recipient
        setIncludeRecipient(!!noteData.recipient && !!noteData.recipient.email);
        
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
    recipient: Yup.object().shape({
      name: Yup.string()
        .when('$includeRecipient', {
          is: true,
          then: Yup.string().required('Recipient name is required'),
        }),
      email: Yup.string()
        .when('$includeRecipient', {
          is: true,
          then: Yup.string().email('Invalid email').required('Recipient email is required'),
        }),
    }),
  });

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // If no recipient is included, remove the recipient field
      const noteData = { ...values };
      if (!includeRecipient) {
        delete noteData.recipient;
      }

      await notesAPI.updateNote(id, noteData);
      toast.success('Note updated successfully');
      navigate(`/view-note/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update note');
    } finally {
      setSubmitting(false);
    }
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
      <motion.div 
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
        className="min-h-screen py-16 max-sm:py-8 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
      >
        <div className="container mx-auto px-4">
          <motion.div 
            variants={containerVariants}
            className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg"
          >
            <motion.div variants={itemVariants} className="flex items-center text-red-600 dark:text-red-400 mb-4">
              <h1 className="text-2xl font-bold">Error</h1>
            </motion.div>
            <motion.p variants={itemVariants} className="mb-6 text-gray-700 dark:text-gray-300">
              {error || 'Failed to load note'}
            </motion.p>
            <motion.div variants={itemVariants}>
              <Link 
                to="/dashboard" 
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center w-auto inline-flex"
              >
                <FaArrowLeft className="mr-2" /> Back to Dashboard
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Format the date for the input field
  const formattedDate = new Date(note.deliveryDate).toISOString().split('T')[0];

  // Create initial values from the note
  const initialValues = {
    title: note.title,
    content: note.content,
    deliveryDate: formattedDate,
    isPublic: note.isPublic || false,
    recipient: {
      name: note.recipient?.name || '',
      email: note.recipient?.email || '',
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="min-h-screen py-16 max-sm:py-8 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
    >
      <div className="container mx-auto px-4">
        <motion.div 
          variants={containerVariants}
          className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg"
        >
          <motion.div variants={itemVariants} className="flex items-center mb-6">
            <Link 
              to={`/view-note/${id}`} 
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Back to Note
            </Link>
          </motion.div>

          <motion.h1 
            variants={itemVariants} 
            className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200"
          >
            Edit Note
          </motion.h1>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            validateOnChange={false}
            validateOnBlur={true}
            validationContext={{ includeRecipient }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <motion.div variants={itemVariants}>
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
                </motion.div>

                <motion.div variants={itemVariants}>
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
                </motion.div>

                <motion.div variants={itemVariants}>
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
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="flex items-center cursor-pointer text-gray-700 dark:text-gray-300">
                    <Field
                      type="checkbox"
                      name="isPublic"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 mr-2"
                    />
                    <span>Make this note public (can be shared with others)</span>
                  </label>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="flex items-center cursor-pointer text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={includeRecipient}
                      onChange={(e) => setIncludeRecipient(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 mr-2"
                    />
                    <span>Send this note to someone else</span>
                  </label>
                </motion.div>

                {includeRecipient && (
                  <motion.div 
                    variants={itemVariants}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6"
                  >
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Recipient Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="recipient.name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <div className="flex items-center">
                            <FaUser className="w-4 h-4 mr-2" /> Recipient Name
                          </div>
                        </label>
                        <Field
                          type="text"
                          name="recipient.name"
                          id="recipient.name"
                          className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Enter recipient's name"
                        />
                        <ErrorMessage 
                          name="recipient.name" 
                          component="div" 
                          className="text-sm text-red-500 dark:text-red-400 mt-1" 
                        />
                      </div>

                      <div>
                        <label htmlFor="recipient.email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <div className="flex items-center">
                            <FaEnvelope className="w-4 h-4 mr-2" /> Recipient Email
                          </div>
                        </label>
                        <Field
                          type="email"
                          name="recipient.email"
                          id="recipient.email"
                          className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Enter recipient's email"
                        />
                        <ErrorMessage 
                          name="recipient.email" 
                          component="div" 
                          className="text-sm text-red-500 dark:text-red-400 mt-1" 
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <motion.div 
                  variants={itemVariants}
                  className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mb-6"
                >
                  <h3 className="text-lg font-semibold mb-2 flex items-center text-gray-800 dark:text-gray-200">
                    <FaLock className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" /> Security Information
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your note will be re-encrypted when updated. It will only be accessible on or after the delivery date.
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} className="flex gap-4">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                  >
                    {isSubmitting ? 'Updating Note...' : 'Update Note'}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => navigate(`/view-note/${id}`)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </motion.div>
              </Form>
            )}
          </Formik>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EditNote;
