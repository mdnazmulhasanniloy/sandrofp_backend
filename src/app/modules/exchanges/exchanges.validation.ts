import { z } from 'zod';

const rejectExchangeSchema = z.object({
  body: z.object({
    reason: z.string({ required_error: 'reason are required' }),
  }),
});

export const exchangeValidator = {
  rejectExchangeSchema,
};
