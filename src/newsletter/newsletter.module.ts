import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NewsletterSubscription, NewsletterSubscriptionSchema } from './newsletter.schema';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: NewsletterSubscription.name, schema: NewsletterSubscriptionSchema }]),
    NotificationsModule,
  ],
  providers: [NewsletterService],
  controllers: [NewsletterController],
})
export class NewsletterModule {} 