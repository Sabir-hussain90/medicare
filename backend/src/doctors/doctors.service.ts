import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.doctor.findMany({
      include: { 
        user: { select: { id: true, name: true, email: true } } 
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.doctor.findUnique({
      where: { id },
      include: { 
        user: { select: { id: true, name: true, email: true } } 
      },
    });
  }

  async createDoctor(data: { name: string; email: string; specialization: string; password: string }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: hashedPassword,
        role: 'DOCTOR',
        authProvider: 'credentials',
        emailVerified: true,
        doctorProfile: {
          create: {
            specialization: data.specialization,
            experience: 5,
            rating: 4.5,
            reviewCount: 10,
            consultationFee: 50,
          },
        },
      },
      include: { doctorProfile: true },
    });
  }
}