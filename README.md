# Code Sync - Real-time Code Sharing Tool

A modern, real-time code synchronization tool that allows multiple developers to share and edit code simultaneously across different computers. Perfect for pair programming, code reviews, and collaborative development in the AI era.

## 🚀 Features

- **Real-time Synchronization**: Share code instantly between multiple devices
- **Local Persistence**: Uses localStorage for offline functionality and data persistence
- **Monaco Editor**: Full-featured code editor with syntax highlighting for multiple languages
- **Session Management**: Create and join coding sessions with unique session IDs
- **Multi-language Support**: JavaScript, TypeScript, Python, Java, HTML, CSS, JSON, Markdown
- **Serverless Architecture**: Built for Vercel with serverless functions
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **No Database Required**: Lightweight solution using in-memory storage and localStorage

## 🛠️ Technology Stack

### Frontend
- **Angular 18+**: Modern web framework
- **Monaco Editor**: VS Code editor in the browser
- **TypeScript**: Type-safe development
- **RxJS**: Reactive programming for real-time updates

### Backend
- **Express.js**: Serverless functions for API endpoints
- **Vercel**: Serverless deployment platform
- **CORS**: Cross-origin resource sharing support

## 📋 Prerequisites

- Node.js 18+ and npm
- Modern web browser with localStorage support

## 🚀 Getting Started

### Local Development

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Sync_code_FrontEnd
   ```

2. **Install dependencies**:
   ```bash
   # Install root dependencies for API
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   ```

3. **Start development servers**:
   ```bash
   # Start Angular development server
   cd frontend
   npm start
   
   # The application will be available at http://localhost:4200
   ```

### Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

## 📖 Usage

### Creating a New Session

1. Open the application in your browser
2. Click **"New Session"** to create a new coding session
3. Share the generated session ID with other participants
4. Start coding! Changes will be synchronized in real-time

### Joining an Existing Session

1. Get the session ID from the session creator
2. Enter the session ID in the input field
3. Click **"Join"** to join the session
4. You'll see the current code and can start collaborating

### Features Guide

- **Language Selection**: Change the programming language from the dropdown in the footer
- **Download Code**: Save your code locally using the "Download" button
- **Clear Code**: Remove all code content (affects all participants)
- **Real-time Sync**: Changes are automatically synchronized every 2 seconds
- **Offline Support**: Code is saved locally and will sync when connection is restored

## 🔧 Configuration

### Environment Variables

No environment variables required - the application uses relative API paths and localStorage for persistence.

### Vercel Configuration

The `vercel.json` file is configured to:
- Serve the Angular frontend from the `frontend/dist` folder
- Handle API routes under `/api/*`
- Support serverless functions

## 🏗️ Architecture

### Frontend Components

- **App Component**: Main application shell
- **Code Editor Component**: Monaco editor with sync functionality
- **Local Storage Service**: Handles data persistence
- **Sync Service**: Manages real-time synchronization with backend

### Backend API Endpoints

- `GET /api/sync?sessionId={id}`: Get current code for session
- `POST /api/sync?sessionId={id}`: Update code for session
- `PUT /api/sync?sessionId={id}`: Join session (increment participants)
- `GET /api/`: API health check and documentation

### Data Flow

1. **Local Changes**: User types in Monaco editor
2. **Local Storage**: Code is immediately saved to localStorage
3. **API Sync**: Changes are sent to serverless API every 2 seconds
4. **Real-time Updates**: Other clients poll for updates and receive changes
5. **Conflict Resolution**: Server timestamp determines the latest version

## 🎯 Use Cases

### AI-Assisted Development
- Share code snippets with AI tools for review and suggestions
- Collaborate on AI-generated code modifications
- Real-time pair programming with AI assistance

### Team Collaboration
- Remote pair programming sessions
- Code review and discussion
- Temporary code sharing without creating files
- Cross-platform development coordination

### Education
- Live coding demonstrations
- Student-teacher code sharing
- Workshop and tutorial sessions

## 🔒 Data Persistence

The application uses a dual-persistence approach:

1. **localStorage**: Client-side persistence for offline functionality
2. **Server Memory**: Temporary server-side storage for real-time sync
3. **No Database**: Lightweight architecture without database dependencies

## 🌐 Browser Support

- Modern browsers with ES6+ support
- localStorage API support
- WebSocket or polling capabilities

## 🛡️ Security Considerations

- Session IDs are randomly generated
- No user authentication required
- Code is temporarily stored in memory
- CORS enabled for cross-origin requests
- No sensitive data persistence

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available under the MIT License.

## 🚀 Future Enhancements

- [ ] WebSocket support for instant updates
- [ ] User presence indicators
- [ ] Code commenting and annotations
- [ ] Session expiration management
- [ ] Enhanced conflict resolution
- [ ] Multiple file support
- [ ] Integrated terminal
- [ ] Plugin system for extensions

---

**Built for the AI era** - Making code collaboration faster, simpler, and more accessible.