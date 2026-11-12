
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthRecordsService {
  constructor(private prisma: PrismaService) {}

  async findPatientRecords(userId: string) {
    try {
      return await this.prisma.healthRecord.findMany({
        where: { 
          patient: { userId: userId } 
        },
        orderBy: { recordDate: 'desc' },
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async createRecord(data: { patientId: string; title: string; type: any; fileUrl: string }) {
    return this.prisma.healthRecord.create({
      data: {
        patientId: data.patientId,
        title: data.title,
        type: data.type,
        fileUrl: data.fileUrl,
      },
    });
  }
}