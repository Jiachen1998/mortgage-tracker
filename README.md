# Mortgage Tracker

A full-stack application for tracking mortgage payments with a React frontend and Node.js backend.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (for database)
- npm or yarn package manager

## Project Structure

```
mortgage-tracker/
├── backend/           # Node.js server
│   ├── transactions/  # Transaction-related routes and models
│   └── server.js      # Main server file
└── ui/               # React frontend
    └── src/          # Source code
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=3002
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   Or using the provided PowerShell script:
   ```bash
   ./run-server.ps1
   ```

The backend server will run on `http://localhost:3002`.

### Frontend Setup

1. Navigate to the UI directory:
   ```bash
   cd ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend application will run on `http://localhost:3000`.

## Running the Application

1. Ensure both backend and frontend servers are running
2. Open your browser and navigate to `http://localhost:3000`
3. You should see the admin dashboard with options to:
   - View transactions
   - Make new payments
   - View analytics

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions/:id` - Get a specific transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction

## Troubleshooting

If you encounter any issues:

1. Ensure MongoDB is properly connected by checking the backend console
2. Verify both servers are running on the correct ports
3. Check the browser console for any frontend errors
4. Ensure all environment variables are properly set

## Development

- Backend uses Express.js with MongoDB
- Frontend uses React with TypeScript and Chakra UI
- API documentation is available via Swagger UI at `http://localhost:3002/api-docs`