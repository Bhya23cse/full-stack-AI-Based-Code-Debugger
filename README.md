# AI-Based Code Debugger

An advanced AI-powered code analysis and debugging tool that helps developers identify, analyze, and fix issues in their code across multiple programming languages.

## 🌟 Features

- **AI-Powered Code Analysis**: Leverages advanced AI models to analyze code and identify potential issues
- **Multi-Language Support**: Works with multiple programming languages
- **Interactive Debugging**: Real-time debugging suggestions and solutions
- **Beautiful UI**: Modern interface with animated galaxy background
- **Code Optimization**: Suggests performance improvements and best practices
- **Error Detection**: Identifies syntax errors, logical issues, and potential bugs
- **Security Analysis**: Detects security vulnerabilities and suggests fixes

## 🚀 Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Three.js (for galaxy animation)
- React Three Fiber
- Shadcn UI Components

### Backend
- Python
- FastAPI
- OpenAI API
- LangChain
- SQLAlchemy

## 📋 Prerequisites

- Node.js 18+ 
- Python 3.8+
- OpenAI API Key
- Git

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-code-debugger.git
cd ai-code-debugger
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend (.env)
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_database_url
```

## 🚀 Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn app:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Usage

1. Navigate to the application in your browser
2. Select your programming language
3. Paste your code in the editor
4. Click "Analyze" to start the debugging process
5. Review the AI-generated suggestions and fixes
6. Apply the suggested changes to your code

## 🔧 Configuration

### Frontend Configuration
- Edit `frontend/.env.local` to configure API endpoints
- Modify `frontend/tailwind.config.js` for styling customization
- Update `frontend/app/components/GalaxyBackground.tsx` for animation customization

### Backend Configuration
- Edit `backend/.env` for API keys and database configuration
- Modify `backend/app.py` for API endpoint customization
- Update `backend/requirements.txt` for dependency management

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the AI models
- Three.js community for the galaxy animation inspiration
- Next.js team for the amazing framework
- All contributors who have helped shape this project

## 📞 Support

For support, email support@aicodebugger.com or open an issue in the GitHub repository.

## 🔄 Updates

Stay tuned for updates and new features! Follow us on GitHub to get notified of new releases.

