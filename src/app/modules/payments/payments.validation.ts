import { z } from 'zod';

const checkoutSchema = z.object({
  body: z.object({
    totalToken: z.number({ required_error: 'total token is required' }),
  }),
});

const checkoutValidation = {
  checkoutSchema,
};
export default checkoutValidation;
