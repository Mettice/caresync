import React, { useState } from 'react';
import axios from 'axios';

const EmailAccountForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    smtp_server: '',
    smtp_port: 587,
    imap_server: '',
    imap_port: 993,
    username: '',
    password: '',
    use_ssl: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseInt(value, 10) : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await axios.post('http://localhost:9999/api/email/connect', formData);
      
      setSuccessMessage('Email account connected successfully!');
      
      // Clear form
      setFormData({
        email: '',
        smtp_server: '',
        smtp_port: 587,
        imap_server: '',
        imap_port: 993,
        username: '',
        password: '',
        use_ssl: true
      });
      
      // Call success callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to connect email account. Please try again.');
      console.error('Error connecting email account:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">Connect Email Account</h2>
      
      {successMessage && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="clinic@example.com"
            />
          </div>
          
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMTP Server
            </label>
            <input
              type="text"
              name="smtp_server"
              value={formData.smtp_server}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="smtp.gmail.com"
            />
          </div>
          
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMTP Port
            </label>
            <input
              type="number"
              name="smtp_port"
              value={formData.smtp_port}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IMAP Server
            </label>
            <input
              type="text"
              name="imap_server"
              value={formData.imap_server}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="imap.gmail.com"
            />
          </div>
          
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IMAP Port
            </label>
            <input
              type="number"
              name="imap_port"
              value={formData.imap_port}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="clinic@example.com"
            />
          </div>
          
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="•••••••••••"
            />
          </div>
          
          <div className="col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="use_ssl"
                checked={formData.use_ssl}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Use SSL/TLS</span>
            </label>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Connecting...' : 'Connect Email Account'}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Note: Email account credentials are stored securely and used only for sending and receiving messages. For Gmail accounts, you'll need to use an App Password.</p>
      </div>
    </div>
  );
};

export default EmailAccountForm; 