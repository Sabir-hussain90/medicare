import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  getHistory(@Query('user1Id') user1Id: string, @Query('user2Id') user2Id: string) {
    return this.chatService.getChatHistory(user1Id, user2Id);
  }

  @Get('doctor-patients')
  getDoctorPatients(@Query('doctorId') doctorId: string) {
    return this.chatService.getDoctorPatients(doctorId);
  }

  @Get('unread-count')
  getUnreadCount(@Query('doctorId') doctorId: string) {
    return this.chatService.getUnreadCountForDoctor(doctorId);
  }

  @Post('read')
  markAsRead(@Body() body: { senderId: string; receiverId: string }) {
    return this.chatService.markAsRead(body.senderId, body.receiverId);
  }

  @Post('send')
  sendMessage(@Body() body: any) {
    return this.chatService.saveMessage(body.senderId, body.receiverId, body.content);
  }
}