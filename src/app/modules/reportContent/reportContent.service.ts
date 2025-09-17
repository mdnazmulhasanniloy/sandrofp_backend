import httpStatus from 'http-status';
import { IReportContent } from './reportContent.interface';
import ReportContent from './reportContent.models';
import AppError from '../../error/AppError';
import { pubClient } from '../../redis';
import QueryBuilder from '../../class/builder/QueryBuilder';
import { UploadedFiles } from '../../interface/common.interface';
import { uploadManyToS3 } from '../../utils/s3';
import { User } from '../user/user.models';
import { USER_ROLE } from '../user/user.constants';
import { modeType } from '../notification/notification.interface';
import { notificationServices } from '../notification/notification.service';

const createReportContent = async (payload: IReportContent, files: any) => {
  if (files) {
    const { images } = files as UploadedFiles;

    //documents
    if (images) {
      const imgsArray: { file: any; path: string; key?: string }[] = [];

      images?.map(async image => {
        imgsArray.push({
          file: image,
          path: `images/reports/images`,
        });
      });

      payload.images = await uploadManyToS3(imgsArray);
    }
  }

  const result = await ReportContent.create(payload);
  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to create reportContent',
    );
  }

  // 🔹 Redis cache invalidation
  try {
    // Clear all reportContent list caches
    const keys = await pubClient.keys('reportContent:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }

    // Optionally, clear single reportContent cache if updating an existing unverified reportContent
    if (result?._id) {
      await pubClient.del('reportContent:' + result?._id?.toString());
    }
  } catch (err) {
    console.error('Redis cache invalidation error (createReportContent):', err);
  }

  // 🔹 Prepare notifications
  const [subAdmins, admin] = await Promise.all([
    User.find({ role: USER_ROLE.sub_admin }).select('_id'),
    User.findOne({ role: USER_ROLE.admin }).select('_id'),
  ]);

  // Sub-admin notifications → Redis queue
  if (subAdmins.length > 0) {
    subAdmins.map(async sa => {
      const message = {
        receiver: sa._id,
        refference: result._id,
        model_type: modeType.ReportContent,
        message: `A new report has been submitted on your product.`,
        description: `A User reported product for "${result.reportType}". Please review the details.`,
      };
      await pubClient.rPush('sub_admin_notification', JSON.stringify(message));
    });
  }

  // Admin notification → direct DB
  if (admin) {
    await notificationServices.insertNotificationIntoDb({
      receiver: admin._id,
      refference: result._id,
      model_type: modeType.ReportContent,
      message: `New product report submitted.`,
      description: `A User has submitted a report on product for "${result.reportType}". Please review and take necessary action.`,
    });
  }

  return result;
};

const getAllReportContent = async (query: Record<string, any>) => {
  try {
    const cacheKey = 'reportContent:' + JSON.stringify(query);
    // 1. Check cache
    const cachedData = await pubClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const reportContentModel = new QueryBuilder(ReportContent.find({}), query)
      .search([''])
      .filter()
      .paginate()
      .sort()
      .fields();

    const data = await reportContentModel.modelQuery;
    const meta = await reportContentModel.countTotal();

    const response = { data, meta };

    // 3. Store in cache (30s TTL)
    await pubClient.set(cacheKey, JSON.stringify(response), { EX: 30 });

    return response;
  } catch (err) {
    console.error('Redis caching error (getAllReportContent):', err);
    const reportContentModel = new QueryBuilder(ReportContent.find({}), query)
      .search([''])
      .filter()
      .paginate()
      .sort()
      .fields();

    const data = await reportContentModel.modelQuery;
    const meta = await reportContentModel.countTotal();

    return {
      data,
      meta,
    };
  }
};

const getReportContentById = async (id: string) => {
  try {
    const cacheKey = 'reportContent:' + id;

    // 1. Check cache
    const cachedData = await pubClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // 2. Fetch from DB
    const result = await ReportContent.findById(id);
    if (!result) {
      throw new Error('ReportContent not found!');
    }

    // 3. Store in cache (e.g., 30s TTL)
    await pubClient.set(cacheKey, JSON.stringify(result), { EX: 30 });

    return result;
  } catch (err) {
    console.error('Redis caching error (geReportContentById):', err);
    const result = await ReportContent.findById(id);
    if (!result) {
      throw new Error('ReportContent not found!');
    }
    return result;
  }
};

const deleteReportContent = async (id: string) => {
  const result = await ReportContent.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to delete reportContent',
    );
  }

  // 🔹 Redis cache invalidation
  try {
    // single reportContent cache delete
    await pubClient.del('reportContent' + id?.toString());

    // reportContent list cache clear
    const keys = await pubClient.keys('reportContent:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (deleteReportContent):', err);
  }

  return result;
};

export const reportContentService = {
  createReportContent,
  getAllReportContent,
  getReportContentById,
  deleteReportContent,
};
