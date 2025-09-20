"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const checkoutSchema = zod_1.z.object({
    body: zod_1.z.object({
        totalToken: zod_1.z.number({ required_error: 'total token is required' }),
    }),
});
const checkoutValidation = {
    checkoutSchema,
};
exports.default = checkoutValidation;
