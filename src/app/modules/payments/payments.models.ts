import { model, Schema, Types } from 'mongoose';
import { IPayments, IPaymentsModules } from './payments.interface';

const paymentsSchema = new Schema<IPayments>(
  {
    user: {
      type: Types.ObjectId,
      ref: 'Users',
      require: true,
    },
    tokenRate: {
      type: Number,
      require: true,
    },
    totalToken: {
      type: Number,
      require: true,
    },
    price: {
      type: Number,
      require: true,
    },
    paymentIntentId: {
      type: String,
      default: null,
    },
    tnxId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'canceled'],
      default: 'pending',
    },
    paymentDate: {
      type: String,
      default: null,
    },
    cardLast4: {
      type: String,
      default: null,
    },
    paymentMethod: {
      type: String,
      default: null,
    },
    receipt_url: {
      type: String,
      default: null,
    },
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  },
);

const Payments = model<IPayments, IPaymentsModules>('Payments', paymentsSchema);
export default Payments;
