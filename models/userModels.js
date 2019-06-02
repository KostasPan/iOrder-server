const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: { type: String },
  password: { type: String },
  admin: { type: Boolean, default: false },
  total: { type: Number, default: 0 },
  ordersToGo: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema);
