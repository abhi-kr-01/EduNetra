# EduNetra ML API

## Quick Start

### Start the API Server

Run the FastAPI server on port 3000:

```bash
python api.py
```

Or using uvicorn directly:

```bash
uvicorn api:app --host 0.0.0.0 --port 3000 --reload
```

The API will be available at:
- **Main URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc

---

## API Endpoints

### 1. **Health Check**
- **GET** `/health`
- Returns the health status of the service

**Example:**
```bash
curl http://localhost:8000/health
```

### 2. **Full Video Analysis** (Recommended)
- **POST** `/analyze`
- Analyze a video from Supabase URL and get comprehensive analysis with AI coaching feedback

**Parameters (JSON Body):**
- `video_url` (string, required): URL of the video file stored in Supabase
- `topic` (string, optional): Topic/subject being taught (default: "General")
- `keywords` (string, optional): Comma-separated keywords for analysis

**Example using curl:**
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "video_url": "https://your-supabase-project.supabase.co/storage/v1/object/public/videos/session.mp4",
    "topic": "Machine Learning"
  }'
```

**Example using Python requests:**
```python
import requests

url = "http://localhost:8000/analyze"
payload = {
    "video_url": "https://your-supabase-project.supabase.co/storage/v1/object/public/videos/session.mp4",
    "topic": "Machine Learning"
}

response = requests.post(url, json=payload)
print(response.json())
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "video.mp4",
    "topic": "Machine Learning",
    "transcript": "...",
    "scores": {
      "audio": {
        "clarity_score": 0.85,
        "confidence_score": 0.78
      },
      "video": {
        "engagement_score": 0.82,
        "gesture_index": 0.65
      },
      "text": {
        "technical_depth": 0.75,
        "interaction_index": 0.68
      }
    },
    "coach_feedback": {
      "performance_summary": "...",
      "strengths": [...],
      "improvements": [...]
    }
  },
  "error": null
}
```

### 3. **Scores Only Analysis** (Faster)
- **POST** `/analyze/scores-only`
- Get only the metrics without AI coaching feedback (faster processing)

**Parameters (JSON Body):**
- `video_url` (string, required): URL of the video file stored in Supabase
- `topic` (string, optional): Topic being taught

**Example:**
```bash
curl -X POST "http://localhost:8000/analyze/scores-only" \
  -H "Content-Type: application/json" \
  -d '{
    "video_url": "https://your-supabase-project.supabase.co/storage/v1/object/public/videos/session.mp4",
    "topic": "Physics"
  }'
```

### 4. **API Information**
- **GET** `/api/info`
- Get information about available endpoints and features

**Example:**
```bash
curl http://localhost:8000/api/info
```

---

## Usage Examples

### JavaScript/TypeScript (Frontend)

```javascript
async function analyzeVideo(videoUrl, topic = "General") {
  const payload = {
    video_url: videoUrl,
    topic: topic
  };

  try {
    const response = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Analysis completed:', result.data);
      return result.data;
    } else {
      console.error('Analysis failed:', result.error);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

// Usage - After uploading video to Supabase
const supabaseVideoUrl = "https://your-project.supabase.co/storage/v1/object/public/videos/session.mp4";
const results = await analyzeVideo(supabaseVideoUrl, "Mathematics");
```

### Python Client

```python
import requests
import json

def analyze_teaching_video(video_url, topic="General"):
    """
    Analyze a teaching video from Supabase URL using the  EduNetra API
    """
    url = "http://localhost:8000/analyze"
    
    payload = {
        "video_url": video_url,
        "topic": topic
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        result = response.json()
        if result['success']:
            return result['data']
        else:
            print(f"Error: {result['error']}")
    else:
        print(f"HTTP Error: {response.status_code}")
        
    return None

# Usage
if __name__ == "__main__":
    supabase_url = "https://your-project.supabase.co/storage/v1/object/public/videos/session.mp4"
    results = analyze_teaching_video(supabase_url, "Computer Science")
    if results:
        print(json.dumps(results, indent=2))
```

---

## Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 3000

CMD ["python", "api.py"]
```

Build and run:

```bash
docker build -t EduNetra-ml .
docker run -p 3000:3000 EduNetra-ml
```

---

## Environment Variables

Set your Google Gemini API key:

```bash
# Windows
set GEMINI_API_KEY=your_api_key_here

# Linux/Mac
export GEMINI_API_KEY=your_api_key_here
```

Or create a `.env` file:

```
GEMINI_API_KEY=your_api_key_here
```

---

## API Features

✅ **Video Download**: Automatically downloads videos from Supabase URLs  
✅ **Audio Analysis**: Speech clarity and confidence detection  
✅ **Video Analysis**: Engagement and gesture tracking  
✅ **Text Analysis**: Technical depth and interaction metrics  
✅ **AI Coaching**: Personalized feedback using Google Gemini  
✅ **CORS Enabled**: Ready for frontend integration  
✅ **Auto Documentation**: Interactive API docs at `/docs`  
✅ **Supported Formats**: mp4, mov, avi, mkv  
✅ **Automatic Cleanup**: Temporary files are cleaned up after processing  

---

## Error Handling

The API returns structured error responses:

```json
{
  "success": false,
  "data": null,
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad request (invalid file type, missing parameters)
- `500`: Internal server error (processing failed)

---

## Performance Tips

1. Use `/analyze/scores-only` for faster results when AI feedback isn't needed
2. Ensure Supabase storage bucket is publicly accessible or use signed URLs
3. Compress videos before uploading to Supabase for faster download and processing
4. Consider implementing rate limiting for production use
5. Use async processing for multiple simultaneous requests
6. Set appropriate timeout values for large video files

---

## Support

For issues or questions, refer to the main README.md or check the API documentation at http://localhost:8000/docs
