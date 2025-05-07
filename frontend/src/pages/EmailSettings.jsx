import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import EmailAccountForm from '../components/EmailAccountForm';
import EmailTemplateForm from '../components/EmailTemplateForm';
import { toast } from 'react-hot-toast';

const EmailSettings = ({ branchId }) => {
  const [activeTab, setActiveTab] = useState('accounts');
  const [accounts, setAccounts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    if (branchId) {
      fetchData();
    }
  }, [branchId]);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setRefreshing(true);
    
    try {
      // Fetch accounts and templates from Supabase
      const [{ data: accountsData, error: accountsError }, { data: templatesData, error: templatesError }] = await Promise.all([
        supabase
          .from('email_accounts')
          .select('*')
          .eq('branch_id', branchId),
        supabase
          .from('email_templates')
          .select('*')
          .eq('branch_id', branchId)
      ]);
      
      if (accountsError) throw accountsError;
      if (templatesError) throw templatesError;
      
      setAccounts(accountsData || []);
      setTemplates(templatesData || []);
    } catch (err) {
      console.error('Error fetching email data:', err);
      setError('Failed to load email settings. Please try again later.');
      toast.error('Failed to load email settings');
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 600);
    }
  };
  
  const handleAccountSuccess = async (newAccount) => {
    try {
      const { data, error } = await supabase
        .from('email_accounts')
        .insert([{ ...newAccount, branch_id: branchId }])
        .select()
        .single();
      
      if (error) throw error;
      
      setAccounts([...accounts, data]);
      toast.success('Email account added successfully');
      
      // Switch to templates tab if this is the first account
      if (accounts.length === 0) {
        setActiveTab('templates');
      }
    } catch (err) {
      console.error('Error adding email account:', err);
      toast.error('Failed to add email account');
    }
  };

  const handleTemplateSuccess = async (newTemplate) => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert([{ ...newTemplate, branch_id: branchId }])
        .select()
        .single();
      
      if (error) throw error;
      
      setTemplates([...templates, data]);
      toast.success('Email template added successfully');
    } catch (err) {
      console.error('Error adding email template:', err);
      toast.error('Failed to add email template');
    }
  };
  
  const TabButton = ({ id, label, icon, current }) => (
    <button
      className={`px-4 py-3 font-medium text-sm rounded-md flex items-center space-x-2 transition-all duration-200 ${
        current === id
          ? 'bg-blue-100 text-blue-700 shadow-sm transform translate-y-[-1px]'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
      onClick={() => setActiveTab(id)}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-white">Email Settings</h1>
          <p className="text-blue-100 mt-2 max-w-2xl">
            Configure email accounts and automatic reply templates to streamline communication with your patients
          </p>
          <div className="mt-4 flex">
            <button 
              onClick={fetchData}
              disabled={refreshing}
              className={`flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-md transition-all duration-200 ${refreshing ? 'cursor-not-allowed' : ''}`}
            >
              <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </header>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 animate-fadeIn">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
              <button 
                onClick={fetchData}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-900 underline"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300">
        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex space-x-2 px-6 py-3">
            <TabButton 
              id="accounts" 
              label="Email Accounts" 
              current={activeTab}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              } 
            />
            <TabButton 
              id="templates" 
              label="Reply Templates" 
              current={activeTab}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
                </svg>
              } 
            />
            <TabButton 
              id="test" 
              label="Test Auto Reply" 
              current={activeTab}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
              } 
            />
          </nav>
        </div>
        
        {/* Tab content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-6 text-gray-500 font-medium">Loading email settings...</p>
            </div>
          ) : (
            <>
              {/* Accounts Tab */}
              {activeTab === 'accounts' && (
                <div className="animate-fadeIn">
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">Connected Email Accounts</h2>
                      <div className="text-sm text-gray-500">
                        {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'} connected
                      </div>
                    </div>
                    
                    {accounts.length === 0 ? (
                      <div className="bg-gray-50 p-8 rounded-lg text-center border border-dashed border-gray-300">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                        <p className="text-gray-600 font-medium">No email accounts connected yet</p>
                        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">Connect an account below to enable automatic email replies for your practice</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {accounts.map(account => (
                          <div key={account.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 bg-white flex justify-between items-center group">
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-3 rounded-full mr-4">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-800">{account.email}</h3>
                                <p className="text-sm text-gray-500 mt-1">Connected: {new Date(account.connected_at).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${account.enabled 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'}`}
                              >
                                <span className={`w-2 h-2 rounded-full mr-2 ${account.enabled ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                {account.enabled ? 'Active' : 'Inactive'}
                              </span>
                              <button className="ml-4 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-1 mb-6">
                    <div className="bg-white rounded-md">
                      <EmailAccountForm onSuccess={handleAccountSuccess} />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Templates Tab */}
              {activeTab === 'templates' && (
                <div className="animate-fadeIn">
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">Email Reply Templates</h2>
                      <div className="text-sm text-gray-500">
                        {templates.length} {templates.length === 1 ? 'template' : 'templates'} configured
                      </div>
                    </div>
                    
                    {templates.length === 0 ? (
                      <div className="bg-gray-50 p-8 rounded-lg text-center border border-dashed border-gray-300">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
                          </svg>
                        </div>
                        <p className="text-gray-600 font-medium">No email templates created yet</p>
                        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">Create a template below to enable automatic replies based on keywords in patient emails</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates.map(template => (
                          <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 bg-white group">
                            <div className="flex justify-between items-center mb-3">
                              <h3 className="font-medium text-gray-800 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
                                </svg>
                                {template.name}
                              </h3>
                              <div className="flex items-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Priority: {template.priority}
                                </span>
                                <button className="ml-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Subject:</span> {template.subject_template}</p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {template.trigger_keywords.map((keyword, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded border border-gray-100 max-h-32 overflow-y-auto">
                              <pre className="whitespace-pre-wrap">{template.body_template}</pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {accounts.length === 0 ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">You need to connect an email account before creating templates.</p>
                          <button
                            onClick={() => setActiveTab('accounts')}
                            className="mt-2 text-sm font-medium text-yellow-700 hover:underline"
                          >
                            Go to Email Accounts
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-1">
                      <div className="bg-white rounded-md">
                        <EmailTemplateForm accountId={accounts[0]?.id} />
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Test Tab */}
              {activeTab === 'test' && (
                <div className="text-center py-12 animate-fadeIn">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
                    <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Test Auto Reply System</h2>
                  <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                    This feature will be available soon. It will allow you to simulate incoming emails and test your automatic reply templates without sending real emails.
                  </p>
                  <div className="inline-flex rounded-md shadow">
                    <button
                      onClick={() => setActiveTab('templates')}
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                    >
                      Go to Templates
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
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

export default EmailSettings; 