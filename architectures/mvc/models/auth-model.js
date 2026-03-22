const { get, run } = require('../../common/sqlite');
const {
  createSessionToken,
  hashPassword,
  sessionExpiryIso,
  verifyPassword
} = require('../../common/security');

function createAuthModel(db) {
  return {
    async createAccount({ username, displayName, password }) {
      await run(
        db,
        'INSERT INTO accounts (username, display_name, password_hash) VALUES (?, ?, ?)',
        [username, displayName, hashPassword(password)]
      );
    },

    async createSession(username) {
      const token = createSessionToken();
      const expiresAt = sessionExpiryIso();

      await run(
        db,
        'INSERT INTO sessions (token, username, expires_at) VALUES (?, ?, ?)',
        [token, username, expiresAt]
      );

      return token;
    },

    async deleteSession(token) {
      await run(db, 'DELETE FROM sessions WHERE token = ?', [token]);
    },

    async findAccount(username) {
      return get(
        db,
        'SELECT username, display_name AS displayName, password_hash AS passwordHash FROM accounts WHERE username = ?',
        [username]
      );
    },

    async authenticate(username, password) {
      const account = await this.findAccount(username);

      if (!account || !verifyPassword(password, account.passwordHash)) {
        return null;
      }

      return account;
    },

    async findUserBySession(token) {
      const session = await get(
        db,
        `
          SELECT
            sessions.token,
            sessions.expires_at AS expiresAt,
            accounts.username,
            accounts.display_name AS displayName
          FROM sessions
          JOIN accounts ON accounts.username = sessions.username
          WHERE sessions.token = ?
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
        username: session.username,
        displayName: session.displayName
      };
    }
  };
}

module.exports = createAuthModel;
