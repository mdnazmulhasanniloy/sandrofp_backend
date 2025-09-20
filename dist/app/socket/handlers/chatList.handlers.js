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
const getChatList_1 = require("../services/getChatList");
const redis_1 = require("../../redis");
const callbackFn_1 = __importDefault(require("../../utils/callbackFn"));
const getChatList = (io, user, callback) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const redisKey = `chat_list:${user.userId}`;
        const cachedChatList = yield redis_1.pubClient.get(redisKey);
        let chatList;
        if (cachedChatList) {
            chatList = JSON.parse(cachedChatList);
        }
        else {
            chatList = yield (0, getChatList_1.getMyChatList)(user.userId);
            yield redis_1.pubClient.set(redisKey, JSON.stringify(chatList), {
                EX: 30, // Cache 30s
            });
        }
        const userSocketId = (yield redis_1.pubClient.hGet('userId_to_socketId', (_a = user === null || user === void 0 ? void 0 : user.userId) === null || _a === void 0 ? void 0 : _a.toString()));
        io.to(userSocketId).emit('chat_list', chatList);
        (0, callbackFn_1.default)(callback, {
            success: true,
            message: 'chat list get success',
            data: chatList,
        });
    }
    catch (error) {
        return (0, callbackFn_1.default)(callback, { success: false, message: error === null || error === void 0 ? void 0 : error.message });
    }
});
exports.default = getChatList;
