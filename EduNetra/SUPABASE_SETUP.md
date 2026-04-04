# Supabase Video Storage Integration Guide

## Overview
Videos uploaded through the demo form are now stored in Supabase Storage and fetched when needed in the Insights page. This provides scalable, secure video storage with CDN delivery.

---

## Setup Instructions

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in project details:
   - **Project Name**: ShikshaNetra (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
5. Wait for project initialization (~2 minutes)

### 2. Get Supabase Credentials

1. From your Supabase project dashboard, click **Settings** (gear icon)
2. Navigate to **API** section
3. Copy the following values:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (under "Project API keys")

### 3. Configure Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Replace the placeholder values with your actual Supabase credentials.

### 4. Initialize Storage Bucket

Run this command to create the storage bucket:

```bash
curl -X POST http://localhost:3000/api/storage/init \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: your-admin-secret-from-env"
```

Or use PowerShell:

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "x-admin-secret" = "your-admin-secret-from-env"
}
Invoke-RestMethod -Uri "http://localhost:3000/api/storage/init" -Method POST -Headers $headers
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Storage bucket initialized successfully",
  "bucket": "analysis-videos"
}
```

### 5. Configure Storage Bucket Policies (Optional)

For additional security, set up Row Level Security (RLS) policies:

1. Go to Supabase Dashboard → **Storage**
2. Find the `analysis-videos` bucket
3. Click **Policies**
4. Add policies as needed:

**Example Policy - Allow authenticated users to upload**:
```sql
CREATE POLICY "Users can upload their own videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'analysis-videos' AND (storage.foldername(name))[1] = auth.uid()::text);
```

**Example Policy - Public read access**:
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'analysis-videos');
```

---

## File Structure

### New Files Created:

1. **`lib/config/supabase.ts`**
   - Supabase client initialization
   - Bucket configuration

2. **`lib/services/storageService.ts`**
   - `uploadVideo()` - Upload video to Supabase
   - `deleteVideo()` - Delete video from storage
   - `getSignedVideoUrl()` - Get temporary signed URLs
   - `listUserVideos()` - List all videos for a user
   - `initializeStorageBucket()` - Create storage bucket

3. **`app/api/storage/init/route.ts`**
   - POST endpoint to initialize storage bucket
   - Requires admin authentication

### Modified Files:

1. **`app/api/analyze/route.ts`**
   - Added video upload to Supabase before ML analysis
   - Stores video URL in database
   - Enhanced error handling

2. **`app/insights/page.tsx`**
   - Added video player component
   - Displays uploaded videos for selected analysis
   - Updated Analysis type with mimeType

3. **`.env.example`**
   - Added Supabase environment variables

---

## How It Works

### Upload Flow:

```
User submits video → Frontend (Demo Page)
                          ↓
                    FormData POST to /api/analyze
                          ↓
                    Backend receives file
                          ↓
                    Upload to Supabase Storage
                          ↓
                    Get public URL
                          ↓
                    Send VIDEO URL (JSON) to ML microservice
                          ↓
                    ML service fetches video from Supabase
                          ↓
                    ML service analyzes and returns results
                          ↓
                    Save analysis + video URL to MongoDB
                          ↓
                    Return success response
```

### Fetch Flow:

```
User visits Insights → Fetch analyses from MongoDB
                            ↓
                    Analysis includes videoUrl field
                            ↓
                    Display video player with URL
                            ↓
                    Video streams from Supabase CDN
```

---

## ML Microservice Integration

### Request Format

The backend sends a **JSON payload** with the video URL (not the file itself):

**POST** `http://localhost:8000/analyze`

```json
{
  "video_url": "https://xxxxx.supabase.co/storage/v1/object/public/analysis-videos/userId/1234567890_video.mp4",
  "topic": "Data Structures",
  "language": "English – Indian",
  "metadata": {
    "fileName": "lecture.mp4",
    "fileSize": 52428800,
    "mimeType": "video/mp4",
    "userId": "user123"
  }
}
```

### Benefits of URL-Based Approach

✅ **Decoupling**: ML service and storage are completely independent  
✅ **Performance**: Backend doesn't stream video, just passes URL  
✅ **Scalability**: ML service downloads at its own pace  
✅ **Retry Logic**: ML service can retry download if network fails  
✅ **CDN Speed**: ML service benefits from Supabase CDN  
✅ **Memory Efficient**: Backend doesn't hold video in memory  

### ML Service Implementation Example

Your ML microservice needs to:
1. Accept `video_url` in JSON payload
2. Download video from the provided Supabase URL
3. Process the video
4. Return analysis results

**Python (FastAPI) Example**:

```python
import requests
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class AnalyzeRequest(BaseModel):
    video_url: str
    topic: str
    language: str
    metadata: dict

@app.post("/analyze")
async def analyze_video(request: AnalyzeRequest):
    try:
        # Download video from Supabase URL
        print(f"Downloading video from: {request.video_url}")
        video_response = requests.get(request.video_url, stream=True)
        
        if video_response.status_code != 200:
            return {
                "success": False, 
                "error": f"Failed to download video: HTTP {video_response.status_code}"
            }
        
        # Save temporarily
        temp_path = f"temp/{request.metadata['fileName']}"
        os.makedirs("temp", exist_ok=True)
        
        with open(temp_path, 'wb') as f:
            for chunk in video_response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"Video downloaded: {temp_path}")
        
        # Process video (your existing ML logic)
        analysis_results = process_video_analysis(
            video_path=temp_path,
            topic=request.topic,
            language=request.language
        )
        
        # Clean up
        os.remove(temp_path)
        
        return {
            "success": True,
            "data": analysis_results
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@app.post("/analyze/scores-only")
async def analyze_scores_only(request: AnalyzeRequest):
    # Same logic but skip AI feedback generation
    pass
```

**Node.js (Express) Example**:

```javascript
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

app.post('/analyze', async (req, res) => {
  try {
    const { video_url, topic, language, metadata } = req.body;
    
    // Download video
    const response = await axios({
      method: 'GET',
      url: video_url,
      responseType: 'stream'
    });
    
    const tempPath = `temp/${metadata.fileName}`;
    const writer = fs.createWriteStream(tempPath);
    
    response.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    // Process video
    const results = await processVideo(tempPath, topic);
    
    // Clean up
    fs.unlinkSync(tempPath);
    
    res.json({
      success: true,
      data: results
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

---

## Storage Service API

### Upload Video

```typescript
import { uploadVideo } from '@/lib/services/storageService';

const result = await uploadVideo(file, userId, fileName);

// Returns:
{
  success: boolean;
  url?: string;        // Public URL to access video
  path?: string;       // Storage path (for deletion)
  error?: string;
}
```

### Delete Video

```typescript
import { deleteVideo } from '@/lib/services/storageService';

const success = await deleteVideo(storagePath);
// Returns: boolean
```

### Get Signed URL (Private Access)

```typescript
import { getSignedVideoUrl } from '@/lib/services/storageService';

const signedUrl = await getSignedVideoUrl(storagePath, 3600); // Expires in 1 hour
// Returns: string | null
```

### List User Videos

```typescript
import { listUserVideos } from '@/lib/services/storageService';

const videoPaths = await listUserVideos(userId);
// Returns: string[] (array of storage paths)
```

---

## Storage Configuration

### Bucket Settings:
- **Name**: `analysis-videos`
- **Public Access**: Yes (for direct video playback)
- **File Size Limit**: 500MB
- **Allowed MIME Types**:
  - `video/mp4`
  - `video/quicktime`
  - `video/x-msvideo`
  - `video/x-matroska`
  - `video/webm`

### File Organization:
```
analysis-videos/
  ├── {userId}/
  │   ├── {timestamp}_{filename}.mp4
  │   ├── {timestamp}_{filename}.mov
  │   └── ...
```

---

## Database Schema Update

The `Analysis` collection now includes:

```typescript
{
  // ... existing fields
  videoUrl: string,           // Public Supabase URL
  videoMetadata: {
    fileName: string,
    fileSize: number,
    mimeType: string,
    videoUrl: string,         // Duplicate for convenience
    storagePath: string,      // For deletion
  }
}
```

---

## Video Player Component

Added to Insights page when analysis is selected:

```tsx
{selectedAnalysis && selectedAnalysis.videoUrl && (
  <Card className="p-5">
    <h2 className="text-sm font-semibold">Session Recording</h2>
    <div className="mt-4 overflow-hidden rounded-xl">
      <video
        controls
        className="w-full"
        src={selectedAnalysis.videoUrl}
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  </Card>
)}
```

---

## Error Handling

### Upload Errors:

1. **Supabase not configured**:
   ```json
   {
     "error": "Missing Supabase environment variables"
   }
   ```
   **Solution**: Add Supabase credentials to `.env.local`

2. **Upload failed**:
   ```json
   {
     "success": false,
     "error": "Failed to upload video to storage"
   }
   ```
   **Solution**: Check Supabase project status and storage quota

3. **Bucket not initialized**:
   ```json
   {
     "error": "Bucket 'analysis-videos' does not exist"
   }
   ```
   **Solution**: Run `/api/storage/init` endpoint

---

## Testing

### Test Upload:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Log in to the application

3. Go to Demo page

4. Upload a video file (max 500MB)

5. Submit for analysis

6. Check console logs for:
   ```
   Uploading video to Supabase: filename.mp4
   Video uploaded successfully: https://....supabase.co/storage/...
   ```

### Test Video Playback:

1. Go to Insights page

2. Click on any completed analysis

3. Video player should appear if video exists

4. Click play to verify video streams correctly

### Verify Storage:

1. Go to Supabase Dashboard → **Storage**

2. Click on `analysis-videos` bucket

3. Browse folders to see uploaded videos

4. Videos organized by userId

---

## Cost Considerations

### Supabase Free Tier:
- **Storage**: 1GB
- **Bandwidth**: 2GB/month
- **File uploads**: Unlimited

### Upgrade When:
- Storage exceeds 1GB
- Monthly bandwidth exceeds 2GB
- Need better performance/CDN

### Cost Optimization:
1. Delete old videos after analysis
2. Compress videos before upload
3. Use signed URLs for private access
4. Implement video retention policies

---

## Security Best Practices

1. **Never expose service_role key** in frontend code
2. **Use anon key** for client-side operations
3. **Implement RLS policies** for multi-user access
4. **Validate file types** before upload
5. **Set file size limits** to prevent abuse
6. **Use signed URLs** for sensitive content
7. **Regular cleanup** of unused videos

---

## Troubleshooting

### Issue: Videos not uploading

**Check**:
1. Supabase credentials in `.env.local`
2. Storage bucket exists (run init endpoint)
3. File size under 500MB limit
4. Correct MIME type

**Logs**:
```bash
# Check Next.js logs
npm run dev

# Look for:
"Uploading video to Supabase: ..."
"Video uploaded successfully: ..."
```

### Issue: Videos not playing

**Check**:
1. Video URL in database
2. Bucket is public
3. Correct MIME type
4. Browser supports video format

**Test URL directly**:
```bash
curl -I https://your-project.supabase.co/storage/v1/object/public/...
```

### Issue: "Missing Supabase environment variables"

**Solution**:
1. Add variables to `.env.local`
2. Restart development server
3. Clear Next.js cache: `rm -rf .next`

---

## Advanced Features (Future)

### Video Transcoding:
```typescript
// Use Supabase Edge Functions for transcoding
// Convert to optimized formats
// Generate thumbnails
```

### Video Analytics:
```typescript
// Track video views
// Monitor playback completion
// Analyze engagement metrics
```

### Progressive Upload:
```typescript
// Chunk large videos
// Upload in parts
// Resume interrupted uploads
```

---

## Summary

✅ **What's Working**:
- Video upload to Supabase during analysis
- Storage URL saved in MongoDB
- Video player in Insights page
- Public access for playback
- Organized by user ID

✅ **Next Steps**:
1. Configure Supabase project
2. Add credentials to `.env.local`
3. Initialize storage bucket
4. Test full upload/playback flow

✅ **Files to Configure**:
- `.env.local` (add Supabase credentials)

✅ **Endpoints to Test**:
- POST `/api/storage/init` (one-time setup)
- POST `/api/analyze` (upload + analyze)
- GET `/api/analyze/history` (fetch with video URLs)

---

**Status**: 🎉 Supabase video storage fully integrated and ready for use!
