from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
import os
import logging
from markdown import markdown

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get API key from environment
api_key = os.getenv("GEMINI_API_KEY")

logger.info(f"Current working directory: {os.getcwd()}")
dict(os.environ)
#logger.info(f"Environment variables: {dict(os.environ)}")

if not api_key:
    error_msg = "GEMINI_API_KEY not found in environment variables"
    logger.error(error_msg)
    raise ValueError(error_msg)

# Configure Gemini API
try:
    genai.configure(api_key=api_key)
    # Use Gemini 2.0 Flash model
    model = genai.GenerativeModel('gemini-2.0-flash')
    logger.info("Gemini API configured successfully")
except Exception as e:
    error_msg = f"Failed to configure Gemini API: {str(e)}"
    logger.error(error_msg)
    raise ValueError(error_msg)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str
    language: str

@app.post("/debug")
async def debug_code(request: CodeRequest):
    try:
        logger.info(f"Received debug request for {request.language} code")
        logger.info(f"Code content: {request.code[:100]}...")  # Log first 100 chars of code
        
        prompt = f"Debug this {request.language} code:\n{request.code}\n\nPlease provide:\n1. Any errors found\n2. Suggested fixes\n3. Best practices recommendations"
        
        try:
            response = model.generate_content(prompt)
            if not response or not hasattr(response, 'text'):
                raise ValueError("Invalid response from Gemini API")
            
            debug_response = markdown(response.text)
            logger.info("Successfully generated debug response")
            print(debug_response)
            
            return {
                "debug_response": debug_response,
                "status": "success"
            }
        except Exception as api_error:
            logger.error(f"Gemini API error: {str(api_error)}")
            return {
                "debug_response": f"Error from Gemini API: {str(api_error)}",
                "status": "error"
            }
            
    except Exception as e:
        error_msg = f"Error in debug_code endpoint: {str(e)}"
        logger.error(error_msg)
        return {
            "debug_response": error_msg,
            "status": "error"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 