import { model, Schema } from 'mongoose';
import {
  IReportContent,
  IReportContentModules,
} from './reportContent.interface';

const imageSchema = new Schema({
  key: { type: String, required: [true, 'Image key is required'] },
  url: {
    type: String,
    required: [true, 'Image URL is required'],
    match: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
  }, // URL validation
});

const reportContentSchema = new Schema<IReportContent>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    reportType: {
      type: String,
      enum: [
        'Fake product',
        'Cheater exchanger',
        'Reject product',
        'Product problem',
        'Other issue',
      ],
      required: true,
    },
    images: [imageSchema],
    description: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const ReportContent = model<IReportContent, IReportContentModules>(
  'ReportContent',
  reportContentSchema,
);
export default ReportContent;
