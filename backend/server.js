// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Define swagger-jsdoc options
const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Transaction API',
        version: '1.0.0',
        description: 'API for managing transactions'
      },
      components: {
        schemas: {
          Transaction: {
            type: 'object',
            required: ['Date', 'Client', 'Deposit'],
            properties: {
              Date: {
                type: 'string',
                format: 'date',
                description: 'Transaction date'
              },
              Client: {
                type: 'string',
                description: 'Client name'
              },
              Deposit: {
                type: 'number',
                description: 'Deposit amount'
              }
            }
          }
        }
      }
    },
    apis: ['./transactions/routes.js'], // Path to the API routes
};
const swaggerSpec = swaggerJsdoc(options);

// Get port from environment variable or use default
const port = process.env.PORT || 3002;

// Middleware to parse JSON
app.use(express.json());

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Connect to MongoDB with specific database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'mortgage-tracker' // Explicitly specify database name
})
.then(() => {
  console.log('Connected to MongoDB Database:', mongoose.connection.db.databaseName);
  console.log('Available collections:', mongoose.connection.collections);
})
.catch(err => console.error('MongoDB connection error:', err));

// Mount the deposit routes
const transactionRoutes = require('./transactions/routes');
app.use('/api/transactions', transactionRoutes);

// Start server (only once!)
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
