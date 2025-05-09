import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import express, { Application } from 'express'; // Removed Request, Response as they are now in route files
import mainRouter from './routes'; // Import the main router
import connectDB from './config/db'; // Import connectDB function

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3001');

const startServer = async () => {
  try {
    await connectDB(); // Attempt to connect to the database

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Mount the main router under /api/v1
    app.use('/api/v1', mainRouter);

    app.listen(PORT, () => {
      console.log(`API Gateway listening on port ${PORT}. API available at /api/v1`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app; // Optional: export app for testing or other purposes 