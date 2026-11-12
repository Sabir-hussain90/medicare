import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer() server: Server;
  private activeUsers = new Map<string, string>();

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('register')
  handleRegister(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    this.activeUsers.set(userId, client.id);
    console.log(`✅ User registered for WebRTC: ${userId}`);
  }

  // 🔥 WEBRTC SIGNALING
  @SubscribeMessage('webrtc-offer')
  handleOffer(@MessageBody() data: { senderId: string; receiverId: string; offer: any }) {
    const receiverSocketId = this.activeUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('webrtc-offer', { senderId: data.senderId, offer: data.offer });
    }
  }

  @SubscribeMessage('webrtc-answer')
  handleAnswer(@MessageBody() data: { senderId: string; receiverId: string; answer: any }) {
    const receiverSocketId = this.activeUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('webrtc-answer', { senderId: data.senderId, answer: data.answer });
    }
  }

  @SubscribeMessage('webrtc-ice-candidate')
  handleIceCandidate(@MessageBody() data: { senderId: string; receiverId: string; candidate: any }) {
    const receiverSocketId = this.activeUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('webrtc-ice-candidate', { senderId: data.senderId, candidate: data.candidate });
    }
  }

  @SubscribeMessage('webrtc-end-call')
  handleEndCall(@MessageBody() data: { senderId: string; receiverId: string }) {
    const receiverSocketId = this.activeUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('webrtc-end-call');
    }
  }

  // EXISTING CHAT MESSAGE LOGIC
  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: { senderId: string; receiverId: string; content: string }, @ConnectedSocket() client: Socket) {
    try {
      const savedMessage = await this.chatService.saveMessage(data.senderId, data.receiverId, data.content);
      const receiverSocketId = this.activeUsers.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('newMessage', savedMessage);
      }
      client.emit('messageSent', savedMessage);
    } catch (error: any) {
      console.error("Chat error:", error.message);
    }
  }
}