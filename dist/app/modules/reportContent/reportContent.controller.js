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
exports.reportContentController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const reportContent_service_1 = require("./reportContent.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createReportContent = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.body.user = req.user.userId;
    const result = yield reportContent_service_1.reportContentService.createReportContent(req.body, req.files);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'ReportContent created successfully',
        data: result,
    });
}));
const getAllReportContent = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield reportContent_service_1.reportContentService.getAllReportContent(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All reportContent fetched successfully',
        data: result,
    });
}));
const getReportContentById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield reportContent_service_1.reportContentService.getReportContentById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'ReportContent fetched successfully',
        data: result,
    });
}));
const deleteReportContent = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield reportContent_service_1.reportContentService.deleteReportContent(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'ReportContent deleted successfully',
        data: result,
    });
}));
exports.reportContentController = {
    createReportContent,
    getAllReportContent,
    getReportContentById,
    deleteReportContent,
};
