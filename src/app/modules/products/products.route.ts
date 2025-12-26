import { Router } from 'express';
import { productsController } from './products.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middleware/parseData';
import validateRequest from '../../middleware/validateRequest';
import { productValidation } from './products.validation';

const router = Router();
const storage = memoryStorage();
const upload = multer({ storage });

router.post(
  '/',
  auth(USER_ROLE.user),
  upload.fields([{ name: 'images', maxCount: 10 }]),
  parseData(),
  validateRequest(productValidation.createProductSchema),
  productsController.createProducts,
);

router.patch(
  '/approved/:id',
  auth(USER_ROLE.admin),
  productsController.approvedProducts,
);

router.patch(
  '/reject/:id',
  auth(USER_ROLE.admin),
  validateRequest(productValidation.rejectProductSchema),
  productsController.rejectProducts,
);
router.patch(
  '/interested/:id',
  auth(USER_ROLE.user), 
  productsController.makeInterested,
);
router.patch(
  '/not-interested/:id',
  auth(USER_ROLE.user), 
  productsController.makeNotInterested,
);

router.patch(
  '/:id',
  auth(USER_ROLE.user, USER_ROLE.admin),
  upload.fields([{ name: 'images', maxCount: 10 }]),
  parseData(),
  validateRequest(productValidation.createProductSchema),
  productsController.updateProducts,
);
router.delete(
  '/:id',
  auth(USER_ROLE.user, USER_ROLE.admin),
  productsController.deleteProducts,
);
router.get(
  '/my-products',
  auth(USER_ROLE.user),
  productsController.getMyProducts,
);
router.get('/:id', productsController.getProductsById);
router.get('/', productsController.getAllProducts);

export const productsRoutes = router;
