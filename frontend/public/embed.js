// CareSync Intake Form Embed Script
(function() {
  // Configuration
  const CARESYNC_URL = process.env.REACT_APP_PUBLIC_URL || 'https://app.caresync.com';
  
  // Create and inject styles
  const style = document.createElement('style');
  style.textContent = `
    .caresync-iframe {
      width: 100%;
      min-height: 800px;
      border: none;
      border-radius: 8px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }
    
    .caresync-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 1rem;
    }
  `;
  document.head.appendChild(style);

  // Create container and iframe
  function createForm(targetElement, config) {
    const container = document.createElement('div');
    container.className = 'caresync-container';
    
    const iframe = document.createElement('iframe');
    iframe.className = 'caresync-iframe';
    iframe.src = `${CARESYNC_URL}/embed/intake-form?clinic=${config.clinicId}&branch=${config.branchId}`;
    
    container.appendChild(iframe);
    targetElement.appendChild(container);

    // Handle messages from iframe
    window.addEventListener('message', (event) => {
      if (event.origin !== CARESYNC_URL) return;
      
      const { type, data } = event.data;
      switch (type) {
        case 'FORM_SUBMITTED':
          if (config.onSuccess) config.onSuccess(data);
          break;
        case 'FORM_ERROR':
          if (config.onError) config.onError(data);
          break;
        case 'RESIZE_FRAME':
          iframe.style.height = `${data.height}px`;
          break;
      }
    });
  }

  // Initialize forms when DOM is ready
  function init() {
    const forms = document.querySelectorAll('[data-caresync-form]');
    forms.forEach(form => {
      const config = {
        clinicId: form.dataset.clinicId,
        branchId: form.dataset.branchId,
        onSuccess: window[form.dataset.onSuccess],
        onError: window[form.dataset.onError]
      };
      createForm(form, config);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(); 