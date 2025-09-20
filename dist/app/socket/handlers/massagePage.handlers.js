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
const user_models_1 = require("../../modules/user/user.models");
const redis_1 = require("../../redis");
const messages_models_1 = __importDefault(require("../../modules/messages/messages.models"));
const MessagePageHandlers = (io, userId, currentUserId, callback) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        return (0, callbackFn_1.default)(callback, {
            success: false,
            message: 'userId is required',
        });
    }
    try {
        // 1️⃣ Check Redis cache for receiver details
        const receiverCacheKey = `user_details:${userId}`;
        let receiverDetails;
        const cachedReceiver = yield redis_1.pubClient.get(receiverCacheKey);
        if (cachedReceiver) {
            receiverDetails = JSON.parse(cachedReceiver);
        }
        else {
            receiverDetails = yield user_models_1.User.findById(userId).select('_id email role profile name');
            if (!receiverDetails) {
                return (0, callbackFn_1.default)(callback, {
                    success: false,
                    message: 'User not found!',
                });
            }
            yield redis_1.pubClient.setEx(receiverCacheKey, 60, JSON.stringify(receiverDetails));
        }
        console.log(receiverDetails);
        if (!receiverDetails) {
            return;
        }
        const payload = {
            _id: receiverDetails._id,
            name: receiverDetails.name,
            email: receiverDetails.email,
            profile: receiverDetails.profile,
            role: receiverDetails.role,
        };
        // 2️⃣ Get sender’s socket ID from Redis
        const userSocket = yield redis_1.pubClient.hGet('userId_to_socketId', currentUserId);
        if (!userSocket) {
            return (0, callbackFn_1.default)(callback, {
                success: false,
                message: 'User socket ID not found',
            });
        }
        // 3️⃣ Emit receiver details to socket
        io.to(userSocket).emit('user_details', payload);
        // 4️⃣ Redis caching for messages
        const messageCacheKey = `messages:${currentUserId}:${userId}`;
        let getPreMessage;
        const cachedMessages = yield redis_1.pubClient.get(messageCacheKey);
        if (cachedMessages) {
            getPreMessage = JSON.parse(cachedMessages);
        }
        else {
            getPreMessage = yield messages_models_1.default.find({
                $or: [
                    { sender: currentUserId, receiver: userId },
                    { sender: userId, receiver: currentUserId },
                ],
            }).sort({ updatedAt: 1 });
            yield redis_1.pubClient.setEx(messageCacheKey, 30, JSON.stringify(getPreMessage));
        }
        // 5️⃣ Emit previous messages
        io.to(userSocket).emit('message', getPreMessage || []);
        // 6️⃣ Final callback
        (0, callbackFn_1.default)(callback, {
            success: true,
            message: 'Message page data retrieved successfully',
            data: {
                getPreMessage,
                userDetails: payload,
            },
        });
    }
    catch (error) {
        console.error('Error in message-page event:', error);
        (0, callbackFn_1.default)(callback, {
            success: false,
            message: error.message,
        });
    }
});
exports.default = MessagePageHandlers;
