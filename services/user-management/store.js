const path = require('path');

const { get, openDatabase, run } = require('../../shared/sqlite');
const { hashPassword, verifyPassword } = require('../../shared/security');

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS accounts (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

function createUserStore(databasePath) {
  const dbPromise = openDatabase(databasePath, SCHEMA);

  return {
    async createAccount({ username, password, displayName }) {
      const db = await dbPromise;

      await run(
        db,
        'INSERT INTO accounts (username, password_hash, display_name) VALUES (?, ?, ?)',
        [username, hashPassword(password), displayName]
      );

      return { username, displayName };
    },

    async findAccount(username) {
      const db = await dbPromise;
      return get(
        db,
        'SELECT username, display_name AS displayName, password_hash AS passwordHash FROM accounts WHERE username = ?',
        [username]
      );
    },

    async verifyCredentials({ username, password }) {
      const account = await this.findAccount(username);

      if (!account || !verifyPassword(password, account.passwordHash)) {
        return null;
      }

      return {
        username: account.username,
        displayName: account.displayName
      };
    }
  };
}

function defaultDatabasePath() {
  return process.env.SQLITE_PATH || path.join(__dirname, '..', '..', 'data', 'user-management.sqlite');
}

module.exports = {
  createUserStore,
  defaultDatabasePath
};
