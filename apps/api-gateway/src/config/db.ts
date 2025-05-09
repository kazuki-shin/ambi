import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('Error: MONGODB_URI is not defined in the environment variables.');
    // Exit only if not in test environment
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    return; // Return in test environment to allow tests to run
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected...');
  } catch (err: any) { // Added type for err
    console.error('MongoDB connection error:', err.message);
    // Exit process with failure only if not in test environment
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

export default connectDB; 