CREATE TABLE IF NOT EXISTS accounts (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  display_name TEXT NOT NULL
);
