import mongoose from 'mongoose';
import '../db/index.js';

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  branch: { type: Number, required: true },
  oldBranch: { type: Number },
  accountNumber: { type: Number, required: true },
  balance: {
    type: Number,
    required: true,
    min: [0.0, 'Balance should be positive'],
  },
});

const Account = mongoose.model('Account', schema, 'account');

export default Account;
