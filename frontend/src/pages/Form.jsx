import React from 'react';
import IntakeForm from '../components/IntakeForm';

const Form = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-600">Patient Intake Form</h1>
        <p className="text-gray-600 mt-2">Please fill out the following information</p>
      </header>
      
      <IntakeForm endpoint="http://localhost:9999/api/form-intake" />
    </div>
  );
};

export default Form;