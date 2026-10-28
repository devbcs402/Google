import mongoose from 'mongoose';
import EmailAccount from '../models/EmailAccount.js';
import { CATEGORIES, validateAccount } from '../utils/validation.js';

function validId(id) {
  return mongoose.isObjectIdOrHexString(id);
}

export async function listAccounts(req, res, next) {
  const { search, category, favorite } = req.query;
  if (search !== undefined && (typeof search !== 'string' || search.length > 100)) {
    return res.status(400).json({ message: 'Search must be 100 characters or fewer.' });
  }
  if (category !== undefined && (typeof category !== 'string' || (category !== 'All' && !CATEGORIES.includes(category)))) {
    return res.status(400).json({ message: 'Choose a valid category filter.' });
  }
  if (favorite !== undefined && !['true', 'false'].includes(favorite)) {
    return res.status(400).json({ message: 'Favorite filter must be true or false.' });
  }
  try {
    const filter = { userId: req.user.id };
    const searchTerm = typeof search === 'string' ? search.trim() : '';
    if (searchTerm) {
      const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = ['emailAddress', 'label', 'purpose', 'category'].map((field) => ({
        [field]: { $regex: escaped, $options: 'i' }
      }));
    }
    if (category && category !== 'All') filter.category = category;
    if (favorite !== undefined) filter.isFavorite = favorite === 'true';
    const accounts = await EmailAccount.find(filter).sort({ isFavorite: -1, updatedAt: -1 }).lean();
    return res.json({ accounts });
  } catch (error) {
    return next(error);
  }
}

export async function getAccount(req, res, next) {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid account identifier.' });
  try {
    const account = await EmailAccount.findOne({ _id: req.params.id, userId: req.user.id }).lean();
    if (!account) return res.status(404).json({ message: 'Account not found.' });
    return res.json({ account });
  } catch (error) {
    return next(error);
  }
}

export async function createAccount(req, res, next) {
  const { errors, value } = validateAccount(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Please correct the highlighted fields.', errors });
  try {
    const existing = await EmailAccount.findOne({ userId: req.user.id, emailAddress: value.emailAddress });
    if (existing) {
      return res.status(409).json({
        message: 'You already have an account saved with this email address.',
        errors: { emailAddress: 'This email address is already saved in your vault.' }
      });
    }
    const account = await EmailAccount.create({ ...value, userId: req.user.id });
    return res.status(201).json({ account });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'You already have an account saved with this email address.',
        errors: { emailAddress: 'This email address is already saved in your vault.' }
      });
    }
    return next(error);
  }
}

export async function updateAccount(req, res, next) {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid account identifier.' });
  const { errors, value } = validateAccount(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Please correct the highlighted fields.', errors });
  try {
    if (value.emailAddress) {
      const duplicate = await EmailAccount.findOne({
        _id: { $ne: req.params.id },
        userId: req.user.id,
        emailAddress: value.emailAddress
      });
      if (duplicate) {
        return res.status(409).json({
          message: 'Another account in your vault already uses this email address.',
          errors: { emailAddress: 'This email address is already in use by another account.' }
        });
      }
    }
    const account = await EmailAccount.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: value },
      { new: true, runValidators: true }
    );
    if (!account) return res.status(404).json({ message: 'Account not found.' });
    return res.json({ account });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Another account in your vault already uses this email address.',
        errors: { emailAddress: 'This email address is already in use by another account.' }
      });
    }
    return next(error);
  }
}

export async function toggleFavorite(req, res, next) {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid account identifier.' });
  if (!req.body || typeof req.body.isFavorite !== 'boolean' || Object.keys(req.body).length !== 1) {
    return res.status(400).json({ message: 'Provide only an isFavorite boolean.' });
  }
  try {
    const account = await EmailAccount.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { isFavorite: req.body.isFavorite } },
      { new: true, runValidators: true }
    );
    if (!account) return res.status(404).json({ message: 'Account not found.' });
    return res.json({ account });
  } catch (error) {
    return next(error);
  }
}

export async function deleteAccount(req, res, next) {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid account identifier.' });
  try {
    const account = await EmailAccount.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!account) return res.status(404).json({ message: 'Account not found.' });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
