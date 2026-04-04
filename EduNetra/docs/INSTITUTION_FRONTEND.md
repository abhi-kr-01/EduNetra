# Institution Frontend Implementation

## Overview
This document describes the institution management features added to ShikshaNetra. Institution admins can now sign up, manage teachers, view teacher profiles, and perform all standard operations like uploading videos and viewing analysis history.

## Features Implemented

### 1. User Roles
- **New Role Added**: `"institution"` role added to User type alongside existing `"mentor"` and `"coordinator"` roles
- Location: `lib/types/user.ts`

### 2. Signup & Login
- **Signup Page** (`app/signup/page.tsx`):
  - "Institution Admin" option now creates an institution entity
  - Converts "Institution Admin" to `"institution"` role on backend
  - Creates an Institution document and links it to the user via `institutionId`
  - Redirects institutions to `/institution/dashboard` after signup

- **Login Page** (`app/login/page.tsx`):
  - Detects institution role and redirects to `/institution/dashboard`
  - Regular users redirect to `/dashboard`

### 3. Backend APIs Created

#### Teacher Management APIs
**GET** `/api/institution/[institutionId]/teachers`
- Lists all teachers (mentors/coordinators) in an institution
- Returns: `{ success, count, teachers[] }`

**POST** `/api/institution/[institutionId]/teachers/add`
- Add a teacher by email
- Request: `{ email: string }`
- Automatically sets teacher's `institutionId` field
- Returns: `{ message, teacher }`

**POST** `/api/institution/[institutionId]/teachers/remove`
- Remove a teacher by email
- Request: `{ email: string }`
- Removes teacher's `institutionId` field
- Returns: `{ message, teacher }`

#### Teacher Profile APIs
**GET** `/api/institution/[institutionId]/teachers/[teacherId]/memory`
- Fetch memory/summary for a specific teacher
- Returns: `{ success, memory, teacher }`

**GET** `/api/institution/[institutionId]/teachers/[teacherId]/analyses`
- Fetch analyses for a specific teacher (top 5 by default)
- Query params: `?limit=5`
- Returns: `{ success, count, analyses[], teacher }`

### 4. Institution Frontend Pages

#### Dashboard (`app/institution/dashboard/page.tsx`)
**Features**:
- Quick stats: Total teachers count
- Quick action cards: Upload Video, View History, Summaries (clickable)
- Teachers list with:
  - Teacher name, email, role
  - "View Profile" button (navigates to teacher profile page)
  - "Remove" button (removes teacher from institution)
- Add Teacher form:
  - Input email of existing user
  - Adds user to institution
  - Shows success/error toasts

**Access Control**: Only users with `role: "institution"` can access

#### Teachers Profile Page (`app/institution/teachers/page.tsx`)
**Features**:
- Query parameter: `?teacherId=xxx`
- Teacher info display: Name, email, total sessions, average score
- Left panel: Summary & Insights
  - Teacher's memory summary
  - Strengths (green checkmarks)
  - Areas for improvement (orange arrows)
  - Last updated timestamp
- Right panel: Recent Sessions (Top 5)
  - Session topic, subject, date
  - Score metrics: Clarity, Confidence, Engagement
  - "View" link to full report page

**Access Control**: Only institution admins can view their teachers' profiles

#### Upload Page (`app/institution/upload/page.tsx`)
- Reuses existing upload page functionality
- Same video upload and analysis features
- Access control: institutions only

#### History Page (`app/institution/history/page.tsx`)
- Reuses existing history page functionality
- Shows institution's uploaded sessions
- Access control: institutions only

#### Summaries Page (`app/institution/summaries/page.tsx`)
- Shows institution's own memory/summary
- Same UI as regular user summaries page
- Displays: Overall Summary, Strengths, Areas for Improvement
- Access control: institutions only

### 5. Navigation Updates

#### Navbar (`components/Navbar.tsx`)
**Institution Navigation Links**:
- Dashboard → `/institution/dashboard`
- Upload → `/institution/upload`
- History → `/institution/history`
- Summaries → `/institution/summaries`

**Regular User Navigation Links** (unchanged):
- Upload → `/upload`
- Dashboard → `/dashboard`
- History → `/history`
- Insights → `/insights`

**Dynamic Routing**:
- Logo now links to appropriate dashboard based on user role
- Mobile menu also shows role-appropriate links

### 6. Authentication Service Update

**File**: `lib/services/authService.ts`

**Institution Signup Flow**:
1. Check if user exists
2. Hash password
3. If role is "institution":
   - Create Institution document with user's name
   - Store institution ID
4. Create User with `institutionId` set to their own institution
5. Return user data

## Usage Flow

### For Institution Admins

1. **Sign Up**:
   - Visit `/signup`
   - Fill in details and select "Institution Admin" from role dropdown
   - System creates Institution and User entities
   - Redirects to `/institution/dashboard`

2. **Add Teachers**:
   - On dashboard, click "Add Teacher" button
   - Enter teacher's email (teacher must already have an account as Mentor/Coordinator)
   - System links teacher to institution
   - Teacher appears in teachers list

3. **View Teacher Profile**:
   - Click "View Profile" on any teacher card
   - See teacher's summary, strengths, areas for improvement
   - View top 5 recent sessions with scores
   - Click "View" on any session to see full report

4. **Remove Teachers**:
   - Click "Remove" button on teacher card
   - Confirm removal
   - Teacher's `institutionId` is cleared (they become independent)

5. **Upload & Analyze Videos**:
   - Use Upload page to analyze teaching sessions
   - Videos are uploaded to Cloudinary
   - Analysis results appear in History

6. **View Personal Summaries**:
   - Visit Summaries page to see institution's own teaching summary
   - View strengths and improvement areas

### For Teachers (Mentors/Coordinators)

- Teachers can be added to institutions by institution admins
- Once added, they continue using regular `/upload`, `/dashboard`, `/history`, `/insights` pages
- Their data becomes visible to their institution admin
- If removed from institution, they revert to independent users

## Security & Access Control

### Authentication Checks
All institution endpoints verify:
1. User is authenticated (valid JWT token)
2. User has `role: "institution"`
3. User's `institutionId` matches the requested institution
4. For teacher-specific endpoints, verify teacher belongs to institution

### Route Protection
- Signup/Login: Check for existing session, redirect to appropriate dashboard
- Institution pages: Check role === "institution", redirect to `/dashboard` if not
- Teacher profile pages: Verify institution admin access before showing data

## Data Models

### User (Updated)
```typescript
{
  id: string;
  email: string;
  name: string;
  role: "mentor" | "coordinator" | "institution";
  institutionId?: string;  // For mentors: their institution, For institutions: their own ID
  createdAt: Date;
  updatedAt: Date;
}
```

### Institution
```typescript
{
  id: string;
  name: string;
  userIds: string[];  // Array of teacher IDs
  createdAt: Date;
  updatedAt: Date;
}
```

## UI Design Patterns

### Color Scheme
- Blue: Teachers/Users section
- Green: Upload/Create actions
- Purple: History/Past data
- Orange: Summaries/Insights
- Slate: Primary text and borders

### Card Design
- Consistent border: `border-slate-200`
- Shadow: `shadow-lg` for main cards
- Hover effects: `hover:shadow-md transition-shadow`
- Rounded corners: `rounded-lg` or `rounded-xl`

### Icons Used
- Users: Teacher management
- Plus: Add teacher
- Trash2: Remove teacher
- Mail: Email display
- UserCircle: User avatars
- FileText: Documents/Reports
- TrendingUp: Improvements/Analytics
- Video: Video upload
- Clock: History/Time
- Award: Achievements/Scores

## Error Handling

### Toast Notifications
- Success: "Teacher added successfully", "Teacher removed successfully"
- Errors: "Failed to add teacher", "User with this email not found"
- Access denied: "Access denied - Institution access only"
- Authentication: "Please login to access this page"

### API Error Responses
- 400: Bad request (missing parameters)
- 401: Unauthorized (invalid token)
- 403: Forbidden (wrong role or institution)
- 404: Not found (teacher, institution, or memory not found)
- 500: Internal server error

## Testing Recommendations

1. **Signup Flow**:
   - Create account with "Institution Admin" role
   - Verify institution document created
   - Verify redirect to `/institution/dashboard`

2. **Teacher Management**:
   - Create 2-3 mentor accounts
   - Add them by email to institution
   - Verify they appear in teachers list
   - Remove one teacher
   - Verify teacher's institutionId cleared

3. **Teacher Profiles**:
   - Have teachers upload videos and generate analyses
   - View teacher profile from institution dashboard
   - Verify summaries and top sessions display correctly

4. **Navigation**:
   - Verify Navbar shows institution-specific links
   - Test mobile menu
   - Verify logo links to correct dashboard

5. **Access Control**:
   - Try accessing institution pages as regular user (should redirect)
   - Try accessing regular user pages as institution (should work for upload/history/summaries)
   - Verify teacher profile pages block access from wrong institution

## Future Enhancements (Not Implemented)

- Bulk teacher import via CSV
- Institution-wide analytics dashboard
- Teacher performance comparisons
- Email invitations for teachers (currently requires pre-existing accounts)
- Institution settings page
- Teacher activity logs
- Export reports to PDF
- Institution branding customization

## Notes

- Institution admins can upload videos and view their own analysis (they act as both admin and teacher)
- Teachers maintain independence - they can still use the platform without being part of an institution
- Removing a teacher from an institution doesn't delete their account or data
- Institution admins cannot access teacher accounts directly (only view their summaries and analyses)
- The Insights page is NOT available to institutions (only to regular mentors/coordinators)
