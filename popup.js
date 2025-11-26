// Extension popup logic
let isRecording = false;
let startTime = null;
let timerInterval = null;

// DOM elements
const elements = {
    recordBtn: document.getElementById('recordBtn'),
    openDashboard: document.getElementById('openDashboard'),
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    duration: document.getElementById('duration'),
    wordCount: document.getElementById('wordCount'),
    actionCount: document.getElementById('actionCount'),
    decisionCount: document.getElementById('decisionCount'),
    apiWarning: document.getElementById('apiWarning'),
    configureLink: document.getElementById('configureLink'),
    settingsLink: document.getElementById('settingsLink')
};

// Initialize
init();

function init() {
    checkApiKey();
    loadState();
    attachEventListeners();
}

async function checkApiKey() {
    const result = await chrome.storage.local.get(['apiKey']);
    if (!result.apiKey || result.apiKey === 'PASTE_YOUR_API_KEY_HERE') {
        elements.apiWarning.classList.remove('hidden');
    } else {
        elements.apiWarning.classList.add('hidden');
    }
}

async function loadState() {
    const result = await chrome.storage.local.get(['isRecording', 'startTime', 'stats']);

    if (result.isRecording) {
        isRecording = true;
        startTime = result.startTime;
        updateUIRecording();
        startTimer();
    }

    if (result.stats) {
        updateStats(result.stats);
    }
}

function attachEventListeners() {
    elements.recordBtn.addEventListener('click', toggleRecording);
    elements.openDashboard.addEventListener('click', openDashboard);
    elements.configureLink.addEventListener('click', openSettings);
    elements.settingsLink.addEventListener('click', openSettings);
}

async function toggleRecording() {
    if (isRecording) {
        await stopRecording();
    } else {
        await startRecording();
    }
}

async function startRecording() {
    try {
        // Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Check if we're on a Zoom page
        if (!tab.url.includes('zoom.us')) {
            alert('Please navigate to a Zoom meeting first!');
            return;
        }

        // Send message to content script to start recording
        await chrome.tabs.sendMessage(tab.id, { action: 'startRecording' });

        isRecording = true;
        startTime = Date.now();

        // Save state
        await chrome.storage.local.set({
            isRecording: true,
            startTime: startTime
        });

        updateUIRecording();
        startTimer();

    } catch (error) {
        console.error('Error starting recording:', error);
        alert('Failed to start recording. Make sure you\'re in a Zoom meeting.');
    }
}

async function stopRecording() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Send message to content script to stop recording
        await chrome.tabs.sendMessage(tab.id, { action: 'stopRecording' });

        isRecording = false;
        startTime = null;

        // Save state
        await chrome.storage.local.set({
            isRecording: false,
            startTime: null
        });

        updateUIReady();
        stopTimer();

    } catch (error) {
        console.error('Error stopping recording:', error);
    }
}

function updateUIRecording() {
    elements.recordBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="6" y="6" width="12" height="12"></rect>
        </svg>
        Stop Recording
    `;
    elements.recordBtn.classList.add('recording');
    elements.statusDot.classList.add('active');
    elements.statusText.textContent = 'Recording in progress...';
}

function updateUIReady() {
    elements.recordBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
        </svg>
        Start Recording
    `;
    elements.recordBtn.classList.remove('recording');
    elements.statusDot.classList.remove('active');
    elements.statusText.textContent = 'Ready to record';
}

function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        elements.duration.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateStats(stats) {
    if (stats.wordCount !== undefined) {
        elements.wordCount.textContent = stats.wordCount;
    }
    if (stats.actionCount !== undefined) {
        elements.actionCount.textContent = stats.actionCount;
    }
    if (stats.decisionCount !== undefined) {
        elements.decisionCount.textContent = stats.decisionCount;
    }
}

async function openDashboard() {
    // Open the MeetMind dashboard
    const dashboardUrl = chrome.runtime.getURL('dashboard.html');
    await chrome.tabs.create({ url: dashboardUrl });
}

function openSettings() {
    const settingsUrl = chrome.runtime.getURL('settings.html');
    chrome.tabs.create({ url: settingsUrl });
}

// Listen for updates from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateStats') {
        updateStats(message.stats);
        chrome.storage.local.set({ stats: message.stats });
    }
});
