require('dotenv').config();
const app = require('./app');
const { redis } = require('./redis');

const port = process.env.PORT || 3001;
redis.connect().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
