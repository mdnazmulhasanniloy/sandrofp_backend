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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchangesService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const exchanges_models_1 = __importDefault(require("./exchanges.models"));
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const redis_1 = require("../../redis");
const sendMessage_handlers_1 = __importDefault(require("../../socket/handlers/sendMessage.handlers"));
const exchanges_constants_1 = require("./exchanges.constants");
const user_models_1 = require("../user/user.models");
const user_constants_1 = require("../user/user.constants");
const notification_interface_1 = require("../notification/notification.interface");
const notification_service_1 = require("../notification/notification.service");
const createExchanges = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const result = yield exchanges_models_1.default.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create exchanges');
    }
    const io = global.socketio;
    if (io) {
        const message = {
            receiver: (_a = payload === null || payload === void 0 ? void 0 : payload.requestTo) === null || _a === void 0 ? void 0 : _a.toString(),
            sender: (_b = payload === null || payload === void 0 ? void 0 : payload.user) === null || _b === void 0 ? void 0 : _b.toString(),
            exchanges: (_c = result === null || result === void 0 ? void 0 : result._id) === null || _c === void 0 ? void 0 : _c.toString(),
            text: '',
            imageUrl: [],
        };
        yield (0, sendMessage_handlers_1.default)(io, message, { userId: payload === null || payload === void 0 ? void 0 : payload.user }, (args) => console.log(args));
    }
    // 🔹 Redis cache invalidation
    try {
        // Clear all exchanges list caches
        const keys = yield redis_1.pubClient.keys('exchanges:*');
        if (keys.length > 0) {
            yield redis_1.pubClient.del(keys);
        }
        // Optionally, clear single exchanges cache if updating an existing unverified exchanges
        if (result === null || result === void 0 ? void 0 : result._id) {
            yield redis_1.pubClient.del('exchanges:' + ((_d = result === null || result === void 0 ? void 0 : result._id) === null || _d === void 0 ? void 0 : _d.toString()));
        }
    }
    catch (err) {
        console.error('Redis cache invalidation error (createExchanges):', err);
    }
    return result;
});
const getAllExchanges = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cacheKey = 'exchanges:' + JSON.stringify(query);
        // 1. Check cache
        const cachedData = yield redis_1.pubClient.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        const exchangesModel = new QueryBuilder_1.default(exchanges_models_1.default.find({ isDeleted: false }), query)
            .search([''])
            .filter()
            .paginate()
            .sort()
            .fields();
        const data = yield exchangesModel.modelQuery;
        const meta = yield exchangesModel.countTotal();
        const response = { data, meta };
        // 3. Store in cache (30s TTL)
        yield redis_1.pubClient.set(cacheKey, JSON.stringify(response), { EX: 30 });
        return response;
    }
    catch (err) {
        console.error('Redis caching error (getAllExchanges):', err);
        const exchangesModel = new QueryBuilder_1.default(exchanges_models_1.default.find({ isDeleted: false }), query)
            .search([''])
            .filter()
            .paginate()
            .sort()
            .fields();
        const data = yield exchangesModel.modelQuery;
        const meta = yield exchangesModel.countTotal();
        return {
            data,
            meta,
        };
    }
});
const getExchangesById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cacheKey = 'exchanges:' + id;
        // 1. Check cache
        const cachedData = yield redis_1.pubClient.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        // 2. Fetch from DB
        const result = yield exchanges_models_1.default.findById(id);
        if (!result || (result === null || result === void 0 ? void 0 : result.isDeleted)) {
            throw new Error('Exchanges not found!');
        }
        // 3. Store in cache (e.g., 30s TTL)
        yield redis_1.pubClient.set(cacheKey, JSON.stringify(result), { EX: 30 });
        return result;
    }
    catch (err) {
        console.error('Redis caching error (geExchangesById):', err);
        const result = yield exchanges_models_1.default.findById(id);
        if (!result || (result === null || result === void 0 ? void 0 : result.isDeleted)) {
            throw new Error('Exchanges not found!');
        }
        return result;
    }
});
const updateExchanges = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exchanges_models_1.default.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to update Exchanges');
    }
    // 🔹 Redis cache invalidation
    try {
        // single exchanges cache delete
        yield redis_1.pubClient.del('exchanges:' + id);
        // exchanges list cache clear
        const keys = yield redis_1.pubClient.keys('exchanges:*');
        if (keys.length > 0) {
            yield redis_1.pubClient.del(keys);
        }
    }
    catch (err) {
        console.error('Redis cache invalidation error (updateExchanges):', err);
    }
    return result;
});
const acceptExchange = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exchanges_models_1.default.findByIdAndUpdate(id, { status: exchanges_constants_1.EXCHANGE_STATUS.Accepted }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to accepted Exchanges');
    }
    // 🔹 Redis cache invalidation
    try {
        // single exchanges cache delete
        yield redis_1.pubClient.del('exchanges:' + id);
        // exchanges list cache clear
        const keys = yield redis_1.pubClient.keys('exchanges:*');
        if (keys.length > 0) {
            yield redis_1.pubClient.del(keys);
        }
    }
    catch (err) {
        console.error('Redis cache invalidation error (updateExchanges):', err);
    }
    // 🔹 Prepare notifications
    const [subAdmins, admin] = yield Promise.all([
        user_models_1.User.find({ role: user_constants_1.USER_ROLE.sub_admin }).select('_id'),
        user_models_1.User.findOne({ role: user_constants_1.USER_ROLE.admin }).select('_id'),
    ]);
    // Sub-admin notifications → Redis queue
    if (subAdmins.length > 0) {
        subAdmins.map((sa) => __awaiter(void 0, void 0, void 0, function* () {
            const message = {
                receiver: sa._id,
                refference: result._id,
                model_type: notification_interface_1.modeType.Exchanges,
                message: `Exchange offer accepted`,
                description: `A user has accepted an exchange offer. Please review the details for approval.`,
            };
            yield redis_1.pubClient.rPush('sub_admin_notification', JSON.stringify(message));
        }));
    }
    // Admin notification → direct DB
    if (admin) {
        yield notification_service_1.notificationServices.insertNotificationIntoDb({
            receiver: admin._id,
            refference: result._id,
            model_type: notification_interface_1.modeType.ReportContent,
            message: `Exchange offer accepted`,
            description: `A user has accepted an exchange offer. Please review the details for approval.`,
        });
    }
    if (result.user) {
        yield notification_service_1.notificationServices.insertNotificationIntoDb({
            receiver: result.user,
            refference: result._id,
            model_type: notification_interface_1.modeType.Exchanges,
            message: `Your exchange request was accepted`,
            description: `Another user has accepted your exchange request. The admin team will review it shortly.`,
        });
    }
    return result;
});
const declineExchange = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exchanges_models_1.default.findByIdAndUpdate(id, { status: exchanges_constants_1.EXCHANGE_STATUS.Declined }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to decline Exchanges');
    }
    // 🔹 Redis cache invalidation
    try {
        // single exchanges cache delete
        yield redis_1.pubClient.del('exchanges:' + id);
        // exchanges list cache clear
        const keys = yield redis_1.pubClient.keys('exchanges:*');
        if (keys.length > 0) {
            yield redis_1.pubClient.del(keys);
        }
    }
    catch (err) {
        console.error('Redis cache invalidation error (updateExchanges):', err);
    }
    if (result.user) {
        yield notification_service_1.notificationServices.insertNotificationIntoDb({
            receiver: result.user,
            refference: result._id,
            model_type: notification_interface_1.modeType.Exchanges,
            message: `Your exchange request was declined`,
            description: `Your exchange request has been declined. You may contact the other user for more details or try submitting a new request.`,
        });
    }
    return result;
});
const approvedExchange = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exchanges_models_1.default.findByIdAndUpdate(id, { status: exchanges_constants_1.EXCHANGE_STATUS.Approved }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to approved exchange request');
    }
    // 🔹 Redis cache invalidation
    try {
        // single exchanges cache delete
        yield redis_1.pubClient.del('exchanges:' + id);
        // exchanges list cache clear
        const keys = yield redis_1.pubClient.keys('exchanges:*');
        if (keys.length > 0) {
            yield redis_1.pubClient.del(keys);
        }
    }
    catch (err) {
        console.error('Redis cache invalidation error (updateExchanges):', err);
    }
    if (result.user) {
        yield notification_service_1.notificationServices.insertNotificationIntoDb({
            receiver: result.user,
            refference: result._id,
            model_type: notification_interface_1.modeType.Exchanges,
            message: `Exchange request approved`,
            description: `Your exchange request has been approved by the admin. You can now proceed with the exchange.`,
        });
    }
    // Notify the user who accepted the request
    if (result.requestTo) {
        yield notification_service_1.notificationServices.insertNotificationIntoDb({
            receiver: result.requestTo,
            refference: result._id,
            model_type: notification_interface_1.modeType.Exchanges,
            message: `Exchange request approved`,
            description: `The exchange request you accepted has been approved by the admin. You can now proceed with the exchange.`,
        });
    }
    return result;
});
const rejectedExchange = (id, reason) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exchanges_models_1.default.findByIdAndUpdate(id, { status: exchanges_constants_1.EXCHANGE_STATUS.Rejected, reason }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to reject exchange request');
    }
    // 🔹 Redis cache invalidation
    try {
        // single exchanges cache delete
        yield redis_1.pubClient.del('exchanges:' + id);
        // exchanges list cache clear
        const keys = yield redis_1.pubClient.keys('exchanges:*');
        if (keys.length > 0) {
            yield redis_1.pubClient.del(keys);
        }
    }
    catch (err) {
        console.error('Redis cache invalidation error (updateExchanges):', err);
    }
    if (result.user) {
        yield notification_service_1.notificationServices.insertNotificationIntoDb({
            receiver: result.user,
            refference: result._id,
            model_type: notification_interface_1.modeType.Exchanges,
            message: `Exchange request Rejected`,
            description: `Your exchange request has been Reject by the admin. You you can see the reason form details page.`,
        });
    }
    // Notify the user who accepted the request
    if (result.requestTo) {
        yield notification_service_1.notificationServices.insertNotificationIntoDb({
            receiver: result.requestTo,
            refference: result._id,
            model_type: notification_interface_1.modeType.Exchanges,
            message: `Exchange request approved`,
            description: `The exchange request you accepted has been approved by the admin. You can now proceed with the exchange.`,
        });
    }
    return result;
});
const deleteExchanges = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exchanges_models_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete exchanges');
    }
    // 🔹 Redis cache invalidation
    try {
        // single exchanges cache delete
        yield redis_1.pubClient.del('exchanges' + (id === null || id === void 0 ? void 0 : id.toString()));
        // exchanges list cache clear
        const keys = yield redis_1.pubClient.keys('exchanges:*');
        if (keys.length > 0) {
            yield redis_1.pubClient.del(keys);
        }
    }
    catch (err) {
        console.error('Redis cache invalidation error (deleteExchanges):', err);
    }
    return result;
});
exports.exchangesService = {
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
