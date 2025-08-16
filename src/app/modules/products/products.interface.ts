import { Model, ObjectId } from 'mongoose';
import { ICategory } from '../category/category.interface';
interface IImages {
  key: string;
  url: string;
}
export interface IProducts {
  images: IImages[];
  author: ObjectId;
  name: string;
  details: string;
  category: ObjectId | ICategory;
  price: number;
  quantity: string;
  expiredAt: string;
  discount: number;
  isDeleted: boolean;
}

export type IProductsModules = Model<IProducts, Record<string, unknown>>;
