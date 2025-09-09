import { Router } from 'express';
import { exchangesController } from './exchanges.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { exchangeValidator } from './exchanges.validation';

const router = Router();

router.post('/', auth(USER_ROLE.user), exchangesController.createExchanges);

router.patch(
  '/:id',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  exchangesController.updateExchanges,
);

router.patch(
  '/accepted/:id',
  auth(USER_ROLE.user),
  exchangesController.acceptExchange,
);

router.patch(
  '/decline/:id',
  auth(USER_ROLE.user),
  exchangesController.declineExchange,
);

router.patch(
  '/approved/:id',
  auth(USER_ROLE.admin, USER_ROLE?.sub_admin, USER_ROLE.super_admin),
  exchangesController.approvedExchange,
);

router.patch(
  '/rejected/:id',
  auth(USER_ROLE.admin, USER_ROLE?.sub_admin, USER_ROLE.super_admin),
  validateRequest(exchangeValidator.rejectExchangeSchema),
  exchangesController.rejectedExchange,
);

router.delete(
  '/:id',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  exchangesController.deleteExchanges,
);

router.get(
  '/my-requests',
  auth(USER_ROLE.user),
  exchangesController.getMyRequestedExchanges,
);

router.get(
  '/requests-for-me',
  auth(USER_ROLE.user),
  exchangesController.getExchangeRequestsForMe,
);

router.get(
  '/:id',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  exchangesController.getExchangesById,
);

router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  exchangesController.getAllExchanges,
);

export const exchangesRoutes = router;
