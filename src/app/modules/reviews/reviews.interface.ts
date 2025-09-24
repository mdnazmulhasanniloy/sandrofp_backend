import { Model, ObjectId } from 'mongoose';
import { IUser } from '../user/user.interface';

 

export interface IReviews {
  _id?: string;
  user: ObjectId | IUser;
  title: string;
  seller: ObjectId | IUser;
  review: string;
  rating: number;
  reference?: ObjectId;
}

export type IReviewsModules = Model<IReviews, Record<string, unknown>>;
