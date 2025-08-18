# Questly Frontend

React app built with Vite for Questly. Provides UI for authentication, dashboard, tasks, planner, notes, and profile.

## Tech Stack
- React + Vite
- Routing: React Router
- API: fetch/axios to Express backend

## Prerequisites
- Node.js LTS
- Backend API running (see backend README)

## Getting Started
1. Install
   - npm install
2. Env (.env)
   - VITE_API_BASE_URL=http://localhost:5000
3. Run
   - npm run dev


## App Features (UI)
- Auth pages: Sign Up / Login
- Dashboard: daily overview, study streak, motivational quote, quick actions
- Tasks: CRUD, complete, filters (All, Today, This Week, Subject)
- Study Planner: weekly view, create/edit/delete sessions; conflict feedback
- Notes: CRUD, filter by subject
- Profile/Settings: username, avatar, theme (light/dark), subjects management
- Landing page: public marketing page with CTA

## Theming
- Light/Dark toggle; persist preference (localStorage)

