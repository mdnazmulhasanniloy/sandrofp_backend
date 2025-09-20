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
exports.reportContentService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const reportContent_models_1 = __importDefault(require("./reportContent.models"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const redis_1 = require("../../redis");
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const s3_1 = require("../../utils/s3");
const user_models_1 = require("../user/user.models");
const user_constants_1 = require("../user/user.constants");
const notification_interface_1 = require("../notification/notification.interface");
const notification_service_1 = require("../notification/notification.service");
const createReportContent = (payload, files) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (files) {
        const { images } = files;
        //documents
        if (images) {
            const imgsArray = [];
            images === null || images === void 0 ? void 0 : images.map((image) => __awaiter(void 0, void 0, void 0, function* () {
                imgsArray.push({
                    file: image,
                    path: `images/reports/images`,
                });
            }));
            payload.images = yield (0, s3_1.uploadManyToS3)(imgsArray);
        }
    }
    const result = yield reportContent_models_1.default.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create reportContent');
    }
    // 🔹 Redis cache invalidation
    try {
        // Clear all reportContent list caches
        const keys = yield redis_1.pubClient.keys('reportContent:*');
        if (keys.length > 0) {
            yield redis_1.pubClient.del(keys);
        }
        // Optionally, clear single reportContent cache if updating an existing unverified reportContent
        if (result === null || result === void 0 ? void 0 : result._id) {
            yield redis_1.pubClient.del('reportContent:' + ((_a = result === null || result === void 0 ? void 0 : result._id) === null || _a === void 0 ? void 0 : _a.toString()));
        }
    }
    catch (err) {
        console.error('Redis cache invalidation error (createReportContent):', err);
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
                model_type: notification_interface_1.modeType.ReportContent,
                message: `A new report has been submitted on your product.`,
                description: `A User reported product for "${result.reportType}". Please review the details.`,
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
            message: `New product report submitted.`,
            description: `A User has submitted a report on product for "${result.reportType}". Please review and take necessary action.`,
        });
    }
    return result;
});
const getAllReportContent = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cacheKey = 'reportContent:' + JSON.stringify(query);
        // 1. Check cache
        const cachedData = yield redis_1.pubClient.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        const reportContentModel = new QueryBuilder_1.default(reportContent_models_1.default.find({}), query)
            .search([''])
            .filter()
            .paginate()
            .sort()
            .fields();
        const data = yield reportContentModel.modelQuery;
        const meta = yield reportContentModel.countTotal();
        const response = { data, meta };
        // 3. Store in cache (30s TTL)
        yield redis_1.pubClient.set(cacheKey, JSON.stringify(response), { EX: 30 });
        return response;
    }
    catch (err) {
        console.error('Redis caching error (getAllReportContent):', err);
        const reportContentModel = new QueryBuilder_1.default(reportContent_models_1.default.find({}), query)
            .search([''])
            .filter()
            .paginate()
            .sort()
            .fields();
        const data = yield reportContentModel.modelQuery;
        const meta = yield reportContentModel.countTotal();
        return {
            data,
            meta,
        };
    }
});
const getReportContentById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cacheKey = 'reportContent:' + id;
        // 1. Check cache
        const cachedData = yield redis_1.pubClient.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        // 2. Fetch from DB
        const result = yield reportContent_models_1.default.findById(id);
        if (!result) {
            throw new Error('ReportContent not found!');
        }
        // 3. Store in cache (e.g., 30s TTL)
        yield redis_1.pubClient.set(cacheKey, JSON.stringify(result), { EX: 30 });
        return result;
    }
    catch (err) {
        console.error('Redis caching error (geReportContentById):', err);
        const result = yield reportContent_models_1.default.findById(id);
        if (!result) {
            throw new Error('ReportContent not found!');
        }
        return result;
    }
});
const deleteReportContent = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield reportContent_models_1.default.findByIdAndDelete(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete reportContent');
    }
    // 🔹 Redis cache invalidation
    try {
        // single reportContent cache delete
        yield redis_1.pubClient.del('reportContent' + (id === null || id === void 0 ? void 0 : id.toString()));
        // reportContent list cache clear
        const keys = yield redis_1.pubClient.keys('reportContent:*');
        if (keys.length > 0) {
            yield redis_1.pubClient.del(keys);
        }
    }
    catch (err) {
        console.error('Redis cache invalidation error (deleteReportContent):', err);
    }
    return result;
});
exports.reportContentService = {
    createReportContent,
    getAllReportContent,
    getReportContentById,
    deleteReportContent,
};
