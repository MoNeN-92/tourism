import { HttpCode, Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  private getClientIp(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];

    if (typeof forwardedFor === 'string' && forwardedFor.trim().length > 0) {
      return forwardedFor.split(',')[0].trim();
    }

    if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
      return forwardedFor[0].split(',')[0].trim();
    }

    return request.ip || request.socket.remoteAddress || 'unknown';
  }

  @Post()
  @HttpCode(202)
  create(@Body() dto: CreateContactMessageDto, @Req() request: Request) {
    return this.contactService.submit(dto, this.getClientIp(request));
  }
}
