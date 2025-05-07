import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

// Mock responses when backend is unavailable
const MOCK_RESPONSES = [
  "Thank you for your question! I'm a demo version running in mock mode. In the full version, I'd connect to your backend for personalized answers.",
  "I'm currently running in demo mode. When properly configured, I can answer questions about your clinic's services, hours, and policies.",
  "This is a demonstration of our AI chat capabilities. In the full version, I'd be connected to your backend to provide accurate information.",
  "I'm showing you how the chat interface works. When connected to the backend, I'll provide personalized answers to patient questions."
];

// Animation keyframes defined once
const ANIMATIONS = `
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(10px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .animate-slideInLeft {
    animation: slideInLeft 0.3s ease-out forwards;
  }
  
  .animate-slideInRight {
    animation: slideInRight 0.3s ease-out forwards;
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;

// Apply styles once on component first render
const injectStyles = () => {
  if (!document.getElementById('chat-animation-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'chat-animation-styles';
    styleElement.textContent = ANIMATIONS;
    document.head.appendChild(styleElement);
  }
};

/**
 * Unified Chat component that works both as an embedded chat and a widget
 * @param {Object} props
 * @param {string} props.mode - Either 'embedded' or 'widget'
 * @param {string} props.endpoint - API endpoint for chat
 * @param {string} props.clinicName - Name of the clinic
 * @param {boolean} props.useMock - Whether to use mock data instead of API
 * @param {string} props.position - For widget mode: 'bottom-right', 'bottom-left', etc.
 * @param {Object} props.clinicInfo - Clinic information to pass to API
 * @param {string} props.className - Additional class names
 */
const Chat = ({
  mode = 'embedded',
  endpoint = 'http://localhost:9999/api/chat',
  clinicName = 'CareSync AI',
  useMock: initialUseMock = false,
  position = 'bottom-right',
  clinicId = null,
  branchId = null,
  className = '',
  onSendMessage = null,
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useMock, setUseMock] = useState(initialUseMock);
  const [isMinimized, setIsMinimized] = useState(mode === 'widget');
  const messagesEndRef = useRef(null);

  // Inject animation styles on first render
  useEffect(() => {
    injectStyles();
  }, []);

  // Initialize chat with welcome message
  useEffect(() => {
    setMessages([
      {
        role: 'ai',
        content: `Hi, welcome to ${clinicName}. How can I help you today?`,
        timestamp: new Date(),
      },
    ]);
  }, [clinicName]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get a random mock response
  const getMockResponse = () => {
    const randomIndex = Math.floor(Math.random() * MOCK_RESPONSES.length);
    return MOCK_RESPONSES[randomIndex];
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      if (useMock) {
        // Simulate API delay with mock data
        await new Promise(resolve => setTimeout(resolve, 1200));
        const mockResponse = getMockResponse();
        
        const aiMessage = {
          role: 'ai',
          content: mockResponse,
          timestamp: new Date(),
          isMock: true,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Attempt to send request to backend
        try {
          if (mode === 'embedded' || !clinicId) {
            // Use axios for API endpoint
            const response = await axios.post(endpoint, {
              question: userMessage.content,
            }, { timeout: 8000 });

            // Add AI response to chat
            const aiMessage = {
              role: 'ai',
              content: response.data.answer || response.data.message,
              timestamp: new Date(),
              sources: response.data.sources || [],
              confidence: response.data.confidence,
            };
            setMessages((prev) => [...prev, aiMessage]);
          } else {
            // Use Supabase for widget mode with clinic context
            if (onSendMessage) {
              onSendMessage(userMessage);
            }

            // Store user message
            await supabase
              .from('chat_messages')
              .insert([{
                content: userMessage.content,
                clinic_id: clinicId,
                branch_id: branchId,
                role: 'user'
              }]);
            
            // Get response from backend
            const response = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: userMessage.content,
                clinicId,
                branchId
              })
            });

            const botData = await response.json();
            
            const botMessage = {
              role: 'ai',
              content: botData.message || botData.answer,
              timestamp: new Date(),
            };
            
            setMessages(prev => [...prev, botMessage]);
            
            // Save bot response
            await supabase
              .from('chat_messages')
              .insert([{
                content: botMessage.content,
                clinic_id: clinicId,
                branch_id: branchId,
                role: 'assistant'
              }]);
          }
        } catch (err) {
          console.error('Error fetching response:', err);
          // If backend fails, switch to mock mode automatically
          setUseMock(true);
          
          const mockResponse = "I'm having trouble connecting to the server right now. I've switched to demo mode so we can continue our conversation. " + getMockResponse();
          
          const aiMessage = {
            role: 'ai',
            content: mockResponse,
            timestamp: new Date(),
            isMock: true,
          };
          setMessages((prev) => [...prev, aiMessage]);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(
        'Sorry, something went wrong. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  const toggleChat = () => {
    setIsMinimized(!isMinimized);
  };
  
  const toggleMockData = (e) => {
    e.stopPropagation();
    setUseMock(!useMock);
    
    // Add system message about mode change
    const modeMessage = {
      role: 'system',
      content: !useMock 
        ? "Switched to demo mode. Responses are simulated." 
        : "Switched to live mode. Connecting to backend for responses.",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, modeMessage]);
  };

  // Positioning classes for widget mode
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      case 'bottom-right':
      default:
        return 'bottom-6 right-6';
    }
  };

  // Helper function to render messages
  const renderMessages = () => {
    return messages.map((message, index) => (
      <div key={index} className={`mb-4 ${message.role === 'user' ? 'animate-slideInRight' : message.role === 'system' ? 'animate-fadeIn' : 'animate-slideInLeft'}`}>
        {message.role === 'system' ? (
          // System message styling
          <div className="text-xs text-center py-2 px-3 bg-gray-200/70 rounded-full mx-auto max-w-[80%]">
            {message.content}
          </div>
        ) : (
          <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'ai' && (
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex-shrink-0 mr-2 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
            )}
            
            <div
              className={`max-w-[80%] rounded-lg p-3 
                ${message.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-200 shadow-sm rounded-tl-none'}`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              
              {/* Display mock indicator if applicable */}
              {message.isMock && (
                <div className="mt-1 text-xs opacity-70 italic">
                  <p>Demo response</p>
                </div>
              )}
              
              {/* Display sources if available */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200/50 text-xs">
                  <p className="font-semibold mb-1">Sources:</p>
                  <ul className="list-disc pl-4">
                    {message.sources.map((source, idx) => (
                      <li key={idx}>
                        {source.document_name}
                        {source.page_number && ` (p. ${source.page_number})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {message.role === 'user' && (
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-blue-400 flex-shrink-0 ml-2 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
            )}
          </div>
        )}
      </div>
    ));
  };

  // Widget mode render
  if (mode === 'widget') {
    return (
      <div className={`fixed z-50 ${getPositionClasses()} ${className}`}>
        {/* Chat button */}
        {isMinimized ? (
          <button
            onClick={toggleChat}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
            aria-label="Open chat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
        ) : (
          <div className="bg-white rounded-lg shadow-xl w-[350px] h-[500px] flex flex-col border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white rounded-t-lg flex justify-between items-center">
              <h3 className="font-medium flex items-center">
                <span className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </span>
                {clinicName} Assistant
                
                <button 
                  onClick={toggleMockData}
                  className={`ml-3 text-xs px-2 py-1 rounded-full transition-all duration-300 ${
                    useMock 
                      ? 'bg-amber-500/60 hover:bg-amber-500/80' 
                      : 'bg-green-500/60 hover:bg-green-500/80'
                  }`}
                >
                  {useMock ? 'Demo Mode' : 'Live Mode'}
                </button>
              </h3>
              <button onClick={toggleChat} className="text-white hover:text-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {renderMessages()}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t p-4 bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // Embedded mode render
  return (
    <div className={`flex flex-col h-full bg-white/90 rounded-lg shadow-lg border border-gray-200/50 overflow-hidden ${className}`}>
      {/* Chat header */}
      <div 
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 font-semibold flex justify-between items-center"
      >
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg whitespace-nowrap">Chat with {clinicName}</h2>
            
            <button 
              onClick={toggleMockData}
              className={`text-xs px-2 py-1 rounded-full transition-all duration-300 ${
                useMock 
                  ? 'bg-amber-500/60 hover:bg-amber-500/80' 
                  : 'bg-green-500/60 hover:bg-green-500/80'
              }`}
            >
              {useMock ? 'Demo Mode' : 'Live Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
        {renderMessages()}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start mb-4 animate-fadeIn">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex-shrink-0 mr-2 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm rounded-tl-none">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex justify-start mb-4 animate-fadeIn">
            <div className="h-8 w-8 rounded-full bg-red-500 flex-shrink-0 mr-2 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 shadow-sm max-w-[80%] rounded-tl-none">
              <p>{error}</p>
              <button 
                onClick={() => {
                  setError(null);
                  setUseMock(true);
                }}
                className="mt-2 text-xs text-red-600 font-medium underline"
              >
                Switch to demo mode
              </button>
            </div>
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              bg-white transition-all duration-200"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full 
              hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed 
              transition-all duration-200 transform hover:scale-105 active:scale-95
              shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat; 