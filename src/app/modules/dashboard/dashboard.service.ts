import httpStatus from 'http-status';
import { IDashboard } from './dashboard.interface';
import Dashboard from './dashboard.models';
import QueryBuilder from '../../class/builder/QueryBuilder';
import AppError from '../../error/AppError';
import { pubClient } from '../../redis';
import { User } from '../user/user.models';
import { USER_ROLE } from '../user/user.constants';
import Products from '../products/products.models';
import Exchanges from '../exchanges/exchanges.models';
import { EXCHANGE_STATUS } from '../exchanges/exchanges.constants';
import moment from 'moment';
import Payments from '../payments/payments.models';
import { PAYMENT_STATUS } from '../payments/payments.constants';
import pickQuery from '../../utils/pickQuery';
import { Types } from 'mongoose';
import { paginationHelper } from '../../helpers/pagination.helpers';

const getTopCardData = async () => {
  const totalActiveUsers = await User.countDocuments({
    status: 'active',
    role: { $ne: USER_ROLE.admin },
    'verification.status': true,
  });

  const listedItems = await Products.countDocuments({
    isSoldOut: false,
    isDeleted: false,
  });

  const successfulTrades = await Exchanges.countDocuments({
    status: EXCHANGE_STATUS.Complete,
  });

  const response = {
    totalActiveUsers,
    listedItems,
    successfulTrades,
  };

  return response;
};

const getOverview = async (query: Record<string, any>) => {
  const year = query.incomeYear || moment().year();
  const start = moment().year(year).startOf('year').toDate();
  const end = moment().year(year).endOf('year').toDate();
  const monthlyIncome = await Payments.aggregate([
    {
      $match: {
        status: PAYMENT_STATUS.paid,
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: { m: { $month: '$createdAt' } },
        income: { $sum: '$price' },
      },
    },
    { $sort: { '_id.m': 1 } },
  ]);

  const income = Array.from({ length: 12 }, (_, i) => ({
    month: moment().month(i).format('MMM'),
    income: 0,
  }));

  monthlyIncome.forEach(
    e => (income[e._id.m - 1].income = Math.round(e.income)),
  );
  /**
   *joining user yearly progress
   */
  const monthlyUser = await User.aggregate([
    {
      $match: {
        'verification.status': true,
        status: 'active',
        role: { $ne: USER_ROLE.admin },
        createdAt: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: { m: { $month: '$createdAt' } }, total: { $sum: 1 } } },
    { $sort: { '_id.m': 1 } },
  ]);

  const users = Array.from({ length: 12 }, (_, i) => ({
    month: moment().month(i).format('MMM'),
    total: 0,
  }));
  monthlyUser.forEach(e => (users[e._id.m - 1].total = Math.round(e.total)));

  /**
   * successfully exchange yearly progress
   */

  const monthlyExchange = await Exchanges.aggregate([
    {
      $match: {
        isDeleted: false,
        status: EXCHANGE_STATUS.Complete,
        createdAt: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: { m: { $month: '$createdAt' } }, total: { $sum: 1 } } },
    { $sort: { '_id.m': 1 } },
  ]);

  const exchanges = Array.from({ length: 12 }, (_, i) => ({
    month: moment().month(i).format('MMM'),
    total: 0,
  }));
  monthlyExchange.forEach(
    e => (users[e._id.m - 1].total = Math.round(e.total)),
  );

  const last15Users = await User.aggregate([
    {
      $match: {
        'verification.status': true,
        status: 'active',
        role: { $ne: USER_ROLE.admin },
      },
    },
    { $sort: { createdAt: -1 } },
    { $limit: 15 },
    { $project: { name: 1, email: 1, createdAt: 1 } },
  ]);
  return {
    userOverview: users,
    incomeOverview: income,
    successfulExchange: exchanges,
    last15Users,
  };
};

const getAllTransitions = async (query: Record<string, any>) => {
  const today = moment().startOf('day');

  const { filters, pagination } = await pickQuery(query);
  const { searchTerm, ...filtersData } = filters;

  if (filtersData.user) {
    filtersData['user'] = new Types.ObjectId(filtersData.user);
  }

  const pipeline: any[] = [];
  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [
          'tnxId',
          'cardLast4',
          'paymentIntentId',
          'status',
          'paymentMethod',
        ].map(field => ({
          [field]: {
            $regex: searchTerm,
            $options: 'i',
          },
        })),
      },
    });
  }

  if (Object.entries(filtersData).length) {
    Object.entries(filtersData).forEach(([field, value]) => {
      if (/^\[.*?\]$/.test(value)) {
        const match = value.match(/\[(.*?)\]/);
        const queryValue = match ? match[1] : value;
        pipeline.push({
          $match: {
            [field]: { $in: [new Types.ObjectId(queryValue)] },
          },
        });
        delete filtersData[field];
      } else {
        if (!isNaN(value)) {
          filtersData[field] = Number(value);
        }
      }
    });

    if (Object.entries(filtersData).length) {
      pipeline.push({
        $match: {
          $and: Object.entries(filtersData).map(([field, value]) => ({
            isDeleted: false,
            [field]: value,
          })),
        },
      });
    }
  }
  const { page, limit, skip, sort } =
    paginationHelper.calculatePagination(pagination);

  if (sort) {
    const sortArray = sort.split(',').map(field => {
      const trimmedField = field.trim();
      if (trimmedField.startsWith('-')) {
        return { [trimmedField.slice(1)]: -1 };
      }
      return { [trimmedField]: 1 };
    });

    pipeline.push({ $sort: Object.assign({}, ...sortArray) });
  }

  pipeline.push({
    $facet: {
      totalData: [{ $count: 'total' }],
      paginatedData: [
        { $skip: skip },
        { $limit: limit },
        // Lookups
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: {
                  name: 1,
                  email: 1,
                  phoneNumber: 1,
                  profile: 1,
                },
              },
            ],
          },
        },

        {
          $addFields: {
            author: { $arrayElemAt: ['$user', 0] },
          },
        },
      ],
    },
  });

  const [result] = await Payments.aggregate(pipeline);
  const total = result?.totalData?.[0]?.total || 0;
  const data = result?.paginatedData || [];
  const transactions = {
    meta: { page, limit, total },
    data,
  };

 
  const earnings = await Payments.aggregate([
    {
      $match: {
        status: PAYMENT_STATUS.paid,
      },
    },
    {
      $facet: {
        totalEarnings: [
          {
            $group: {
              _id: null,
              total: { $sum: '$price' },
            },
          },
          {
            $project: {
              total: { $ifNull: ['$total', 0] }, // If no data, default to 0
            },
          },
        ],
        todayEarnings: [
          {
            $match: {
              isDeleted: false,
              createdAt: {
                $gte: today.toDate(),
                $lte: today.endOf('day').toDate(),
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$price' },
            },
          },
          {
            $project: {
              total: { $ifNull: ['$total', 0] }, // If no data, default to 0
            },
          },
        ],
      },
    },
    {
      $project: {
        totalEarnings: {
          $ifNull: [{ $arrayElemAt: ['$totalEarnings.total', 0] }, 0],
        }, // Ensure default 0 if empty
        todayEarnings: {
          $ifNull: [{ $arrayElemAt: ['$todayEarnings.total', 0] }, 0],
        }, // Ensure default 0 if empty
      },
    },
  ]).then(data => data[0]);

  return {
    transactions,
    earnings,
  };
};

export const dashboardService = {
  getTopCardData,
  getOverview,
  getAllTransitions,
};
