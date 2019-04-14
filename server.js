const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
// const cors = require('cors');
// const logger = require('morgan');

const app = express();

//app.use(cors());

const dbConfig = require('./config/secret');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Methods',
    'GET',
    'POST',
    'DELETE',
    'PUT',
    'OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-Width, Content-Type, Accept, Authorization'
  );
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
// app.use(logger('dev'));

mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, { useNewUrlParser: true });

const auth = require('./routes/authRoutes');
const table = require('./routes/tableRoutes');
const order = require('./routes/orderRoutes');
const product = require('./routes/productRoutes');

app.use('/api/iorder', auth);
app.use('/api/iorder', table);
app.use('/api/iorder', order);
app.use('/api/iorder', product);

app.listen(3000, () => {
  console.log('Running on port 3000');
});
