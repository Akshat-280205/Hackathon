// Background service worker
console.log('MeetMind background service worker loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('MeetMind extension installed');
        // Set default values
        chrome.storage.local.set({
            apiProvider: 'groq',
            apiKey: 'PASTE_YOUR_API_KEY_HERE'
        });

        // Open welcome/settings page
        chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message);

    // Handle different message types
    if (message.action === 'saveTranscript') {
        chrome.storage.local.set({ transcript: message.transcript }, () => {
            sendResponse({ success: true });
        });
        return true;
    }

    if (message.action === 'saveInsights') {
        chrome.storage.local.set({ insights: message.insights }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
});

// Keep service worker alive
chrome.runtime.onConnect.addListener((port) => {
    console.log('Port connected:', port.name);
});
