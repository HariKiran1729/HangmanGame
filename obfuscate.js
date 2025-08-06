// Simple obfuscation helper functions
const obf = {
    // Encode strings to make them less obvious
    encode: (str) => btoa(str).split('').reverse().join(''),
    decode: (str) => atob(str.split('').reverse().join('')),
    
    // Hide API endpoint
    getApiUrl: () => './words-api.html',
    
    // Hide sensitive strings
    getSessionKey: () => obf.decode('ZXJ1Y2VzX25hbWduYWg='), // 'hangman_secure' encoded
    
    // Scramble variable names in console
    hideConsole: () => {
        if (typeof console !== 'undefined') {
            const originalLog = console.log;
            console.log = (...args) => {
                // Only show logs in development
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    originalLog.apply(console, args);
                }
            };
        }
    },
    
    // Disable right-click and inspect shortcuts
    disableInspect: () => {
        // Disable right-click
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
        
        // Disable F12, Ctrl+Shift+I, Ctrl+U
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
                return false;
            }
        });
        
        // Disable text selection on game elements
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.mozUserSelect = 'none';
        document.body.style.msUserSelect = 'none';
    },
    
    // Detect if DevTools is open
    detectDevTools: () => {
        setInterval(() => {
            const devtools = {
                open: false,
                orientation: null
            };
            
            const threshold = 160;
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                devtools.open = true;
                devtools.orientation = 'vertical';
            }
            
            if (devtools.open) {
                document.body.innerHTML = `
                    <div style="
                        position: fixed; 
                        top: 0; 
                        left: 0; 
                        width: 100%; 
                        height: 100%; 
                        background: #000; 
                        color: #fff; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        z-index: 99999;
                        font-family: Arial, sans-serif;
                    ">
                        <div style="text-align: center;">
                            <h1>🚫 Developer Tools Detected</h1>
                            <p>Please close developer tools to continue playing.</p>
                            <p>Refresh the page to restart.</p>
                        </div>
                    </div>
                `;
            }
        }, 500);
    },
    
    // Initialize all protection
    init: () => {
        obf.hideConsole();
        obf.disableInspect();
        obf.detectDevTools();
        
        // Clear any existing console content
        if (console.clear) console.clear();
        
        // Override console methods
        ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
            if (console[method]) {
                console[method] = () => {};
            }
        });
    }
};

// Auto-initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', obf.init);
} else {
    obf.init();
}

// Export for use in main script
window.obf = obf; 