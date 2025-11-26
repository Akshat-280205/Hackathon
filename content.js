// Content script - runs on Zoom pages
console.log('MeetMind extension loaded on Zoom page');

// State
let isRecording = false;
let recognition = null;
let transcript = [];
let startTime = null;

// Initialize speech recognition
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = handleSpeechResult;
        recognition.onerror = handleSpeechError;
        recognition.onend = handleSpeechEnd;

        console.log('Speech recognition initialized');
    } else {
        console.warn('Speech recognition not supported');
    }
}

function handleSpeechResult(event) {
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptText = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
            finalTranscript += transcriptText + ' ';
        }
    }

    if (finalTranscript) {
        addTranscriptItem(finalTranscript.trim());
        updateStats();
    }
}

function handleSpeechError(event) {
    console.error('Speech recognition error:', event.error);
    if (event.error !== 'no-speech') {
        showNotification('Speech recognition error: ' + event.error, 'error');
    }
}

function handleSpeechEnd() {
    if (isRecording) {
        // Restart recognition if still recording
        try {
            recognition.start();
        } catch (e) {
            console.log('Recognition already started');
        }
    }
}

function addTranscriptItem(text) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);

    const item = {
        text,
        timestamp: new Date().toISOString(),
        elapsed
    };

    transcript.push(item);

    // Save to storage
    chrome.storage.local.get(['fullTranscript'], (result) => {
        const fullTranscript = result.fullTranscript || [];
        fullTranscript.push(item);
        chrome.storage.local.set({ fullTranscript });
    });

    console.log('Transcript item added:', text);
}

function updateStats() {
    const wordCount = transcript.reduce((count, item) => {
        return count + item.text.split(' ').length;
    }, 0);

    // Send stats to popup
    chrome.runtime.sendMessage({
        action: 'updateStats',
        stats: {
            wordCount,
            actionCount: 0, // Will be updated after AI analysis
            decisionCount: 0
        }
    });
}

// Start recording
async function startRecording() {
    if (!recognition) {
        initSpeechRecognition();
    }

    if (!recognition) {
        showNotification('Speech recognition not supported in this browser', 'error');
        return;
    }

    isRecording = true;
    startTime = Date.now();
    transcript = [];

    try {
        recognition.start();
        showNotification('MeetMind recording started', 'success');
        addMeetMindIndicator();
    } catch (error) {
        console.error('Error starting recording:', error);
        showNotification('Failed to start recording', 'error');
        isRecording = false;
    }
}

// Stop recording
async function stopRecording() {
    isRecording = false;

    if (recognition) {
        recognition.stop();
    }

    showNotification('Recording stopped. Analyzing...', 'info');
    removeMeetMindIndicator();

    // Analyze transcript
    if (transcript.length > 0) {
        await analyzeTranscript();
    }
}

// Analyze transcript with AI
async function analyzeTranscript() {
    try {
        const result = await chrome.storage.local.get(['apiKey', 'apiProvider']);
        const apiKey = result.apiKey;
        const apiProvider = result.apiProvider || 'groq';

        if (!apiKey || apiKey === 'PASTE_YOUR_API_KEY_HERE') {
            showNotification('Please configure your API key first', 'warning');
            return;
        }

        const fullTranscript = transcript.map(item => item.text).join(' ');

        const prompt = `Analyze the following meeting transcript and extract:

1. Action Items: Tasks that need to be done, who should do them, and priority (high/medium/low)
2. Key Decisions: Important decisions made during the meeting
3. Main Topics: Key topics discussed

Transcript:
${fullTranscript}

Please respond in JSON format:
{
    "actions": [{"task": "...", "assignee": "...", "priority": "high/medium/low"}],
    "decisions": [{"decision": "...", "context": "..."}],
    "topics": [{"topic": "...", "summary": "..."}]
}`;

        const insights = await callAI(prompt, apiKey, apiProvider);

        if (insights) {
            // Save insights
            await chrome.storage.local.set({ insights });

            // Update stats
            chrome.runtime.sendMessage({
                action: 'updateStats',
                stats: {
                    wordCount: fullTranscript.split(' ').length,
                    actionCount: insights.actions?.length || 0,
                    decisionCount: insights.decisions?.length || 0
                }
            });

            showNotification('Analysis complete! Click "Open Dashboard" to view insights.', 'success');
        }

    } catch (error) {
        console.error('Analysis error:', error);
        showNotification('Analysis failed: ' + error.message, 'error');
    }
}

// Call AI API
async function callAI(prompt, apiKey, provider) {
    if (provider === 'groq') {
        return await callGroq(prompt, apiKey);
    }
    // Add other providers as needed
}

async function callGroq(prompt, apiKey) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'You are a meeting analysis assistant. Always respond with valid JSON only, no markdown formatting.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 2000,
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Groq API error ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    return JSON.parse(content);
}

// UI helpers
function addMeetMindIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'meetmind-indicator';
    indicator.innerHTML = `
        <style>
            #meetmind-indicator {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #f093fb 100%);
                color: white;
                padding: 12px 20px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.5);
                z-index: 10000;
                font-family: 'Inter', sans-serif;
                font-size: 14px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 10px;
                animation: slideIn 0.3s ease;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            #meetmind-indicator .pulse {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: white;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
            }
        </style>
        <div class="pulse"></div>
        <span>MeetMind Recording...</span>
    `;
    document.body.appendChild(indicator);
}

function removeMeetMindIndicator() {
    const indicator = document.getElementById('meetmind-indicator');
    if (indicator) {
        indicator.remove();
    }
}

function showNotification(message, type = 'info') {
    const colors = {
        success: '#4ade80',
        error: '#f87171',
        warning: '#fbbf24',
        info: '#667eea'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10001;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startRecording') {
        startRecording();
        sendResponse({ success: true });
    } else if (message.action === 'stopRecording') {
        stopRecording();
        sendResponse({ success: true });
    }
    return true;
});

// Initialize on load
initSpeechRecognition();
