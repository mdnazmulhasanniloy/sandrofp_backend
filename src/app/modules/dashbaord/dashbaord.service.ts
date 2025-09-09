
import httpStatus from 'http-status';
import { IDashbaord } from './dashbaord.interface';
import Dashbaord from './dashbaord.models';
import QueryBuilder from '../../class/builder/QueryBuilder';
import AppError from '../../error/AppError';
import { pubClient } from '../../redis';

const createDashbaord = async (payload: IDashbaord) => {
  const result = await Dashbaord.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create dashbaord');
  }

  // 🔹 Redis cache invalidation
  try {
    // Clear all dashbaord list caches
    const keys = await pubClient.keys('dashbaord:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }

    // Optionally, clear single dashbaord cache if updating an existing unverified dashbaord
    if (result?._id) {
      await pubClient.del('dashbaord:'+ result?._id?.toString());
    }
  } catch (err) {
    console.error('Redis cache invalidation error (createDashbaord):', err);
  }



  return result;
};

const getAllDashbaord = async (query: Record<string, any>) => {
 
  try {
  const cacheKey = 'dashbaord:' + JSON.stringify(query);
      // 1. Check cache
    const cachedData = await pubClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  const dashbaordModel = new QueryBuilder(Dashbaord.find({isDeleted:false}), query)
    .search([""])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await dashbaordModel.modelQuery;
  const meta = await dashbaordModel.countTotal();

const response = { data, meta };

  // 3. Store in cache (30s TTL)
    await pubClient.set(cacheKey, JSON.stringify(response), { EX: 30 });

    return response;

  
  } catch (err) {
    console.error('Redis caching error (getAllDashbaord):', err);
    const dashbaordModel = new QueryBuilder(Dashbaord.find({isDeleted:false}), query)
    .search([""])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await dashbaordModel.modelQuery;
  const meta = await dashbaordModel.countTotal();

  return {
    data,
    meta,
  };
};
    }

const getDashbaordById = async (id: string) => {
try{
 const cacheKey = 'dashbaord:' +id;

    // 1. Check cache
    const cachedData = await pubClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

// 2. Fetch from DB
   const result = await Dashbaord.findById(id);
  if (!result && result?.isDeleted) {
    throw new Error('Dashbaord not found!');
  }

// 3. Store in cache (e.g., 30s TTL)
    await pubClient.set(cacheKey, JSON.stringify(result), { EX: 30 });

    return result;
}catch (err) {
 console.error('Redis caching error (geDashbaordById):', err);
  const result = await Dashbaord.findById(id);
  if (!result && result?.isDeleted) {
    throw new Error('Dashbaord not found!');
  }
  return result;
  
  }
};

const updateDashbaord = async (id: string, payload: Partial<IDashbaord>) => {
  const result = await Dashbaord.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Dashbaord');
  }

   // 🔹 Redis cache invalidation
  try {
    // single dashbaord cache delete
    await pubClient.del('dashbaord:'+id);

    // dashbaord list cache clear
    const keys = await pubClient.keys('dashbaord:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (updateDashbaord):', err);
  }

  return result;
};

const deleteDashbaord = async (id: string) => {
  const result = await Dashbaord.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete dashbaord');
  }

 // 🔹 Redis cache invalidation
  try {
    // single dashbaord cache delete
    await pubClient.del('dashbaord'+id?.toString());

    // dashbaord list cache clear
    const keys = await pubClient.keys('dashbaord:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (deleteDashbaord):', err);
  }




  return result;
};

export const dashbaordService = {
  createDashbaord,
  getAllDashbaord,
  getDashbaordById,
  updateDashbaord,
  deleteDashbaord,
};