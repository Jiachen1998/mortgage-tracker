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
        title: 'My API',
        version: '1.0.0',
      },
    },
    // Paths to files containing OpenAPI definitions
    apis: ['./routes/*.js'],
  };
const swaggerSpec = swaggerJsdoc(options);

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.listen(3000, () => console.log('Server running on port 3000'));

const port = process.env.PORT || 3001;

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Mount the deposit routes
const transactionRoutes = require('./transactions/routes');
app.use('/api/transactions', transactionRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
