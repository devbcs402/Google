import mongoose from 'mongoose';
import { CATEGORIES, PROVIDERS } from '../utils/validation.js';

const importantLinkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    url: { type: String, required: true, trim: true, maxlength: 2048 }
  },
  { _id: false }
);

const emailAccountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    emailAddress: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    label: { type: String, required: true, trim: true, maxlength: 100 },
    provider: { type: String, enum: PROVIDERS, default: 'Other' },
    category: { type: String, enum: CATEGORIES, default: 'Personal' },
    purpose: { type: String, trim: true, maxlength: 2000, default: '' },
    storageDetails: { type: String, trim: true, maxlength: 1000, default: '' },
    importantLinks: { type: [importantLinkSchema], default: [] },
    notes: { type: String, trim: true, maxlength: 2000, default: '' },
    isFavorite: { type: Boolean, default: false }
  },
  { timestamps: true }
);

emailAccountSchema.index({ userId: 1, updatedAt: -1 });
emailAccountSchema.index({ userId: 1, emailAddress: 1 }, { unique: true });

export default mongoose.model('EmailAccount', emailAccountSchema);
