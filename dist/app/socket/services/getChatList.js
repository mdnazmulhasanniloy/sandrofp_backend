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
exports.getMyChatList = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const chat_models_1 = __importDefault(require("../../modules/chat/chat.models"));
const messages_models_1 = __importDefault(require("../../modules/messages/messages.models"));
const getMyChatList = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const chats = yield chat_models_1.default.find({
        participants: { $all: userId },
    }).populate({
        path: 'participants',
        select: 'name email profile role _id phoneNumber',
        match: { _id: { $ne: userId } },
    });
    if (!chats) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Chat list not found');
    }
    // extract all chat ids
    const chatIds = chats.map(chat => chat._id);
    // fetch all latest messages at once
    const messages = yield messages_models_1.default.aggregate([
        { $match: { chat: { $in: chatIds } } },
        { $sort: { createdAt: -1 } },
        {
            $group: {
                _id: '$chat',
                latestMessage: { $first: '$$ROOT' },
            },
        },
    ]);
    // fetch all unread message counts at once
    const unreadCounts = yield messages_models_1.default.aggregate([
        {
            $match: {
                chat: { $in: chatIds },
                seen: false,
                sender: { $ne: userId },
            },
        },
        {
            $group: {
                _id: '$chat',
                count: { $sum: 1 },
            },
        },
    ]);
    // Map for quick lookup
    const messageMap = new Map(messages.map(m => [m._id.toString(), m.latestMessage]));
    const unreadMap = new Map(unreadCounts.map(u => [u._id.toString(), u.count]));
    const data = chats.map(chat => {
        const chatId = chat._id.toString();
        return {
            chat,
            message: messageMap.get(chatId) || null,
            unreadMessageCount: unreadMap.get(chatId) || 0,
        };
    });
    // sort by latest message time
    data.sort((a, b) => {
        var _a, _b;
        const dateA = ((_a = a.message) === null || _a === void 0 ? void 0 : _a.createdAt) || 0;
        const dateB = ((_b = b.message) === null || _b === void 0 ? void 0 : _b.createdAt) || 0;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    return data;
});
exports.getMyChatList = getMyChatList;
