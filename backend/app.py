from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import tempfile
import subprocess
import logging
from dotenv import load_dotenv
from code_analyzer import CodeAnalyzer
from services.code_analysis import analyze_code, MODEL_NAME

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": os.getenv("FRONTEND_URL", "http://localhost:3000"), "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

# Initialize AI Based Code Debugger
code_analyzer = CodeAnalyzer()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "Server is running"})

@app.route('/api/model-info', methods=['GET'])
def model_info():
    """Return information about the AI model being used"""
    return jsonify({
        "model": "gemini-2.0-flash",
        "provider": "Google"
    })

@app.route('/api/debug', methods=['POST'])
def debug_code():
    """Analyze code using AI and return debug information"""
    data = request.json
    if not data or 'code' not in data or 'language' not in data:
        return jsonify({"error": "Missing code or language parameter"}), 400
    
    code = data['code']
    language = data['language']
    
    try:
        # Analyze code with AI
        analysis_result = code_analyzer.analyze(code, language)
        return jsonify(analysis_result)
    except Exception as e:
        logger.error(f"Error analyzing code: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/execute/javascript', methods=['POST'])
def execute_javascript():
    """Execute JavaScript code and return the result"""
    return execute_code('js', 'node')

@app.route('/api/execute/python', methods=['POST'])
def execute_python():
    """Execute Python code and return the result"""
    return execute_code('py', 'python')

@app.route('/api/execute/java', methods=['POST'])
def execute_java():
    """Execute Java code and return the result"""
    return execute_java_code()

@app.route('/api/execute/cpp', methods=['POST'])
def execute_cpp():
    """Execute C++ code and return the result"""
    return execute_cpp_code()

@app.route("/api/analyze", methods=["POST"])
def analyze():
    try:
        data = request.json
        if not data or "code" not in data or "language" not in data:
            logger.error("Missing required fields in analyze request")
            return jsonify({
                "success": False,
                "error": "Missing required fields: code and language"
            }), 400
        
        code = data["code"]
        language = data["language"]
        
        logger.info(f"Analyzing code in {language}, length: {len(code)} characters")
        
        result = analyze_code(code, language)
        
        if not result.get("success"):
            logger.error(f"Analysis failed: {result.get('error')}")
            
        return jsonify(result)
    except Exception as e:
        logger.error(f"Unexpected error in analyze endpoint: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"An unexpected error occurred: {str(e)}",
            "analysis": None,
            "model": MODEL_NAME
        }), 500

def execute_code(extension, command):
    """Generic function to execute code"""
    data = request.json
    if not data or 'code' not in data:
        return jsonify({"error": "No code provided"}), 400
    
    code = data['code']
    
    # Create a temporary file
    try:
        with tempfile.NamedTemporaryFile(suffix=f'.{extension}', delete=False) as tmp:
            tmp_path = tmp.name
            tmp.write(code.encode())
        
        # Execute the code with timeout
        timeout = int(os.getenv('MAX_EXECUTION_TIME', 10))
        result = subprocess.run(
            [command, tmp_path],
            capture_output=True,
            text=True,
            timeout=timeout
        )
        
        return jsonify({
            "output": result.stdout,
            "error": result.stderr
        })
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Execution timed out"}), 408
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

def execute_java_code():
    """Execute Java code"""
    data = request.json
    if not data or 'code' not in data:
        return jsonify({"error": "No code provided"}), 400
    
    code = data['code']
    class_name = 'Main'  # Java class name must match in the code
    
    # Create a temporary directory
    try:
        temp_dir = tempfile.mkdtemp()
        java_file = os.path.join(temp_dir, f"{class_name}.java")
        
        # Write code to file
        with open(java_file, 'w') as f:
            f.write(code)
        
        # Compile and run with timeout
        timeout = int(os.getenv('MAX_EXECUTION_TIME', 10))
        
        # Compile
        compile_result = subprocess.run(
            ['javac', java_file],
            capture_output=True,
            text=True,
            timeout=timeout//2
        )
        
        if compile_result.returncode != 0:
            return jsonify({
                "output": "",
                "error": compile_result.stderr
            })
        
        # Run
        run_result = subprocess.run(
            ['java', '-cp', temp_dir, class_name],
            capture_output=True,
            text=True,
            timeout=timeout//2
        )
        
        return jsonify({
            "output": run_result.stdout,
            "error": run_result.stderr
        })
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Execution timed out"}), 408
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up
        import shutil
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)

def execute_cpp_code():
    """Execute C++ code"""
    data = request.json
    if not data or 'code' not in data:
        return jsonify({"error": "No code provided"}), 400
    
    code = data['code']
    
    # Create a temporary directory
    try:
        temp_dir = tempfile.mkdtemp()
        cpp_file = os.path.join(temp_dir, "main.cpp")
        exe_file = os.path.join(temp_dir, "main.exe" if os.name == 'nt' else "main")
        
        # Write code to file
        with open(cpp_file, 'w') as f:
            f.write(code)
        
        # Compile and run with timeout
        timeout = int(os.getenv('MAX_EXECUTION_TIME', 10))
        
        # Compile
        compile_result = subprocess.run(
            ['g++', cpp_file, '-o', exe_file],
            capture_output=True,
            text=True,
            timeout=timeout//2
        )
        
        if compile_result.returncode != 0:
            return jsonify({
                "output": "",
                "error": compile_result.stderr
            })
        
        # Run
        run_result = subprocess.run(
            [exe_file],
            capture_output=True,
            text=True,
            timeout=timeout//2
        )
        
        return jsonify({
            "output": run_result.stdout,
            "error": run_result.stderr
        })
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Execution timed out"}), 408
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up
        import shutil
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 3001))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_ENV') == 'development') 