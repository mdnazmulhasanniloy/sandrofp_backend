"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const imageSchema = new mongoose_1.Schema({
    key: { type: String, required: [true, 'Image key is required'] },
    url: {
        type: String,
        required: [true, 'Image URL is required'],
        match: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
    }, // URL validation
});
const reportContentSchema = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    reportType: {
        type: String,
        enum: [
            'Fake product',
            'Cheater exchanger',
            'Reject product',
            'Product problem',
            'Other issue',
        ],
        required: true,
    },
    images: [imageSchema],
    description: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
const ReportContent = (0, mongoose_1.model)('ReportContent', reportContentSchema);
exports.default = ReportContent;
