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
    
    // Helper function to extract client name from column header
    const extractClientName = (header) => {
      // Check if the header ends with " Deposit"
      if (header.endsWith(' Deposit')) {
        // Return everything before " Deposit"
        return header.slice(0, -8); // Remove " Deposit" (8 characters)
      }
      return null;
    };
    
    // Process the CSV file
    await new Promise((resolve, reject) => {
      let headers = null;
      stream
        .pipe(csv())
        .on('headers', (columnHeaders) => {
          // Save headers for later use
          headers = columnHeaders;
          console.log('CSV Headers:', headers);
        })
        .on('data', (data) => {
          // Validate Date field
          if (!data.Date) {
            errors.push({ row: processed + 1, error: 'Missing Date field' });
            processed++;
            return;
          }

          // Parse the date - improved date handling
          let date;
          try {
            console.log('Date string to parse:', data.Date);
            
            // If the date is in format like "Saturday, June 29, 2024"
            if (data.Date.includes(',')) {
              // Remove the day of week part if present
              const dateWithoutDay = data.Date.split(',').slice(1).join(',').trim();
              console.log('Date without day of week:', dateWithoutDay);
              date = new Date(dateWithoutDay);
            } else {
              date = new Date(data.Date);
            }
            
            // Verify the date is valid
            if (isNaN(date.getTime())) {
              throw new Error('Invalid date format');
            }
            
            console.log('Parsed date:', date);
          } catch (error) {
            console.error('Date parsing error:', error);
            errors.push({ row: processed + 1, error: 'Invalid date format: ' + data.Date });
            processed++;
            return;
          }
          
          // Find and process deposit columns
          const depositColumns = headers.filter(header => header.endsWith(' Deposit'));
          
          if (depositColumns.length === 0) {
            errors.push({ row: processed + 1, error: 'No deposit columns found' });
            processed++;
            return;
          }
          
          // Process each client's deposit as a separate transaction
          for (const depositColumn of depositColumns) {
            // Skip if value is empty
            if (!data[depositColumn] || data[depositColumn].trim() === '') {
              continue;
            }
            
            // Extract client name
            const clientName = extractClientName(depositColumn);
            
            if (!clientName) {
              console.warn(`Couldn't extract client name from ${depositColumn}`);
              continue;
            }
            
            // Parse deposit amount - remove commas
            const depositValue = data[depositColumn].replace(/,/g, '');
            const deposit = parseFloat(depositValue);
            
            if (isNaN(deposit)) {
              errors.push({ 
                row: processed + 1, 
                error: `Invalid deposit amount for ${clientName}` 
              });
              continue;
            }
            
            // Create transaction document in the original schema format
            const doc = {
              Date: date,
              Client: clientName,
              Deposit: deposit
            };
            
            console.log('Processed document:', doc);
            results.push(doc);
          }
          
          processed++;
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if(errors.length > 0){
      console.log('Errors:', errors);
    }

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

    console.log(`Preparing to perform ${bulkOps.length} operations`);
    if (bulkOps.length > 0) {
      const result = await Transaction.bulkWrite(bulkOps);
      console.log('Bulk write result:', result);
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
