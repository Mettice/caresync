import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import IntakeFormWidget from '../components/IntakeFormWidget';

const EmbeddedIntakeForm = () => {
  const [searchParams] = useSearchParams();
  const clinicId = searchParams.get('clinic');
  const branchId = searchParams.get('branch');

  useEffect(() => {
    // Function to send height to parent
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'RESIZE_FRAME', data: { height } }, '*');
    };

    // Send initial height
    sendHeight();

    // Send height on window resize
    window.addEventListener('resize', sendHeight);

    return () => window.removeEventListener('resize', sendHeight);
  }, []);

  const handleSuccess = (data) => {
    window.parent.postMessage({ type: 'FORM_SUBMITTED', data }, '*');
  };

  const handleError = (error) => {
    window.parent.postMessage({ type: 'FORM_ERROR', data: error }, '*');
  };

  if (!clinicId || !branchId) {
    return (
      <div className="p-4 text-center text-red-600">
        Missing required parameters: clinic and branch IDs
      </div>
    );
  }

  return (
    <div className="p-4">
      <IntakeFormWidget
        clinicId={clinicId}
        branchId={branchId}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  );
};

export default EmbeddedIntakeForm; 