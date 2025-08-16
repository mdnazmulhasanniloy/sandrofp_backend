import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const createProductSchema = z.object({
  images: z
    .array(
      z.object({
        key: z.string().min(1, { message: 'Image key is required' }),
        url: z
          .string()
          .url({ message: 'Invalid URL format' })
          .min(1, { message: 'Image URL is required' }),
      }),
    )
    .min(1, { message: 'At least one image is required' }),

  name: z.string().min(1, { message: 'Product name is required' }),

  details: z.string().min(1, { message: 'Product details are required' }),

  category: z.string().min(1, { message: 'Category is required' }),

  price: z.number().min(0, { message: 'Price must be a positive number' }),

  quantity: z.string().min(1, { message: 'Quantity is required' }),

  expiredAt: z.string().min(1, { message: 'Expiry date is required' }),

  discount: z.number().optional(),

  isDeleted: z.boolean().default(false),
});

const updateProductSchema = createProductSchema.deepPartial(); // Allow partial updates

export const productValidation = {
  createProductSchema,
  updateProductSchema,
};
