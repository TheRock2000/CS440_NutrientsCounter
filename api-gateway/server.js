const dotenv = require('dotenv');

const { createGatewayApp } = require('./app');

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = createGatewayApp();

app.listen(PORT, () => {
  console.log(`API Gateway running at http://localhost:${PORT}`);
});
