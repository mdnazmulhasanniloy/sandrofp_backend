import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { paymentsService } from './payments.service';
import sendResponse from '../../utils/sendResponse';

const checkout = catchAsync(async (req: Request, res: Response) => {
  req.body['user'] = req.user.userId;
  const result = await paymentsService.checkout(req.body);
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

export const paymentsController = {
  checkout,
  confirmPayment,
};
