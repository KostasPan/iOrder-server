const mongoose = require('mongoose');

const tableSchema = mongoose.Schema({
  position_table: String,
  position_table_name: { type: String, default: '' },
  length_tables: { type: Number, default: 0 },
  tables: [{ id: { type: Number, min: 0 }, name: { type: String } }]
});

// data = {
//   positions: [
//     'A',
//     'B',
//     'C'
//   ],
//   table_data: [
//     {
//       position_tables: 'A',
//       position_tables_name: 'A',
//       length_tables: 5,
//       tables: [
//         { id: 1, name: 'A1' },
//         { id: 2, name: 'A2' },
//         { id: 3, name: 'A3' },
//         { id: 4, name: 'A4' },
//         { id: 5, name: 'A5' }
//       ]
//     }
//   ]
// };

module.exports = mongoose.model('Table', tableSchema);
