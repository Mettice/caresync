import React from 'react';
import ReminderForm from '../components/ReminderForm';

const Reminders = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-600">Appointment Reminders</h1>
        <p className="text-gray-600 mt-2">Schedule appointment reminders for patients</p>
      </header>
      
      <ReminderForm endpoint="http://localhost:9999/api/schedule-reminder" />
    </div>
  );
};

export default Reminders;