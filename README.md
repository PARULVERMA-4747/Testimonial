# SaleShandy testimonials

A lightweight testimonial platform with a public submission form, moderation dashboard, public wall, and embeddable widget demo.

## What is included

- Customer testimonial submission form
- SQLite-backed API for persistence
- Moderation dashboard with approve/reject actions
- Public wall that only shows approved testimonials
- Simple iframe-based widget demo page

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the backend:
   ```bash
   node server/index.js
   ```
3. Start the frontend in a second terminal:
   ```bash
   npm run dev
   ```
4. Open:
   - Frontend: http://localhost:5173
   - API health: http://localhost:3001/health
   - Widget demo: http://localhost:5173/widget-demo.html

## Verification

- Frontend build: `npm run build`
- Database test: `node --test tests/db.test.js`
