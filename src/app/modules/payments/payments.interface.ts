import { Model, ObjectId } from 'mongoose';
import { IUser } from '../user/user.interface';

export interface IPayments {
  _id: string;
  user: ObjectId | IUser;
  tokenRate: number;
  tnxId: string;
  paymentIntentId: string;
  totalToken: number;
  price: number;
  status: 'pending' | 'paid' | 'refunded' | 'canceled';
  isDeleted: boolean;
}

export type IPaymentsModules = Model<IPayments, Record<string, unknown>>;
