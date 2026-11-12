import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // 🔥 THIS FETCHES ALL USERS WITH THEIR PROFILE
  async findAllUsers() {
    return this.prisma.user.findMany({
      include: {
        patientProfile: true, // Important for the dropdown ID
        doctorProfile: true,
      },
    });
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true, doctorProfile: true },
    });
  }

  async getDashboardStats(userId: string) {
    const appointmentsCount = await this.prisma.appointment.count({
      where: { patient: { userId: userId } },
    });

    const messagesCount = await this.prisma.message.count({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] }
    });

    const consultationsCount = await this.prisma.appointment.count({
      where: { patient: { userId: userId }, status: 'COMPLETED' },
    });

    return {
      appointments: appointmentsCount,
      consultations: consultationsCount,
      messages: messagesCount,
    };
  }

  async createProfileIfMissing(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true }
    });

    if (!user) throw new Error("User not found");
    if (user.patientProfile) return user.patientProfile;

    return this.prisma.patient.create({
      data: { userId: userId }
    });
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string; profileImage?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name: data.name },
    });
    
    if (data.phone || data.profileImage) {
      await this.prisma.patient.updateMany({
        where: { userId: userId },
        data: { phone: data.phone, profileImage: data.profileImage },
      });
    }
    return user;
  }
}