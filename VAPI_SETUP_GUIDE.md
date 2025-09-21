# VAPI Voice Integration Setup Guide

## 🎤 Voice Calling Now Integrated!

Your dashboard now includes full VAPI voice calling functionality! Here's how to complete the setup:

## 📋 Setup Steps

### 1. Get Your VAPI API Keys
1. Go to [VAPI Dashboard](https://dashboard.vapi.ai)
2. Sign up or log in to your account
3. Get both keys:
   - **Private API Key** (for server-side assistant creation)
   - **Public API Key** (for client-side voice calls)

### 2. Configure Environment Variables
Add these to your `.env.local` file:

```bash
# VAPI Configuration
VAPI_API_KEY=your_private_api_key_here
NEXT_PUBLIC_VAPI_API_KEY=your_public_api_key_here
```

### 3. Test the Integration
1. Start your development server: `npm run dev`
2. Go to Dashboard → Be Chosen section
3. Build your CRM (requires LinkedIn username in settings)
4. Click "Practice Call" on any contact
5. The voice widget will appear - click "Start Practice Call"

## 🚀 How It Works

### Voice Practice Flow:
1. **Create Assistant**: When you click "Practice Call", it creates a VAPI assistant tailored to that specific contact
2. **Voice Widget**: A voice interface appears with real-time conversation
3. **Live Transcript**: See the conversation in real-time
4. **Practice Scenarios**: The AI roleplays as your target contact

### Features Included:
- ✅ **Real-time voice conversations**
- ✅ **Live transcript display**
- ✅ **Contact-specific AI personas**
- ✅ **Professional voice synthesis**
- ✅ **Call management (start/end)**
- ✅ **Error handling and loading states**

## 🎯 Practice Scenarios

The AI assistant will roleplay as your LinkedIn contacts:
- **Realistic responses** based on their title and industry
- **Natural conversation flow** with appropriate skepticism
- **Constructive feedback** after calls
- **Industry-specific talking points**

## 🔧 Customization Options

### Voice Models
Currently using ElevenLabs voice `21m00Tcm4TlvDq8ikWAM`. You can change this in:
```typescript
// app/api/vapi/route.ts
voice: {
  provider: "11labs",
  voiceId: "your_preferred_voice_id"
}
```

### AI Model
Currently using GPT-4. You can modify the model in the same file:
```typescript
model: {
  provider: "openai",
  model: "gpt-4", // or "gpt-3.5-turbo" for faster responses
  temperature: 0.7
}
```

## 🐛 Troubleshooting

### Common Issues:

1. **"VAPI configuration missing"**
   - Check your API keys in `.env.local`
   - Ensure `NEXT_PUBLIC_VAPI_API_KEY` is set

2. **"Failed to start call"**
   - Check browser permissions for microphone
   - Ensure you're on HTTPS (required for microphone access)

3. **No voice heard**
   - Check your speakers/headphones
   - Verify the voice model ID is valid

4. **Assistant creation fails**
   - Check your private VAPI_API_KEY
   - Verify your VAPI account has sufficient credits

## 📱 Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

**Note**: Microphone access requires HTTPS in production.

## 🎉 Next Steps

1. **Add your VAPI API keys** to start voice calling
2. **Configure your LinkedIn username** in dashboard settings
3. **Build your CRM** to get practice contacts
4. **Start practicing** your cold calls with AI!

## 💡 Pro Tips

- Use headphones to prevent audio feedback
- Practice in a quiet environment
- The AI learns from your conversation style
- End calls properly to get feedback

---

**Ready to dominate your cold calls with AI-powered practice? Add your VAPI keys and start talking! 🎤**
