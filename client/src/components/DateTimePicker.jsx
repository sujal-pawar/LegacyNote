import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

/**
 * DateTimePicker Component
 * @param {Object} props Component props
 * @param {String} props.value Current date-time value in ISO format
 * @param {Function} props.onChange Function to call when value changes
 * @param {String} props.className Additional CSS classes
 * @param {Boolean} props.error Whether there's an error
 * @param {String} props.errorMessage Error message to display
 * @param {Number} props.minDays Minimum days from now (default: 0)
 * @param {Number} props.maxDays Maximum days from now (default: 30)
 */
const DateTimePicker = ({ 
  value, 
  onChange, 
  className = "",
  error = false,
  errorMessage = "",
  minDays = 0,
  maxDays = 30
}) => {
  // Split into date and time components
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  // Calculate min and max dates
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + minDays);
  
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + maxDays);
  
  // Format for input fields
  const minDateStr = minDate.toISOString().split('T')[0];
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Initialize from value if provided
  useEffect(() => {
    if (value) {
      const dateTime = new Date(value);
      if (!isNaN(dateTime.getTime())) {
        setDate(dateTime.toISOString().split('T')[0]);
        
        // Format the time as HH:MM
        const hours = String(dateTime.getHours()).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');
        setTime(`${hours}:${minutes}`);
      }
    }
  }, [value]);

  // When date or time changes, combine and call onChange
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);
    combineDateTime(newDate, time);
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setTime(newTime);
    combineDateTime(date, newTime);
  };

  // Combine date and time into an ISO string and call onChange
  const combineDateTime = (dateStr, timeStr) => {
    if (!dateStr) return;
    
    // If time is not provided, default to now
    const currentTime = new Date();
    const defaultTime = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;
    const timeToUse = timeStr || defaultTime;
    
    // Combine date and time
    const dateTimeStr = `${dateStr}T${timeToUse}`;
    const dateTime = new Date(dateTimeStr);
    
    if (!isNaN(dateTime.getTime())) {
      onChange(dateTime.toISOString());
    }
  };

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="form-label flex items-center">
            <FaCalendarAlt className="mr-2" /> Date
          </label>
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            min={minDateStr}
            max={maxDateStr}
            className={`form-control ${error ? 'border-red-500' : ''}`}
            required
          />
        </div>
        <div>
          <label className="form-label flex items-center">
            <FaClock className="mr-2" /> Time
          </label>
          <input
            type="time"
            value={time}
            onChange={handleTimeChange}
            className={`form-control ${error ? 'border-red-500' : ''}`}
            required
          />
        </div>
      </div>
      {error && errorMessage && (
        <div className="text-red-500 text-sm mt-1">{errorMessage}</div>
      )}
      <p className="text-sm text-gray-500 mt-1">
        Message will be delivered at the specified date and time. Valid for up to {maxDays} days in the future.
      </p>
    </div>
  );
};

export default DateTimePicker; 