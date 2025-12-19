const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const app = require('./app');
const { redis } = require('./redis');

const port = process.env.PORT || 3001;
redis.connect().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
