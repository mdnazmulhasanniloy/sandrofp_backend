import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { dashboardService } from './dashboard.service';
import sendResponse from '../../utils/sendResponse';
import { storeFile } from '../../utils/fileHelper';
import { uploadToS3 } from '../../utils/s3';

const getTopCardData = catchAsync(async (req: Request, res: Response) => {
  const result = await dashboardService.getTopCardData();
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Dashboard top card data get successfully',
    data: result,
  });
});

const getOverview = catchAsync(async (req: Request, res: Response) => {
  const result = await dashboardService.getOverview(req.query);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Dashboard top overview successfully',
    data: result,
  });
});
const getAllTransitions = catchAsync(async (req: Request, res: Response) => {
  const result = await dashboardService.getAllTransitions(req.query);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Dashboard transition data get successfully',
    data: result,
  });
});

export const dashboardController = {
  getTopCardData,
  getOverview,
  getAllTransitions,
};
