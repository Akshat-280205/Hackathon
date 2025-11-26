// Dashboard logic
const elements = {
    emptyState: document.getElementById('emptyState'),
    dashboard: document.getElementById('dashboard'),
    statDuration: document.getElementById('statDuration'),
    statWords: document.getElementById('statWords'),
    statActions: document.getElementById('statActions'),
    statDecisions: document.getElementById('statDecisions'),
    actionsList: document.getElementById('actionsList'),
    decisionsList: document.getElementById('decisionsList'),
    topicsList: document.getElementById('topicsList'),
    transcriptList: document.getElementById('transcriptList')
};

// Load data
loadDashboardData();

async function loadDashboardData() {
    const result = await chrome.storage.local.get(['fullTranscript', 'insights', 'startTime']);

    if (!result.fullTranscript || result.fullTranscript.length === 0) {
        elements.emptyState.style.display = 'block';
        elements.dashboard.style.display = 'none';
        return;
    }

    elements.emptyState.style.display = 'none';
    elements.dashboard.style.display = 'block';

    // Display transcript
    displayTranscript(result.fullTranscript);

    // Display insights if available
    if (result.insights) {
        displayInsights(result.insights);
    }

    // Calculate and display stats
    const wordCount = result.fullTranscript.reduce((count, item) => {
        return count + item.text.split(' ').length;
    }, 0);

    const duration = result.startTime
        ? Math.floor((Date.now() - result.startTime) / 1000 / 60)
        : Math.floor((result.fullTranscript[result.fullTranscript.length - 1].elapsed) / 60);

    elements.statDuration.textContent = `${duration} min`;
    elements.statWords.textContent = wordCount;

    if (result.insights) {
        elements.statActions.textContent = result.insights.actions?.length || 0;
        elements.statDecisions.textContent = result.insights.decisions?.length || 0;
    }
}

function displayTranscript(transcript) {
    elements.transcriptList.innerHTML = transcript.map(item => `
        <div class="transcript-item">
            <div class="transcript-time">${formatTime(item.elapsed)}</div>
            <div class="transcript-text">${item.text}</div>
        </div>
    `).join('');
}

function displayInsights(insights) {
    // Display Action Items
    if (insights.actions && insights.actions.length > 0) {
        elements.actionsList.innerHTML = insights.actions.map(action => `
            <div class="insight-item action">
                <div class="insight-header">
                    <div class="insight-title">${action.task}</div>
                    <span class="insight-badge ${action.priority}">${action.priority}</span>
                </div>
                <div class="insight-meta">Assignee: ${action.assignee || 'Unassigned'}</div>
            </div>
        `).join('');
    } else {
        elements.actionsList.innerHTML = '<p style="color: #6b6b7e; text-align: center;">No action items found</p>';
    }

    // Display Decisions
    if (insights.decisions && insights.decisions.length > 0) {
        elements.decisionsList.innerHTML = insights.decisions.map(decision => `
            <div class="insight-item decision">
                <div class="insight-title">${decision.decision}</div>
                ${decision.context ? `<div class="insight-meta">${decision.context}</div>` : ''}
            </div>
        `).join('');
    } else {
        elements.decisionsList.innerHTML = '<p style="color: #6b6b7e; text-align: center;">No decisions found</p>';
    }

    // Display Topics
    if (insights.topics && insights.topics.length > 0) {
        elements.topicsList.innerHTML = insights.topics.map(topic => `
            <div class="insight-item topic">
                <div class="insight-title">${topic.topic}</div>
                ${topic.summary ? `<div class="insight-meta">${topic.summary}</div>` : ''}
            </div>
        `).join('');
    } else {
        elements.topicsList.innerHTML = '<p style="color: #6b6b7e; text-align: center;">No topics found</p>';
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Listen for updates
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        loadDashboardData();
    }
});
