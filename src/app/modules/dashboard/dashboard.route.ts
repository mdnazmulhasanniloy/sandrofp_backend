import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.get(
  '/top-cards',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  dashboardController.getTopCardData,
);
router.get(
  '/overview',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  dashboardController.getOverview,
);
router.get(
  '/transitions',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  dashboardController.getAllTransitions,
);

export const dashboardRoutes = router;
