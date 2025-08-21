import { Router } from 'express';
import { reportContentController } from './reportContent.controller';
import { USER_ROLE } from '../user/user.constants';
import auth from '../../middleware/auth';
import multer from 'multer';
import parseData from '../../middleware/parseData';
import validateRequest from '../../middleware/validateRequest';
import { reportContentValidator } from './reportContent.validation';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/',
  auth(USER_ROLE.user),
  upload.fields([{ name: 'images', maxCount: 5 }]),
  parseData(),
  validateRequest(reportContentValidator.create),
  reportContentController.createReportContent,
);
router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  reportContentController.deleteReportContent,
);
router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  reportContentController.getReportContentById,
);
router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  reportContentController.getAllReportContent,
);

export const reportContentRoutes = router;
