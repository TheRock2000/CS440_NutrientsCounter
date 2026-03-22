# CS440 Nutrient Tracker Architecture Samples

This repository now includes three local-only implementations of the same small feature slice for the health app:

- `architectures/layered`
- `architectures/mvc`
- `architectures/hexagonal`

Each implementation uses:

- Node.js + Express
- plain HTML/CSS/JavaScript
- SQLite via the `sqlite3` package
- no external database server

## Implemented Feature Slice

Each architecture implements the same two features:

- account signup/login/logout with server-managed sessions
- meal tracking with a weekly nutrition summary

The larger Project 1 scope is intentionally not implemented here.

## Install

```bash
npm install
```

## Run

```bash
npm run start:layered
npm run start:mvc
npm run start:hexagonal
```

Default ports:

- Layered: `3101`
- MVC: `3102`
- Hexagonal: `3103`

Each implementation creates its own SQLite file under `data/` automatically.
