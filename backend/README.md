# Questly Backend

REST API for Questly: authentication, profiles, subjects, tasks, study planner, and notes.

## Tech Stack
- Node.js + Express
- Auth: Passport.js, bcrypt
- DB: Your choice (PostgreSQL)

## Prerequisites
- Node.js LTS
- Package manager: npm
- Database instance (configure in .env)
- Run migration to migrate DB schema

## Getting Started
1. Install
   - npm install
2. Configure env (.env)
   - PORT=5000
   - NODE_ENV=development
   - DATABASE_URL=your_connection_string
   - SESSION_SECRET=your_secret
3. Run
   - npm run dev        # nodemon and migration

## API Summary
- Auth/Profile
  - POST /signup
  - POST /login
  - GET /profile
  - POST /profile/logout
  - PUT /profile/username
  - POST /profile/avatar
  - POST /profile/subject
  - DELETE /profile/subject/:id
- Tasks
  - GET /tasks/
  - POST /tasks/
  - PUT /tasks/:id
  - PATCH /tasks/:id/toggle
  - DELETE /tasks/:id
- Planner
  - GET /planner/
  - POST /planner/
  - PUT /planner/:id
  - DELETE /planner/:id
- Notes
  - GET /notes/
  - POST /notes/
  - PUT /notes/:id
  - DELETE /notes/:id

## Features
- Email/password auth
- Profile: username, avatar, theme, subjects
- Tasks: CRUD, complete, filters
- Study planner: weekly sessions with conflict checks
- Notes: CRUD, by subject

## Non‑Functional Targets
- Security: bcrypt, Passport.js, secure sessions
- Performance: 500+ concurrent users
- Availability: 99% uptime target
- Scalability: data model for growth
