import { Model, ObjectId } from 'mongoose';

export interface IImages {
  url: string;
  key: string;
}
export interface IReportContent {
  product: ObjectId | string;
  reportType:
    | 'Fake product'
    | 'Cheater exchanger'
    | 'Reject product'
    | 'Product problem'
    | 'Other issue';
  images: IImages[];
  description: string;
  user: ObjectId | string;
}

export type IReportContentModules = Model<
  IReportContent,
  Record<string, unknown>
>;
