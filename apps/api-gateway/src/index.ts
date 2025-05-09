import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import express, { Application } from 'express'; // Removed Request, Response as they are now in route files
import mainRouter from './routes'; // Import the main router
import connectDB from './config/db'; // Import connectDB function
import errorHandler from './middleware/errorHandler'; // Import error handler

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3001');

// Global error handlers
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(reason);
  // Optionally, you might want to close the server gracefully here before exiting
  process.exit(1);
});

const startServer = async () => {
  try {
    await connectDB(); // Attempt to connect to the database

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Mount the main router under /api/v1
    app.use('/api/v1', mainRouter);

    // Centralized error handling middleware - should be last
    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`API Gateway listening on port ${PORT}. API available at /api/v1`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    // The global unhandledRejection or uncaughtException might catch this if it's not handled here,
    // but explicit exit is fine too.
    process.exit(1);
  }
};

startServer();

export default app; // Optional: export app for testing or other purposes 