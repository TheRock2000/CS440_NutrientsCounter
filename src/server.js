const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'home', 'index.html'));
});

app.get('/login', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login', 'index.html'));
});

app.get('/signup', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'signup', 'index.html'));
});

app.get('/account', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'account', 'index.html'));
});

app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/api/signup', async (req, res) => {
  const { username, password, display_name: displayName } = req.body;

  if (!username || !password || !displayName) {
    return res.status(400).json({ error: 'username, password, and display_name are required' });
  }

  try {
    await db.query(
      'INSERT INTO accounts (username, password, display_name) VALUES ($1, $2, $3)',
      [username, password, displayName]
    );

    return res.status(201).json({ ok: true });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Username already exists' });
    }

    return res.status(500).json({ error: 'Unable to create account' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  try {
    const result = await db.query(
      'SELECT username, display_name FROM accounts WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.json({ ok: true, user: result.rows[0] });
  } catch {
    return res.status(500).json({ error: 'Unable to login' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
