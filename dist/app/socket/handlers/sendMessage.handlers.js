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
const redis_1 = require("../../redis");
const callbackFn_1 = __importDefault(require("../../utils/callbackFn"));
const chat_models_1 = __importDefault(require("../../modules/chat/chat.models"));
const chatList_handlers_1 = __importDefault(require("./chatList.handlers"));
const sendMessage = (io, payload, user, callback) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        if (!(payload === null || payload === void 0 ? void 0 : payload.chat)) {
            const chat = yield chat_models_1.default.create({
                participants: [payload === null || payload === void 0 ? void 0 : payload.receiver, payload === null || payload === void 0 ? void 0 : payload.sender],
                status: 'accepted',
            });
            payload.chat = (_a = chat._id) === null || _a === void 0 ? void 0 : _a.toString();
        }
        const message = {
            chat: payload === null || payload === void 0 ? void 0 : payload.chat,
            exchanges: payload === null || payload === void 0 ? void 0 : payload.exchanges,
            receiver: payload === null || payload === void 0 ? void 0 : payload.receiver,
            sender: user === null || user === void 0 ? void 0 : user.userId,
            text: payload === null || payload === void 0 ? void 0 : payload.text,
            imageUrl: payload.imageUrl,
            createdAt: new Date().toISOString(),
        };
        const redisKey = `chat:${(_b = payload.chat) === null || _b === void 0 ? void 0 : _b.toString()}:messages`;
        yield redis_1.pubClient.rPush(redisKey, JSON.stringify(message));
        const [senderSocketId, receiverSocketId] = (yield Promise.all([
            redis_1.pubClient.hGet('userId_to_socketId', (_c = message.sender) === null || _c === void 0 ? void 0 : _c.toString()),
            redis_1.pubClient.hGet('userId_to_socketId', (_d = message.receiver) === null || _d === void 0 ? void 0 : _d.toString()),
        ]));
        io.to(senderSocketId).emit('new_message', { message });
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('new_message', { message });
        }
        else {
            // const reciver = await User.findById(message.receiver);
        }
        (0, chatList_handlers_1.default)(io, { _id: payload.sender }, callback);
        (0, chatList_handlers_1.default)(io, { _id: payload.receiver }, callback);
        (0, callbackFn_1.default)(callback, {
            success: true,
            message: 'message send successfully',
            data: message,
        });
    }
    catch (error) {
        console.log(error);
        (0, callbackFn_1.default)(callback, {
            success: false,
            message: error === null || error === void 0 ? void 0 : error.message,
        });
    }
});
exports.default = sendMessage;
