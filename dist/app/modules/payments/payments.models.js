"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const paymentsSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tokenRate: {
        type: Number,
        require: true,
    },
    totalToken: {
        type: Number,
        require: true,
    },
    price: {
        type: Number,
        require: true,
    },
    paymentIntentId: {
        type: String,
        default: null,
    },
    tnxId: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'canceled'],
        default: 'pending',
    },
    paymentDate: {
        type: String,
        default: null,
    },
    cardLast4: {
        type: String,
        default: null,
    },
    paymentMethod: {
        type: String,
        default: null,
    },
    receipt_url: {
        type: String,
        default: null,
    },
    isSecondColl: {
        type: Boolean,
        default: false,
    },
    isDeleted: { type: 'boolean', default: false },
}, {
    timestamps: true,
});
const Payments = (0, mongoose_1.model)('Payments', paymentsSchema);
exports.default = Payments;
