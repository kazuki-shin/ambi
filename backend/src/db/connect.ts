import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('Error: MONGODB_URI is not defined in the environment variables.');
    process.exit(1); // Exit the process if the DB URI is missing
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
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB; 