/**
 * Monterossa KI-Chat Embed Script
 * Universal embeddable chat widget for any website
 * 
 * Usage: <script src="https://your-domain.com/embed.js" data-position="bottom-right"></script>
 * 
 * Configuration Options (data attributes):
 * - data-position: "bottom-right" | "bottom-left" (default: "bottom-right")
 * - data-primary-color: Hex color (default: "#22d3bb")
 * - data-welcome-message: Custom welcome message
 * - data-base-url: Override base URL for API
 */
(function() {
  'use strict';

  // Get script element and configuration
  const scripts = document.querySelectorAll('script[src*="embed.js"]');
  const script = scripts[scripts.length - 1];
  
  const config = {
    position: script?.dataset?.position || 'bottom-right',
    primaryColor: script?.dataset?.primaryColor || '#22d3bb',
    accentColor: script?.dataset?.accentColor || '#f97316',
    welcomeMessage: script?.dataset?.welcomeMessage || '',
    baseUrl: script?.dataset?.baseUrl || (function() {
      try {
        return new URL(script?.src || window.location.href).origin;
      } catch {
        return window.location.origin;
      }
    })()
  };

  // Position mapping
  const positionStyles = {
    'bottom-right': { bottom: '24px', right: '24px', left: 'auto' },
    'bottom-left': { bottom: '24px', left: '24px', right: 'auto' }
  };
  const pos = positionStyles[config.position] || positionStyles['bottom-right'];

  // Check if already initialized
  if (document.getElementById('monterossa-chat-container')) {
    console.warn('Monterossa Chat: Already initialized');
    return;
  }

  // Inject styles
  const styles = document.createElement('style');
  styles.id = 'monterossa-chat-styles';
  styles.textContent = `
    @keyframes monterossa-pulse {
      0% { box-shadow: 0 0 0 0 rgba(34, 211, 187, 0.4); }
      70% { box-shadow: 0 0 0 15px rgba(34, 211, 187, 0); }
      100% { box-shadow: 0 0 0 0 rgba(34, 211, 187, 0); }
    }
    @keyframes monterossa-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    @keyframes monterossa-fade-in {
      from { opacity: 0; transform: translateY(10px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes monterossa-fade-out {
      from { opacity: 1; transform: translateY(0) scale(1); }
      to { opacity: 0; transform: translateY(10px) scale(0.95); }
    }
    #monterossa-chat-button {
      animation: monterossa-pulse 2s ease-in-out infinite;
    }
    #monterossa-chat-button:hover {
      animation: none;
      transform: scale(1.1) !important;
      box-shadow: 0 15px 40px rgba(34, 211, 187, 0.4) !important;
    }
    #monterossa-chat-iframe.open {
      animation: monterossa-fade-in 0.3s ease forwards;
    }
    #monterossa-chat-iframe.close {
      animation: monterossa-fade-out 0.3s ease forwards;
    }
    #monterossa-chat-badge {
      animation: monterossa-bounce 2s ease-in-out infinite;
    }
  `;
  document.head.appendChild(styles);

  // Create container
  const container = document.createElement('div');
  container.id = 'monterossa-chat-container';
  
  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'monterossa-chat-iframe';
  iframe.src = `${config.baseUrl}/embed/chat`;
  iframe.setAttribute('allow', 'microphone; clipboard-write');
  iframe.style.cssText = `
    position: fixed;
    bottom: 96px;
    ${pos.right ? 'right: ' + pos.right + ';' : ''}
    ${pos.left ? 'left: ' + pos.left + ';' : ''}
    width: 400px;
    height: 600px;
    max-width: calc(100vw - 48px);
    max-height: calc(100vh - 140px);
    border: none;
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    z-index: 999998;
    display: none;
    background: transparent;
  `;

  // Create button
  const button = document.createElement('button');
  button.id = 'monterossa-chat-button';
  button.setAttribute('aria-label', 'Chat öffnen');
  button.style.cssText = `
    position: fixed;
    ${Object.entries(pos).map(([k, v]) => `${k}: ${v}`).join('; ')};
    width: 64px;
    height: 64px;
    border-radius: 20px;
    border: none;
    background: linear-gradient(135deg, ${config.primaryColor}, #1aa395);
    cursor: pointer;
    z-index: 999999;
    box-shadow: 0 10px 30px rgba(34, 211, 187, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
    padding: 0;
  `;
  button.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;

  // Chat icon SVG
  const chatIcon = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
  const closeIcon = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

  // State
  let isOpen = false;

  // Toggle function
  function toggleChat() {
    isOpen = !isOpen;
    
    if (isOpen) {
      iframe.style.display = 'block';
      iframe.classList.remove('close');
      iframe.classList.add('open');
      button.innerHTML = closeIcon;
      button.setAttribute('aria-label', 'Chat schließen');
      
      // Remove badge
      const badge = document.getElementById('monterossa-chat-badge');
      if (badge) badge.remove();
      
      // Mark as seen
      try {
        sessionStorage.setItem('monterossa-chat-seen', 'true');
      } catch (e) {}
    } else {
      iframe.classList.remove('open');
      iframe.classList.add('close');
      button.innerHTML = chatIcon;
      button.setAttribute('aria-label', 'Chat öffnen');
      
      setTimeout(() => {
        if (!isOpen) {
          iframe.style.display = 'none';
        }
      }, 300);
    }
  }

  // Event listeners
  button.addEventListener('click', toggleChat);

  // Listen for messages from iframe
  window.addEventListener('message', function(event) {
    // Security: Check origin
    if (!event.origin.startsWith(config.baseUrl) && event.origin !== window.location.origin) {
      return;
    }
    
    if (event.data === 'monterossa-chat-close' && isOpen) {
      toggleChat();
    }
  });

  // Escape key to close
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isOpen) {
      toggleChat();
    }
  });

  // Append elements
  container.appendChild(iframe);
  container.appendChild(button);
  document.body.appendChild(container);

  // Show notification badge if not seen
  try {
    if (!sessionStorage.getItem('monterossa-chat-seen')) {
      setTimeout(function() {
        const badge = document.createElement('div');
        badge.id = 'monterossa-chat-badge';
        badge.style.cssText = `
          position: fixed;
          ${pos.right ? 'right: 16px;' : ''}
          ${pos.left ? 'left: 16px;' : ''}
          bottom: 96px;
          background: linear-gradient(135deg, ${config.primaryColor}, #1aa395);
          color: white;
          padding: 10px 18px;
          border-radius: 24px;
          font-size: 14px;
          font-weight: 500;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          z-index: 999997;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
        `;
        badge.textContent = '💬 Chat starten';
        
        badge.addEventListener('click', function() {
          if (!isOpen) toggleChat();
        });
        
        document.body.appendChild(badge);
        
        // Auto-hide badge after 10 seconds
        setTimeout(function() {
          if (badge.parentNode) {
            badge.style.opacity = '0';
            badge.style.transition = 'opacity 0.3s ease';
            setTimeout(function() {
              if (badge.parentNode) badge.remove();
            }, 300);
          }
        }, 10000);
      }, 2000);
    }
  } catch (e) {}

  // Expose API
  window.MonterossaChat = {
    open: function() { if (!isOpen) toggleChat(); },
    close: function() { if (isOpen) toggleChat(); },
    toggle: toggleChat,
    isOpen: function() { return isOpen; }
  };

  console.log('Monterossa KI-Chat initialized');
})();
