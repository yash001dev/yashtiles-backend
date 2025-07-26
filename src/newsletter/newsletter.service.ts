import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NewsletterSubscription } from './newsletter.schema';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(NewsletterSubscription.name) private newsletterModel: Model<NewsletterSubscription>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async subscribe(dto: SubscribeNewsletterDto) {
    // Prevent duplicate subscriptions
    const exists = await this.newsletterModel.findOne({ email: dto.email });
    if (exists) throw new ConflictException('Email is already subscribed');
    // Save to DB
    const sub = new this.newsletterModel({ email: dto.email });
    await sub.save();
    // Send thank-you email
    await this.notificationsService.sendNewsletterThankYouEmail(dto.email);
    return { message: 'Thank you for subscribing!' };
  }
} 