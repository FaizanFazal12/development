const express = require('express');
const dotenv = require('dotenv');
const  errorMiddleware  = require('./middlewares/errorMiddleware');
const  router  = require('./routers');
const { connectToDatabase } = require('./connect');
const app = express();
const cookieParser = require("cookie-parser");
const port = process.env.PORT ||  3000;
dotenv.config();

app.use(cookieParser());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Default route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/v1',router)
app.use(errorMiddleware);


connectToDatabase();

// Start the server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
