const mongoose = require('mongoose');

const TransactionModel = new mongoose.Schema({
  Date: { type: Date, required: true },
  Client: { type: String, required: true },
  Deposit: { type: Number, required: true }
}, {
  versionKey: false // This removes the __v field from the response
});

module.exports = mongoose.model('Transaction', TransactionModel, 'transactions');
