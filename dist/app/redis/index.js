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
exports.messageQueue = exports.connectRedis = exports.subClient = exports.pubClient = void 0;
const redis_1 = require("redis");
const colors_1 = __importDefault(require("colors"));
const bullmq_1 = require("bullmq");
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const pubClient = (0, redis_1.createClient)({ url: redisUrl });
exports.pubClient = pubClient;
const subClient = pubClient.duplicate();
exports.subClient = subClient;
const connectRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    yield Promise.all([pubClient.connect(), subClient.connect()]);
    console.log(colors_1.default.blue.bold('✨ Connected to Redis server'));
});
exports.connectRedis = connectRedis;
// BullMQ Queue (use proper connection object)
const messageQueue = new bullmq_1.Queue('save_messages', {
    connection: {
        host: 'localhost',
        port: 6379,
    },
});
exports.messageQueue = messageQueue;
// const messageQueue = new Queue('save_messages', {
//   connection: pubClient,
// });
// Subscribe to new message channel
subClient.subscribe('new_message_channel', (rawMessage) => __awaiter(void 0, void 0, void 0, function* () {
    const message = JSON.parse(rawMessage);
    // Bonus part: Save to message queue
    yield messageQueue.add('save', message);
    // Emit to receiver via socket
    const receiverSocketId = yield pubClient.hGet('socket_map', message.receiverId);
    if (receiverSocketId) {
        // io.to(receiverSocketId).emit('new_message', message);
    }
}));
