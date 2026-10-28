import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Please sign in to continue.' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('_id name email');
    if (!user) return res.status(401).json({ message: 'Your session is no longer valid. Please sign in again.' });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Your session is invalid or expired. Please sign in again.' });
  }
}
