# Code Sync - Frontend

A powerful tool for sharing code snippets between multiple computers using localStorage for persistence. Perfect for developers working across different devices or collaborating in real-time during AI-assisted development.

![Code Sync Application](https://github.com/user-attachments/assets/6228cd36-b38a-4ca9-b6f9-252d0f7e7c03)

## Features

### 🔄 Real-time Synchronization
- **localStorage-based sync** across browser tabs and windows
- **No database required** - pure client-side persistence
- **Cross-device sharing** with automatic device detection
- **Storage events** for instant updates across sessions

### 💻 Professional Code Editor
- **Monaco Editor** integration (VS Code editor)
- **Syntax highlighting** for 15+ programming languages
- **Auto-save functionality** with configurable debounce
- **Language switching** on-the-fly

### 🎨 Developer-Focused UI
- **Dark theme** inspired by VS Code
- **Responsive design** for desktop and mobile
- **Device status indicators** with online/offline detection
- **Snippet management** with timestamps and metadata

### 📦 Import/Export
- **JSON export** for backup and sharing
- **Import functionality** to restore data
- **Version control** compatible data format

## Supported Languages

JavaScript, TypeScript, Python, Java, C#, C++, HTML, CSS, JSON, XML, Markdown, SQL, PHP, Go, Rust

## Quick Start

### Development
```bash
npm install
npm start
```

The application will be available at `http://localhost:4200`

### Build for Production
```bash
npm run build:prod
```

### Vercel Deployment
The project is configured for Vercel deployment with:
- Static build output in `dist/` folder
- No serverless functions required
- Client-side only operation

## How It Works

1. **Device Identification**: Each browser gets a unique device ID
2. **localStorage Persistence**: All data stored locally in browser
3. **Storage Events**: Cross-tab synchronization via localStorage events
4. **Heartbeat System**: Device tracking with 30-second timeout
5. **Conflict Resolution**: Timestamp-based conflict resolution

## Usage

### Creating Snippets
1. Enter a title for your snippet
2. Select the programming language
3. Click "Create"
4. Start coding in the Monaco editor

### Cross-Device Sync
1. Open the application on multiple devices/tabs
2. Create or edit snippets on any device
3. Changes automatically sync across all active sessions
4. View active devices in the sidebar

### Backup & Restore
- **Export**: Click "Export" to download JSON backup
- **Import**: Click "Import" to restore from backup file

## Technical Architecture

### Frontend Stack
- **Angular 17+** with TypeScript
- **Monaco Editor** for code editing
- **localStorage API** for persistence
- **Storage Events** for real-time sync
- **RxJS** for reactive data management

### Key Services
- **StorageService**: Handles localStorage operations and sync
- **SyncService**: Manages device status and sync coordination
- **MonacoEditorComponent**: Monaco editor integration

### Browser Compatibility
- Modern browsers with localStorage support
- Chrome, Firefox, Safari, Edge
- Mobile browsers supported

## Configuration

The application is configured for:
- **Maximum 50 snippets** per device (configurable)
- **Auto-save delay**: 1 second (configurable)
- **Device timeout**: 30 seconds (configurable)
- **Heartbeat interval**: 5 seconds (configurable)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for any purpose.

---

**Perfect for**: AI development, code sharing, cross-device development, real-time collaboration, code snippets management