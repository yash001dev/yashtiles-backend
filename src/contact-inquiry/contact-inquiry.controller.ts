import { Body, Controller, Post } from '@nestjs/common';
import { ContactInquiryService } from './contact-inquiry.service';
import { CreateContactInquiryDto } from './dto/create-contact-inquiry.dto';

@Controller('contact-inquiry')
export class ContactInquiryController {
  constructor(private readonly contactInquiryService: ContactInquiryService) {}

  @Post()
  async createContactInquiry(@Body() dto: CreateContactInquiryDto) {
    const { ticketNumber } = await this.contactInquiryService.createInquiry(dto);
    return {
      message: 'Thank you for contacting us! We will reach out to you as soon as possible.',
      ticketNumber,
    };
  }
} 