# MVC Architecture

This version organizes the app into:

- `models/` for SQLite-backed data access and summary queries
- `controllers/` for request/response flow and page routing
- shared static views under `architectures/common/public`

The implemented slice covers:

- signup/login/logout with SQLite-backed sessions
- meal entry creation, listing, deletion, and weekly totals
