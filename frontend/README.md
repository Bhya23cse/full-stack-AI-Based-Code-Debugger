# AI Code Debugger Frontend

A modern web application that provides an intuitive interface for AI-powered code analysis and debugging, powered by Google's Gemini AI model.

## Features

- **Modern UI/UX**
  - Beautiful galaxy animation background
  - Real-time code analysis
  - Syntax highlighting
  - Dark/Light mode support
  - Responsive design

- **Code Analysis Features**
  - Real-time code analysis
  - Syntax error detection
  - Performance suggestions
  - Security vulnerability scanning
  - Code style recommendations

- **Editor Features**
  - Monaco Editor integration
  - Multiple language support
  - Auto-completion
  - Error highlighting
  - Code formatting

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Editor**: Monaco Editor
- **3D Animation**: Three.js
- **State Management**: React Hooks
- **API Client**: Axios
- **UI Components**: Headless UI, Radix UI

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your backend URL:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

## Running the Application

Development:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_GA_ID`: Google Analytics ID (optional)

## Project Structure

```
frontend/
├── app/
│   ├── components/
│   ├── lib/
│   ├── styles/
│   └── page.tsx
├── public/
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details 