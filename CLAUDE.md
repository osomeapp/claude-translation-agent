# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a simple web application that demonstrates Claude AI agent integration for text translation. It consists of a Node.js/Express backend that interfaces with Claude's API and a vanilla HTML/CSS/JavaScript frontend.

## Architecture

**Backend (server.js)**:
- Express server with CORS enabled
- Single API endpoint `/api/translate` that accepts POST requests with text
- Uses Anthropic SDK to call Claude API for translation to Chinese
- Serves static files from root directory
- Requires `ANTHROPIC_API_KEY` environment variable

**Frontend (index.html + script.js)**:
- Simple form interface with textarea for input text
- JavaScript handles form submission and API calls
- Displays translated results with preserved formatting using `<pre>` element
- CSS styling for clean, responsive interface

**Key Files**:
- `server.js` - Express backend with Claude API integration
- `index.html` - Main web interface
- `script.js` - Frontend JavaScript for form handling
- `.env` - Environment variables (API key)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (with auto-restart)
npm run dev

# Start production server
npm start
```

## Environment Setup

1. Copy environment template:
```bash
cp .env.example .env
```

2. Add your Anthropic API key to `.env`:
```
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

## Application Flow

1. User enters text in textarea
2. Frontend sends POST request to `/api/translate`
3. Backend uses Claude API to translate text to Chinese
4. Translation preserves original formatting (line breaks, paragraphs)
5. Result displayed in formatted container

Server runs on `http://localhost:3000` by default.