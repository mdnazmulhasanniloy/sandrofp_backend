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
exports.dashboardController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const dashboard_service_1 = require("./dashboard.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const getTopCardData = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield dashboard_service_1.dashboardService.getTopCardData();
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Dashboard top card data get successfully',
        data: result,
    });
}));
const getOverview = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield dashboard_service_1.dashboardService.getOverview(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Dashboard top overview successfully',
        data: result,
    });
}));
const getAllTransitions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield dashboard_service_1.dashboardService.getAllTransitions(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Dashboard transition data get successfully',
        data: result,
    });
}));
exports.dashboardController = {
    getTopCardData,
    getOverview,
    getAllTransitions,
};
