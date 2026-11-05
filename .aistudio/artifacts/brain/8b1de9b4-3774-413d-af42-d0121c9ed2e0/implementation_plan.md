# Coursecraft: YouTube Private Lectures, Gmail Access Whitelist & Gateway Flow

This comprehensive implementation plan transforms Coursecraft into a private, cohort-based academy powered by unlisted YouTube lecture streams, in-app PDF lecture sheets, an intuitive Gateway onboarding page, and Gmail-based private access verification.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed via interactive user requirements:
> 
> - **Gateway Onboarding Page**: A clean first-time decision screen asks visitors *"Are you joining as an Instructor or a Student?"* before authentication.
> - **Student Flow**: Selecting Student presents a single "Sign In with Google" button and routes authenticated students directly to their private learning portal.
> - **Instructor Flow & Dual-View**: Selecting Instructor presents Google Sign-In with administrative capabilities (launching courses, uploading YouTube videos/PDFs, editing student data) and a prominent **Dual-View Switcher** (`Admin Studio` vs. `Student Preview`).
> - **Gmail-Keyed Private Access**: Private course enrollment is enforced strictly via the student's authenticated Gmail address. Instructors manage an allowed Gmail whitelist roster; unlisted emails see an access-request screen.
> - **YouTube Video & In-App PDF Viewer**: Lectures embed YouTube video and playlist links, paired with an integrated in-app PDF lecture sheet reader and direct download button.

---

## 1. Overview & Core Concept

Coursecraft delivers a private video learning portal for educators hosting content on YouTube:
- **Educators / Instructors**: Organize unlisted/private YouTube videos into structured modules, attach PDF lecture sheets, control who gets access by entering student Gmail addresses, and switch seamlessly between Admin and Student views.
- **Students**: Sign in with their authorized Google account, watch embedded YouTube lectures, study lecture sheets in the built-in reader, take timestamped notes, and track completion.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Role Gateway Page (Entry Point)**:
   - When not logged in, users see a branded gateway:
     - Header: *"Coursecraft Private Academy"*
     - Subtitle: *"Sign in with your Google account to access your private lectures and course materials."*
     - **Card 1: Student Portal**: Displays *"I am a Student"* with a prominent *"Sign In with Google"* button.
     - **Card 2: Instructor Portal**: Displays *"I am an Instructor"* with a *"Log In as Instructor"* button.
2. **Gmail Whitelist Verification**:
   - On student Google login, the system matches `currentUser.email` against the course's allowed student list.
   - **Authorized**: Instant access to course lectures, video streaming, and materials.
   - **Unauthorized**: Clean status card displaying: *"Your account (user@gmail.com) has not been invited to this private course yet."* with an instant "Request Access / Refresh" option.
3. **Classroom Player with YouTube & PDF Sheets**:
   - Responsive embedded YouTube player with playback status synchronization.
   - **Lecture Sheet Tab**: Integrated PDF / document viewer displaying lecture notes, formulas, slides, and code summaries, accompanied by a *"Download PDF"* button.
   - Timestamps & Student Notes remain synchronized with video runtime.
4. **Instructor Studio & Dual-View Switcher**:
   - Top bar contains a visible **Dual-View Toggle**: `Viewing as Instructor (Admin)` <---> `Previewing as Student`.
   - **YouTube & Lecture Sheet Uploader**: Paste any YouTube link (`youtube.com/watch?v=...`, `youtu.be/...`, or playlist URL), upload/link PDF lecture sheets, and attach interactive checkpoint quizzes.
   - **Gmail Whitelist Manager**: Add, remove, or bulk-paste student Gmail addresses with instant access provisioning.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: YouTube Embed with Fallback Iframe Player**
  - *Chosen Approach*: Lightweight, responsive YouTube iframe embed with regex parser for all standard formats (`watch?v=`, `youtu.be/`, `/embed/`, and `playlist?list=`).
  - *Why*: Reliable streaming without hosting costs; respects YouTube's bandwidth and unlisted video privacy settings.
- **Decision 2: Gmail Whitelist Access Control**
  - *Chosen Approach*: Course entities store an `allowedStudentEmails: string[]` array. Checking `allowedStudentEmails.includes(currentUser.email)` enforces private cohort security.
  - *Why*: Simple, robust, and directly aligns with the user's requirement to use Gmail addresses as access keys.
- **Decision 3: In-App PDF Lecture Sheet Reader**
  - *Chosen Approach*: Interactive document preview drawer rendering formatted lecture slides, typography, diagrams, and downloadable PDF assets.
  - *Why*: Allows students to study notes directly alongside video lectures without leaving the application or switching tabs.

---

## 4. Technical Architecture & System Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Coursecraft Application                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Gateway Onboarding Screen                     │  │
│  │     [Join as Student (Google)]    │   [Join as Instructor]       │  │
│  └───────────────────────────────────┴──────────────────────────────┘  │
│                         │                            │                 │
│                         ▼                            ▼                 │
│  ┌───────────────────────────────┐     ┌────────────────────────────┐  │
│  │     Student Portal View       │     │  Instructor Admin Studio   │  │
│  │  • Gmail Whitelist Guard      │     │  • Dual-View Mode Switch   │  │
│  │  • Enrolled Courses           │     │  • YouTube Video Uploader  │  │
│  │  • YouTube Classroom Player   │     │  • PDF Lecture Sheet Link  │  │
│  │  • In-App PDF Sheet Viewer    │     │  • Gmail Whitelist Manager │  │
│  │  • Timestamp Notes & Quizzes  │     │  • Student Progress Roster │  │
│  └───────────────────────────────┘     └────────────────────────────┘  │
│                         │                            │                 │
│                         ▼                            ▼                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │               CourseContext & Firebase Authentication            │  │
│  │  - currentUser: { uid, name, email, avatar, role }               │  │
│  │  - allowedEmails check & whitelist mutation                      │  │
│  │  - Course state with YouTube URLs and PDF resources             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Data Model Updates

```typescript
export interface Lesson {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  videoUrl: string; // YouTube URL or direct MP4
  videoType: 'youtube' | 'sample' | 'blob';
  youtubeVideoId?: string;
  pdfLectureSheet?: {
    title: string;
    pdfUrl?: string;
    fileSize?: string;
    contentSummary?: string;
    keyPoints?: string[];
  };
  timestamps?: VideoTimestamp[];
  quiz?: QuizQuestion[];
}

export interface Course {
  // Existing course fields...
  isPrivateCohort?: boolean;
  allowedStudentEmails: string[]; // Whitelist of student Gmail addresses
}
```
