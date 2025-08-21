import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const schema = z.object({
  name: z.string().nonempty({ message: 'Product name is required' }),
  descriptions: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  brands: z.string().nullable().optional(),
  materials: z.string().nullable().optional(),
  colors: z.string().nullable().optional(),
  tags: z.array(z.string().nonempty({ message: 'Tag is required' })),
  isSoldOut: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  isVerified: z.boolean().optional().default(false),
  category: z.string().nonempty({ message: 'Category is required' }),
  price: z.number().min(0, { message: 'Price must be >= 0' }),
  quantity: z.string().nonempty({ message: 'Quantity is required' }),
  discount: z.number().optional().default(0),
  isDeleted: z.boolean().optional().default(false),
});

const createProductSchema = z.object({
  body: schema,
});

const updateProductSchema = z.object({
  body: schema.deepPartial(),
});
const approvedProductSchema = z.object({
  body: z.object({
    isVerified: z.boolean(),
  }),
});
const rejectProductSchema = z.object({
  params: z.object({
    id: z.string().nonempty({ message: 'Product ID is required in query' }),
  }),
  body: z.object({
    reason: z.string().nonempty({ message: 'Reason is required' }),
  }),
});

export const productValidation = {
  createProductSchema,
  updateProductSchema,
  rejectProductSchema,
  approvedProductSchema,
};
