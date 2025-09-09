import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { paymentsService } from './payments.service';
import sendResponse from '../../utils/sendResponse';

const createPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.createPayments(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Payments created successfully',
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.confirmPayment(req?.query, res);
  res.render('paymentSuccess', {
    paymentDetails: result?.chargeDetails,
  });
});
const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.getAllPayments(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All payments fetched successfully',
    data: result,
  });
});

const getPaymentsById = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.getPaymentsById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payments fetched successfully',
    data: result,
  });
});
const updatePayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.updatePayments(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payments updated successfully',
    data: result,
  });
});

const deletePayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.deletePayments(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payments deleted successfully',
    data: result,
  });
});

export const paymentsController = {
  createPayments,
  getAllPayments,
  getPaymentsById,
  updatePayments,
  deletePayments,
  confirmPayment,
};
