const {
  buildSessionCookie,
  clearSessionCookie,
  createSessionToken,
  hashPassword,
  sessionExpiryIso,
  verifyPassword
} = require('../../common/security');

function createAuthService(authRepository) {
  return {
    async register({ username, password, displayName }) {
      validateAuthPayload({ username, password, displayName });

      const existingAccount = await authRepository.findAccountByUsername(username);

      if (existingAccount) {
        const error = new Error('Username already exists.');
        error.statusCode = 409;
        throw error;
      }

      await authRepository.createAccount({
        username,
        displayName,
        passwordHash: hashPassword(password)
      });

      return this.createSessionForUser(username);
    },

    async login({ username, password }) {
      if (!username || !password) {
        const error = new Error('Username and password are required.');
        error.statusCode = 400;
        throw error;
      }

      const account = await authRepository.findAccountByUsername(username);

      if (!account || !verifyPassword(password, account.passwordHash)) {
        const error = new Error('Invalid credentials.');
        error.statusCode = 401;
        throw error;
      }

      return this.createSessionForUser(account.username);
    },

    async createSessionForUser(username) {
      const account = await authRepository.findAccountByUsername(username);
      const token = createSessionToken();
      const expiresAt = sessionExpiryIso();

      await authRepository.createSession({
        token,
        username,
        expiresAt
      });

      return {
        cookie: buildSessionCookie(token),
        user: {
          username: account.username,
          displayName: account.displayName
        }
      };
    },

    async logout(token) {
      if (token) {
        await authRepository.deleteSession(token);
      }

      return clearSessionCookie();
    },

    async getSessionUser(token) {
      if (!token) {
        return null;
      }

      const session = await authRepository.findSessionUser(token);

      if (!session) {
        return null;
      }

      if (new Date(session.expiresAt).getTime() <= Date.now()) {
        await authRepository.deleteSession(token);
        return null;
      }

      return {
        username: session.username,
        displayName: session.displayName,
        token: session.token
      };
    }
  };
}

function validateAuthPayload({ username, password, displayName }) {
  if (!displayName || !username || !password) {
    const error = new Error('Display name, username, and password are required.');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error('Password must be at least 6 characters.');
    error.statusCode = 400;
    throw error;
  }
}

module.exports = createAuthService;
