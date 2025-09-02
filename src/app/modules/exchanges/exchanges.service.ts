import httpStatus from 'http-status';
import { IExchanges } from './exchanges.interface';
import Exchanges from './exchanges.models';
import QueryBuilder from '../../class/builder/QueryBuilder';
import AppError from '../../error/AppError';
import { pubClient } from '../../redis';
import sendMessage from '../../socket/handlers/sendMessage.handlers';
import { EXCHANGE_STATUS } from './exchanges.constants';
import { User } from '../user/user.models';
import { USER_ROLE } from '../user/user.constants';
import { modeType } from '../notification/notification.interface';
import { notificationServices } from '../notification/notification.service';

interface IMEssagePayload {
  imageUrl: string[];
  text: string;
  receiver: string;
  chat?: string;
  sender: string;
  exchanges?: string;
}

const createExchanges = async (payload: IExchanges) => {
  const result = await Exchanges.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create exchanges');
  }

  const io = global.socketio;
  if (io) {
    const message: IMEssagePayload = {
      receiver: payload?.requestTo?.toString(),
      sender: payload?.user?.toString(),
      exchanges: result?._id?.toString(),
      text: '',
      imageUrl: [],
    };

    await sendMessage(io, message, { userId: payload?.user }, (args: any) =>
      console.log(args),
    );
  }

  // 🔹 Redis cache invalidation
  try {
    // Clear all exchanges list caches
    const keys = await pubClient.keys('exchanges:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }

    // Optionally, clear single exchanges cache if updating an existing unverified exchanges
    if (result?._id) {
      await pubClient.del('exchanges:' + result?._id?.toString());
    }
  } catch (err) {
    console.error('Redis cache invalidation error (createExchanges):', err);
  }

  return result;
};

const getAllExchanges = async (query: Record<string, any>) => {
  try {
    const cacheKey = 'exchanges:' + JSON.stringify(query);
    // 1. Check cache
    const cachedData = await pubClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const exchangesModel = new QueryBuilder(
      Exchanges.find({ isDeleted: false }),
      query,
    )
      .search([''])
      .filter()
      .paginate()
      .sort()
      .fields();

    const data = await exchangesModel.modelQuery;
    const meta = await exchangesModel.countTotal();

    const response = { data, meta };

    // 3. Store in cache (30s TTL)
    await pubClient.set(cacheKey, JSON.stringify(response), { EX: 30 });

    return response;
  } catch (err) {
    console.error('Redis caching error (getAllExchanges):', err);
    const exchangesModel = new QueryBuilder(
      Exchanges.find({ isDeleted: false }),
      query,
    )
      .search([''])
      .filter()
      .paginate()
      .sort()
      .fields();

    const data = await exchangesModel.modelQuery;
    const meta = await exchangesModel.countTotal();

    return {
      data,
      meta,
    };
  }
};

const getExchangesById = async (id: string) => {
  try {
    const cacheKey = 'exchanges:' + id;

    // 1. Check cache
    const cachedData = await pubClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // 2. Fetch from DB
    const result = await Exchanges.findById(id);
    if (!result || result?.isDeleted) {
      throw new Error('Exchanges not found!');
    }

    // 3. Store in cache (e.g., 30s TTL)
    await pubClient.set(cacheKey, JSON.stringify(result), { EX: 30 });

    return result;
  } catch (err) {
    console.error('Redis caching error (geExchangesById):', err);
    const result = await Exchanges.findById(id);
    if (!result || result?.isDeleted) {
      throw new Error('Exchanges not found!');
    }
    return result;
  }
};

const updateExchanges = async (id: string, payload: Partial<IExchanges>) => {
  const result = await Exchanges.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update Exchanges');
  }

  // 🔹 Redis cache invalidation
  try {
    // single exchanges cache delete
    await pubClient.del('exchanges:' + id);

    // exchanges list cache clear
    const keys = await pubClient.keys('exchanges:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (updateExchanges):', err);
  }

  return result;
};

const acceptExchange = async (id: string) => {
  const result = await Exchanges.findByIdAndUpdate(
    id,
    { status: EXCHANGE_STATUS.Accepted },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to accepted Exchanges');
  }

  // 🔹 Redis cache invalidation
  try {
    // single exchanges cache delete
    await pubClient.del('exchanges:' + id);

    // exchanges list cache clear
    const keys = await pubClient.keys('exchanges:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (updateExchanges):', err);
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
        model_type: modeType.Exchanges,
        message: `Exchange offer accepted`,
        description: `A user has accepted an exchange offer. Please review the details for approval.`,
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
      message: `Exchange offer accepted`,
      description: `A user has accepted an exchange offer. Please review the details for approval.`,
    });
  }

  if (result.user) {
    await notificationServices.insertNotificationIntoDb({
      receiver: result.user,
      refference: result._id,
      model_type: modeType.Exchanges,
      message: `Your exchange request was accepted`,
      description: `Another user has accepted your exchange request. The admin team will review it shortly.`,
    });
  }

  return result;
};

const declineExchange = async (id: string) => {
  const result = await Exchanges.findByIdAndUpdate(
    id,
    { status: EXCHANGE_STATUS.Declined },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to decline Exchanges');
  }

  // 🔹 Redis cache invalidation
  try {
    // single exchanges cache delete
    await pubClient.del('exchanges:' + id);

    // exchanges list cache clear
    const keys = await pubClient.keys('exchanges:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (updateExchanges):', err);
  }

  if (result.user) {
    await notificationServices.insertNotificationIntoDb({
      receiver: result.user,
      refference: result._id,
      model_type: modeType.Exchanges,
      message: `Your exchange request was declined`,
      description: `Your exchange request has been declined. You may contact the other user for more details or try submitting a new request.`,
    });
  }

  return result;
};

const approvedExchange = async (id: string) => {
  const result = await Exchanges.findByIdAndUpdate(
    id,
    { status: EXCHANGE_STATUS.Approved },
    { new: true },
  );
  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to approved exchange request',
    );
  }

  // 🔹 Redis cache invalidation
  try {
    // single exchanges cache delete
    await pubClient.del('exchanges:' + id);

    // exchanges list cache clear
    const keys = await pubClient.keys('exchanges:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (updateExchanges):', err);
  }

  if (result.user) {
    await notificationServices.insertNotificationIntoDb({
      receiver: result.user,
      refference: result._id,
      model_type: modeType.Exchanges,
      message: `Exchange request approved`,
      description: `Your exchange request has been approved by the admin. You can now proceed with the exchange.`,
    });
  }

  // Notify the user who accepted the request
  if (result.requestTo) {
    await notificationServices.insertNotificationIntoDb({
      receiver: result.requestTo,
      refference: result._id,
      model_type: modeType.Exchanges,
      message: `Exchange request approved`,
      description: `The exchange request you accepted has been approved by the admin. You can now proceed with the exchange.`,
    });
  }

  return result;
};

const rejectedExchange = async (id: string, reason: string) => {
  const result = await Exchanges.findByIdAndUpdate(
    id,
    { status: EXCHANGE_STATUS.Rejected, reason },
    { new: true },
  );
  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to reject exchange request',
    );
  }

  // 🔹 Redis cache invalidation
  try {
    // single exchanges cache delete
    await pubClient.del('exchanges:' + id);

    // exchanges list cache clear
    const keys = await pubClient.keys('exchanges:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (updateExchanges):', err);
  }

  if (result.user) {
    await notificationServices.insertNotificationIntoDb({
      receiver: result.user,
      refference: result._id,
      model_type: modeType.Exchanges,
      message: `Exchange request Rejected`,
      description: `Your exchange request has been Reject by the admin. You you can see the reason form details page.`,
    });
  }

  // Notify the user who accepted the request
  if (result.requestTo) {
    await notificationServices.insertNotificationIntoDb({
      receiver: result.requestTo,
      refference: result._id,
      model_type: modeType.Exchanges,
      message: `Exchange request approved`,
      description: `The exchange request you accepted has been approved by the admin. You can now proceed with the exchange.`,
    });
  }

  return result;
};

const deleteExchanges = async (id: string) => {
  const result = await Exchanges.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete exchanges');
  }

  // 🔹 Redis cache invalidation
  try {
    // single exchanges cache delete
    await pubClient.del('exchanges' + id?.toString());

    // exchanges list cache clear
    const keys = await pubClient.keys('exchanges:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (deleteExchanges):', err);
  }

  return result;
};

export const exchangesService = {
  createExchanges,
  getAllExchanges,
  getExchangesById,
  updateExchanges,
  deleteExchanges,
  acceptExchange,
  declineExchange,
  approvedExchange,
  rejectedExchange,
};
