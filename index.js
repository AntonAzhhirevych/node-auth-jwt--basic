const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
//import routes
// const authRoute = require('./modules/routes/auth');
const authRoute = require('./modules/auth/auth.router')
const newsRoute = require('./modules/news/news.router');

dotenv.config();

//db
mongoose.connect(
  process.env.DB_CONNECTION,
  { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true },
  () => console.log('connected to database'),
);

//middlewares
app.use(express.json());

//routes
app.use('/api/user', authRoute);
app.use('/api', newsRoute);

app.listen(process.env.APP_PORT, () => console.log('server up and started'));
