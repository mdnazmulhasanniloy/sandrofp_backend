import { Model, ObjectId } from 'mongoose';
import { ICategory } from '../category/category.interface';
import { IUser } from '../user/user.interface';
interface IImages {
  key: string;
  url: string;
}

interface ILocation {
  type: string;
  coordinates: [number, number];
}
export interface IProducts {
  images: IImages[];
  author: ObjectId | IUser;
  name: string;
  descriptions: string;
  location: ILocation;
  price: number;
  discount: number;
  size: string;
  brands: string;
  category: ObjectId | ICategory;
  materials: string;
  colors: string;
  tags: string[];
  isSoldOut: boolean;
  isFeatured: boolean;
  quantity: string;
  isDeleted: boolean;
  isVerified: boolean;
}

export type IProductsModules = Model<IProducts, Record<string, unknown>>;
