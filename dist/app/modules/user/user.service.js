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
exports.userService = void 0;
const fs_1 = __importDefault(require("fs"));
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const user_models_1 = require("./user.models");
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const redis_1 = require("../../redis");
const s3_1 = require("../../utils/s3");
const generateCryptoString_1 = __importDefault(require("../../utils/generateCryptoString"));
const user_constants_1 = require("./user.constants");
const path_1 = __importDefault(require("path"));
const mailSender_1 = require("../../utils/mailSender");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const isExist = yield user_models_1.User.isUserExist(payload.email);
    if (isExist && !((_a = isExist === null || isExist === void 0 ? void 0 : isExist.verification) === null || _a === void 0 ? void 0 : _a.status)) {
        const { email } = payload, updateData = __rest(payload, ["email"]);
        updateData.password = yield bcrypt_1.default.hash(payload === null || payload === void 0 ? void 0 : payload.password, Number(config_1.default.bcrypt_salt_rounds));
        const user = yield user_models_1.User.findByIdAndUpdate(isExist === null || isExist === void 0 ? void 0 : isExist._id, updateData, {
            new: true,
        });
        if (!user) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'user creation failed');
        }
        return user;
    }
    else if (isExist && ((_b = isExist === null || isExist === void 0 ? void 0 : isExist.verification) === null || _b === void 0 ? void 0 : _b.status)) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'User already exists with this email');
    }
    if (!payload.password) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Password is required');
    }
    const user = yield user_models_1.User.create(payload);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User creation failed');
    }
    // 🔹 Redis cache invalidation
    try {
        // Clear all user list caches
        const keys = yield redis_1.pubClient.keys('users:*');
        if (keys.length > 0) {
            yield redis_1.pubClient.del(keys);
        }
        // Optionally, clear single user cache if updating an existing unverified user
        if (user === null || user === void 0 ? void 0 : user._id) {
            yield redis_1.pubClient.del(`user:${(_c = user._id) === null || _c === void 0 ? void 0 : _c.toString()}`);
        }
    }
    catch (err) {
        console.error('Redis cache invalidation error (createUser):', err);
    }
    return user;
});
const getAllUser = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cacheKey = `users:${JSON.stringify(query)}`;
        // 1. Check cache
        const cachedData = yield redis_1.pubClient.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        // 2. Build query
        const userModel = new QueryBuilder_1.default(user_models_1.User.find(), query)
            .search(['name', 'email', 'phoneNumber', 'status'])
            .filter()
            .paginate()
            .sort();
        const data = yield userModel.modelQuery;
        const meta = yield userModel.countTotal();
        const response = { data, meta };
        // 3. Store in cache (30s TTL)
        yield redis_1.pubClient.set(cacheKey, JSON.stringify(response), { EX: 30 });
        return response;
    }
    catch (err) {
        console.error('Redis caching error:', err);
        // fallback to DB if Redis fails
        const userModel = new QueryBuilder_1.default(user_models_1.User.find(), query)
            .search(['name', 'email', 'phoneNumber', 'status'])
            .filter()
            .paginate()
            .sort();
        const data = yield userModel.modelQuery;
        const meta = yield userModel.countTotal();
        return { data, meta };
    }
});
const geUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cacheKey = `users:${id}`;
        // 1. Check cache
        const cachedData = yield redis_1.pubClient.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        // 2. Fetch from DB
        const result = yield user_models_1.User.findById(id);
        if (!result) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
        }
        // 3. Store in cache (e.g., 60s TTL)
        yield redis_1.pubClient.set(cacheKey, JSON.stringify(result), { EX: 60 });
        return result;
    }
    catch (err) {
        console.error('Redis caching error (geUserById):', err);
        // fallback if Redis fails
        const result = yield user_models_1.User.findById(id);
        if (!result) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
        }
        return result;
    }
});
const updateUser = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.User.findByIdAndUpdate(id, payload, { new: true });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User updating failed');
    }
    try {
        // single user cache delete
        yield redis_1.pubClient.del(`users:${id}`);
        // user list cache clear
        const keys = yield redis_1.pubClient.keys('users:*');
        if (keys.length > 0) {
            yield redis_1.pubClient.del(keys);
        }
    }
    catch (err) {
        console.error('Redis cache invalidation error (updateUser):', err);
    }
    return user;
});
const createSubAdmin = (payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const tempPassword = (0, generateCryptoString_1.default)(6);
    if (file) {
        payload.profile = (yield (0, s3_1.uploadToS3)({
            file: file,
            fileName: `images/user/profile/${Math.floor(100000 + Math.random() * 900000)}`,
        }));
    }
    const user = yield user_models_1.User.create(Object.assign(Object.assign({}, payload), { password: tempPassword, role: user_constants_1.USER_ROLE.sub_admin, expireAt: null, 'verification.status': true }));
    const otpEmailPath = path_1.default.join(__dirname, '../../../../public/view/sub_admin_mail.html');
    yield (0, mailSender_1.sendEmail)(user === null || user === void 0 ? void 0 : user.email, 'New Sub‑Admin Created', fs_1.default
        .readFileSync(otpEmailPath, 'utf8')
        .replace('{{fullName}}', user === null || user === void 0 ? void 0 : user.name)
        .replace('{{email}}', user === null || user === void 0 ? void 0 : user.email)
        .replace('{{tempPassword}}', tempPassword)
        .replace('{{loginUrl}}', '#')
        .replace('{{helpUrl}}', '#'));
});
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'user deleting failed');
    }
    try {
        // single user cache delete
        yield redis_1.pubClient.del(`users:${id}`);
        // user list cache clear
        const keys = yield redis_1.pubClient.keys('users:*');
        if (keys.length > 0) {
            yield redis_1.pubClient.del(keys);
        }
    }
    catch (err) {
        console.error('Redis cache invalidation error (deleteUser):', err);
    }
    return user;
});
exports.userService = {
    createUser,
    getAllUser,
    geUserById,
    updateUser,
    deleteUser,
};
