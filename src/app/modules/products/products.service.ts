import httpStatus from 'http-status';
import { IProducts } from './products.interface';
import Products from './products.models';
import QueryBuilder from '../../class/builder/QueryBuilder';
import AppError from '../../error/AppError';
import { UploadedFiles } from '../../interface/common.interface';
import { uploadManyToS3 } from '../../utils/s3';
import path from 'path';
import fs from 'fs';
import { sendEmail } from '../../utils/mailSender';
import { IUser } from '../user/user.interface';

const createProducts = async (payload: IProducts, files: any) => {
  if (files) {
    const { images } = files as UploadedFiles;

    //documents
    if (images) {
      const imgsArray: { file: any; path: string; key?: string }[] = [];

      images?.map(async image => {
        imgsArray.push({
          file: image,
          path: `images/service/images`,
        });
      });

      payload.images = await uploadManyToS3(imgsArray);
    }
  }

  const result = await Products.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create products');
  }
  return result;
};

const getAllProducts = async (query: Record<string, any>) => {
  const { latitude, longitude, distance, ...queries } = query;
  const productsModel = new QueryBuilder(
    Products.find({ isDeleted: false }).populate([
      { path: 'author', select: 'name email profile avgRating' },
      { path: 'category' },
    ]),
    queries,
  )
    .nearbyFilter('location', latitude, longitude, distance)
    .search(['name'])
    .filter()
    .paginate()
    .sort()
    .fields();

  await productsModel.executePopulate();

  const data = await productsModel.modelQuery;
  const meta = await productsModel.countTotal();

  return {
    data,
    meta,
  };
};

const getProductsById = async (id: string) => {
  const result = await Products.findById(id).populate([
    { path: 'author', select: 'name email profile avgRating' },
    { path: 'category' },
  ]);
  if (!result || result?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Products not found!');
  }
  return result;
};

const updateProducts = async (
  id: string,
  payload: Partial<IProducts>,
  files: any,
) => {
  const { images } = payload;
  if (files) {
    const { images } = files as UploadedFiles;

    //documents
    if (images) {
      const imgsArray: { file: any; path: string; key?: string }[] = [];

      images?.map(async image => {
        imgsArray.push({
          file: image,
          path: `images/service/images`,
        });
      });

      payload.images = await uploadManyToS3(imgsArray);
    }
  }

  if (images && images?.length > 0)
    images?.map(img => payload.images?.push(img));

  const result = await Products.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update Products');
  }
  return result;
};

const rejectProducts = async (id: string, payload: { reason: string }) => {
  const result = await Products.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  ).populate([{ path: 'author', select: 'name email profile' }]);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete products');
  }
  const rejectProductMailPath = path.join(
    __dirname,
    '../../../../public/view/reject_product.html',
  );

  await sendEmail(
    (result?.author as IUser).email,
    'Your Product request Rejected',
    fs
      .readFileSync(rejectProductMailPath, 'utf8')
      .replace('{{name}}', (result?.author as IUser).name)
      .replace('{{product_name}}', result?.name)
      .replace('{{reason}}', payload.reason as string),
  );

  return result;
};

const deleteProducts = async (id: string) => {
  const result = await Products.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete products');
  }
  return result;
};

const makeNotInterested = async (productId: string, userId: string) => {
  const product = await Products.findByIdAndUpdate(
    productId,
    {
      $addToSet: { notInterested: userId },
      $pull: { interested: userId },
    },
    { new: true },
  );
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return product;
};

const makeInterested = async (productId: string, userId: string) => {
  const product = await Products.findByIdAndUpdate(
    productId,
    {
      $addToSet: { interested: userId },
      $pull: { notInterested: userId },
    },
    { new: true },
  );
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return product;
};

export const productsService = {
  createProducts,
  getAllProducts,
  getProductsById,
  updateProducts,
  deleteProducts,
  rejectProducts,
  makeNotInterested,
  makeInterested,
};
