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
exports.exchangesController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const exchanges_service_1 = require("./exchanges.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createExchanges = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.body['user'] = req.user.userId;
    const result = yield exchanges_service_1.exchangesService.createExchanges(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Exchanges created successfully',
        data: result,
    });
}));
const getAllExchanges = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exchanges_service_1.exchangesService.getAllExchanges(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All exchanges fetched successfully',
        data: result,
    });
}));
const getMyRequestedExchanges = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.query['user'] = req.user.userId;
    const result = yield exchanges_service_1.exchangesService.getAllExchanges(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All exchanges fetched successfully',
        data: result,
    });
}));
const getExchangeRequestsForMe = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.query['requestTo'] = req.user.userId;
    const result = yield exchanges_service_1.exchangesService.getAllExchanges(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All exchanges fetched successfully',
        data: result,
    });
}));
const getExchangesById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exchanges_service_1.exchangesService.getExchangesById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Exchanges fetched successfully',
        data: result,
    });
}));
const acceptExchange = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exchanges_service_1.exchangesService.acceptExchange(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Exchanges accept successfully',
        data: result,
    });
}));
const declineExchange = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exchanges_service_1.exchangesService.declineExchange(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Exchanges decline successfully',
        data: result,
    });
}));
const approvedExchange = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exchanges_service_1.exchangesService.approvedExchange(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Exchanges approved successfully',
        data: result,
    });
}));
const rejectedExchange = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exchanges_service_1.exchangesService.rejectedExchange(req.params.id, req.body.reason);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Exchanges approved successfully',
        data: result,
    });
}));
const updateExchanges = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exchanges_service_1.exchangesService.updateExchanges(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Exchanges updated successfully',
        data: result,
    });
}));
const deleteExchanges = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exchanges_service_1.exchangesService.deleteExchanges(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Exchanges deleted successfully',
        data: result,
    });
}));
exports.exchangesController = {
    createExchanges,
    getAllExchanges,
    getExchangesById,
    updateExchanges,
    deleteExchanges,
    acceptExchange,
    declineExchange,
    approvedExchange,
    rejectedExchange,
    getMyRequestedExchanges,
    getExchangeRequestsForMe,
};
