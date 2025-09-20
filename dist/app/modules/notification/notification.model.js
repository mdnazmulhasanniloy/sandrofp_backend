"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const notification_interface_1 = require("./notification.interface");
const NotificationSchema = new mongoose_1.Schema({
    receiver: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Receiver id is required'],
    },
    refference: {
        type: mongoose_1.Schema.Types.ObjectId,
        //   dynamic refference
        refPath: 'model_type',
        required: [true, 'Receiver id is required'],
    },
    model_type: {
        type: String,
        enum: Object.values(notification_interface_1.modeType),
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
    },
    description: {
        type: String,
        default: '',
    },
    read: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
exports.Notification = (0, mongoose_1.model)('Notification', NotificationSchema);
