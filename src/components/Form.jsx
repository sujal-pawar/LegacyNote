import React from 'react'
import { useState } from 'react'

const Form = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      name,
      email,
      message,
      deliveryDate,
    };
    console.log('Form submitted:', formData);
  };

  return (
    <div className="flexmax-w-full bg-[#242424] border-2 mx-auto p-8 rounded-2xl">
      <div>

      </div>
      <h2 className="text-2xl font-bold text-center mb-4 text-white p-2 rounded-md hover:text-blue-300" >Create Your LegacyNote</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-md font-light pb-2">Full Name</label>
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
          <label htmlFor="email" className="block text-md font-light pb-2">Email Address</label>
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
          <label htmlFor="message" className="block text-md font-light pb-2">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="deliveryDate" className="block text-md font-light pb-2">Media</label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleSubmit}
            className=" border-1 p-2 text-blue-300 flex justify-center items-center border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="deliveryDate" className="block text-md font-light pb-2">Delivery Date</label>
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
        >
          Create LegacyNote
        </button>
      </form>
    </div>
  );
};


export default Form
