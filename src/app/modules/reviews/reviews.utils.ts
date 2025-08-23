import { Types } from 'mongoose';
import Reviews from './reviews.models';

interface IReturn {
  averageRating: number;
  totalReviews: number;
}

export const getAverageRating = async (sellerId: string): Promise<IReturn> => {
  const result = await Reviews.aggregate([
    {
      $match: { seller: new Types.ObjectId(sellerId) },
    },
    {
      $group: {
        _id: '$seller',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (result.length === 0) {
    return { averageRating: 0, totalReviews: 0 };
  }

  return result[0];
};
