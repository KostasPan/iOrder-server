const mongoose = require('mongoose');

const totalSchema = mongoose.Schema([
  {
    username: { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    total: { type: Number, default: 0 },
    ordersToGo: { type: Number, default: 0 }
  }
]);

module.exports = mongoose.model('Total', totalSchema);
