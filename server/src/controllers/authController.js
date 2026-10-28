import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validateCredentials } from '../utils/validation.js';

function issueToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

export async function register(req, res, next) {
  const { errors, name, email, password } = validateCredentials(req.body, 'register');
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Please correct the highlighted fields.', errors });
  try {
    const exists = await User.exists({ email });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    return res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  const { errors, email, password } = validateCredentials(req.body, 'login');
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Enter a valid email and password.', errors });
  try {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }
    return res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

export function getProfile(req, res) {
  res.json({ user: publicUser(req.user) });
}

export async function updateProfile(req, res, next) {
  const allowed = ['name', 'email'];
  const keys = Object.keys(req.body || {});
  const errors = {};
  if (keys.some((key) => !allowed.includes(key))) errors.body = 'Only name and email can be updated.';
  const updates = {};
  if (Object.hasOwn(req.body || {}, 'name')) {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    if (name.length < 2 || name.length > 60) errors.name = 'Name must be between 2 and 60 characters.';
    else updates.name = name;
  }
  if (Object.hasOwn(req.body || {}, 'email')) {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) errors.email = 'Enter a valid email address.';
    else updates.email = email;
  }
  if (!keys.length) errors.body = 'Provide a name or email to update.';
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Please correct the highlighted fields.', errors });
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true, runValidators: true });
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}
