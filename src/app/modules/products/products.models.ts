import { model, Schema } from 'mongoose';
import { IProducts, IProductsModules } from './products.interface';

const imageSchema = new Schema({
  key: { type: String, required: [true, 'Image key is required'] },
  url: {
    type: String,
    required: [true, 'Image URL is required'],
    match: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
  }, // URL validation
});

const productsSchema = new Schema<IProducts>(
  {
    images: [imageSchema],
    author: { type: String,
      ref:{
        
      }, required: [true, 'Product author is required'] },
    name: { type: String, required: [true, 'Product name is required'] },
    details: { type: String, required: [true, 'Product details are required'] },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    quantity: { type: String, required: [true, 'Quantity is required'] },
    expiredAt: { type: String, required: [true, 'Expiry date is required'] },
    discount: { type: Number, default: 0 },
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  },
);

const Products = model<IProducts, IProductsModules>('Products', productsSchema);
export default Products;
