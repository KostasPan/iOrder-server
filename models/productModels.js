const mongoose = require('mongoose');

// did not checked
const productSchema = mongoose.Schema({
  category: { type: String, default: '' },
  name: { type: String, default: '' },
  price: { type: Number, default: 0 },
  priceTag: { type: String, default: 'eu' },
  station: { type: String, default: '0.0.0.0' },
  details: { type: Array, default: [] },
  detailsoptional: { type: Array, default: [] }
});

module.exports = mongoose.model('Product', productSchema);
