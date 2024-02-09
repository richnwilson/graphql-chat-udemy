import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function connectDB () {
  try {
    const options = {
      tlsCAFile: `${__dirname}/cert.cer`,
      tls: true,
      tlsAllowInvalidCertificates: true,
      autoIndex: false
    }
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`Connected to MongoDB [ ${process.env.DBNAME} ] succesfully...`);
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};