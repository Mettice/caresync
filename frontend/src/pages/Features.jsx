import React from 'react';

// Import the components from LandingPage.jsx
import { Icons, Button, Navbar, Footer } from './LandingPage';

const Features = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-caresync-light/30 py-16 md:py-24">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 gradient-text">
                What CareSync AI Can Do for Your Clinic
              </h1>
              <p className="text-xl text-muted-foreground">
                Our AI-powered tools automate routine tasks, boost efficiency, and enhance patient satisfaction.
              </p>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
              {/* Smart Clinic Chatbot */}
              <div className="rounded-lg overflow-hidden shadow-lg border">
                <div className="aspect-video bg-caresync-primary/10 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-caresync-primary/20 flex items-center justify-center">
                    <Icons.Mail className="h-8 w-8 text-caresync-dark" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-3">Smart Clinic Chatbot</h3>
                  <p className="text-muted-foreground mb-6">
                    Responds instantly to patient questions about hours, services, insurance, and more. Trained on your clinic's specific information for personalized responses.
                  </p>
                  <Button className="bg-caresync-primary hover:bg-caresync-secondary">
                    See Demo
                  </Button>
                </div>
              </div>
              
              {/* AI Appointment Reminders */}
              <div className="rounded-lg overflow-hidden shadow-lg border">
                <div className="aspect-video bg-caresync-primary/10 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-caresync-primary/20 flex items-center justify-center">
                    <Icons.Bell className="h-8 w-8 text-caresync-dark" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-3">AI Appointment Reminders</h3>
                  <p className="text-muted-foreground mb-6">
                    Automatically sends WhatsApp or email reminders to patients before visits. Reduces no-shows and improves scheduling efficiency.
                  </p>
                  <Button className="bg-caresync-primary hover:bg-caresync-secondary">
                    See Demo
                  </Button>
                </div>
              </div>
              
              {/* Patient Intake Automation */}
              <div className="rounded-lg overflow-hidden shadow-lg border">
                <div className="aspect-video bg-caresync-primary/10 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-caresync-primary/20 flex items-center justify-center">
                    <Icons.FileInput className="h-8 w-8 text-caresync-dark" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-3">Patient Intake Automation</h3>
                  <p className="text-muted-foreground mb-6">
                    Streamlines new patient forms. Collects and organizes information into a digital profile you receive instantly, saving time for both staff and patients.
                  </p>
                  <Button className="bg-caresync-primary hover:bg-caresync-secondary">
                    See Demo
                  </Button>
                </div>
              </div>
              
              {/* AI Email Responder */}
              <div className="rounded-lg overflow-hidden shadow-lg border">
                <div className="aspect-video bg-caresync-primary/10 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-caresync-primary/20 flex items-center justify-center">
                    <Icons.Mail className="h-8 w-8 text-caresync-dark" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-3">AI Email Responder</h3>
                  <p className="text-muted-foreground mb-6">
                    Handles general email inquiries and generates polite replies using AI. Saves hours weekly by managing routine communications without human intervention.
                  </p>
                  <Button className="bg-caresync-primary hover:bg-caresync-secondary">
                    See Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-caresync-light/30">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Let us install a live version of any feature on your website for free.
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                No commitment required. See for yourself how CareSync AI can transform patient communication at your clinic.
              </p>
              <Button className="bg-caresync-dark hover:bg-caresync-accent text-lg px-8 py-6">
                Book Your Free Installation
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Features; 