const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
// const logger = require('morgan');

const app = express();

app.use(cors());

const dbConfig = require('./config/secret');
const printer = require('./printer/printer');
const auth = require('./routes/authRoutes');
const table = require('./routes/tableRoutes');
const order = require('./routes/orderRoutes');
const product = require('./routes/productRoutes');
const total = require('./routes/totalRoutes');
const user = require('./routes/userRoutes');
const discount = require('./routes/discountRoutes');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
// app.use(logger('dev'));

mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/api/iorder', auth);
app.use('/api/iorder', table);
app.use('/api/iorder', order);
app.use('/api/iorder', product);
app.use('/api/iorder', total);
app.use('/api/iorder', user);
app.use('/api/iorder', discount);

app.listen(3000, () => {
  console.log('Running on port 3000');
  // printer
  //   .initPrinter()
  //   .then(() => console.log('Printer ready!'))
  //   .catch((err) => {
  //     console.log('Printer error:', err);
  //   });
});
