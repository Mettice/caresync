import React, { useState } from 'react';
import { createReminder } from '../lib/supabase';

const ReminderForm = () => {
  const [formData, setFormData] = useState({
    patientEmail: '',
    reminderDate: '',
    reminderTime: '',
    message: ''
  });
  const [status, setStatus] = useState(null); // null, 'scheduling', 'success', 'error'
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (status === 'error') {
      setStatus(null);
      setMessage('');
    }
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.patientEmail.trim()) {
      setStatus('error');
      setMessage('Please enter patient email');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.patientEmail)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return false;
    }
    
    if (!formData.reminderDate) {
      setStatus('error');
      setMessage('Please select a date');
      return false;
    }
    
    if (!formData.reminderTime) {
      setStatus('error');
      setMessage('Please select a time');
      return false;
    }

    if (!formData.message.trim()) {
      setStatus('error');
      setMessage('Please enter a reminder message');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setStatus('scheduling');
    setMessage('Scheduling reminder...');
    
    // Combine date and time for backend
    const reminderData = {
      patient_email: formData.patientEmail,
      reminder_date: `${formData.reminderDate}T${formData.reminderTime}`,
      message: formData.message,
      status: 'scheduled',
      user_id: '1' // This should be fetched from auth context in a real app
    };
    
    try {
      const result = await createReminder(reminderData);
      
      if (result.success) {
        setStatus('success');
        setMessage('Reminder scheduled successfully!');
        console.log('Reminder scheduling response:', result.data);
        
        // Reset form after successful submission
        setFormData({
          patientEmail: '',
          reminderDate: '',
          reminderTime: '',
          message: ''
        });
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setStatus(null);
          setMessage('');
        }, 5000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Error scheduling reminder. Please try again.');
      console.error('Reminder scheduling error:', error);
    }
  };

  // Get today's date in YYYY-MM-DD format for min date attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
        <h2 className="text-2xl font-bold text-white">Schedule Reminder</h2>
        <p className="text-blue-100 text-sm mt-1">Send automated reminders to your patients</p>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Patient Email */}
          <div>
            <label htmlFor="patientEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Patient Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                </svg>
              </div>
              <input
                type="email"
                id="patientEmail"
                name="patientEmail"
                value={formData.patientEmail}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="patient@example.com"
              />
            </div>
          </div>
          
          {/* Date and Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reminder Date */}
            <div>
              <label htmlFor="reminderDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <input
                  type="date"
                  id="reminderDate"
                  name="reminderDate"
                  value={formData.reminderDate}
                  onChange={handleChange}
                  min={today}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            {/* Reminder Time */}
            <div>
              <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <input
                  type="time"
                  id="reminderTime"
                  name="reminderTime"
                  value={formData.reminderTime}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Reminder Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Reminder Message
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                </svg>
              </div>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter a detailed reminder message for your patient"
              ></textarea>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Be clear and specific about any preparations needed.
            </p>
          </div>
          
          {/* Status message */}
          {status && (
            <div className={`p-4 rounded-md ${
              status === 'success' 
                ? 'bg-green-50 border-l-4 border-green-500' 
                : status === 'error' 
                  ? 'bg-red-50 border-l-4 border-red-500' 
                  : 'bg-blue-50 border-l-4 border-blue-500'
            } transition-all duration-300 animate-fadeIn`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {status === 'success' && (
                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                  {status === 'error' && (
                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  )}
                  {status === 'scheduling' && (
                    <svg className="h-5 w-5 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={status === 'scheduling'}
            className={`w-full py-3 px-4 rounded-md font-medium text-white shadow-sm transform transition-all duration-200
              ${status === 'scheduling' 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
          >
            <div className="flex items-center justify-center">
              {status === 'scheduling' && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {status === 'scheduling' ? 'Scheduling...' : 'Schedule Reminder'}
            </div>
          </button>
          
          {/* Tips */}
          <div className="mt-6 bg-blue-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Tips for effective reminders
            </h3>
            <ul className="mt-2 text-xs text-blue-700 space-y-1">
              <li>• Be specific about appointment details</li>
              <li>• Include any preparation instructions</li>
              <li>• Mention what patients should bring</li>
              <li>• Provide contact information for questions</li>
            </ul>
          </div>
        </form>
      </div>
      
      {/* Add some global CSS for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ReminderForm;