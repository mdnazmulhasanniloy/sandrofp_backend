"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchangeValidator = void 0;
const zod_1 = require("zod");
const rejectExchangeSchema = zod_1.z.object({
    body: zod_1.z.object({
        reason: zod_1.z.string({ required_error: 'reason are required' }),
    }),
});
exports.exchangeValidator = {
    rejectExchangeSchema,
};
