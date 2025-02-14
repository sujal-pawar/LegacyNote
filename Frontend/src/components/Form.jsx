import React, { useState } from 'react';

const Form = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Disable button during submission
  const [isSubmitted, setIsSubmitted] = useState(false); // To show success message
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // To disable the button after submission

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Disable button
    setIsButtonDisabled(true); // Completely disable the submit button

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('message', message);
    formData.append('deliveryDate', deliveryDate);

    try {
      const response = await fetch('http://localhost:5000/api/legacy/create', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setIsSubmitted(true); // Show success message
      } else {
        console.error('Error submitting form');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false); // Enable button after submission (for future submission)
    }
  };

  return (
    <div className="flexmax-w-full bg-[#242424] border-2 mx-auto p-8 rounded-2xl">
      <h2 className="text-2xl font-bold text-center mb-4 text-white p-2 rounded-md hover:text-blue-300">
        Create Your LegacyNote
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-md font-light pb-2">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-md font-light pb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-md font-light pb-2">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="media" className="block text-md font-light pb-2">
            Media
          </label>
          <input
            type="file"
            accept="image/*,video/*"
            name="media"
            multiple
            className="border-1 p-2 text-blue-300 flex justify-center items-center border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="deliveryDate" className="block text-md font-light pb-2">
            Delivery Date
          </label>
          <input
            type="date"
            id="deliveryDate"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          disabled={isButtonDisabled} // Completely disable the button after submission
        >
          {isSubmitting ? 'Submitting...' : 'Create LegacyNote'}
        </button>
      </form>

      {isSubmitted && (
        <p className="text-green-500 mt-4 text-center">
          Your LegacyNote has been successfully submitted!
        </p>
      )}
    </div>
  );
};

export default Form;
