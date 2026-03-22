const { get, run } = require('../../common/sqlite');

function createAuthRepository(db) {
  return {
    async createAccount({ username, displayName, passwordHash }) {
      await run(
        db,
        'INSERT INTO accounts (username, display_name, password_hash) VALUES (?, ?, ?)',
        [username, displayName, passwordHash]
      );
    },

    async findAccountByUsername(username) {
      return get(
        db,
        'SELECT username, display_name AS displayName, password_hash AS passwordHash FROM accounts WHERE username = ?',
        [username]
      );
    },

    async createSession({ token, username, expiresAt }) {
      await run(
        db,
        'INSERT INTO sessions (token, username, expires_at) VALUES (?, ?, ?)',
        [token, username, expiresAt]
      );
    },

    async deleteSession(token) {
      await run(db, 'DELETE FROM sessions WHERE token = ?', [token]);
    },

    async findSessionUser(token) {
      return get(
        db,
        `
          SELECT
            sessions.token,
            sessions.username,
            sessions.expires_at AS expiresAt,
            accounts.display_name AS displayName
          FROM sessions
          JOIN accounts ON accounts.username = sessions.username
          WHERE sessions.token = ?
        `,
        [token]
      );
    }
  };
}

module.exports = createAuthRepository;
