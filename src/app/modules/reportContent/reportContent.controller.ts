import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { reportContentService } from './reportContent.service';
import sendResponse from '../../utils/sendResponse';

const createReportContent = catchAsync(async (req: Request, res: Response) => {
  req.body.user = req.user.userId;
  const result = await reportContentService.createReportContent(
    req.body,
    req.files,
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'ReportContent created successfully',
    data: result,
  });
});

const getAllReportContent = catchAsync(async (req: Request, res: Response) => {
  const result = await reportContentService.getAllReportContent(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All reportContent fetched successfully',
    data: result,
  });
});

const getReportContentById = catchAsync(async (req: Request, res: Response) => {
  const result = await reportContentService.getReportContentById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'ReportContent fetched successfully',
    data: result,
  });
});

const deleteReportContent = catchAsync(async (req: Request, res: Response) => {
  const result = await reportContentService.deleteReportContent(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'ReportContent deleted successfully',
    data: result,
  });
});

export const reportContentController = {
  createReportContent,
  getAllReportContent,
  getReportContentById,
  deleteReportContent,
};
