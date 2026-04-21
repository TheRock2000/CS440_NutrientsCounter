const dotenv = require('dotenv');

const { createBffApp } = require('./app');

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = createBffApp();

app.listen(PORT, () => {
  console.log(`BFF service running at http://localhost:${PORT}`);
});
