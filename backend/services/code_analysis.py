import os
import json
import requests
from dotenv import load_dotenv
from pathlib import Path
import logging
import time
import google.generativeai as genai
from .pattern_analyzer import analyze_with_patterns

# Load environment variables from the correct path
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Gemini
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY not found in environment variables. Please set it in your environment.")
MODEL_NAME = "gemini-2.0-flash"

# Initialize Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(MODEL_NAME)

# Track API usage to detect rate limiting
last_api_call = 0
api_calls_count = 0
RATE_LIMIT_WINDOW = 60  # 60 seconds (1 minute)
RATE_LIMIT_MAX = 10  # Maximum 10 calls per minute

def check_rate_limit():
    """Check if we might be approaching rate limits"""
    global last_api_call, api_calls_count
    
    current_time = time.time()
    # Reset counter if we're in a new time window
    if current_time - last_api_call > RATE_LIMIT_WINDOW:
        api_calls_count = 0
        last_api_call = current_time
        return False
    
    # Increment counter
    api_calls_count += 1
    last_api_call = current_time
    
    # Check if we're approaching limits
    if api_calls_count >= RATE_LIMIT_MAX:
        logger.warning(f"Rate limit may be exceeded: {api_calls_count} calls in the last minute")
        return True
    
    return False

def get_mock_analysis(language: str) -> str:
    """Provide a mock analysis when the API is unavailable"""
    return f"""# Code Analysis for {language}

## 1. Code Quality Review

The provided code appears to be generally well-structured. Here are some observations:

- Good use of meaningful variable names
- Clear function structure with appropriate comments
- Some minor style inconsistencies could be improved

## 2. Performance Analysis

No major performance issues detected. However, consider:

- Optimizing any nested loops for better time complexity
- Using more efficient data structures where applicable

## 3. Security Review

- No obvious security vulnerabilities detected
- Consider adding input validation for user-provided data
- Follow standard security practices for {language} applications

## Recommendations

1. Add more comprehensive error handling
2. Consider adding more unit tests
3. Follow consistent code formatting standards
4. Document public interfaces thoroughly

This is a mock analysis as the API connection could not be established."""

def analyze_code(code: str, language: str) -> dict:
    """
    Analyze code using Gemini and/or pattern matching.
    """
    try:
        # First, use the pattern analyzer to catch common issues
        pattern_results = analyze_with_patterns(code, language)
        
        # If we don't have an API key, just use pattern analysis
        if not GEMINI_API_KEY:
            logger.info("No API key found, using pattern analysis only")
            return pattern_results
        
        # Check for potential rate limiting before making the API call
        approaching_limit = check_rate_limit()
        if approaching_limit:
            logger.warning("Approaching API rate limit, using pattern analysis only")
            return pattern_results

        # For very short code snippets, pattern analysis might be sufficient
        if len(code.strip()) < 50:
            return pattern_results
            
        # For longer code, try the AI model analysis
        try:
            # Try AI model analysis, and fall back to pattern analysis if it fails
            ai_results = _analyze_with_ai(code, language)
            
            if ai_results.get("success"):
                # Combine the results from both analyzers
                return _combine_analysis_results(ai_results, pattern_results)
            else:
                # AI analysis failed, return pattern analysis results
                return pattern_results
                
        except Exception as e:
            logger.error(f"Error during AI analysis: {str(e)}")
            return pattern_results
    except Exception as e:
        logger.error(f"Error in analyze_code: {str(e)}")
        return {
            "success": False,
            "error": f"Error during code analysis: {str(e)}"
        }

def _analyze_with_ai(code: str, language: str) -> dict:
    """
    Analyze code using the Gemini model.
    """
    prompt = f"""Analyze this {language} code and provide detailed feedback:

{code}

Provide a comprehensive analysis covering:
1. Code Quality Review:
   - Identify any bugs or potential issues
   - Point out style and convention violations
   - Suggest improvements for readability
   - Explain why each suggestion matters
   - Provide impact assessment
   - Include relevant references

2. Performance Analysis:
   - Identify performance bottlenecks
   - Suggest optimizations
   - Point out any resource usage concerns
   - Explain the performance impact
   - Provide confidence levels

3. Security Review:
   - Identify security vulnerabilities
   - Point out unsafe practices
   - Suggest security improvements
   - Explain security implications
   - Provide references to security best practices

Format your response in JSON with the following structure:
{{
  "success": true,
  "analysis": "Overall analysis text",
  "model": "model name",
  "sections": [
    {{
      "title": "Section title",
      "content": "Content text or array",
      "type": "text|list|code|table",
      "explanation": "Detailed explanation of why this matters",
      "impact": "Impact assessment",
      "references": ["reference URLs"],
      "confidence": confidence_score,
      "severity": "info|warning|error|success"
    }}
  ]
}}"""

    try:
        # Make request to Gemini API
        response = model.generate_content(prompt)
        
        if response.text:
            try:
                # Parse the JSON response
                result = json.loads(response.text)
                return result
            except json.JSONDecodeError:
                # If JSON parsing fails, return a structured response
                return {
                    "success": True,
                    "analysis": response.text,
                    "model": MODEL_NAME,
                    "sections": [
                        {
                            "title": "Analysis",
                            "content": response.text,
                            "type": "text",
                            "explanation": "AI-generated analysis of your code",
                            "severity": "info"
                        }
                    ]
                }
        else:
            return {
                "success": False,
                "error": "No response from Gemini API"
            }

    except Exception as e:
        logger.error(f"Error during Gemini API request: {str(e)}")
        return {
            "success": False,
            "error": f"Error during API request: {str(e)}"
        }

def _combine_analysis_results(ai_results: dict, pattern_results: dict) -> dict:
    """
    Combine the results from AI analysis and pattern analysis.
    """
    # Create a combined analysis text
    ai_analysis = ai_results.get("analysis", "")
    pattern_analysis = pattern_results.get("analysis", "")
    
    # Extract issues from pattern analysis if available
    pattern_issues = pattern_results.get("issues", [])
    
    # If the AI analysis is empty or failed, just return pattern results
    if not ai_analysis:
        return pattern_results
    
    # If there are no pattern issues, just return AI results
    if not pattern_issues:
        return ai_results
    
    # Create a combined analysis text
    combined_analysis = f"""# Combined Code Analysis

## AI Analysis
{ai_analysis}

## Pattern-Based Analysis
{pattern_analysis}
"""
    
    return {
        "success": True,
        "analysis": combined_analysis,
        "model": f"{ai_results.get('model')} + Pattern Analyzer",
        "issues": pattern_issues
    } 