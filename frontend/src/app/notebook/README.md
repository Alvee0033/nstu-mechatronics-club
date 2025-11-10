# AI Research Assistant Notebook

An interactive notebook feature for NSTU Mechatronics Club members to conduct research, experiment with code, and get AI-powered assistance.

## Features

### 🧠 Core Functionality
- **Interactive Code Cells**: Write and execute Python code with real-time output
- **Markdown Cells**: Document your research with formatted text
- **AI Assistant**: Get help from Gemini AI specifically trained for mechatronics

### 📚 Document Processing
- **File Upload**: Support for PDFs, text files, and documents
- **Content Analysis**: AI-powered processing of uploaded materials
- **Source-Grounded Responses**: AI answers based on your documents

### 🎓 Learning Tools
- **Flashcards**: Automatically generate flashcards from your content
- **Quizzes**: Create custom quizzes with detailed explanations
- **Audio Overviews**: Text-to-speech podcast-style summaries
- **Mind Maps**: Visual connection diagrams of concepts

### 🎙️ Content Generation
- **Audio Summaries**: Listen to AI-generated podcast-style overviews
- **Voice Selection**: Multiple text-to-speech voices available
- **Interactive Learning**: Educational content tailored for mechatronics

### 🔗 Additional Features
- **Real-time Collaboration**: Work on research projects
- **Visual Mind Maps**: Interactive concept mapping
- **Code Execution**: Sandboxed Python code execution
- **Citation Support**: Link answers to source documents

## Setup

### 1. Gemini API Configuration

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add your API key to `frontend/.env.local`:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
```

The notebook uses the Gemini REST API directly for better control and no additional dependencies.

### 2. Restart Development Server

After adding the API key, restart your development server:

```bash
cd frontend
npm run dev
```

## Usage

### Code Cells
- Write Python code in code cells
- Click "Run" to execute the code
- View output and errors in real-time
- Basic Python syntax is supported (print, variables, math operations)

### Markdown Cells
- Write documentation and notes
- Use standard Markdown syntax
- Supports headers, lists, links, and code blocks

### AI Assistant
- Ask questions about mechatronics, coding, or research
- Get explanations, code examples, and project guidance
- Specialized knowledge for NSTU Mechatronics Club projects

### Document Upload
- Upload PDFs, text files, and documents for analysis
- AI processes content for Q&A and learning tools
- Supports drag-and-drop and file selection

### Flashcards
- Automatically generate flashcards from uploaded documents
- Interactive study mode with question/answer reveal
- Navigate through cards with previous/next controls

### Quiz System
- AI-generated quizzes based on your content
- Multiple choice questions with explanations
- Track your score and progress

### Audio Overviews
- Generate podcast-style audio summaries
- Multiple voice options for text-to-speech
- Play, pause, and control audio playback

### Mind Maps
- Visual representation of concepts and connections
- Interactive nodes that can be dragged and connected
- Automatically generated from document content

## Security

- Code execution is sandboxed and limited
- Dangerous operations (file access, system calls) are blocked
- All AI interactions are logged for safety

## Technical Details

- Built with Next.js 14 and TypeScript
- Uses Google Gemini 2.5 Flash REST API for AI responses
- Tailwind CSS for styling with Framer Motion animations
- Real-time code execution with security validation

## Contributing

This feature is designed for NSTU Mechatronics Club research activities. For improvements or bug reports, please contact the development team.