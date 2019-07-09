const mongoose = require('mongoose');

const tableSchema = mongoose.Schema({
  position_table: String,
  position_table_name: { type: String, default: '' },
  length_tables: { type: Number, default: 0 },
  tables: [
    {
      id: { type: Number, min: 0 },
      name: { type: String },
      busy: { type: Boolean, default: false },
      user: { type: String, default: '' },
      orderTime: { type: Date },
      discount: {
        isDiscountActive: { type: Boolean, default: false },
        discountedtotal: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        type: { type: String, default: '' },
        discountStr: { type: String, default: '' }
      }
    }
  ]
});

module.exports = mongoose.model('Table', tableSchema);
