# AI Code Debugger Backend

A powerful backend service that combines Google's Gemini AI model with pattern-based analysis to provide intelligent code debugging and analysis.

## Features

- **Hybrid Analysis System**
  - Google's Gemini AI model for advanced code analysis
  - Pattern-based analysis for reliable fallback
  - Real-time code execution and debugging
  - Multi-language support

- **Code Analysis Capabilities**
  - Syntax error detection
  - Logical issue identification
  - Performance optimization suggestions
  - Security vulnerability scanning
  - Code style and best practices recommendations

- **API Endpoints**
  - `/api/analyze` - Analyze code using both AI and pattern matching
  - `/api/debug` - Debug code with detailed feedback
  - `/api/health` - Health check endpoint
  - `/api/model-info` - Get information about the current AI model

## Tech Stack

- **Framework**: Flask
- **AI Model**: Google Gemini AI
- **Pattern Analysis**: Custom pattern matching system
- **API Documentation**: OpenAPI/Swagger
- **Authentication**: JWT-based
- **CORS**: Enabled for frontend integration

## Installation

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

## Running the Server

Development:
```bash
python app.py
```

Production:
```bash
gunicorn app:app
```

## API Usage

### Analyze Code
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"code": "your_code_here", "language": "python"}'
```

### Debug Code
```bash
curl -X POST http://localhost:5000/api/debug \
  -H "Content-Type: application/json" \
  -d '{"code": "your_code_here", "language": "python"}'
```

## Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key
- `FLASK_ENV`: Development or production environment
- `FRONTEND_URL`: URL of the frontend application
- `PORT`: Port number for the server (default: 5000)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details 