
import { model, Schema } from 'mongoose';
import { IDashbaord, IDashbaordModules } from './dashbaord.interface';

const dashbaordSchema = new Schema<IDashbaord>(
  {
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  }
);
 

const Dashbaord = model<IDashbaord, IDashbaordModules>(
  'Dashbaord',
  dashbaordSchema
);
export default Dashbaord;