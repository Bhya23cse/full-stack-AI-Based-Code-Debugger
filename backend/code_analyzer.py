import os
import logging
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from services.pattern_analyzer import PatternAnalyzer

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CodeIssue(BaseModel):
    """Model for representing a code issue"""
    lineNumber: int = Field(..., description="Line number where the issue occurs")
    message: str = Field(..., description="Description of the issue")
    severity: str = Field(..., description="Severity of the issue: 'error', 'warning', or 'info'")
    column: Optional[int] = Field(None, description="Column where the issue starts")

class AnalysisResult(BaseModel):
    """Model for representing the code analysis result"""
    issues: List[CodeIssue] = Field(default_factory=list, description="List of identified issues")
    suggestions: List[str] = Field(default_factory=list, description="List of improvement suggestions")
    summary: str = Field("", description="Summary of code analysis")
    optimizedCode: Optional[str] = Field(None, description="Optimized version of the code")

class CodeAnalyzer:
    """Analyzes code using pattern matching and Gemini AI"""
    
    def __init__(self):
        """Initialize the code analyzer"""
        self.pattern_analyzer = PatternAnalyzer()
        logger.info("Initialized CodeAnalyzer with PatternAnalyzer")
    
    def analyze(self, code: str, language: str) -> Dict[str, Any]:
        """
        Analyze code using pattern matching and AI
        
        Args:
            code: The source code to analyze
            language: The programming language of the code
            
        Returns:
            Dictionary with analysis results
        """
        try:
            # Use the pattern analyzer which includes both pattern matching and AI analysis
            return self.pattern_analyzer.analyze(code, language)
        except Exception as e:
            logger.error(f"Error analyzing code: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "analysis": None
            }
    
    def _analyze_with_rules(self, code: str, language: str) -> Dict[str, Any]:
        """
        Fallback rule-based code analysis
        This is a basic implementation with common patterns
        """
        issues = []
        suggestions = []
        
        # Split code into lines for analysis
        lines = code.split("\n")
        
        # Check for common issues based on language
        if language == "python":
            # Check for missing colons
            for i, line in enumerate(lines):
                if any(keyword in line for keyword in ["if ", "for ", "while ", "def ", "class "]) and ":" not in line:
                    issues.append(CodeIssue(
                        lineNumber=i+1,
                        message=f"Missing colon after statement",
                        severity="error"
                    ))
                    
                # Check for indentation
                if line.strip() and not line.startswith(" ") and i > 0 and lines[i-1].endswith(":"):
                    issues.append(CodeIssue(
                        lineNumber=i+1,
                        message=f"Expected indentation after block statement",
                        severity="error"
                    ))
                    
            # General Python suggestions
            suggestions.append("Consider using a linter like flake8 or pylint for better code quality")
            
        elif language == "javascript":
            # Check for missing semicolons
            for i, line in enumerate(lines):
                stripped = line.strip()
                if (stripped and 
                    not stripped.endswith(";") and 
                    not stripped.endswith("{") and 
                    not stripped.endswith("}") and 
                    not stripped.endswith("(") and
                    not "function" in stripped and
                    not stripped.startswith("//")):
                    issues.append(CodeIssue(
                        lineNumber=i+1,
                        message=f"Missing semicolon at the end of statement",
                        severity="warning"
                    ))
                
                # Check for console.log statements
                if "console.log" in line:
                    issues.append(CodeIssue(
                        lineNumber=i+1,
                        message=f"Console.log statement should be removed in production code",
                        severity="info"
                    ))
            
            # General JavaScript suggestions
            suggestions.append("Consider using ESLint for better code quality")
            
        # Generate a basic summary
        summary = f"Found {len(issues)} potential issues in {language} code"
        
        return AnalysisResult(
            issues=issues,
            suggestions=suggestions,
            summary=summary
        ).dict() 