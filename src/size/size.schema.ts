import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Size extends Document {
  @Prop({ required: true })
  size: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: true })
  enabled: boolean;
}

export const SizeSchema = SchemaFactory.createForClass(Size);
