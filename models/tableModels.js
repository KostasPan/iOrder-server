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
      user: { type: String, default: '' }
    }
  ]
});

module.exports = mongoose.model('Table', tableSchema);
