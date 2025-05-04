import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('Error: MONGODB_URI is not defined in the environment variables.');
    // Exit only if not in test environment
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1); 
    }
    return; // Don't proceed if URI is missing
  }

  // Skip actual MongoDB connection in test environment
  if (process.env.NODE_ENV === 'test') {
    console.log('Test environment detected. Skipping MongoDB connection.');
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected...');
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('MongoDB connection error:', err.message);
    } else {
      console.error('An unknown error occurred during MongoDB connection');
    }
    // Exit process with failure only if not in test environment
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

export default connectDB;   