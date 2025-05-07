import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Chat from '../components/ui/Chat';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

// Simple Button component to replace shadcn/ui Button while maintaining styling
const Button = ({ children, className, variant, ...props }) => {
  const getClasses = () => {
    if (variant === 'outline') {
      return 'border border-caresync-dark text-caresync-dark hover:bg-gray-50 text-lg py-3 px-6 rounded-md backdrop-blur-sm ' + (className || '');
    }
    return 'bg-caresync-dark hover:bg-caresync-accent text-white text-lg py-3 px-6 rounded-md shadow-md hover:shadow-lg transition-all duration-300 ' + (className || '');
  };
  
  return (
    <button className={getClasses()} {...props}>
      {children}
    </button>
  );
};

// Basic icons using SVG to replace lucide-react
const Icons = {
  Shield: ({ className = "h-4 w-4 mr-2" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
    </svg>
  ),
  Clock: ({ className = "h-6 w-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  ),
  Bell: ({ className = "h-6 w-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
    </svg>
  ),
  ArrowUpRight: ({ className = "h-6 w-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
    </svg>
  ),
  FileInput: ({ className = "h-6 w-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>
  ),
  Mail: ({ className = "h-6 w-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
    </svg>
  ),
  LayoutDashboard: ({ className = "h-4 w-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
    </svg>
  )
};

// Updated Navbar component
const Navbar = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-caresync-primary to-caresync-dark"></div>
            <span className="text-xl font-bold">CareSync AI</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-caresync-dark transition-colors">Home</Link>
          <a href="#features" className="text-sm font-medium hover:text-caresync-dark transition-colors">Features</a>
          <a href="#pricing" className="text-sm font-medium hover:text-caresync-dark transition-colors">Pricing</a>
          <a href="#contact" className="text-sm font-medium hover:text-caresync-dark transition-colors">Contact</a>
          {isLoggedIn ? (
            <Link to="/dashboard" className="bg-caresync-dark hover:bg-caresync-accent text-white px-4 py-2 rounded-md flex items-center gap-1">
              <Icons.LayoutDashboard />
              <span>Dashboard</span>
            </Link>
          ) : (
            <Link to="/login" className="bg-caresync-dark hover:bg-caresync-accent text-white px-4 py-2 rounded-md">
              Login
            </Link>
          )}
          <button className="bg-caresync-primary hover:bg-caresync-secondary text-white px-4 py-2 rounded-md">Book Demo</button>
        </nav>
        
        <div className="md:hidden">
          <button className="p-2 text-gray-600" onClick={toggleMenu}>
            {isMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/40">
          <div className="container py-4 flex flex-col gap-4">
            <Link to="/" className="text-sm font-medium hover:text-caresync-dark transition-colors" onClick={toggleMenu}>Home</Link>
            <a href="#features" className="text-sm font-medium hover:text-caresync-dark transition-colors" onClick={toggleMenu}>Features</a>
            <a href="#pricing" className="text-sm font-medium hover:text-caresync-dark transition-colors" onClick={toggleMenu}>Pricing</a>
            <a href="#contact" className="text-sm font-medium hover:text-caresync-dark transition-colors" onClick={toggleMenu}>Contact</a>
            {isLoggedIn ? (
              <Link to="/dashboard" className="bg-caresync-dark hover:bg-caresync-accent text-white px-4 py-2 rounded-md flex items-center gap-1 justify-center" onClick={toggleMenu}>
                <Icons.LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link to="/login" className="bg-caresync-dark hover:bg-caresync-accent text-white px-4 py-2 rounded-md text-center" onClick={toggleMenu}>
                Login
              </Link>
            )}
            <button className="bg-caresync-primary hover:bg-caresync-secondary text-white w-full px-4 py-2 rounded-md" onClick={toggleMenu}>Book Demo</button>
          </div>
        </div>
      )}
    </header>
  );
};

// Simple footer component
const Footer = () => (
  <footer className="bg-gray-50 border-t">
    <div className="container py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between">
        <div className="mb-6 md:mb-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-caresync-primary to-caresync-dark"></div>
            <span className="text-xl font-bold">CareSync AI</span>
          </div>
          <p className="text-muted-foreground max-w-xs">
            Transforming healthcare communication with AI-powered patient support.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-medium mb-3">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-muted-foreground hover:text-caresync-dark">Features</a></li>
              <li><a href="#pricing" className="text-muted-foreground hover:text-caresync-dark">Pricing</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-caresync-dark">Demo</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-caresync-dark">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-caresync-dark">Documentation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-caresync-dark">Help Center</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-caresync-dark">About</a></li>
              <li><a href="#contact" className="text-muted-foreground hover:text-caresync-dark">Contact</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-caresync-dark">Legal</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} CareSync AI. All rights reserved.
      </div>
    </div>
  </footer>
);

// Animation hook that adds a class when element is in viewport
const useInView = (options = { threshold: 0.25 }) => {
  const ref = useRef();
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return [ref, isInView];
};

// Animation wrapper component
const AnimateOnScroll = ({ children, animation = 'fade-up', delay = 0 }) => {
  const [ref, isInView] = useInView();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isInView ? `animate-${animation}` : 'opacity-0'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// Simple feature card with animation
const FeatureCard = ({ title, description, icon, showDemo = true, delay = 0 }) => {
  const [ref, isInView] = useInView();
  
  return (
    <div 
      ref={ref}
      className={`bg-white/90 backdrop-blur-md p-6 rounded-lg shadow-lg border border-gray-200/50 
        transition-all duration-500 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        hover:shadow-xl hover:-translate-y-1`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      {showDemo && (
        <a href="#" className="text-caresync-dark font-medium hover:text-caresync-primary inline-flex items-center 
          transition-all duration-200 hover:translate-x-1">
          See demo
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </a>
      )}
    </div>
  );
};

// Simple feature step with animation
const FeatureStep = ({ step, title, description, delay = 0 }) => {
  const [ref, isInView] = useInView();
  
  return (
    <div 
      ref={ref}
      className={`flex flex-col items-center text-center group
        transition-all duration-700 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="step-number mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-12 h-12 
        rounded-full flex items-center justify-center font-bold text-lg 
        shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
        {step}
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

// Featured Detail Card for full features section with animation
const FeatureDetailCard = ({ title, description, icon, delay = 0 }) => {
  const [ref, isInView] = useInView();
  
  return (
    <div 
      ref={ref}
      className={`rounded-lg overflow-hidden shadow-lg border border-gray-200/50 
        bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-md
        transition-all duration-700 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
        hover:shadow-xl hover:-translate-y-1`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="aspect-video bg-gradient-to-r from-blue-100/50 to-indigo-100/50 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground mb-6">
          {description}
        </p>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 active:scale-95 transition-all duration-300">
          See Demo
        </Button>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-caresync-dark"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">Smarter Patient Support with AI – Live on Your Website, 24/7
          </span>
          <span className="block text-caresync-primary">Reduce admin time, respond faster, and give patients the care experience they expect – without lifting a finger.</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Streamline your healthcare practice with our intelligent practice management solution.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <div className="rounded-md shadow">
            <button
              onClick={handleGetStarted}
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-caresync-primary hover:bg-caresync-dark md:py-4 md:text-lg md:px-10"
            >
              {user ? 'Go to Dashboard' : 'Get Started'}
            </button>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Features that empower your practice
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Everything you need to manage your healthcare practice efficiently
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">Patient Management</h3>
                <p className="mt-2 text-base text-gray-500">
                  Efficiently manage patient records, appointments, and communications all in one place.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">Smart Scheduling</h3>
                <p className="mt-2 text-base text-gray-500">
                  AI-powered scheduling system that optimizes your clinic's workflow and reduces wait times.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">Analytics & Insights</h3>
                <p className="mt-2 text-base text-gray-500">
                  Make data-driven decisions with comprehensive analytics and reporting tools.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How CareSync AI Works
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Simple steps to transform your healthcare practice
            </p>
          </div>
          
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <FeatureStep 
                step="1"
                title="Set Up Your Profile"
                description="Create your clinic profile with customized settings for your practice"
                delay={100}
              />
              <FeatureStep 
                step="2"
                title="Invite Your Team"
                description="Add your staff members and set appropriate access permissions"
                delay={300}
              />
              <FeatureStep 
                step="3"
                title="Start Managing Patients"
                description="Begin adding patients and enjoying streamlined healthcare management"
                delay={500}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Detailed Features Section */}
      <section id="detailed-features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Explore Our Key Features
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Advanced tools designed for modern healthcare practices
            </p>
          </div>
          
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                title="AI-Powered Chatbot"
                description="Enhance patient communication with our intelligent chatbot that can answer common questions and schedule appointments."
                icon={<Icons.Bell className="w-6 h-6 text-blue-500" />}
                delay={100}
              />
              <FeatureCard
                title="Secure Document Management"
                description="Store and manage patient documents securely with our HIPAA-compliant document system."
                icon={<Icons.FileInput className="w-6 h-6 text-blue-500" />}
                delay={200}
              />
              <FeatureCard
                title="Automated Reminders"
                description="Reduce no-shows with automated appointment reminders sent via email or text message."
                icon={<Icons.Clock className="w-6 h-6 text-blue-500" />}
                delay={300}
              />
              <FeatureCard
                title="Custom Email Templates"
                description="Create and save email templates for common communications with patients."
                icon={<Icons.Mail className="w-6 h-6 text-blue-500" />}
                delay={400}
              />
              <FeatureCard
                title="Data Analytics"
                description="Gain insights into your practice with comprehensive reporting and analytics tools."
                icon={<Icons.LayoutDashboard className="w-6 h-6 text-blue-500" />}
                delay={500}
              />
              <FeatureCard
                title="Secure Patient Portal"
                description="Offer patients a secure portal to access their health information and communicate with your practice."
                icon={<Icons.Shield className="w-6 h-6 text-blue-500" />}
                delay={600}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section id="cta" className="py-16 bg-gradient-to-r from-caresync-dark to-caresync-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to transform your healthcare practice?
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-white opacity-90">
            Join thousands of healthcare providers who trust CareSync AI.
          </p>
          <div className="mt-8">
            <button 
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-caresync-dark bg-white hover:bg-gray-100 md:py-4 md:text-lg md:px-10"
            >
              Get Started Today
            </button>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Contact Us
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Have questions? Our team is here to help.
            </p>
          </div>
          
          <div className="mt-10 max-w-3xl mx-auto">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-8">
                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" name="name" id="name" className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-caresync-primary focus:border-caresync-primary border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" id="email" className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-caresync-primary focus:border-caresync-primary border-gray-300 rounded-md" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                    <input type="text" name="subject" id="subject" className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-caresync-primary focus:border-caresync-primary border-gray-300 rounded-md" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                    <textarea id="message" name="message" rows="4" className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-caresync-primary focus:border-caresync-primary border-gray-300 rounded-md"></textarea>
                  </div>
                  <div className="sm:col-span-2">
                    <Button className="w-full">
                      Send Message
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
      
      {/* Chat Widget */}
      <Chat 
        mode="widget"
        position="bottom-right"
        clinicName="CareSync"
        useMock={true}
      />
    </div>
  );
};

export { Button, Icons, Navbar, Footer, FeatureCard, FeatureStep, FeatureDetailCard };
export default LandingPage; 