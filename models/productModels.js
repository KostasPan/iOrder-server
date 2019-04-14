const mongoose = require('mongoose');

// did not checked
const productSchema = mongoose.Schema({
  category: { type: String, default: '' },
  name: { type: String, default: '' },
  shortName: { type: String, default: '' },
  price: { type: Number, default: '' },
  priceTag: { type: String, default: '' },
  station: { type: String, default: '' },
  details: { type: Array, default: [] }
});

module.exports = mongoose.model('Product', productSchema);
