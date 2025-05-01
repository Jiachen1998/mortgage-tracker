// transaction.routes.js
const express = require('express');
const router = express.Router();
const Transaction = require('./model');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Date
 *               - Client
 *               - Deposit
 *             properties:
 *               Date:
 *                 type: string
 *                 format: date
 *               Client:
 *                 type: string
 *               Deposit:
 *                 type: number
 *     responses:
 *       201:
 *         description: Transaction created successfully
 */
router.post('/', async (req, res) => {
  try {
    const newtransaction = await Transaction.create(req.body);
    res.status(201).json(newtransaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions
 *     responses:
 *       200:
 *         description: List of all transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Date:
 *                     type: string
 *                     format: date
 *                   Client:
 *                     type: string
 *                   Deposit:
 *                     type: number
 */
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all transactions...');
    const transactions = await Transaction.find();
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get a transaction by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction details
 *       404:
 *         description: Transaction not found
 */
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'GET: transaction not found' });
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Update a transaction
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Date:
 *                 type: string
 *                 format: date
 *               Client:
 *                 type: string
 *               Deposit:
 *                 type: number
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       404:
 *         description: Transaction not found
 */
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

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *       404:
 *         description: Transaction not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedtransaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!deletedtransaction) return res.status(404).json({ error: 'transaction not found' });
    res.status(200).json({ message: 'transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/transactions/bulk:
 *   post:
 *     summary: Bulk upload transactions from CSV
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Transactions uploaded successfully
 *       400:
 *         description: Invalid file format or data
 */
router.post('/bulk', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];
  const errors = [];
  let processed = 0;

  try {
    // Create a readable stream from the buffer
    const stream = Readable.from(req.file.buffer);
    
    // Process the CSV file
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => {
          // Validate required fields
          if (!data.Date || !data.Client || !data.Deposit) {
            errors.push({ row: processed + 1, error: 'Missing required fields' });
            processed++;
            return;
          }

          // Parse the date
          const date = new Date(data.Date);
          if (isNaN(date.getTime())) {
            errors.push({ row: processed + 1, error: 'Invalid date format' });
            processed++;
            return;
          }

          // Parse the deposit amount
          const deposit = parseFloat(data.Deposit);
          if (isNaN(deposit)) {
            errors.push({ row: processed + 1, error: 'Invalid deposit amount' });
            processed++;
            return;
          }

          results.push({
            Date: date,
            Client: data.Client,
            Deposit: deposit
          });
          processed++;
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Bulk upsert the transactions
    const bulkOps = results.map(doc => ({
      updateOne: {
        filter: { 
          Date: doc.Date,
          Client: doc.Client
        },
        update: { $set: doc },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await Transaction.bulkWrite(bulkOps);
    }

    res.status(200).json({
      message: 'Bulk upload completed',
      processed,
      successful: results.length,
      failed: errors.length,
      errors
    });
  } catch (error) {
    console.error('Error processing CSV:', error);
    res.status(500).json({ error: 'Error processing CSV file' });
  }
});

module.exports = router;
