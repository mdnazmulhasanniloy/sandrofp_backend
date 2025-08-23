import { model, Schema, Types } from 'mongoose';
import {
  IReviews,
  IReviewsModules,
  REVIEW_MODEL_TYPE,
} from './reviews.interface';

const reviewsSchema = new Schema<IReviews>(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    review: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  },
);

const Reviews = model<IReviews, IReviewsModules>('Reviews', reviewsSchema);
export default Reviews;
