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

// ... existing code ... 