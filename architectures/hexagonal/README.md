# Hexagonal Architecture

This version organizes the app into:

- `domain/` for validation and summary rules
- `application/` for use cases
- `adapters/persistence/` for SQLite repositories
- `adapters/http/` for Express route translation and session loading

The implemented slice covers:

- signup/login/logout with SQLite-backed sessions
- meal entry creation, listing, deletion, and weekly totals
