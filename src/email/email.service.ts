import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}
  async sendEmail(confirmUrl: string, user: CreateUserDto) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'welcome to TeLead ! Confirm your email',
      template: './welcome',
      context: {
        name: user.email,
        confirmation_url: confirmUrl,
      },
    });
  }
}
