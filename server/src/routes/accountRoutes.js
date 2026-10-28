import { Router } from 'express';
import { createAccount, deleteAccount, getAccount, listAccounts, toggleFavorite, updateAccount } from '../controllers/accountController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.route('/').get(listAccounts).post(createAccount);
router.patch('/:id/favorite', toggleFavorite);
router.route('/:id').get(getAccount).put(updateAccount).delete(deleteAccount);

export default router;
