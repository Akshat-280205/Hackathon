# 🎯 MeetMind Browser Extension

AI-powered meeting transcription and analysis for Zoom web meetings.

## 🚀 Features

- ✅ **Real-time Transcription** - Automatic speech-to-text during Zoom meetings
- 🤖 **AI Analysis** - Extract action items, decisions, and topics
- 📊 **Beautiful Dashboard** - View insights in a polished interface
- 💾 **Local Storage** - All data stored locally for privacy
- 🎨 **Modern UI** - Glassmorphic design matching MeetMind brand

---

## 📦 Installation

### For Development/Testing:

1. **Open Edge (or Chrome)**
   - Navigate to: `edge://extensions/`
   - Enable "Developer mode" (toggle in top right)

2. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder: `d:\hackathon\meetmind-extension\`
   - Extension will appear in your extensions list!

3. **Pin the Extension** (Optional)
   - Click the puzzle icon in your browser toolbar
   - Find "MeetMind - AI Meeting Assistant"
   - Click the pin icon to keep it visible

---

## ⚙️ Setup

### 1. Configure API Key (First Time Only)

1. Click the MeetMind extension icon
2. Click "Settings"
3. Choose your AI provider (Groq recommended)
4. Get a free API key:
   - **Groq**: https://console.groq.com (Free & fast!)
   - **Gemini**: https://makersuite.google.com/app/apikey
5. Paste your API key and save

---

## 🎯 How to Use

### During a Zoom Meeting:

1. **Join a Zoom meeting** (web version: zoom.us)
2. **Click the MeetMind extension icon** in your toolbar
3. **Click "Start Recording"**
   - A notification appears: "MeetMind recording started"
   - A recording indicator shows in the top-right of Zoom
4. **Speak normally** during the meeting
5. **Click "Stop Recording"** when done
   - AI analyzes the transcript automatically
6. **Click "Open Dashboard"** to view insights!

---

## 📊 What You Get

After each meeting:
- ✅ **Action Items** with assignees and priorities
- 🎯 **Key Decisions** made during the meeting
- 📝 **Topics Discussed** with summaries
- 📜 **Full Transcript** with timestamps
- 📈 **Statistics** (duration, word count, etc.)

---

## 🏗️ Project Structure

```
meetmind-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup UI
├── popup.js               # Popup logic
├── content.js             # Runs on Zoom pages
├── content.css            # Zoom page styles
├── background.js          # Background service worker
├── dashboard.html         # Insights dashboard
├── dashboard.js           # Dashboard logic
├── settings.html          # Settings page
├── settings.js            # Settings logic
├── dashboard-styles.css   # Shared styles
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # This file
```

---

## 🔧 Technical Details

### Technologies Used:
- **Manifest V3** - Latest Chrome extension standard
- **Web Speech API** - Real-time transcription
- **Groq/Gemini API** - AI analysis
- **Chrome Storage API** - Local data persistence
- **Content Scripts** - Zoom page integration

### Permissions Required:
- `activeTab` - Access current tab
- `storage` - Save settings and data
- `scripting` - Inject content scripts
- `https://*.zoom.us/*` - Access Zoom pages

### Privacy:
- ✅ All data stored locally on your device
- ✅ API key never shared with our servers
- ✅ Transcript and insights stay private
- ✅ No third-party tracking

---

## 🎨 Features Comparison

| Feature | Standalone App | Browser Extension |
|---------|---------------|-------------------|
| Local Recording | ✅ | ✅ |
| Zoom Integration | ❌ | ✅ |
| Real-time Indicator | ❌ | ✅ |
| One-Click Access | ❌ | ✅ |
| Works Anywhere | ✅ | Zoom only |

---

## 🚀 Future Enhancements

- [ ] Google Meet support
- [ ] Microsoft Teams support
- [ ] Speaker diarization (identify who said what)
- [ ] Calendar integration
- [ ] Auto-email action items
- [ ] Export to PDF/Word
- [ ] Team collaboration features
- [ ] Chrome Web Store publication

---

## 🐛 Troubleshooting

### Extension not loading?
- Make sure Developer mode is enabled
- Try reloading the extension
- Check browser console for errors

### Recording not working?
- Ensure you're on a Zoom web page (zoom.us)
- Allow microphone permissions when prompted
- Check if Web Speech API is supported (Chrome/Edge)

### AI analysis failing?
- Verify your API key is configured correctly
- Check your internet connection
- Ensure you have API credits remaining

### No transcript appearing?
- Speak clearly and at normal volume
- Check microphone settings in browser
- Try restarting the recording

---

## 📝 License

Free to use for hackathons and learning!

---

## 🙋 Support

Created for hackathon demonstration.

For issues or questions, check the browser console:
- Press `F12` → Console tab
- Look for errors or warnings

---

## 🎉 Enjoy Your AI-Powered Meetings!

**Good luck with your hackathon! 🚀**
