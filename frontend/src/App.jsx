import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import EmailSettings from './pages/EmailSettings';
import AuthRoute from './components/AuthRoute';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth.jsx';
import EmbeddedChatbot from './pages/EmbeddedChatbot';
import EmbeddedIntakeForm from './pages/EmbeddedIntakeForm';
import { useGlobalState } from './context/GlobalStateContext';
import Upload from './pages/Upload';
import Reminders from './pages/Reminders';
import Form from './pages/Form';
import Features from './pages/Features';
import { Toaster } from 'react-hot-toast';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Create a 404 page component
const PageNotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <a 
        href="/"
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Go Home
      </a>
    </div>
  </div>
);

function App() {
  const { state, actions } = useGlobalState();
  
  // Apply theme from global state
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<Features />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/signup" element={<AuthRoute><Register /></AuthRoute>} />
          <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
          <Route path="/reset-password" element={<AuthRoute><ResetPassword /></AuthRoute>} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/email-settings" element={<ProtectedRoute><EmailSettings /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
          <Route path="/forms" element={<ProtectedRoute><Form /></ProtectedRoute>} />
          
          {/* Embedded routes */}
          <Route path="/widget/chat/:clinicId" element={<EmbeddedChatbot />} />
          <Route path="/widget/intake/:formId" element={<EmbeddedIntakeForm />} />
          
          {/* Redirects and 404 */}
          <Route path="/home" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;