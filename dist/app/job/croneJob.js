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
const node_cron_1 = __importDefault(require("node-cron"));
const redis_1 = require("../redis");
const messages_models_1 = __importDefault(require("../modules/messages/messages.models"));
const notification_service_1 = require("../modules/notification/notification.service");
node_cron_1.default.schedule('*/10 * * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    const keys = yield redis_1.pubClient.keys('chat:*:messages');
    if ((keys === null || keys === void 0 ? void 0 : keys.length) > 0) {
        for (const key of keys) {
            const messages = yield redis_1.pubClient.lRange(key, 0, -1);
            if (!messages.length)
                continue;
            const parsedMessages = messages.map(msg => JSON.parse(msg));
            yield messages_models_1.default.insertMany(parsedMessages);
            // await prisma.message.createMany({ data: parsedMessages });
            yield redis_1.pubClient.del(key);
        }
    }
    console.log('✅ Redis messages saved to DB');
}));
const flushNotifications = (channel) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Read all notifications from Redis
        const notifications = yield redis_1.pubClient.lRange(channel, 0, -1);
        if (!notifications.length)
            return;
        notifications.map((n) => __awaiter(void 0, void 0, void 0, function* () { return yield notification_service_1.notificationServices.insertNotificationIntoDb(JSON.parse(n)); }));
        // Save to MongoDB
        // Remove the flushed notifications from Redis
        yield redis_1.pubClient.del(channel);
        console.log(`✅ Saved  notifications from "${channel}" to DB`);
    }
    catch (err) {
        console.error(`❌ Error flushing notifications from "${channel}":`, err);
    }
});
node_cron_1.default.schedule('*/30 * * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('🔄 Running notification scheduler...');
    yield flushNotifications('sub_admin_notification');
}));
