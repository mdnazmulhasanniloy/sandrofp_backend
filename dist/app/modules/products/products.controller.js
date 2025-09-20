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
exports.productsController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const products_service_1 = require("./products.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.body.author = req.user.userId;
    const result = yield products_service_1.productsService.createProducts(req.body, req.files);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Products created successfully',
        data: result,
    });
}));
const getAllProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield products_service_1.productsService.getAllProducts(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All products fetched successfully',
        data: result,
    });
}));
const getMyProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.query.author = req.user.userId;
    const result = yield products_service_1.productsService.getAllProducts(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All products fetched successfully',
        data: result,
    });
}));
const getProductsById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield products_service_1.productsService.getProductsById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Products fetched successfully',
        data: result,
    });
}));
const updateProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield products_service_1.productsService.updateProducts(req.params.id, req.body, req.files);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Products updated successfully',
        data: result,
    });
}));
/**
 * here need to complete approved and reject product
 *
 */
const rejectProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield products_service_1.productsService.rejectProducts(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Products updated successfully',
        data: result,
    });
}));
const approvedProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield products_service_1.productsService.updateProducts(req.params.id, { isVerified: true }, req.files);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Products verification successfully',
        data: result,
    });
}));
const deleteProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield products_service_1.productsService.deleteProducts(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Products deleted successfully',
        data: result,
    });
}));
exports.productsController = {
    createProducts,
    getAllProducts,
    getProductsById,
    updateProducts,
    deleteProducts,
    getMyProducts,
    approvedProducts,
    rejectProducts,
};
