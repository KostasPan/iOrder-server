const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  // table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  user: { type: String, default: '' },
  price: { type: Number, default: '' },
  products: [String],
  createdAt: { type: Date, default: Date.now() }
});

module.exports = mongoose.model('Order', orderSchema);
