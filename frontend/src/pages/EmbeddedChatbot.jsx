import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatbotWidget from '../components/ChatbotWidget';

const EmbeddedChatbot = () => {
  const [searchParams] = useSearchParams();
  const clinicId = searchParams.get('clinic');
  const branchId = searchParams.get('branch');

  if (!clinicId || !branchId) {
    return (
      <div className="p-4 text-center text-red-600">
        Missing required parameters: clinic and branch IDs
      </div>
    );
  }

  return (
    <div className="h-screen">
      <ChatbotWidget
        clinicId={clinicId}
        branchId={branchId}
        onSendMessage={(message) => {
          // Send message to parent window
          window.parent.postMessage({
            type: 'CHAT_MESSAGE_SENT',
            data: message
          }, '*');
        }}
      />
    </div>
  );
};

export default EmbeddedChatbot; 