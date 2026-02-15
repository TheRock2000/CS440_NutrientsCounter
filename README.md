# CS440_NutrientsCounter

## 1) Install

```bash
npm install
```

## 2) Configure env

```bash
cp .env
```

Update `DATABASE_URL` as needed (default local DB: `health_app`).

## 3) Optional DB init

```bash
psql "$DATABASE_URL" -f db/init.sql
```

## 4) Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Initial schema

`db/init.sql` creates one table:

- `accounts(username, password, display_name)`
