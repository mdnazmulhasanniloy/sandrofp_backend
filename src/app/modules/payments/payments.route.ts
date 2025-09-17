import { Router } from 'express';
import { paymentsController } from './payments.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import checkoutValidation from './payments.validation';

const router = Router();

router.post(
  '/checkout',
  auth(USER_ROLE.user),
  validateRequest(checkoutValidation.checkoutSchema),
  paymentsController.checkout,
);
router.get('/confirm-payment', paymentsController.confirmPayment);
export const paymentsRoutes = router;
