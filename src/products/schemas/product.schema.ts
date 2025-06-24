import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop([{
    size: { type: String, required: true },
    price: { type: Number, required: true },
  }])
  pricing: Array<{
    size: string;
    price: number;
  }>;

  @Prop([String])
  availableSizes: string[];

  @Prop([String])
  frameTypes: string[];

  @Prop([String])
  images: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({
    type: {
      material: String,
      weight: String,
      dimensions: String,
      care: String,
    },
  })
  specifications?: {
    material: string;
    weight: string;
    dimensions: string;
    care: string;
  };

  @Prop([String])
  tags: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ sortOrder: 1 });