const express = require('express');
const dotenv = require('dotenv');
const { default: errorMiddleware } = require('./middlewares/errorMiddleware');
const { default: router } = require('./routers');
const app = express();
const port = process.env.PORT ||  3000;
dotenv.config();
// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Default route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/v1',router)
app.use(errorMiddleware());

// Start the server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
