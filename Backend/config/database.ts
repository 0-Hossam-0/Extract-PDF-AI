import mongoose from 'mongoose';

let gfs: mongoose.mongo.GridFSBucket;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI!);
    console.log('MongoDB connected');
    if (conn.connection.db) {
      gfs = new mongoose.mongo.GridFSBucket(conn.connection.db, {
        bucketName: 'pdfs',
      });
    }
    console.log('GridFSBucket initialized');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Getter for GridFSBucket
export const getGFS = (): mongoose.mongo.GridFSBucket => {
  if (!gfs) {
    throw new Error('GridFSBucket not initialized. Call connectDB first.');
  }
  return gfs;
};

export default connectDB;
