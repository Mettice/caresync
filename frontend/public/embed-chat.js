// CareSync Chatbot Embed Script
(function() {
  // Configuration
  const CARESYNC_URL = process.env.REACT_APP_PUBLIC_URL || 'https://app.caresync.com';
  
  // Create and inject styles
  const style = document.createElement('style');
  style.textContent = `
    .caresync-chat-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
      width: 100%;
    }
    
    .caresync-chat-button {
      position: absolute;
      bottom: 0;
      right: 0;
      background-color: #2563eb;
      color: white;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }
    
    .caresync-chat-button:hover {
      transform: scale(1.1);
    }
    
    .caresync-chat-frame {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 100%;
      height: 600px;
      border: none;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      background: white;
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateY(20px);
      pointer-events: none;
    }
    
    .caresync-chat-frame.open {
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    }
  `;
  document.head.appendChild(style);

  // Create chat widget
  function createChatWidget(config) {
    const container = document.createElement('div');
    container.className = 'caresync-chat-container';
    
    // Create chat button
    const button = document.createElement('button');
    button.className = 'caresync-chat-button';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    // Create chat iframe
    const iframe = document.createElement('iframe');
    iframe.className = 'caresync-chat-frame';
    iframe.src = `${CARESYNC_URL}/embed/chat?clinic=${config.clinicId}&branch=${config.branchId}`;
    
    // Add click handler to toggle chat
    let isOpen = false;
    button.addEventListener('click', () => {
      isOpen = !isOpen;
      iframe.classList.toggle('open', isOpen);
      button.innerHTML = isOpen
        ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    });

    // Handle messages from iframe
    window.addEventListener('message', (event) => {
      if (event.origin !== CARESYNC_URL) return;
      
      const { type, data } = event.data;
      switch (type) {
        case 'CHAT_MESSAGE_SENT':
          if (config.onMessage) config.onMessage(data);
          break;
        case 'CHAT_STARTED':
          if (config.onStart) config.onStart(data);
          break;
        case 'CHAT_ENDED':
          if (config.onEnd) config.onEnd(data);
          break;
      }
    });
    
    container.appendChild(iframe);
    container.appendChild(button);
    document.body.appendChild(container);
  }

  // Initialize chat widgets when DOM is ready
  function init() {
    const widgets = document.querySelectorAll('[data-caresync-chat]');
    widgets.forEach(widget => {
      const config = {
        clinicId: widget.dataset.clinicId,
        branchId: widget.dataset.branchId,
        onMessage: window[widget.dataset.onMessage],
        onStart: window[widget.dataset.onStart],
        onEnd: window[widget.dataset.onEnd]
      };
      createChatWidget(config);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(); 