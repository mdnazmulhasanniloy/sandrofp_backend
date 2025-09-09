
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';  
import { dashbaordService } from './dashbaord.service';
import sendResponse from '../../utils/sendResponse';
import { storeFile } from '../../utils/fileHelper';
import { uploadToS3 } from '../../utils/s3';

const createDashbaord = catchAsync(async (req: Request, res: Response) => {
 const result = await dashbaordService.createDashbaord(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Dashbaord created successfully',
    data: result,
  });

});

const getAllDashbaord = catchAsync(async (req: Request, res: Response) => {

 const result = await dashbaordService.getAllDashbaord(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All dashbaord fetched successfully',
    data: result,
  });

});

const getDashbaordById = catchAsync(async (req: Request, res: Response) => {
 const result = await dashbaordService.getDashbaordById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Dashbaord fetched successfully',
    data: result,
  });

});
const updateDashbaord = catchAsync(async (req: Request, res: Response) => {
const result = await dashbaordService.updateDashbaord(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Dashbaord updated successfully',
    data: result,
  });

});


const deleteDashbaord = catchAsync(async (req: Request, res: Response) => {
 const result = await dashbaordService.deleteDashbaord(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Dashbaord deleted successfully',
    data: result,
  });

});

export const dashbaordController = {
  createDashbaord,
  getAllDashbaord,
  getDashbaordById,
  updateDashbaord,
  deleteDashbaord,
};