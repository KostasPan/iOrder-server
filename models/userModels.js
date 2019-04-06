const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: { type: String },
  password: { type: String },
  admin: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
