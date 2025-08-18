# Questly

A student productivity app that brings tasks, study sessions, and notes into one place—securely and simply.

## Overview
Questly helps students plan their week, track assignments, and organize notes by subject. It includes authentication, profile customization, and a public landing page.

## Features
- Authentication & Profile: Email/password login, edit username, avatar, theme (light/dark), manage subjects.
- Study Planner: Add/edit/delete weekly sessions, conflict detection, weekday view.
- Tasks: Create/edit/delete, complete, due dates, filter by All/Today/This Week/Subject.
- Notes: Create/edit/delete, filter by All or Subject.
- Landing Page: Public homepage with features, audience, and Sign Up CTA.

## Non‑Functional
- Performance: Smooth for 500+ concurrent users.
- Security: bcrypt password hashing, secure sessions (Passport.js).
- Scalability: Data model designed for growing users/sessions/tasks.
- Usability: Simple, student‑friendly UI.
- Availability: Target 99% uptime.

## API Endpoints (summary)
- Auth/Profile: `/signup`, `/login`, `/profile`, `/profile/logout`, `/profile/username`, `/profile/avatar`, `/profile/subject`
- Tasks: `/tasks/`, `/tasks/:id`, `/tasks/:id/toggle`
- Planner: `/planner/`, `/planner/:id`
- Notes: `/notes/`, `/notes/:id`

## Testing Highlights
Covers happy paths and validation errors for signup/login, profile updates, subjects, tasks, planner sessions (including time conflicts), and notes.

## Getting Started
1. Clone the repo
2. Install dependencies: `npm install` (for both frontend and backend folders)
3. Set environment variables (DB URL, session secret, etc.)
4. Run dev server: `npm run dev` (to run both the database migration and nodemon server.js)
5. Run dev client: `npm run dev` (to start client react app)

## Tech Stack (planned)
- Backend: Node.js + Express
- Auth: Passport.js, bcrypt
- Database: PostgreSQL
- Frontend: React (java script)
