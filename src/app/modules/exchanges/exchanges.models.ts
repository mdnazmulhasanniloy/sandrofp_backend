import { model, Schema, Types } from 'mongoose';
import { IExchanges, IExchangesModules } from './exchanges.interface';
import { EXCHANGE_STATUS } from './exchanges.constants';

const exchangesSchema = new Schema<IExchanges>(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestTo: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: [
        'requested',
        'accepted',
        'decline',
        'approved',
        'rejected',
        'complete',
      ],
      default: EXCHANGE_STATUS.Requested,
    },
    products: [
      {
        type: Types?.ObjectId,
        ref: 'Products',
        require: true,
      },
    ],
    exchangeWith: [
      {
        type: Types?.ObjectId,
        ref: 'Products',
        require: true,
      },
    ],
    extraToken: {
      type: Number,
      default: 0,
    },
    totalToken: {
      type: Number,
      required: true,
    },
    reviewers: [
      {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    reason: { type: String, default: null },
    isReviewed: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

const Exchanges = model<IExchanges, IExchangesModules>(
  'Exchanges',
  exchangesSchema,
);
export default Exchanges;
