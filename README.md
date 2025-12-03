# Speechero - Hybrid Voice Assistant

A hybrid voice assistant that combines local LLM processing with cloud-based Gemini AI for intelligent, real-time voice interactions.

## Features

- Voice-to-text transcription using Web Speech API
- Local LLM processing for privacy-sensitive operations
- Cloud-based Gemini AI integration for advanced queries
- Real-time fact extraction and display
- Multi-agent orchestration for intelligent responses
- Persistent conversation history

## Setup

### Prerequisites

- Node.js (v16 or higher)
- A Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/groverkunal/speechero-hybrid-voice-assistant.git
cd speechero-hybrid-voice-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Configure your API key:

   **Option 1: Environment Variable (Recommended)**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

   **Option 2: In-App Configuration**

   You can also enter your API key directly in the application interface when prompted.

   **Get your API key:** Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to obtain a Gemini API key.

### Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Security Note

- **Never commit your `.env` file** to version control
- **Never hardcode API keys** in your source code
- The `.env` file is already included in `.gitignore`

## Project Structure

- `src/components/` - React components
  - `VoiceAssistant.jsx` - Main voice interaction component
  - `AmbientMode.jsx` - Ambient listening mode with fact extraction
  - `FactCard.jsx` - Display component for extracted facts
- `src/services/` - Service layer
  - `stt.js` - Speech-to-text service
  - `local-llm.js` - Local LLM integration
  - `cloud-llm.js` - Google Gemini integration
  - `multi-agent.js` - Agent orchestration

## Technologies Used

- React + Vite
- Framer Motion for animations
- Lucide React for icons
- Google Generative AI (Gemini)
- Web Speech API
