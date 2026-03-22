const { parseCookies, SESSION_COOKIE } = require('../../../common/security');

function createSessionMiddleware(authUseCases) {
  return async (req, _res, next) => {
    const cookies = parseCookies(req.headers.cookie);
    req.currentUser = await authUseCases.getSessionUser(cookies[SESSION_COOKIE]);
    next();
  };
}

module.exports = createSessionMiddleware;
