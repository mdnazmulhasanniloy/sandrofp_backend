import { ObjectId } from 'mongodb';
export enum modeType {
  Exchanges = 'Exchanges',
  ReportContent = 'ReportContent',
  Order = 'Order',
  Payments = 'Payments',
}
export interface TNotification {
  receiver: ObjectId;
  message: string;
  description?: string;
  refference: ObjectId;
  model_type: modeType;
  date?: Date;
  read: boolean;
  isDeleted: boolean;
}
