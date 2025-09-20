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
const { Server } = require('socket.io');
const redis_adapter_1 = require("@socket.io/redis-adapter");
const auth_socket_1 = require("./middleware/auth.socket");
const onlineUser_handlers_1 = require("./handlers/onlineUser.handlers");
const redis_1 = require("../redis");
const massagePage_handlers_1 = __importDefault(require("./handlers/massagePage.handlers"));
const chatList_handlers_1 = __importDefault(require("./handlers/chatList.handlers"));
const seenMessages_handlers_1 = __importDefault(require("./handlers/seenMessages.handlers"));
const sendMessage_handlers_1 = __importDefault(require("./handlers/sendMessage.handlers"));
const callbackFn_1 = __importDefault(require("../utils/callbackFn"));
const initializeSocketIO = (server) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, redis_1.connectRedis)();
    const io = new Server(server, {
        adapter: (0, redis_adapter_1.createAdapter)(redis_1.pubClient, redis_1.subClient),
        cors: {
            origin: '*',
        },
    });
    io.adapter((0, redis_adapter_1.createAdapter)(redis_1.pubClient, redis_1.subClient));
    io.use(auth_socket_1.socketAuthMiddleware);
    global.socketio = io;
    io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        console.log(`New client connected: ${socket.id}`);
        const userId = (_a = socket.data) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            console.warn(`Socket ${socket.id} connected without userId`);
            return;
        }
        // Redis ID -> socketID map
        yield redis_1.pubClient.hSet('userId_to_socketId', userId, socket.id);
        //  socketID -> userId map
        yield redis_1.pubClient.hSet('socketId_to_userId', socket.id, userId);
        // online users
        socket.on('getOnlineUsers', () => __awaiter(void 0, void 0, void 0, function* () { return (0, onlineUser_handlers_1.getOnlineUserIds)(io); }));
        //message page
        socket.on('message_page', (payload, callback) => __awaiter(void 0, void 0, void 0, function* () { return (0, massagePage_handlers_1.default)(io, payload === null || payload === void 0 ? void 0 : payload.userId, userId, callback); }));
        //my chat list
        socket.on('my_chat_list', (_a, callback_1) => __awaiter(void 0, [_a, callback_1], void 0, function* ({}, callback) { return (0, chatList_handlers_1.default)(io, socket === null || socket === void 0 ? void 0 : socket.data, callback); }));
        //seen message
        socket.on('seen', (_a, callback_1) => __awaiter(void 0, [_a, callback_1], void 0, function* ({ chatId }, callback) { return (0, seenMessages_handlers_1.default)(io, chatId, socket === null || socket === void 0 ? void 0 : socket.data, callback); }));
        //send message
        socket.on('send_message', (payload, callback) => __awaiter(void 0, void 0, void 0, function* () { return (0, sendMessage_handlers_1.default)(io, payload, socket === null || socket === void 0 ? void 0 : socket.data, callback); }));
        /**
         * **************************************************************** calling test project ****************************************************************
         */
        //call-user
        socket.on('call-user', (data, callBack) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { to } = data;
                if (!(to === null || to === void 0 ? void 0 : to._id))
                    return (0, callbackFn_1.default)(callBack, {
                        success: false,
                        message: 'to is undefined',
                    });
                const socketId = yield redis_1.pubClient.hGet('userId_to_socketId', to === null || to === void 0 ? void 0 : to._id);
                io.to(socketId).emit('incoming-call', {
                    from: Object.assign(Object.assign({}, socket.data), { _id: (_a = socket === null || socket === void 0 ? void 0 : socket.data) === null || _a === void 0 ? void 0 : _a.userId }),
                });
                return (0, callbackFn_1.default)(callBack, {
                    success: true,
                    from: Object.assign(Object.assign({}, socket.data), { _id: (_b = socket === null || socket === void 0 ? void 0 : socket.data) === null || _b === void 0 ? void 0 : _b.userId }),
                    message: 'call sent successfully',
                });
            }
            catch (error) {
                return (0, callbackFn_1.default)(callBack, {
                    success: false,
                    message: 'Internal server error',
                });
            }
        }));
        //decline-call
        // socket.on('decline-call', async (data, callBack) => {
        //   const { to } = data;
        //   console.log(data?.to);
        //   if (!to?._id) return console.log('decline-call to is undefined');
        //   const socketId = await pubClient.hGet('userId_to_socketId', to?._id);
        //   if (socketId) {
        //     io.to(socketId).emit('call-ended', { from: socket.data });
        //   }
        // });
        socket.on('decline-call', (data, callback) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { to } = data;
                console.log(data === null || data === void 0 ? void 0 : data.to);
                if (!(to === null || to === void 0 ? void 0 : to._id)) {
                    console.log('decline-call to is undefined');
                    return (0, callbackFn_1.default)(callback, {
                        success: false,
                        message: 'Recipient not found',
                    });
                }
                const socketId = yield redis_1.pubClient.hGet('userId_to_socketId', to._id);
                if (socketId) {
                    io.to(socketId).emit('call-ended', { from: socket.data });
                }
                return (0, callbackFn_1.default)(callback, {
                    success: true,
                    message: 'Call declined successfully',
                });
            }
            catch (err) {
                console.error('Error in decline-call:', err);
                (0, callbackFn_1.default)(callback, {
                    success: false,
                    message: 'Internal server error',
                });
            }
        }));
        socket.on('accept-call', (data, callBack) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { to } = data;
                console.log(data === null || data === void 0 ? void 0 : data.to);
                if (!(to === null || to === void 0 ? void 0 : to._id))
                    return (0, callbackFn_1.default)(callBack, {
                        success: false,
                        message: 'recover id not found',
                    });
                const roomId = Math.floor(10000 + Math.random() * 90000);
                const socketId = yield redis_1.pubClient.hGet('userId_to_socketId', to === null || to === void 0 ? void 0 : to._id);
                console.log('🚀 ~ initializeSocketIO ~ socketId:', socketId);
                io.to(socketId).emit('accepted-call', {
                    from: Object.assign(Object.assign({}, socket.data), { _id: (_a = socket === null || socket === void 0 ? void 0 : socket.data) === null || _a === void 0 ? void 0 : _a.userId }),
                    roomId,
                });
                return (0, callbackFn_1.default)(callBack, {
                    success: true,
                    data: { roomId, from: Object.assign(Object.assign({}, socket.data), { _id: (_b = socket === null || socket === void 0 ? void 0 : socket.data) === null || _b === void 0 ? void 0 : _b.userId }) },
                    message: 'call accepted successfully',
                });
            }
            catch (error) {
                (0, callbackFn_1.default)(callBack, {
                    success: false,
                    message: 'Internal server error',
                });
            }
        }));
        socket.on('disconnect', () => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`Client disconnected: ${socket.id}`);
            const uid = yield redis_1.pubClient.hGet('socketId_to_userId', socket.id);
            if (uid) {
                yield redis_1.pubClient.hDel('socketId_to_userId', socket.id);
                yield redis_1.pubClient.hDel('userId_to_socketId', uid);
                console.log(`Removed Redis mapping for userId ${uid} and socketId ${socket.id}`);
            }
        }));
    }));
    return io;
});
exports.default = initializeSocketIO;
