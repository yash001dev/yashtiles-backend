import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class NewsletterSubscription extends Document {
  @Prop({ required: true, unique: true })
  email: string;
}

export const NewsletterSubscriptionSchema = SchemaFactory.createForClass(NewsletterSubscription); 