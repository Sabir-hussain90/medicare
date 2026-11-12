import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { patientId: string; doctorId: string; date: string; timeSlot: string }) {
    const existing = await this.prisma.appointment.findFirst({
      where: {
        doctorId: data.doctorId,
        date: new Date(data.date),
        timeSlot: data.timeSlot,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (existing) throw new BadRequestException('This time slot is already booked');

    return this.prisma.appointment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        date: new Date(data.date),
        timeSlot: data.timeSlot,
        status: 'PENDING',
      },
    });
  }

  async findUserAppointments(userId: string, role: string) {
    if (role === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({ where: { userId } });
      if (!patient) return [];
      return this.prisma.appointment.findMany({
        where: { patientId: patient.id },
        include: { doctor: { include: { user: { select: { name: true } } } } },
        orderBy: { date: 'asc' },
      });
    } else if (role === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
      if (!doctor) return [];
      return this.prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        include: { patient: { include: { user: { select: { name: true } } } } },
        orderBy: { date: 'asc' },
      });
    }
    return [];
  }
}