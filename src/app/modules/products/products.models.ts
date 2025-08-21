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
    author: {
      type: String,
      ref: 'User',
      required: [true, 'Product author is required'],
    },
    name: { type: String, required: [true, 'Product name is required'] },
    descriptions: { type: String, default: null },
    size: { type: String, default: null },
    brands: { type: String, default: null },
    materials: { type: String, default: null },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    colors: { type: String, default: null },
    tags: [{ type: String, required: [true, 'Tag is required'] }],
    isSoldOut: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    quantity: { type: String, required: [true, 'Quantity is required'] },
    discount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

productsSchema.index({ location: '2dsphere' });

productsSchema.index({
  name: 'text',
  author: 'text',
  category: 1,
  isVerified: 1,
  price: 1,
});

const Products = model<IProducts, IProductsModules>('Products', productsSchema);
export default Products;
