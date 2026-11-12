import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async saveMessage(senderId: string, receiverId: string, content: string) {
    try {
      return await this.prisma.message.create({
        data: { senderId, receiverId, content, isRead: false },
      });
    } catch (error: any) {
      return { error: true, message: error?.message };
    }
  }

  async getChatHistory(user1Id: string, user2Id: string) {
    try {
      return await this.prisma.message.findMany({
        where: {
          OR: [
            { senderId: user1Id, receiverId: user2Id },
            { senderId: user2Id, receiverId: user1Id },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });
    } catch (error: any) {
      return [];
    }
  }

  async getDoctorPatients(doctorId: string) {
    try {
      const messages = await this.prisma.message.findMany({
        where: { OR: [{ senderId: doctorId }, { receiverId: doctorId }] },
        include: { 
          sender: { include: { patientProfile: true } }, 
          receiver: { include: { patientProfile: true } } 
        },
        orderBy: { createdAt: 'desc' },
      });

      const patientMap = new Map();
      for (const msg of messages) {
        const otherUser = msg.senderId === doctorId ? msg.receiver : msg.sender;
        
        if (otherUser.role === 'PATIENT' && !patientMap.has(otherUser.id)) {
          patientMap.set(otherUser.id, {
            id: otherUser.id,
            name: otherUser.name || "Patient",
            lastMessage: msg.content,
            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unreadCount: msg.receiverId === doctorId && !msg.isRead ? 1 : 0,
            // 🔥 THIS SENDS THE REAL IMAGE TO FRONTEND
            profileImage: otherUser.patientProfile?.profileImage || null 
          });
        }
      }
      return Array.from(patientMap.values());
    } catch (error) {
      return [];
    }
  }

  async getUnreadCountForDoctor(doctorId: string) {
    try {
      return this.prisma.message.count({ where: { receiverId: doctorId, isRead: false } });
    } catch (e) { return 0; }
  }

  async markAsRead(senderId: string, receiverId: string) {
    try {
      await this.prisma.message.updateMany({
        where: { senderId: senderId, receiverId: receiverId, isRead: false },
        data: { isRead: true },
      });
    } catch (e) {}
  }
}