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
const callbackFn_1 = __importDefault(require("../../utils/callbackFn"));
const messages_models_1 = __importDefault(require("../../modules/messages/messages.models"));
const mongoose_1 = require("mongoose");
const chat_models_1 = __importDefault(require("../../modules/chat/chat.models"));
const chatList_handlers_1 = __importDefault(require("./chatList.handlers"));
const SeenMessageHandlers = (io, chatId, user, callback) => __awaiter(void 0, void 0, void 0, function* () {
    if (!chatId) {
        return (0, callbackFn_1.default)(callback, {
            success: false,
            message: 'chatId id is required',
        });
    }
    try {
        const chat = yield chat_models_1.default.findById(chatId);
        if (!chat) {
            return (0, callbackFn_1.default)(callback, {
                success: false,
                message: 'chat not found',
            });
        }
        messages_models_1.default.updateMany({
            chat: new mongoose_1.Types.ObjectId(chatId),
            receiver: new mongoose_1.Types.ObjectId(user === null || user === void 0 ? void 0 : user.userId),
            seen: false,
        }, { seen: true });
        const user1 = chat.participants[0];
        const user2 = chat.participants[1];
        (0, chatList_handlers_1.default)(io, { _id: user1 }, callback);
        (0, chatList_handlers_1.default)(io, { _id: user2 }, callback);
    }
    catch (error) {
        return (0, callbackFn_1.default)(callback, {
            success: false,
            message: (error === null || error === void 0 ? void 0 : error.message) || 'seen message failed',
        });
    }
});
exports.default = SeenMessageHandlers;
