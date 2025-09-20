"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    text: {
        type: String,
        default: null,
    },
    exchanges: {
        type: mongoose_1.Types.ObjectId,
        ref: 'Exchanges',
        default: null,
    },
    imageUrl: [
        {
            type: String,
            default: null,
        },
    ],
    seen: {
        type: Boolean,
        default: false,
    },
    sender: {
        type: mongoose_1.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    receiver: {
        type: mongoose_1.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    chat: {
        type: mongoose_1.Types.ObjectId,
        required: true,
        ref: 'Chat',
    },
}, {
    timestamps: true,
});
const Message = (0, mongoose_1.model)('Messages', messageSchema);
exports.default = Message;
