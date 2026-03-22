const {
  buildSessionCookie,
  clearSessionCookie,
  parseCookies,
  SESSION_COOKIE
} = require('../../common/security');

function createAuthController(authModel, architectureName) {
  return {
    loadCurrentUser: async (req, _res, next) => {
      const cookies = parseCookies(req.headers.cookie);
      req.currentUser = await authModel.findUserBySession(cookies[SESSION_COOKIE]);
      next();
    },

    session: (req, res) => {
      res.json({
        architecture: architectureName,
        authenticated: Boolean(req.currentUser),
        user: req.currentUser || null
      });
    },

    signup: async (req, res) => {
      try {
        const { displayName, username, password } = req.body;

        if (!displayName || !username || !password) {
          res.status(400).json({ error: 'Display name, username, and password are required.' });
          return;
        }

        if (password.length < 6) {
          res.status(400).json({ error: 'Password must be at least 6 characters.' });
          return;
        }

        const existingAccount = await authModel.findAccount(username);

        if (existingAccount) {
          res.status(409).json({ error: 'Username already exists.' });
          return;
        }

        await authModel.createAccount({ username, displayName, password });
        const token = await authModel.createSession(username);
        const account = await authModel.findAccount(username);

        res.setHeader('Set-Cookie', buildSessionCookie(token));
        res.status(201).json({
          user: {
            username: account.username,
            displayName: account.displayName
          }
        });
      } catch (error) {
        res.status(500).json({ error: error.message || 'Unable to create account.' });
      }
    },

    login: async (req, res) => {
      try {
        const { username, password } = req.body;

        if (!username || !password) {
          res.status(400).json({ error: 'Username and password are required.' });
          return;
        }

        const account = await authModel.authenticate(username, password);

        if (!account) {
          res.status(401).json({ error: 'Invalid credentials.' });
          return;
        }

        const token = await authModel.createSession(account.username);
        res.setHeader('Set-Cookie', buildSessionCookie(token));
        res.json({
          user: {
            username: account.username,
            displayName: account.displayName
          }
        });
      } catch (error) {
        res.status(500).json({ error: error.message || 'Unable to login.' });
      }
    },

    logout: async (req, res) => {
      const cookies = parseCookies(req.headers.cookie);

      if (cookies[SESSION_COOKIE]) {
        await authModel.deleteSession(cookies[SESSION_COOKIE]);
      }

      res.setHeader('Set-Cookie', clearSessionCookie());
      res.json({ ok: true });
    }
  };
}

module.exports = createAuthController;
