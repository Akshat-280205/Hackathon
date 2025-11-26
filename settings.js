// Settings page logic
const elements = {
    apiProvider: document.getElementById('apiProvider'),
    apiKey: document.getElementById('apiKey'),
    saveBtn: document.getElementById('saveBtn'),
    saveMessage: document.getElementById('saveMessage'),
    apiInstructions: document.getElementById('apiInstructions')
};

// Load saved settings
loadSettings();

// Event listeners
elements.saveBtn.addEventListener('click', saveSettings);
elements.apiProvider.addEventListener('change', updateApiInstructions);

async function loadSettings() {
    const result = await chrome.storage.local.get(['apiProvider', 'apiKey']);

    if (result.apiProvider) {
        elements.apiProvider.value = result.apiProvider;
    }

    if (result.apiKey && result.apiKey !== 'PASTE_YOUR_API_KEY_HERE') {
        elements.apiKey.value = result.apiKey;
    }

    updateApiInstructions();
}

async function saveSettings() {
    const apiProvider = elements.apiProvider.value;
    const apiKey = elements.apiKey.value;

    if (!apiKey || apiKey.trim() === '') {
        showMessage('Please enter an API key', 'error');
        return;
    }

    await chrome.storage.local.set({
        apiProvider,
        apiKey
    });

    showMessage('Settings saved successfully!', 'success');
}

function updateApiInstructions() {
    const provider = elements.apiProvider.value;

    const guides = {
        groq: `
            <li>Visit <a href="https://console.groq.com" target="_blank">console.groq.com</a></li>
            <li>Sign up for a free account</li>
            <li>Navigate to API Keys section</li>
            <li>Create a new API key and copy it</li>
        `,
        gemini: `
            <li>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a></li>
            <li>Sign in with your Google account</li>
            <li>Click "Get API Key"</li>
            <li>Copy your API key</li>
        `,
        openai: `
            <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a></li>
            <li>Sign in or create an account</li>
            <li>Navigate to API Keys</li>
            <li>Create new secret key and copy it</li>
        `
    };

    elements.apiInstructions.innerHTML = guides[provider];
}

function showMessage(message, type) {
    elements.saveMessage.textContent = message;
    elements.saveMessage.className = `save-message ${type}`;
    elements.saveMessage.style.display = 'block';

    setTimeout(() => {
        elements.saveMessage.style.display = 'none';
    }, 3000);
}
