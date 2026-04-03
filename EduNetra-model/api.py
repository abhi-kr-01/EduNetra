"""
FastAPI Backend API for Shiksha Netra ML Microservice
Exposes video analysis endpoints at port 3000
"""

from fastapi import FastAPI, HTTPException, Body
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import tempfile
import requests
from typing import Optional
from pydantic import BaseModel, HttpUrl
from src.pipeline import process_session

# Initialize FastAPI app
app = FastAPI(
    title="Shiksha Netra ML API",
    root_path="/api",
    description="AI-powered pedagogical analysis microservice for teaching sessions",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class AnalysisRequest(BaseModel):
    video_url: str
    topic: Optional[str] = "General"
    keywords: Optional[str] = None

# Response Models
class HealthResponse(BaseModel):
    status: str
    message: str

class AnalysisResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None

# Endpoints


@app.get("/")
def root():
    return RedirectResponse(url="http://localhost:8501")


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Service is operational"
    }

def download_video_from_url(video_url: str) -> str:
    """
    Download video from Supabase URL and save to temporary file
    Returns the path to the temporary file
    """
    try:
        # Extract file extension from URL
        url_path = video_url.split('?')[0]  # Remove query parameters
        file_extension = os.path.splitext(url_path)[1].lower()
        
        # Validate extension
        allowed_extensions = ['.mp4', '.mov', '.avi', '.mkv']
        if not file_extension or file_extension not in allowed_extensions:
            file_extension = '.mp4'  # Default to mp4
        
        # Download the video
        print(f"Downloading video from: {video_url}")
        response = requests.get(video_url, stream=True, timeout=300)
        response.raise_for_status()
        
        # Save to temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=file_extension)
        
        # Write in chunks to handle large files
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                temp_file.write(chunk)
        
        temp_file.close()
        print(f"Video downloaded successfully to: {temp_file.name}")
        return temp_file.name
        
    except requests.RequestException as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to download video from URL: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing video download: {str(e)}"
        )

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_video(request: AnalysisRequest = Body(...)):
    """
    Analyze a teaching session video from Supabase URL and return comprehensive feedback
    
    Parameters:
    - video_url: URL of the video file stored in Supabase
    - topic: Subject/topic being taught (default: "General")
    - keywords: Optional comma-separated keywords for content analysis
    
    Returns:
    - Comprehensive analysis including audio, video, text scores and AI coach feedback
    """
    
    temp_file_path = None
    try:
        # Download video from Supabase URL
        temp_file_path = download_video_from_url(request.video_url)
        
        # Process the video through the ML pipeline
        print(f"Processing video for topic: {request.topic}")
        report = process_session(temp_file_path, topic_name=request.topic or "General")
        
        if report is None:
            raise HTTPException(
                status_code=500,
                detail="Analysis failed. Please check the video file and try again."
            )
        
        # Return successful response
        return AnalysisResponse(
            success=True,
            data=report,
            error=None
        )
    
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
    finally:
        # Cleanup: remove temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
                print(f"Cleaned up temporary file: {temp_file_path}")
            except Exception as e:
                print(f"Warning: Could not delete temporary file: {e}")

@app.post("/analyze/scores-only", response_model=AnalysisResponse)
async def analyze_video_scores_only(request: AnalysisRequest = Body(...)):
    """
    Analyze video from Supabase URL and return only the scores (without AI coach feedback)
    Faster endpoint for getting just the metrics
    
    Parameters:
    - video_url: URL of the video file stored in Supabase
    - topic: Subject/topic being taught (default: "General")
    
    Returns:
    - Analysis scores without AI coach feedback
    """
    
    temp_file_path = None
    try:
        # Download video from Supabase URL
        temp_file_path = download_video_from_url(request.video_url)
        
        # Process the video
        print(f"Processing video (scores only) for topic: {request.topic}")
        report = process_session(temp_file_path, topic_name=request.topic or "General")
        
        if report is None:
            raise HTTPException(
                status_code=500,
                detail="Analysis failed. Please check the video file and try again."
            )
        
        # Return only scores, not the full coach feedback
        scores_only = {
            "session_id": report.get("session_id"),
            "topic": report.get("topic"),
            "scores": report.get("scores"),
            "transcript": report.get("transcript")
        }
        
        return AnalysisResponse(
            success=True,
            data=scores_only,
            error=None
        )
    
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
    finally:
        # Cleanup
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
                print(f"Cleaned up temporary file: {temp_file_path}")
            except Exception as e:
                print(f"Warning: Could not delete temporary file: {e}")

@app.get("/info")
async def api_info():
    """Get information about available endpoints and their usage"""
    return {
        "endpoints": {
            "/": "Root endpoint - API information",
            "/health": "Health check",
            "/analyze": "Full video analysis with AI coach feedback (POST)",
            "/analyze/scores-only": "Video analysis with scores only, no AI feedback (POST)",
            "/docs": "Interactive API documentation (Swagger UI)",
            "/redoc": "Alternative API documentation (ReDoc)"
        },
        "supported_formats": ["mp4", "mov", "avi", "mkv"],
        "analysis_features": [
            "Audio analysis (clarity, confidence)",
            "Video analysis (engagement, gestures)",
            "Text analysis (technical depth, interaction)",
            "AI-powered coaching feedback"
        ]
    }

# Run the server
if __name__ == "__main__":
    print("=" * 60)
    print("🎓 Shiksha Netra ML API Starting...")
    print("=" * 60)
    print(f"Server running at: http://localhost:8000")
    print(f"API Documentation: http://localhost:8000/docs")
    print(f"Alternative Docs: http://localhost:8000/redoc")
    print("=" * 60)
    
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
