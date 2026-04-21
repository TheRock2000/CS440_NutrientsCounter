# CS440 Health App Microservices

This project replaces the architecture comparison example with a local microservices deployment:

- `user-management`: account creation and password verification.
- `health-stats`: meal entries and weekly nutrition summaries.
- `bff`: browser-facing backend, static UI, and session storage.
- `api-gateway`: external entry point and request router.

Each stateful service owns a separate SQLite database. Docker Compose mounts those databases as independent volumes so services do not share storage.

## Install

```bash
npm install
```

## Run With Docker Compose

```bash
docker compose up --build
```

Open `http://localhost:3000`.

## Run Locally Without Docker

Start each service in a separate terminal:

```bash
npm run dev:user-management
npm run dev:health-stats
npm run dev:bff
npm run dev:gateway
```

The API Gateway listens on `http://localhost:3000`.

## API Routes

Browser traffic goes through the API Gateway:

- `/`, `/login`, `/signup`, `/tracker`
- `/api/session`
- `/api/signup`
- `/api/login`
- `/api/logout`
- `/api/meals`
- `/api/summary/weekly`

The gateway also exposes service namespaces for testing:

- `/api/users/*` routes to `user-management`
- `/api/health-stats/*` routes to `health-stats`

## Verify

```bash
npm test
npm run lint
```
