import React from 'react';
import FormUpload from '../components/FormUpload';
import DocumentList from '../components/DocumentList';

const Upload = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Upload</h1>
        <p className="text-gray-600 mb-8">
          Upload your medical records, referrals, or any relevant documents. We'll process them for easy access and reference.
        </p>
        
        <div className="space-y-8">
          <FormUpload />
          <DocumentList />
        </div>
      </div>
    </div>
  );
};

export default Upload;