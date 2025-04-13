import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaPaperPlane, FaEnvelope, FaHeading, FaAlignLeft } from 'react-icons/fa';
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        <FaEnvelope className="inline-block mr-2" />
        Schedule Message to Self
      </h2>
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, errors, touched }) => (
          <Form>
            <div className="mb-4">
              <label htmlFor="title" className="form-label flex items-center">
                <FaHeading className="mr-2" /> Title
              </label>
              <Field
                type="text"
                name="title"
                id="title"
                className={`form-control ${errors.title && touched.title ? 'border-red-500' : ''}`}
                placeholder="Enter message title"
              />
              <ErrorMessage name="title" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <div className="mb-4">
              <label htmlFor="content" className="form-label flex items-center">
                <FaAlignLeft className="mr-2" /> Message Content
              </label>
              <Field
                as="textarea"
                name="content"
                id="content"
                rows="6"
                className={`form-control ${errors.content && touched.content ? 'border-red-500' : ''}`}
                placeholder="What would you like to tell your future self?"
              />
              <ErrorMessage name="content" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <div className="mb-6">
              <label className="form-label">Delivery Date & Time</label>
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
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center"
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