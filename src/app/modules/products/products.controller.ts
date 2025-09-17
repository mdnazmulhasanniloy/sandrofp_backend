import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { productsService } from './products.service';
import sendResponse from '../../utils/sendResponse';

const createProducts = catchAsync(async (req: Request, res: Response) => {
  req.body.author = req.user.userId;
  const result = await productsService.createProducts(req.body, req.files);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Products created successfully',
    data: result,
  });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await productsService.getAllProducts(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All products fetched successfully',
    data: result,
  });
});
const getMyProducts = catchAsync(async (req: Request, res: Response) => {
  req.query.author = req.user.userId;
  const result = await productsService.getAllProducts(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All products fetched successfully',
    data: result,
  });
});

const getProductsById = catchAsync(async (req: Request, res: Response) => {
  const result = await productsService.getProductsById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Products fetched successfully',
    data: result,
  });
});
const updateProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await productsService.updateProducts(
    req.params.id,
    req.body,
    req.files,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Products updated successfully',
    data: result,
  });
});
/**
 * here need to complete approved and reject product
 *
 */

const rejectProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await productsService.rejectProducts(req.params.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Products updated successfully',
    data: result,
  });
});

const approvedProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await productsService.updateProducts(
    req.params.id,
    { isVerified: true },
    req.files,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Products verification successfully',
    data: result,
  });
});

const deleteProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await productsService.deleteProducts(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Products deleted successfully',
    data: result,
  });
});

export const productsController = {
  createProducts,
  getAllProducts,
  getProductsById,
  updateProducts,
  deleteProducts,
  getMyProducts,
  approvedProducts,
  rejectProducts,
};
