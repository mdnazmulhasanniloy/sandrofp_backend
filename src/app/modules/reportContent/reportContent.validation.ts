import z from 'zod';

// Reuse your enum values
export const ReportTypeEnum = z.enum([
  'Fake product',
  'Cheater exchanger',
  'Reject product',
  'Product problem',
  'Other issue',
]);

// Image validator
const imageSchema = z.object({
  key: z.string().min(1, 'Image key is required'),
  url: z.string().url('Invalid image URL format'),
});

// Main ReportContent validator
export const schema = z.object({
  product: z.string().min(1, 'Product ID is required'),
  reportType: ReportTypeEnum,
  description: z.string().min(1, 'Description is required'),
});

const create = z.object({
  body: schema,
});
const update = z.object({
  params: z.object({
    id: z.string().min(1, 'Report ID is required'),
  }),
  body: schema.deepPartial(),
});

export const reportContentValidator = {
  update,
  create,
};
