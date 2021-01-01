import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { VerifyUserDto } from 'src/user/dto';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}
  async sendEmail(confirmUrl: string, user: User) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'welcome to TeLead ! Confirm your email',
      template: './welcome',
      context: {
        name: user.email,
        confirmUrl: confirmUrl,
      },
    });
  }
  // send email confirmation
  async sendResetEmail(email: VerifyUserDto, user: User, resetLink: string) {
    await this.mailerService.sendMail({
      to: email.email,
      subject: 'Reset password',
      template: './resetPassword',
      context: {
        name: user.fullName,
        resetLink,
      },
    });
  }
}
