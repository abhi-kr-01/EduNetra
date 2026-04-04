<div align="center">

# 🎓 EduNetra

AI-powered pedagogical analysis platform for teaching session videos.

<img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs" />
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript" />
<img alt="Tailwind" src="https://img.shields.io/badge/TailwindCSS-3.x-38b2ac?logo=tailwindcss" />
<img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb" />
<img alt="Cloudinary" src="https://img.shields.io/badge/Cloudinary-Uploads-1C9CEA?logo=cloudinary" />


</div>

---

## 🌟 Overview
EduNetra analyzes audio, video, and text to deliver actionable insights on clarity, confidence, engagement, technical depth, and interaction quality. Direct Cloudinary uploads keep videos secure while reducing backend load.

## 🚀 Features

### Core Functionality
- **Video Analysis**: Upload teaching session videos for comprehensive AI analysis
- **Multi-Modal Analysis**: 
  - Audio analysis (clarity, confidence, speech features)
  - Video analysis (engagement, gesture index, emotion detection)
  - Text analysis (technical depth, interaction index, topic relevance)
- **Real-Time Dashboard**: View statistics, session history, and performance trends
- **Detailed Reports**: In-depth analysis reports with video playback
- **Secure Storage**: Direct-to-Cloudinary uploads with private delivery URLs

### User Management
- **Authentication**: JWT-based authentication with refresh tokens
- **Role-Based Access**: Support for Mentors, Coordinators, and Institution Admins
- **User Dashboard**: Profile information, statistics, and session history
- **Session Management**: Track and review all past analyses

### Analytics & Insights
- **Performance Metrics**: Track clarity, confidence, engagement, and technical depth
- **Trend Analysis**: Visualize performance across multiple sessions
- **Coach Feedback**: AI-generated strengths and improvement suggestions
- **Video Playback**: On-demand video streaming via Cloudinary delivery URLs

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom React components

### Backend
- **API**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Authentication**: JWT with HTTP-only cookies
- **Storage**: Cloudinary (unsigned preset uploads from browser)
- **ML Service**: FastAPI Python microservice

### Infrastructure
- **Video Storage**: Cloudinary with unsigned preset (folder: `video`)
- **File Upload**: Direct from browser to Cloudinary; backend receives the URL
- **Security**: Ownership enforced via authenticated job creation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB Atlas** account
- **Cloudinary** account (unsigned upload preset ready)
- **Python >=3.8 and <3.11** (for model service)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/asminity/EduNetra.git
cd EduNetra
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# MongoDB Atlas Configuration
MONGODB_URI=

# Admin Secret (for database initialization)
ADMIN_SECRET=your-admin-secret-for-db-operations

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# ML Microservice Configuration
ML_MICROSERVICE_URL=http://localhost:8000

# Node Environment
NODE_ENV=development

# Cloudinary Configuration (client-side upload)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=EduNetra
NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDER=video
```

### 4. Database Setup

Initialize the MongoDB database:

```bash
curl -X POST http://localhost:3000/api/db/init \
  -H "x-admin-secret: your-admin-secret"
```

### 5. Cloudinary Upload Setup

1. Create a Cloudinary account and grab your **cloud name**.
2. Create an **unsigned upload preset** named `EduNetra`.
3. Set the preset to use folder `video` (resource type: video). No API keys are needed client-side for unsigned uploads.
4. Add the Cloudinary variables to `.env.local` as shown above.

### 6. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 7. Model Service (Analysis)
Use the deployed Space or run locally.

- Hugging Face: https://huggingface.co/spaces/genathon00/sikshanetra-model
- Local: see `model/README.md`

Expected endpoint: `POST {ML_MICROSERVICE_URL}/analyze`

Payload (current app sends downloaded video as base64):
```json
{
  "video_data": "<base64>",
  "video_filename": "session.mp4",
  "video_mimeType": "video/mp4",
  "topic": "General",
  "language": "English",
  "metadata": { "userId": "..." }
}
```
Response includes transcript, scores, and coach_feedback JSON.

## 📱 Usage

### Getting Started

1. **Sign Up / Login**
   - Navigate to `/signup` to create an account
   - Or login at `/login` with existing credentials
   - Upon successful authentication, you'll be redirected to your dashboard

2. **Upload a Video**
   - Go to the Demo page (`/demo`)
   - Select a video file (MP4, MOV, AVI, MKV, WebM)
   - Choose subject and language
   - Click "Run Analysis"

3. **View Results**
   - **Dashboard** (`/dashboard`): Overview of all sessions, statistics, and quick access to reports
   - **Insights** (`/insights`): Visual analytics with charts and video playback
   - **Reports** (`/report/[id]`): Detailed analysis with scores, transcript, and feedback

### Key Pages

- **`/`** - Landing page
- **`/login`** - User login
- **`/signup`** - User registration
- **`/dashboard`** - User dashboard with profile and session history
- **`/demo`** - Video upload and analysis
- **`/insights`** - Analytics and performance visualization
- **`/report/[id]`** - Detailed analysis report for a specific session
- **`/platform`** - Platform overview

## 🏗️ Project Structure

```
EduNetra/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── analyze/           # Video analysis endpoints
│   │   ├── video/             # Video signed URL generation
│   │   ├── db/                # Database initialization
│   │   └── storage/           # Storage initialization
│   ├── dashboard/             # User dashboard page
│   ├── demo/                  # Video upload page
│   ├── insights/              # Analytics page
│   ├── login/                 # Login page
│   ├── signup/                # Signup page
│   ├── report/[id]/          # Detailed report page
│   └── layout.tsx             # Root layout
├── components/                 # Reusable React components
│   ├── Card.tsx
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   ├── PageHeader.tsx
│   └── ToastContext.tsx
├── lib/
│   ├── config/                # Configuration files
│   │   ├── database.ts       # MongoDB connection
│   │   └── supabase.ts       # Legacy Supabase client setup (not used for video uploads)
│   ├── middleware/            # Express-like middleware
│   │   └── auth.ts           # JWT authentication
│   ├── models/                # Database models
│   │   ├── Analysis.ts       # Analysis schema
│   │   └── User.ts           # User schema
│   ├── services/              # Business logic
│   │   ├── analysisService.ts # ML response transformation
│   │   ├── authService.ts     # User authentication
│   │   └── storageService.ts  # Legacy Supabase storage helpers
│   ├── types/                 # TypeScript type definitions
│   │   └── analysis.ts       # Analysis types
│   ├── utils/                 # Utility functions
│   │   ├── jwt.ts            # Token generation/verification
│   │   └── videoUpload.ts    # Video upload utilities
│   └── validators/            # Input validation
│       └── auth.ts  
model/
├── config/
│   └── __pycache__/                          
│   └── settings.py                          
├── src/
│   ├── genai/
│   │   ├── __init__.py
│   │   ├── .env.sample
│   │   ├── __pycache__/                          
│   │   └── coach.py                    # High-level orchestrator
│   │
│   ├── processors/
│   │   ├── __init__.py
│   │   ├── audio_analyzer.py           # Audio ML logic
│   │   ├── text_analyzer.py            # Text ML logic
│   │   ├── video_analyzer.py           # Video ML logic
│   │   └── pipeline.py                 # Pipeline combining processors
│   │
│   ├── app.py                          # FastAPI/Flask app (should host inference API)
│   ├── main.py                         # Entry point (runs the server)
│   ├── packages.txt
│   ├── requirements.txt
│   └── README.md         # Auth validation schemas
├── public/                    # Static assets
├── .env.local                 # Environment variables (not in repo)
├── .env.example              # Example environment variables
└── README.md                 # This file
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **HTTP-Only Cookies**: Refresh tokens stored securely
- **Private Storage**: Videos uploaded via Cloudinary unsigned preset (folder `video`)
- **Delivery URLs**: Cloudinary secure delivery links passed through authenticated job creation
- **User Validation**: Video access restricted to owners only
- **Service Role Key**: Admin operations use separate credentials

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token

### Analysis
- `POST /api/analyze` - Upload and analyze video (with AI feedback)
- `POST /api/analyze/scores-only` - Analyze video (scores only, no AI feedback)
- `GET /api/analyze/history` - Get user's analysis history
- `GET /api/analyze/[id]` - Get specific analysis details
- `GET /api/analyze/search` - Search analyses with filters

### Video
- `GET /api/video/signed-url` - Deprecated (Cloudinary URLs are used directly)

### Admin
- `POST /api/db/init` - Initialize database (requires admin secret)
- `POST /api/storage/init` - Deprecated (Supabase storage removed)

## 📊 Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  email: string (unique),
  passwordHash: string,
  name: string,
  role: "mentor" | "coordinator" | "institution_admin",
  createdAt: Date,
  updatedAt: Date
}
```

### Analyses Collection
```typescript
{
  _id: ObjectId,
  userId: string,
  videoMetadata: {
    fileName: string,
    fileSize: number,
    mimeType: string,
    storagePath: string
  },
  subject: string,
  language: string,
  sessionId: string,
  topic: string,
  transcript: string,
  clarityScore: number,
  confidenceScore: number,
  engagementScore: number,
  technicalDepth: number,
  interactionIndex: number,
  gestureIndex: number,
  dominantEmotion: string,
  topicRelevanceScore: number,
  coachStrengths: string[],
  coachSuggestions: string[],
  status: "processing" | "completed" | "failed",
  createdAt: Date,
  updatedAt: Date
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

EduNetra - AI-Powered Teaching Analytics Platform

## 📞 Support

For support, please contact the development team or open an issue on GitHub.

---

**Note**: This is an active development project. Features and documentation are continuously updated.

