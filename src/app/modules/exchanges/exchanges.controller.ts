import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { exchangesService } from './exchanges.service';
import sendResponse from '../../utils/sendResponse';

const createExchanges = catchAsync(async (req: Request, res: Response) => {
  req.body['user'] = req.user.userId;
  const result = await exchangesService.createExchanges(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Exchanges created successfully',
    data: result,
  });
});

const getAllExchanges = catchAsync(async (req: Request, res: Response) => {
  const result = await exchangesService.getAllExchanges(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All exchanges fetched successfully',
    data: result,
  });
});

const getMyRequestedExchanges = catchAsync(
  async (req: Request, res: Response) => {
    req.query['user'] = req.user.userId;
    const result = await exchangesService.getAllExchanges(req.query);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'All exchanges fetched successfully',
      data: result,
    });
  },
);

const getExchangeRequestsForMe = catchAsync(
  async (req: Request, res: Response) => {
    req.query['requestTo'] = req.user.userId;
    const result = await exchangesService.getAllExchanges(req.query);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'All exchanges fetched successfully',
      data: result,
    });
  },
);

const getExchangesById = catchAsync(async (req: Request, res: Response) => {
  const result = await exchangesService.getExchangesById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Exchanges fetched successfully',
    data: result,
  });
});

const acceptExchange = catchAsync(async (req: Request, res: Response) => {
  const result = await exchangesService.acceptExchange(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Exchanges accept successfully',
    data: result,
  });
});

const declineExchange = catchAsync(async (req: Request, res: Response) => {
  const result = await exchangesService.declineExchange(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Exchanges decline successfully',
    data: result,
  });
});

const approvedExchange = catchAsync(async (req: Request, res: Response) => {
  const result = await exchangesService.approvedExchange(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Exchanges approved successfully',
    data: result,
  });
});

const rejectedExchange = catchAsync(async (req: Request, res: Response) => {
  const result = await exchangesService.rejectedExchange(
    req.params.id,
    req.body.reason,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Exchanges approved successfully',
    data: result,
  });
});

const updateExchanges = catchAsync(async (req: Request, res: Response) => {
  const result = await exchangesService.updateExchanges(
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Exchanges updated successfully',
    data: result,
  });
});

const deleteExchanges = catchAsync(async (req: Request, res: Response) => {
  const result = await exchangesService.deleteExchanges(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Exchanges deleted successfully',
    data: result,
  });
});

export const exchangesController = {
  createExchanges,
  getAllExchanges,
  getExchangesById,
  updateExchanges,
  deleteExchanges,
  acceptExchange,
  declineExchange,
  approvedExchange,
  rejectedExchange,
  getMyRequestedExchanges,
  getExchangeRequestsForMe,
};
