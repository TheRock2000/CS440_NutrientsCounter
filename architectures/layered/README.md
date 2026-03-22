# Layered Architecture

This version separates the app into:

- `repositories/` for SQLite persistence
- `services/` for business rules and weekly summary logic
- `server.js` for route wiring and HTTP concerns

The implemented slice covers:

- signup/login/logout with SQLite-backed sessions
- meal entry creation, listing, deletion, and weekly totals
