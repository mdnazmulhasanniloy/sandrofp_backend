"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const exchanges_constants_1 = require("./exchanges.constants");
const exchangesSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    requestTo: {
        type: mongoose_1.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    status: {
        type: String,
        enum: [
            'requested',
            'accepted',
            'decline',
            'approved',
            'rejected',
            'complete',
        ],
        default: exchanges_constants_1.EXCHANGE_STATUS.Requested,
    },
    products: [
        {
            type: mongoose_1.Types === null || mongoose_1.Types === void 0 ? void 0 : mongoose_1.Types.ObjectId,
            ref: 'Products',
            require: true,
        },
    ],
    exchangeWith: [
        {
            type: mongoose_1.Types === null || mongoose_1.Types === void 0 ? void 0 : mongoose_1.Types.ObjectId,
            ref: 'Products',
            require: true,
        },
    ],
    extraToken: {
        type: Number,
        default: 0,
    },
    totalToken: {
        type: Number,
        required: true,
    },
    reason: { type: String, default: null },
    isReviewed: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
});
const Exchanges = (0, mongoose_1.model)('Exchanges', exchangesSchema);
exports.default = Exchanges;
