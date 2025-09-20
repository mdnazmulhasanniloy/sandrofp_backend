"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productValidation = void 0;
const zod_1 = require("zod");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const schema = zod_1.z.object({
    name: zod_1.z.string().nonempty({ message: 'Product name is required' }),
    descriptions: zod_1.z.string().nullable().optional(),
    size: zod_1.z.string().nullable().optional(),
    brands: zod_1.z.string().nullable().optional(),
    materials: zod_1.z.string().nullable().optional(),
    colors: zod_1.z.string().nullable().optional(),
    tags: zod_1.z.array(zod_1.z.string().nonempty({ message: 'Tag is required' })),
    isSoldOut: zod_1.z.boolean().optional().default(false),
    isFeatured: zod_1.z.boolean().optional().default(false),
    isVerified: zod_1.z.boolean().optional().default(false),
    category: zod_1.z.string().nonempty({ message: 'Category is required' }),
    price: zod_1.z.number().min(0, { message: 'Price must be >= 0' }),
    quantity: zod_1.z.string().nonempty({ message: 'Quantity is required' }),
    discount: zod_1.z.number().optional().default(0),
    isDeleted: zod_1.z.boolean().optional().default(false),
});
const createProductSchema = zod_1.z.object({
    body: schema,
});
const updateProductSchema = zod_1.z.object({
    body: schema.deepPartial(),
});
const approvedProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        isVerified: zod_1.z.boolean(),
    }),
});
const rejectProductSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().nonempty({ message: 'Product ID is required in query' }),
    }),
    body: zod_1.z.object({
        reason: zod_1.z.string().nonempty({ message: 'Reason is required' }),
    }),
});
exports.productValidation = {
    createProductSchema,
    updateProductSchema,
    rejectProductSchema,
    approvedProductSchema,
};
