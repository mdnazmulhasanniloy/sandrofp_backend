import { Model, ObjectId } from 'mongoose';
import { IUser } from '../user/user.interface';

export enum REVIEW_MODEL_TYPE {
  apartment = 'Apartment',
  property = 'Property',
}

export interface IReviews {
  _id?: string;
  user: ObjectId | IUser;
  title: string;
  seller: ObjectId | IUser;
  review: string;
  rating: number;
  booking?: ObjectId;
}

export type IReviewsModules = Model<IReviews, Record<string, unknown>>;
