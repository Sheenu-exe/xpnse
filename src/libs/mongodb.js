import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI;
const MONGODB_URI_FALLBACK = process.env.MONGO_URI_FALLBACK || 'mongodb://127.0.0.1:27017/xpnsr';

if (!MONGODB_URI) {
  console.warn('MONGO_URI is missing. Will rely on fallback.');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    if (MONGODB_URI) {
      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log('MongoDB successfully connected internally (Primary).');
        return mongoose;
      }).catch(err => {
        console.error('Primary MongoDB connection failed:', err.message);
        console.warn('Attempting fallback connection...');
        return mongoose.connect(MONGODB_URI_FALLBACK, opts).then((mongoose) => {
          console.log('MongoDB successfully connected internally (Fallback).');
          return mongoose;
        });
      });
    } else {
      cached.promise = mongoose.connect(MONGODB_URI_FALLBACK, opts).then((mongoose) => {
        console.log('MongoDB successfully connected internally (Fallback).');
        return mongoose;
      });
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
