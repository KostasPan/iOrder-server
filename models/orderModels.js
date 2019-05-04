const mongoose = require('mongoose');

const orderSchema = mongoose.Schema([
  {
    username: { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
    name: { type: String, default: '' },
    price: { type: Number, default: '' },
    quantity: { type: Number, default: '' },
    choices: [
      {
        type: { type: String, default: '' },
        selected: { type: String, default: '' },
        multiple: { type: Boolean, default: false }
      }
    ],
    comment: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now() }
  }
]);

module.exports = mongoose.model('Order', orderSchema);
