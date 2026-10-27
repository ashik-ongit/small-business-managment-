import mongoose from 'mongoose';
const opts = { timestamps: true };
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['owner', 'staff'], default: 'owner' },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
}, opts);
const BusinessSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  ownerEmail: { type: String, required: true, lowercase: true, trim: true },
  currency: { type: String, default: 'INR' },
}, opts);
const TransactionSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  kind: { type: String, required: true, enum: ['sales', 'expenses'] },
  amountPaise: { type: Number, required: true, min: 1, max: 99999999999 },
  paymentMethod: { type: String, enum: ['Cash','UPI','Card'] },
  category: { type: String, enum: ['Stock','Rent','Electricity','Staff Salary'] },
  description: { type: String, maxlength: 200, default: '' },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, opts);
TransactionSchema.index({ businessId: 1, kind: 1, date: -1 });
export const User = mongoose.model('User', UserSchema);
export const Business = mongoose.model('Business', BusinessSchema);
export const Transaction = mongoose.model('Transaction', TransactionSchema);
