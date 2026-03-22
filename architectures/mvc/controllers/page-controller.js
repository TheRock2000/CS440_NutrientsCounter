const path = require('path');

function createPageController(publicDir) {
  function sendPage(relativePath) {
    return (_req, res) => {
      res.sendFile(path.join(publicDir, relativePath));
    };
  }

  return {
    home: sendPage('home/index.html'),
    login: sendPage('login/index.html'),
    signup: sendPage('signup/index.html'),
    tracker: sendPage('tracker/index.html')
  };
}

module.exports = createPageController;
