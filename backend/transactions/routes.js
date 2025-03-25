// transaction.routes.js
const express = require('express');
const router = express.Router();
const Transaction = require('./model');

// CREATE - Add a new transaction
router.post('/', async (req, res) => {
  try {
    const newtransaction = await Transaction.create(req.body);
    res.status(201).json(newtransaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ - Get all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ - Get a single transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'GET: transaction not found' });
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Update a transaction by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedtransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedtransaction) return res.status(404).json({ error: 'PUT: transaction not found' });
    res.status(200).json(updatedtransaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE - Remove a transaction by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedtransaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!deletedtransaction) return res.status(404).json({ error: 'transaction not found' });
    res.status(200).json({ message: 'transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
