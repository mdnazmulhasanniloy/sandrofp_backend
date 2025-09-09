
import { Router } from 'express';
import { dashbaordController } from './dashbaord.controller';

const router = Router();

router.post('/', dashbaordController.createDashbaord);
router.patch('/:id', dashbaordController.updateDashbaord);
router.delete('/:id', dashbaordController.deleteDashbaord);
router.get('/:id', dashbaordController.getDashbaordById);
router.get('/', dashbaordController.getAllDashbaord);

export const dashbaordRoutes = router;