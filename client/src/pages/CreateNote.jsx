import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaCalendarAlt, FaEnvelope, FaUser, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { notesAPI } from '../api/api';

const CreateNote = () => {
  const navigate = useNavigate();
  const [includeRecipient, setIncludeRecipient] = useState(false);

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

  // Form initial values
  const initialValues = {
    title: '',
    content: '',
    deliveryDate: '',
    isPublic: false,
    recipient: {
      name: '',
      email: '',
    },
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // If no recipient is included, remove the recipient field
      const noteData = { ...values };
      if (!includeRecipient) {
        delete noteData.recipient;
      }

      await notesAPI.createNote(noteData);
      toast.success('Note created successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create note');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6">Create New Note</h1>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          validateOnChange={false}
          validateOnBlur={true}
          validationContext={{ includeRecipient }}
        >
          {({ isSubmitting, setFieldValue }) => (
            <Form>
              <div className="mb-4">
                <label htmlFor="title" className="form-label">
                  Title
                </label>
                <Field
                  type="text"
                  name="title"
                  id="title"
                  className="form-control"
                  placeholder="Enter note title"
                />
                <ErrorMessage name="title" component="div" className="form-error" />
              </div>

              <div className="mb-4">
                <label htmlFor="content" className="form-label">
                  Content
                </label>
                <Field
                  as="textarea"
                  name="content"
                  id="content"
                  className="form-control min-h-[200px]"
                  placeholder="Write your note here..."
                />
                <ErrorMessage name="content" component="div" className="form-error" />
              </div>

              <div className="mb-4">
                <label htmlFor="deliveryDate" className="form-label flex items-center">
                  <FaCalendarAlt className="mr-2" /> Delivery Date
                </label>
                <Field
                  type="date"
                  name="deliveryDate"
                  id="deliveryDate"
                  className="form-control"
                  min={new Date().toISOString().split('T')[0]}
                />
                <ErrorMessage name="deliveryDate" component="div" className="form-error" />
                <p className="text-sm text-gray-500 mt-1">
                  This note will be available on or after this date.
                </p>
              </div>

              <div className="mb-4">
                <label className="flex items-center cursor-pointer">
                  <Field
                    type="checkbox"
                    name="isPublic"
                    className="mr-2"
                  />
                  <span>Make this note public (can be shared with others)</span>
                </label>
              </div>

              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeRecipient}
                    onChange={(e) => setIncludeRecipient(e.target.checked)}
                    className="mr-2"
                  />
                  <span>Send this note to someone else</span>
                </label>
              </div>

              {includeRecipient && (
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <h3 className="text-lg font-semibold mb-3">Recipient Information</h3>
                  <div className="mb-4">
                    <label htmlFor="recipient.name" className="form-label flex items-center">
                      <FaUser className="mr-2" /> Recipient Name
                    </label>
                    <Field
                      type="text"
                      name="recipient.name"
                      id="recipient.name"
                      className="form-control"
                      placeholder="Enter recipient's name"
                    />
                    <ErrorMessage name="recipient.name" component="div" className="form-error" />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="recipient.email" className="form-label flex items-center">
                      <FaEnvelope className="mr-2" /> Recipient Email
                    </label>
                    <Field
                      type="email"
                      name="recipient.email"
                      id="recipient.email"
                      className="form-control"
                      placeholder="Enter recipient's email"
                    />
                    <ErrorMessage name="recipient.email" component="div" className="form-error" />
                  </div>
                </div>
              )}

              <div className="security-info p-4 bg-blue-50 rounded-md mb-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <FaLock className="mr-2" /> Security Information
                </h3>
                <p className="text-sm">
                  Your note will be encrypted and securely stored. It will only be accessible on or after the delivery date.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Note...' : 'Create Note'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateNote; 