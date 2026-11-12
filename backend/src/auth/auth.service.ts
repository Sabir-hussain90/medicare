import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from './mail.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async googleLogin(req: any) {
    if (!req.user) throw new UnauthorizedException('No user from google');
    const { email, name } = req.user;
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: { 
          email, 
          name, 
          authProvider: 'google', 
          emailVerified: true,
          // 🔥 Create Patient Profile automatically
          patientProfile: {
            create: {}
          }
        },
      });
    }
    const token = this.jwtService.sign({ id: user.id, role: user.role });
    return { token, user };
  }

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      const hashedPassword = await bcrypt.hash(pass, 10);
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      try {
        await this.mailService.sendActivationEmail(email, token);
      } catch (error) {
        throw new BadRequestException('Could not send activation email.');
      }

      await this.prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          authProvider: 'credentials',
          emailVerified: false,
          activationToken: token,
          activationExpires: expires,
          // 🔥 Create Patient Profile automatically
          patientProfile: {
            create: {}
          }
        },
      });

      throw new BadRequestException('Account created! Please check your Gmail to activate.');
    }

    if (!user.emailVerified) throw new UnauthorizedException('Please check your Gmail to activate.');
    if (!user.passwordHash) throw new UnauthorizedException('Please use Google Login.');

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials.');

    const token = this.jwtService.sign({ id: user.id, role: user.role });
    return { token, user };
  }

  async activateAccount(token: string, newPassword: string) {
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (newPassword.length < 10) throw new BadRequestException('Password must be at least 10 characters.');
    if (!specialCharRegex.test(newPassword)) throw new BadRequestException('Password must contain a special character.');

    const user = await this.prisma.user.findFirst({
      where: { activationToken: token, activationExpires: { gt: new Date() } },
    });

    if (!user) throw new BadRequestException('Invalid or expired token');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword, emailVerified: true, activationToken: null, activationExpires: null },
    });

    return { message: 'Account activated successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'If an account exists, a reset link has been sent.' };

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { email },
      data: { activationToken: token, activationExpires: expires },
    });

    console.log(`🔗 Reset Link: http://localhost:3000/reset-password?token=${token}`);
    return { message: 'If an account exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: { activationToken: token, activationExpires: { gt: new Date() } },
    });

    if (!user) throw new BadRequestException('Invalid or expired token');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword, activationToken: null, activationExpires: null },
    });

    return { message: 'Password reset successfully' };
  }
}