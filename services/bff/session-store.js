const path = require('path');

const { get, openDatabase, run } = require('../../shared/sqlite');
const { createSessionToken, sessionExpiryIso } = require('../../shared/security');

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    display_name TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

function createSessionStore(databasePath) {
  const dbPromise = openDatabase(databasePath, SCHEMA);

  return {
    async createSession(user) {
      const db = await dbPromise;
      const token = createSessionToken();
      const expiresAt = sessionExpiryIso();

      await run(
        db,
        'INSERT INTO sessions (token, username, display_name, expires_at) VALUES (?, ?, ?, ?)',
        [token, user.username, user.displayName, expiresAt]
      );

      return {
        token,
        user: {
          username: user.username,
          displayName: user.displayName
        }
      };
    },

    async findSession(token) {
      if (!token) {
        return null;
      }

      const db = await dbPromise;
      const session = await get(
        db,
        `
          SELECT
            token,
            username,
            display_name AS displayName,
            expires_at AS expiresAt
          FROM sessions
          WHERE token = ?
        `,
        [token]
      );

      if (!session) {
        return null;
      }

      if (new Date(session.expiresAt).getTime() <= Date.now()) {
        await this.deleteSession(token);
        return null;
      }

      return {
        token: session.token,
        user: {
          username: session.username,
          displayName: session.displayName
        }
      };
    },

    async deleteSession(token) {
      if (!token) {
        return;
      }

      const db = await dbPromise;
      await run(db, 'DELETE FROM sessions WHERE token = ?', [token]);
    }
  };
}

function defaultDatabasePath() {
  return process.env.SQLITE_PATH || path.join(__dirname, '..', '..', 'data', 'bff.sqlite');
}

module.exports = {
  createSessionStore,
  defaultDatabasePath
};
