import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
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
      <div className="container mx-auto py-8 flex justify-center items-center">
        <FaSpinner className="animate-spin text-3xl text-primary-color mr-2" />
        <span>Loading note...</span>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center text-red-600 mb-4">
            <h1 className="text-2xl font-bold">Error</h1>
          </div>
          <p className="mb-6">{error || 'Failed to load note'}</p>
          <Link to="/dashboard" className="btn btn-primary flex items-center w-auto inline-flex">
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
        </div>
      </div>
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
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6">
          <Link to={`/view-note/${id}`} className="text-primary-color hover:underline flex items-center w-auto inline-flex">
            <FaArrowLeft className="mr-2" /> Back to Note
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">Edit Note</h1>

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
                  Your note will be re-encrypted when updated. It will only be accessible on or after the delivery date.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating Note...' : 'Update Note'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/view-note/${id}`)}
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

export default EditNote; 