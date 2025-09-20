"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagesValidation = void 0;
const zod_1 = require("zod");
const sendMessageValidation = zod_1.z.object({
    body: zod_1.z.object({
        chat: zod_1.z.string({ required_error: 'chat id is required' }).optional(),
        text: zod_1.z
            .string({ required_error: 'text is required' })
            .default('')
            .optional(),
        receiver: zod_1.z.string({ required_error: 'receiver id is required' }),
        seen: zod_1.z.boolean().default(false),
    }),
});
const updateMessageValidation = zod_1.z.object({
    body: zod_1.z.object({
        chat: zod_1.z.string({ required_error: 'chat id is required' }),
        text: zod_1.z
            .string({ required_error: 'text is required' })
            .default('')
            .optional(),
        receiver: zod_1.z.string({ required_error: 'receiver id is required' }),
        seen: zod_1.z.boolean().default(false),
    }),
});
exports.messagesValidation = {
    sendMessageValidation,
    updateMessageValidation,
};
