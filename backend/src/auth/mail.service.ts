import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    // Log the variables to make sure they are loaded
    console.log("📧 Initializing MailService with:", process.env.EMAIL_USER);

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendActivationEmail(to: string, token: string) {
    const activationLink = `http://localhost:3000/activate?token=${token}`;

    try {
      const info = await this.transporter.sendMail({
        from: `"MediCare" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: 'Activate Your MediCare Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #008c9e; text-align: center;">Welcome to MediCare!</h2>
            <p style="color: #334155; font-size: 16px;">Please click the button below to activate your account and set your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${activationLink}" style="padding: 12px 24px; background-color: #008c9e; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Activate Account
              </a>
            </div>
            <p style="color: #64748b; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="color: #008c9e; font-size: 14px; word-break: break-all;">${activationLink}</p>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">This link expires in 24 hours.</p>
          </div>
        `,
      });
      console.log("✅ Email sent successfully:", info.messageId);
    } catch (error) {
      console.error("❌ Failed to send email. Error:", error);
      throw new InternalServerErrorException('Failed to send activation email. Please check backend logs.');
    }
  }
}