import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactInquiry, ContactInquirySchema } from './contact-inquiry.schema';
import { ContactInquiryService } from './contact-inquiry.service';
import { ContactInquiryController } from './contact-inquiry.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ContactInquiry.name, schema: ContactInquirySchema }]),
    NotificationsModule,
  ],
  providers: [ContactInquiryService],
  controllers: [ContactInquiryController],
})
export class ContactInquiryModule {} 