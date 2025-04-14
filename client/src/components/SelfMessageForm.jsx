import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaPaperPlane, FaEnvelope, FaHeading, FaAlignLeft, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
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

  // Handle form submission
  const handleSubmit = async (values, { resetForm }) => {
    try {
      setIsSubmitting(true);
      
      // Create note data structure
      const noteData = {
        title: values.title,
        content: values.content,
        deliveryDate: values.deliveryDateTime,
        isPublic: false,
        // Add the user as recipient to receive the email
        recipient: {
          name: user?.name || 'Me',
          email: user?.email
        }
      };

      // Call API to create the note
      await notesAPI.createNote(noteData);
      
      toast.success('Message scheduled successfully!');
      resetForm();
      setDateTimeValue('');
      
      // Call onSuccess callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (error) {
      console.error('Error scheduling message:', error);
      toast.error(error.response?.data?.error || 'Failed to schedule message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
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
