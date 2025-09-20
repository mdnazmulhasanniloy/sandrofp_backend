"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportContentValidator = exports.schema = exports.ReportTypeEnum = void 0;
const zod_1 = __importDefault(require("zod"));
// Reuse your enum values
exports.ReportTypeEnum = zod_1.default.enum([
    'Fake product',
    'Cheater exchanger',
    'Reject product',
    'Product problem',
    'Other issue',
]);
// Image validator
const imageSchema = zod_1.default.object({
    key: zod_1.default.string().min(1, 'Image key is required'),
    url: zod_1.default.string().url('Invalid image URL format'),
});
// Main ReportContent validator
exports.schema = zod_1.default.object({
    product: zod_1.default.string().min(1, 'Product ID is required'),
    reportType: exports.ReportTypeEnum,
    description: zod_1.default.string().min(1, 'Description is required'),
});
const create = zod_1.default.object({
    body: exports.schema,
});
const update = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string().min(1, 'Report ID is required'),
    }),
    body: exports.schema.deepPartial(),
});
exports.reportContentValidator = {
    update,
    create,
};
