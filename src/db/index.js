import mongoose from 'mongoose';
import 'dotenv/config.js';

const { DB_PASS, DB_USER, DB_URI } = process.env;

const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_URI}`;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch((error) => handleError(error));
