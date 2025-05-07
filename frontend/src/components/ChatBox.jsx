import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Mock responses when backend is unavailable
const MOCK_RESPONSES = [
  "Thank you for your question! I'm a demo version running in mock mode. In the full version, I'd connect to your backend for personalized answers.",
  "I'm currently running in demo mode. When properly configured, I can answer questions about your clinic's services, hours, and policies.",
  "This is a demonstration of our AI chat capabilities. In the full version, I'd be connected to your backend to provide accurate information.",
  "I'm showing you how the chat interface works. When connected to the backend, I'll provide personalized answers to patient questions."
];

// Animation keyframes defined outside component
const slideInLeftAnimation = `
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;

const slideInRightAnimation = `
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(10px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;

const fadeInAnimation = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// Apply the animation styles once at the app startup
const injectStyles = () => {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    ${slideInLeftAnimation}
    ${slideInRightAnimation}
    ${fadeInAnimation}
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
  document.head.appendChild(styleEl);
};

// Call the function immediately
injectStyles();

const ChatBox = ({ 
  endpoint = 'http://localhost:9999/api/chat', 
  clinicName = 'CareSync AI',
  minimized = false,
  onToggleMinimize = null,
  className = ""
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);
  const messagesEndRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(!minimized);

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

  // Handle minimized state changes from parent
  useEffect(() => {
    setIsExpanded(!minimized);
  }, [minimized]);
  
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
      if (useMockData) {
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
          const response = await axios.post(endpoint, {
            question: userMessage.content,
          }, { timeout: 8000 }); // Add timeout to fail faster if server doesn't respond

          // Add AI response to chat
          const aiMessage = {
            role: 'ai',
            content: response.data.answer,
            timestamp: new Date(),
            sources: response.data.sources || [],
            confidence: response.data.confidence,
          };
          setMessages((prev) => [...prev, aiMessage]);
        } catch (err) {
          console.error('Error fetching response:', err);
          // If backend fails, switch to mock mode automatically
          setUseMockData(true);
          
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

  const toggleMinimize = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    if (onToggleMinimize) {
      onToggleMinimize(newExpandedState);
    }
  };
  
  const toggleMockData = () => {
    setUseMockData(!useMockData);
    
    // Add system message about mode change
    const modeMessage = {
      role: 'system',
      content: !useMockData 
        ? "Switched to demo mode. Responses are simulated." 
        : "Switched to live mode. Connecting to backend for responses.",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, modeMessage]);
  };

  return (
    <div className={`flex flex-col ${isExpanded ? 'h-[600px] w-[400px]' : 'h-[60px] w-[280px]'} transition-all duration-300 ease-in-out 
      backdrop-blur-md bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-xl 
      border border-gray-200/50 dark:border-gray-700/50 overflow-hidden 
      hover:shadow-2xl ${className}`}
      style={{
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Chat header */}
      <div 
        className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 font-semibold 
          flex justify-between items-center cursor-pointer transition-all duration-300
          ${!isExpanded && 'hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500'}`}
        onClick={toggleMinimize}
      >
        <div className="flex items-center">
          <div className={`h-8 w-8 rounded-full bg-white/20 flex items-center justify-center mr-3 
            transition-transform duration-300 ${!isExpanded && 'scale-90'}`}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg whitespace-nowrap">Chat with {clinicName}</h2>
            
            {/* Show mode toggle in header */}
            {isExpanded && (
              <div className="ml-3 transition-opacity duration-300">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMockData();
                  }}
                  className={`text-xs px-2 py-1 rounded-full transition-all duration-300 ${
                    useMockData 
                      ? 'bg-amber-500/60 hover:bg-amber-500/80' 
                      : 'bg-green-500/60 hover:bg-green-500/80'
                  }`}
                >
                  {useMockData ? 'Demo Mode' : 'Live Mode'}
                </button>
              </div>
            )}
          </div>
        </div>
        <button className="focus:outline-none transition-transform duration-300 hover:scale-110">
          {isExpanded ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
            </svg>
          )}
        </button>
      </div>

      {/* Messages container */}
      {isExpanded && (
        <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50/90 to-white/90 dark:from-gray-800/90 dark:to-gray-900/90">
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 animate-slideIn ${message.role === 'user' ? 'animate-slideInRight' : message.role === 'system' ? 'animate-fadeIn' : 'animate-slideInLeft'}`} style={{ animationDelay: `${index * 0.1}s` }}>
              {message.role === 'system' ? (
                // System message styling
                <div className="text-xs text-center py-2 px-3 bg-gray-200/70 dark:bg-gray-700/70 rounded-full mx-auto max-w-[80%] backdrop-blur-sm">
                  {message.content}
                </div>
              ) : (
                <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'ai' && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex-shrink-0 mr-2 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg p-3 transition-all duration-300 
                      ${message.role === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-tr-none shadow-md' 
                        : 'bg-white/80 dark:bg-gray-700/80 border border-gray-200/50 dark:border-gray-600/50 shadow-sm rounded-tl-none backdrop-blur-sm'}`}
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
                              {source.relevance_score && ` - Score: ${source.relevance_score.toFixed(2)}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Display confidence if available */}
                    {message.confidence && (
                      <div className="mt-1 text-xs opacity-70">
                        <p>Confidence: {(message.confidence * 100).toFixed(1)}%</p>
                      </div>
                    )}
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-blue-400 flex-shrink-0 ml-2 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start mb-4 animate-fadeIn">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex-shrink-0 mr-2 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="bg-white/80 dark:bg-gray-700/80 border border-gray-200/50 dark:border-gray-600/50 rounded-lg p-3 shadow-sm backdrop-blur-sm rounded-tl-none">
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
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 shadow-sm max-w-[80%] backdrop-blur-sm rounded-tl-none">
                <p>{error}</p>
                <button 
                  onClick={() => {
                    setError(null);
                    setUseMockData(true);
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
      )}

      {/* Input form */}
      {isExpanded && (
        <form onSubmit={handleSubmit} className="border-t border-gray-200/50 dark:border-gray-700/50 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 border border-gray-300/50 dark:border-gray-600/50 rounded-full px-4 py-2 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-all duration-200"
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
      )}
    </div>
  );
};

export default ChatBox;