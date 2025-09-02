import { Model, ObjectId } from 'mongoose';

export interface IExchanges {
  user: ObjectId;
  status:
    | 'requested'
    | 'accepted'
    | 'decline'
    | 'approved'
    | 'rejected'
    | 'complete';
  products: ObjectId[];
  exchangeWith: ObjectId[];
  extraToken: number;
  reason: string;
  totalToken: number;
  requestTo: ObjectId;
  isReviewed: boolean;
  isDeleted: boolean;
}

export type IExchangesModules = Model<IExchanges, Record<string, unknown>>;
