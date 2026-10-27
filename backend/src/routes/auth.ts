import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { getCurrentUser, refreshSession, requestCode, verifyCode } from '../controllers/auth.js';

const router = Router();

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');

  next();
});

router.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts. Try again later.' },
  }),
);

router.post('/request-code', requestCode);

router.post('/verify-code', verifyCode);

router.post('/refresh', refreshSession);

router.get('/me', getCurrentUser);

export default router;
