"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = void 0;
const user_models_1 = require("../user/user.models");
const user_constants_1 = require("../user/user.constants");
const products_models_1 = __importDefault(require("../products/products.models"));
const exchanges_models_1 = __importDefault(require("../exchanges/exchanges.models"));
const exchanges_constants_1 = require("../exchanges/exchanges.constants");
const moment_1 = __importDefault(require("moment"));
const payments_models_1 = __importDefault(require("../payments/payments.models"));
const payments_constants_1 = require("../payments/payments.constants");
const pickQuery_1 = __importDefault(require("../../utils/pickQuery"));
const mongoose_1 = require("mongoose");
const pagination_helpers_1 = require("../../helpers/pagination.helpers");
const getTopCardData = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalActiveUsers = yield user_models_1.User.countDocuments({
        status: 'active',
        role: { $ne: user_constants_1.USER_ROLE.admin },
        'verification.status': true,
    });
    const listedItems = yield products_models_1.default.countDocuments({
        isSoldOut: false,
        isDeleted: false,
    });
    const successfulTrades = yield exchanges_models_1.default.countDocuments({
        status: exchanges_constants_1.EXCHANGE_STATUS.Complete,
    });
    const response = {
        totalActiveUsers,
        listedItems,
        successfulTrades,
    };
    return response;
});
const getOverview = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const year = query.incomeYear || (0, moment_1.default)().year();
    const start = (0, moment_1.default)().year(year).startOf('year').toDate();
    const end = (0, moment_1.default)().year(year).endOf('year').toDate();
    const monthlyIncome = yield payments_models_1.default.aggregate([
        {
            $match: {
                status: payments_constants_1.PAYMENT_STATUS.paid,
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
        month: (0, moment_1.default)().month(i).format('MMM'),
        income: 0,
    }));
    monthlyIncome.forEach(e => (income[e._id.m - 1].income = Math.round(e.income)));
    /**
     *joining user yearly progress
     */
    const monthlyUser = yield user_models_1.User.aggregate([
        {
            $match: {
                'verification.status': true,
                status: 'active',
                role: { $ne: user_constants_1.USER_ROLE.admin },
                createdAt: { $gte: start, $lte: end },
            },
        },
        { $group: { _id: { m: { $month: '$createdAt' } }, total: { $sum: 1 } } },
        { $sort: { '_id.m': 1 } },
    ]);
    const users = Array.from({ length: 12 }, (_, i) => ({
        month: (0, moment_1.default)().month(i).format('MMM'),
        total: 0,
    }));
    monthlyUser.forEach(e => (users[e._id.m - 1].total = Math.round(e.total)));
    /**
     * successfully exchange yearly progress
     */
    const monthlyExchange = yield exchanges_models_1.default.aggregate([
        {
            $match: {
                isDeleted: false,
                status: exchanges_constants_1.EXCHANGE_STATUS.Complete,
                createdAt: { $gte: start, $lte: end },
            },
        },
        { $group: { _id: { m: { $month: '$createdAt' } }, total: { $sum: 1 } } },
        { $sort: { '_id.m': 1 } },
    ]);
    const exchanges = Array.from({ length: 12 }, (_, i) => ({
        month: (0, moment_1.default)().month(i).format('MMM'),
        total: 0,
    }));
    monthlyExchange.forEach(e => (users[e._id.m - 1].total = Math.round(e.total)));
    const last15Users = yield user_models_1.User.aggregate([
        {
            $match: {
                'verification.status': true,
                status: 'active',
                role: { $ne: user_constants_1.USER_ROLE.admin },
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
});
const getAllTransitions = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const today = (0, moment_1.default)().startOf('day');
    const { filters, pagination } = yield (0, pickQuery_1.default)(query);
    const { searchTerm } = filters, filtersData = __rest(filters, ["searchTerm"]);
    if (filtersData.user) {
        filtersData['user'] = new mongoose_1.Types.ObjectId(filtersData.user);
    }
    const pipeline = [];
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
                        [field]: { $in: [new mongoose_1.Types.ObjectId(queryValue)] },
                    },
                });
                delete filtersData[field];
            }
            else {
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
    const { page, limit, skip, sort } = pagination_helpers_1.paginationHelper.calculatePagination(pagination);
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
    const [result] = yield payments_models_1.default.aggregate(pipeline);
    const total = ((_b = (_a = result === null || result === void 0 ? void 0 : result.totalData) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
    const data = (result === null || result === void 0 ? void 0 : result.paginatedData) || [];
    const transactions = {
        meta: { page, limit, total },
        data,
    };
    // const earnings = await Payments.aggregate([
    //   {
    //     $match: {
    //       status: PAYMENT_STATUS.paid,
    //     },
    //   },
    //   {
    //     $facet: {
    //       totalEarnings: [
    //         {
    //           $group: {
    //             _id: null,
    //             total: { $sum: '$amount' },
    //           },
    //         },
    //       ],
    //       todayEarnings: [
    //         {
    //           $match: {
    //             isDeleted: false,
    //             createdAt: {
    //               $gte: today.toDate(),
    //               $lte: today.endOf('day').toDate(),
    //             },
    //           },
    //         },
    //         {
    //           $group: {
    //             _id: null,
    //             total: { $sum: '$amount' }, // Sum of today's earnings
    //           },
    //         },
    //       ],
    //     },
    //   },
    // ]);
    const earnings = yield payments_models_1.default.aggregate([
        {
            $match: {
                status: payments_constants_1.PAYMENT_STATUS.paid,
            },
        },
        {
            $facet: {
                totalEarnings: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$amount' },
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
                            total: { $sum: '$amount' },
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
});
exports.dashboardService = {
    getTopCardData,
    getOverview,
    getAllTransitions,
};
