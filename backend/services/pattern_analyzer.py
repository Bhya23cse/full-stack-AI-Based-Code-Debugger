import json
import re
import os
from pathlib import Path
import logging
from typing import List, Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Gemini
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyCiuNQ2U3O6SqewHInjjNtDZYxUZiUMjNQ")
MODEL_NAME = "gemini-2.0-flash"

# Initialize Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(MODEL_NAME)

class CodeIssue:
    def __init__(self, line_number: int, message: str, severity: str, column: int = None):
        self.line_number = line_number
        self.message = message
        self.severity = severity
        self.column = column
    
    def to_dict(self):
        return {
            "lineNumber": self.line_number,
            "message": self.message,
            "severity": self.severity,
            "column": self.column
        }

class PatternAnalyzer:
    """
    Analyzes code using both pattern matching and Gemini AI.
    """
    
    def __init__(self, pattern_file_path=None):
        """
        Initialize the pattern analyzer with the path to the pattern JSON file.
        If not specified, it will look for code_patterns.json in the data directory.
        """
        if pattern_file_path is None:
            pattern_file_path = Path(__file__).parent.parent / 'data' / 'code_patterns.json'
        
        try:
            with open(pattern_file_path, 'r') as f:
                self.pattern_data = json.load(f)
            logger.info(f"Loaded {len(self.pattern_data.get('patterns', {}))} pattern sets for code analysis")
        except FileNotFoundError:
            logger.error(f"Pattern file not found at {pattern_file_path}")
            self.pattern_data = {"patterns": {}, "security_checks": {}, "performance_checks": {}}
        except json.JSONDecodeError:
            logger.error("Invalid JSON in pattern file")
            self.pattern_data = {"patterns": {}, "security_checks": {}, "performance_checks": {}}
    
    def analyze(self, code: str, language: str) -> Dict[str, Any]:
        """
        Analyze code using both pattern matching and Gemini AI.
        
        Args:
            code: The source code to analyze
            language: The programming language of the code
            
        Returns:
            Dictionary with analysis results
        """
        if not code or not language:
            return {
                "success": True,
                "analysis": "# Code Analysis\n\nNo code provided for analysis.",
                "model": "Pattern Analyzer + Gemini"
            }
        
        # Get pattern-based analysis
        pattern_issues = self._analyze_patterns(code, language)
        
        # Get Gemini AI analysis
        try:
            ai_analysis = self._analyze_with_gemini(code, language)
            if ai_analysis.get("success"):
                # Combine both analyses
                return self._combine_analyses(pattern_issues, ai_analysis)
            else:
                # If AI analysis fails, return pattern analysis
                return pattern_issues
        except Exception as e:
            logger.error(f"Error during Gemini analysis: {str(e)}")
            return pattern_issues
    
    def _analyze_patterns(self, code: str, language: str) -> Dict[str, Any]:
        """Analyze code using predefined patterns."""
        code_lines = code.split('\n')
        issues = []
        
        # Check language-specific patterns
        if language in self.pattern_data.get('patterns', {}):
            for pattern_info in self.pattern_data['patterns'][language]:
                regex_pattern = pattern_info['pattern']
                try:
                    for i, line in enumerate(code_lines):
                        if re.search(regex_pattern, line):
                            issues.append(CodeIssue(
                                line_number=i+1,
                                message=f"{pattern_info['description']}. Suggestion: {pattern_info['suggestion']}",
                                severity=pattern_info['severity']
                            ))
                except re.error:
                    logger.error(f"Invalid regex pattern: {regex_pattern}")
        
        # Check security patterns
        for sec_check in self.pattern_data.get('security_checks', {}).values():
            if language in sec_check.get('applies_to', []):
                try:
                    for i, line in enumerate(code_lines):
                        if re.search(sec_check['pattern'], line):
                            issues.append(CodeIssue(
                                line_number=i+1,
                                message=f"SECURITY: {sec_check['description']}. {sec_check['suggestion']}",
                                severity=sec_check['severity']
                            ))
                except re.error:
                    logger.error(f"Invalid regex pattern in security check: {sec_check['pattern']}")
        
        # Check performance patterns
        for perf_check in self.pattern_data.get('performance_checks', {}).values():
            if language in perf_check.get('applies_to', []):
                try:
                    if re.search(perf_check['pattern'], code):
                        issues.append(CodeIssue(
                            line_number=1,
                            message=f"PERFORMANCE: {perf_check['description']}. {perf_check['suggestion']}",
                            severity=perf_check['severity']
                        ))
                except re.error:
                    logger.error(f"Invalid regex pattern in performance check: {perf_check['pattern']}")
        
        return {
            "success": True,
            "analysis": self._generate_analysis_text(code, language, issues),
            "model": "Pattern Analyzer",
            "issues": [issue.to_dict() for issue in issues]
        }
    
    def _analyze_with_gemini(self, code: str, language: str) -> Dict[str, Any]:
        """Analyze code using Gemini AI."""
        prompt = f"""Analyze this {language} code and provide detailed feedback:

{code}

Focus on:
1. Code Quality:
   - Identify bugs and potential issues
   - Point out style violations
   - Suggest readability improvements

2. Performance:
   - Identify bottlenecks
   - Suggest optimizations
   - Point out resource usage concerns

3. Security:
   - Identify vulnerabilities
   - Point out unsafe practices
   - Suggest security improvements

Format your response with clear sections and specific line references when applicable."""

        try:
            response = model.generate_content(prompt)
            
            if response.text:
                return {
                    "success": True,
                    "analysis": response.text,
                    "model": MODEL_NAME
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
    
    def _combine_analyses(self, pattern_analysis: Dict[str, Any], ai_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Combine pattern-based and AI analyses."""
        pattern_text = pattern_analysis.get("analysis", "")
        ai_text = ai_analysis.get("analysis", "")
        pattern_issues = pattern_analysis.get("issues", [])
        
        combined_analysis = f"""# Combined Code Analysis

## AI Analysis (Gemini)
{ai_text}

## Pattern-Based Analysis
{pattern_text}
"""
        
        return {
            "success": True,
            "analysis": combined_analysis,
            "model": f"{MODEL_NAME} + Pattern Analyzer",
            "issues": pattern_issues
        }
    
    def _generate_analysis_text(self, code: str, language: str, issues: List[CodeIssue]) -> str:
        """Generate a human-readable analysis text based on the issues found."""
        if not issues:
            return f"""# Code Analysis for {language.capitalize()} Code

## Summary
No issues detected in the provided code.

## Recommendations
- Continue following good coding practices
- Consider adding more comments to document your code
- Write unit tests to ensure code reliability
"""
        
        # Count issues by severity
        errors = sum(1 for issue in issues if issue.severity == "error")
        warnings = sum(1 for issue in issues if issue.severity == "warning")
        infos = sum(1 for issue in issues if issue.severity == "info")
        
        # Generate the analysis text
        analysis = f"""# Code Analysis for {language.capitalize()} Code

## Summary
Found {len(issues)} issues in the code ({errors} errors, {warnings} warnings, {infos} info).

## Issues
"""
        
        # Add detailed issue information
        for issue in issues:
            severity_emoji = "🔴" if issue.severity == "error" else "🟠" if issue.severity == "warning" else "🔵"
            analysis += f"{severity_emoji} **Line {issue.line_number}**: {issue.message}\n\n"
        
        # Add general recommendations based on the language
        analysis += "\n## Recommendations\n"
        
        if language == "python":
            analysis += """- Follow PEP 8 style guidelines
- Use a linter like flake8 or pylint
- Consider using type hints for better IDE support
"""
        elif language == "javascript":
            analysis += """- Follow JavaScript Standard Style or Airbnb style guide
- Use ESLint to catch issues early
- Consider using TypeScript for better type safety
"""
        elif language == "java":
            analysis += """- Follow Google Java Style Guide
- Use a static code analyzer like SonarQube
- Follow the principles of clean code
"""
        elif language == "cpp":
            analysis += """- Follow Google C++ Style Guide
- Use a static analyzer like Clang-Tidy
- Be careful with memory management
"""
        
        return analysis

# Singleton instance
pattern_analyzer = PatternAnalyzer()

def analyze_with_patterns(code: str, language: str) -> Dict[str, Any]:
    """
    Analyze code using pattern matching and Gemini AI.
    """
    return pattern_analyzer.analyze(code, language) 