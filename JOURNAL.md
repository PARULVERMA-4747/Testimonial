# Journal

## Decisions made
- Built a compact React + Express + SQLite testimonial platform to satisfy the P0 loop quickly.
- Kept the moderation dashboard unprotected because the assignment explicitly allows a hardcoded dashboard.
- Chose an iframe-based widget demo for the embeddable experience because it is simple to drop onto a third-party page.

## What worked well
- The submission form, moderation review flow, and public wall all share the same persistence layer.
- The SQLite database keeps the app self-contained and easy to run without external services.

## What is incomplete
- There is no authentication or user management.
- The widget currently uses placeholder testimonial content rather than the live approved dataset.
- There is no pagination or advanced moderation features beyond approve/reject.

## Verification
- Frontend build succeeded with `npm run build`.
- Database regression test passed with `node --test tests/db.test.js`.
- API submission and pending-list checks succeeded via `curl` against `http://localhost:3001/api/testimonials`.
