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
exports.reviewsService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const reviews_models_1 = __importDefault(require("./reviews.models"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const reviews_utils_1 = require("./reviews.utils");
const mongoose_1 = require("mongoose");
const user_models_1 = require("../user/user.models");
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const createReviews = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const session = yield (0, mongoose_1.startSession)();
    session.startTransaction();
    try {
        // Create the review
        const result = yield reviews_models_1.default.create([payload], { session });
        if (!result || (result === null || result === void 0 ? void 0 : result.length) === 0) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create review');
        }
        // Calculate the new average rating
        const { averageRating, totalReviews } = yield (0, reviews_utils_1.getAverageRating)((_b = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.seller) === null || _b === void 0 ? void 0 : _b.toString());
        const newAvgRating = (Number(averageRating) * Number(totalReviews) + Number(payload.rating)) /
            (totalReviews + 1);
        yield user_models_1.User.findByIdAndUpdate(result[0].seller, {
            avgRating: newAvgRating,
            //  $addToSet: { reviews: result[0]?._id },
            $inc: { totalReview: 1 },
        }, { session });
        // await Bookings.findByIdAndUpdate(
        //   payload?.booking,
        //   { isReviewed: true },
        //   { new: true, upsert: false, session },
        // );
        // Commit the transaction if everything is successful
        yield session.commitTransaction();
        session.endSession();
        return result[0];
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, (error === null || error === void 0 ? void 0 : error.message) || 'Review creation failed');
    }
});
const getAllReviews = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const reviewsModel = new QueryBuilder_1.default(reviews_models_1.default.find().populate([
        { path: 'reference' },
        { path: 'user', select: 'name email phoneNumber profile' },
    ]), query)
        .search([''])
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield reviewsModel.modelQuery;
    const meta = yield reviewsModel.countTotal();
    return {
        data,
        meta,
    };
});
const getReviewsById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield reviews_models_1.default.findById(id).populate([
        { path: 'reference' },
        { path: 'user', select: 'name email phoneNumber profile' },
    ]);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Reviews not found!');
    }
    return result;
});
const updateReviews = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield reviews_models_1.default.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to update Reviews');
    }
    return result;
});
const deleteReviews = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield (0, mongoose_1.startSession)();
    session.startTransaction();
    try {
        const result = yield reviews_models_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true, session });
        if (!result) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete review');
        }
        // Commit the transaction if everything is successful
        yield session.commitTransaction();
        session.endSession();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, (error === null || error === void 0 ? void 0 : error.message) || 'Review deletion failed');
    }
});
exports.reviewsService = {
    createReviews,
    getAllReviews,
    getReviewsById,
    updateReviews,
    deleteReviews,
};
