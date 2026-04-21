const dotenv = require('dotenv');

const { createHealthStatsApp } = require('./app');

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = createHealthStatsApp();

app.listen(PORT, () => {
  console.log(`Health stats service running at http://localhost:${PORT}`);
});
