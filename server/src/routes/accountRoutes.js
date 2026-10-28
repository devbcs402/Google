import { Router } from 'express';
import {
  createAccount,
  deleteAccount,
  downloadBackupPdf,
  getAccount,
  listAccounts,
  toggleFavorite,
  updateAccount
} from '../controllers/accountController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/backup/pdf', downloadBackupPdf);
router.route('/').get(listAccounts).post(createAccount);
router.patch('/:id/favorite', toggleFavorite);
router.route('/:id').get(getAccount).put(updateAccount).delete(deleteAccount);

export default router;
