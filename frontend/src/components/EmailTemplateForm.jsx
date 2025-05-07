import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmailTemplateForm = ({ accountId }) => {
  const [formData, setFormData] = useState({
    account_id: accountId || '',
    name: '',
    subject_template: '',
    body_template: '',
    trigger_keywords: '',
    priority: 1
  });
  
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Fetch accounts if no accountId is provided
  useEffect(() => {
    if (!accountId) {
      fetchEmailAccounts();
    }
  }, [accountId]);
  
  const fetchEmailAccounts = async () => {
    setFetchingAccounts(true);
    try {
      const response = await axios.get('http://localhost:9999/api/email/accounts');
      setAccounts(response.data || []);
      
      // Set the first account as default if available
      if (response.data && response.data.length > 0 && !formData.account_id) {
        setFormData(prev => ({
          ...prev,
          account_id: response.data[0].id
        }));
      }
    } catch (err) {
      console.error('Error fetching email accounts:', err);
    } finally {
      setFetchingAccounts(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value, 10) : value
    });
  };
  
  const handleKeywordsChange = (e) => {
    setFormData({
      ...formData,
      trigger_keywords: e.target.value // Store as comma-separated string in the form
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Convert comma-separated keywords to array
      const keywordsArray = formData.trigger_keywords
        .split(',')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword);
      
      if (keywordsArray.length === 0) {
        throw new Error('At least one trigger keyword is required');
      }
      
      const templateData = {
        ...formData,
        trigger_keywords: keywordsArray
      };
      
      await axios.post('http://localhost:9999/api/email/templates', templateData);
      
      setSuccessMessage('Email template created successfully!');
      
      // Clear form
      setFormData({
        account_id: accountId || (accounts.length > 0 ? accounts[0].id : ''),
        name: '',
        subject_template: '',
        body_template: '',
        trigger_keywords: '',
        priority: 1
      });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to create template. Please try again.');
      console.error('Error creating email template:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">Create Email Template</h2>
      
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
        {!accountId && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Account
            </label>
            <select
              name="account_id"
              value={formData.account_id}
              onChange={handleChange}
              required
              disabled={fetchingAccounts || accounts.length === 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {fetchingAccounts ? (
                <option>Loading accounts...</option>
              ) : accounts.length === 0 ? (
                <option value="">No accounts available - add one first</option>
              ) : (
                accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.email}
                  </option>
                ))
              )}
            </select>
            {accounts.length === 0 && !fetchingAccounts && (
              <p className="mt-1 text-sm text-red-600">
                You need to connect an email account before creating templates.
              </p>
            )}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Appointment Confirmation"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject Template
          </label>
          <input
            type="text"
            name="subject_template"
            value={formData.subject_template}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Confirmation: Your appointment on {{appointment_date}}"
          />
          <p className="mt-1 text-xs text-gray-500">
            Use {{variable}} syntax for dynamic content
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Body Template
          </label>
          <textarea
            name="body_template"
            value={formData.body_template}
            onChange={handleChange}
            required
            rows="6"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Dear {{patient_name}},

This is to confirm your appointment on {{appointment_date}} at {{appointment_time}} with {{doctor_name}}.

Best regards,
CareSync Clinic"
          ></textarea>
          <p className="mt-1 text-xs text-gray-500">
            Use {{variable}} syntax for dynamic content
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trigger Keywords (comma-separated)
          </label>
          <input
            type="text"
            name="trigger_keywords"
            value={formData.trigger_keywords}
            onChange={handleKeywordsChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="appointment, confirm, schedule"
          />
          <p className="mt-1 text-xs text-gray-500">
            These keywords will trigger this template when found in incoming emails
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority (lower number = higher priority)
          </label>
          <input
            type="number"
            name="priority"
            min="1"
            max="100"
            value={formData.priority}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading || (!accountId && accounts.length === 0)}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(loading || (!accountId && accounts.length === 0)) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating...' : 'Create Template'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailTemplateForm; 