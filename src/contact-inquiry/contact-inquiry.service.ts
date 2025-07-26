import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactInquiry } from './contact-inquiry.schema';
import { CreateContactInquiryDto } from './dto/create-contact-inquiry.dto';
// import your mailer service (adjust path as needed)
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ContactInquiryService {
  constructor(
    @InjectModel(ContactInquiry.name) private inquiryModel: Model<ContactInquiry>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createInquiry(dto: CreateContactInquiryDto): Promise<{ ticketNumber: string }> {
    // Generate a unique ticket number (e.g., CT-YYYYMMDD-XXXX)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `CT-${dateStr}-${random}`;

    // Save to DB
    const inquiry = new this.inquiryModel({ ...dto, ticketNumber });
    await inquiry.save();

    // Send thank-you email
    await this.notificationsService.sendContactInquiryThankYouEmail(dto.email, dto.firstName, ticketNumber);

    return { ticketNumber };
  }
} 