const dotenv = require('dotenv');

const { createUserManagementApp } = require('./app');

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = createUserManagementApp();

app.listen(PORT, () => {
  console.log(`User management service running at http://localhost:${PORT}`);
});
