const {
  buildSessionCookie,
  clearSessionCookie,
  createSessionToken,
  hashPassword,
  sessionExpiryIso,
  verifyPassword
} = require('../../common/security');
const { validateCredentials } = require('../domain/validators');

function createAuthUseCases(authRepository) {
  return {
    async register(input) {
      validateCredentials(input, { requireDisplayName: true });

      const existingAccount = await authRepository.findAccountByUsername(input.username);

      if (existingAccount) {
        const error = new Error('Username already exists.');
        error.statusCode = 409;
        throw error;
      }

      await authRepository.createAccount({
        username: input.username,
        displayName: input.displayName,
        passwordHash: hashPassword(input.password)
      });

      return this.createSessionForUser(input.username);
    },

    async login(input) {
      validateCredentials(input);
      const account = await authRepository.findAccountByUsername(input.username);

      if (!account || !verifyPassword(input.password, account.passwordHash)) {
        const error = new Error('Invalid credentials.');
        error.statusCode = 401;
        throw error;
      }

      return this.createSessionForUser(account.username);
    },

    async createSessionForUser(username) {
      const account = await authRepository.findAccountByUsername(username);
      const token = createSessionToken();

      await authRepository.createSession({
        token,
        username,
        expiresAt: sessionExpiryIso()
      });

      return {
        cookie: buildSessionCookie(token),
        user: {
          username: account.username,
          displayName: account.displayName
        }
      };
    },

    async getSessionUser(token) {
      if (!token) {
        return null;
      }

      const sessionUser = await authRepository.findSessionUser(token);

      if (!sessionUser) {
        return null;
      }

      if (new Date(sessionUser.expiresAt).getTime() <= Date.now()) {
        await authRepository.deleteSession(token);
        return null;
      }

      return {
        token: sessionUser.token,
        username: sessionUser.username,
        displayName: sessionUser.displayName
      };
    },

    async logout(token) {
      if (token) {
        await authRepository.deleteSession(token);
      }

      return clearSessionCookie();
    }
  };
}

module.exports = createAuthUseCases;
