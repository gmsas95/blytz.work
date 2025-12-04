import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { prisma } from '../utils/prisma.js';
import { pushNotificationService } from './pushNotificationService.js';
import { getAuth } from 'firebase-admin/auth';

export interface SocketUser {
  userId: string;
  email: string;
  role: 'va' | 'company' | 'admin';
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'read';
  createdAt: Date;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
}

export class WebSocketServer {
  private io: SocketIOServer;
  private connectedUsers: Map<string, Set<string>> = new Map(); // userId -> socketIds

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || [
          "https://hyred.blytz.app",
          "https://blytz.work",
          "http://localhost:3000",
          "http://localhost:3001"
        ],
        credentials: true,
        methods: ["GET", "POST"]
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    console.log('🚀 WebSocket server initialized');
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          console.log('❌ No token provided for WebSocket connection');
          return next(new Error('Authentication token required'));
        }

        // Verify Firebase token
        const decodedToken = await getAuth().verifyIdToken(token);
        
        // Get user from database
        const user = await prisma.user.findUnique({
          where: { email: decodedToken.email },
          select: { id: true, email: true, role: true }
        });

        if (!user) {
          console.log('❌ User not found for WebSocket connection:', decodedToken.email);
          return next(new Error('User not found'));
        }

        // Attach user to socket
        socket.data.user = user;
        console.log('✅ WebSocket authenticated:', user.email);
        next();
        
      } catch (error) {
        console.error('❌ WebSocket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const user = socket.data.user as SocketUser;
      console.log('🔌 User connected to WebSocket:', user.email, 'Socket:', socket.id);
      
      // Track connected user
      if (!this.connectedUsers.has(user.userId)) {
        this.connectedUsers.set(user.userId, new Set());
      }
      this.connectedUsers.get(user.userId)!.add(socket.id);

      // Join user's personal room for notifications
      socket.join(`user_${user.userId}`);

      // Chat room events
      this.handleChatEvents(socket, user);
      
      // Typing indicators
      this.handleTypingEvents(socket, user);
      
      // Status updates
      this.handleStatusEvents(socket, user);

      socket.on('disconnect', () => {
        console.log('🔌 User disconnected:', user.email, 'Socket:', socket.id);
        
        // Remove from connected users
        const userSockets = this.connectedUsers.get(user.userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            this.connectedUsers.delete(user.userId);
          }
        }
      });
    });
  }

  private handleChatEvents(socket: any, user: SocketUser) {
    socket.on('join_chat', async (data) => {
      try {
        const { chatRoomId } = data;
        console.log(`📱 User ${user.email} joining chat ${chatRoomId}`);
        
        // Verify user has access to this chat room
        const hasAccess = await this.verifyChatAccess(chatRoomId, user.userId);
        
        if (!hasAccess) {
          socket.emit('error', { message: 'Access denied to this chat room' });
          return;
        }

        // Join the chat room
        socket.join(`chat_${chatRoomId}`);
        socket.data.currentChatRoom = chatRoomId;
        
        // Send recent messages
        const recentMessages = await this.getRecentMessages(chatRoomId);
        socket.emit('chat_history', recentMessages);
        
        // Notify other participants
        socket.to(`chat_${chatRoomId}`).emit('user_joined', {
          userId: user.userId,
          name: user.role === 'va' ? 
            (await prisma.vAProfile.findUnique({ where: { userId: user.userId } }))?.name :
            (await prisma.company.findUnique({ where: { userId: user.userId } }))?.name,
          joinedAt: new Date()
        });
        
        console.log(`✅ User ${user.email} joined chat ${chatRoomId}`);
        
      } catch (error) {
        console.error('❌ Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat room' });
      }
    });

    socket.on('send_message', async (data) => {
      try {
        const { content, chatRoomId, type = 'text' } = data;
        const userId = user.userId;
        
        if (!socket.data.currentChatRoom || socket.data.currentChatRoom !== chatRoomId) {
          socket.emit('error', { message: 'Not authorized for this chat room' });
          return;
        }

        console.log(`💬 Message from ${user.email} in chat ${chatRoomId}: ${content.substring(0, 50)}...`);

        // Save message to database
        const message = await prisma.message.create({
          data: {
            roomId: chatRoomId,
            senderId: userId,
            content,
            type: type as 'text' | 'image' | 'file',
            status: 'sent'
          },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                vaProfile: { select: { name: true, avatarUrl: true } },
                company: { select: { name: true, logoUrl: true } }
              }
            }
          }
        });

        // Update chat room last message time
        await prisma.chatRoom.update({
          where: { id: chatRoomId },
          data: { lastMessageAt: new Date() }
        });

        // Format message for client
        const formattedMessage: ChatMessage = {
          id: message.id,
          roomId: message.roomId,
          senderId: message.senderId,
          content: message.content,
          type: message.type,
          status: message.status,
          createdAt: message.createdAt,
          sender: {
            id: message.sender.id,
            name: message.sender.vaProfile?.name || message.sender.company?.name || message.sender.email,
            avatar: message.sender.vaProfile?.avatarUrl || message.sender.company?.logoUrl,
            role: message.sender.vaProfile ? 'va' : 'company'
          }
        };

        // Broadcast to all participants in the room
        this.io.to(`chat_${chatRoomId}`).emit('new_message', formattedMessage);

        // Send push notification to other participants
        await this.notifyOtherParticipants(chatRoomId, userId, message);

        console.log(`✅ Message sent and broadcasted in chat ${chatRoomId}`);
        
      } catch (error) {
        console.error('❌ Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('mark_message_read', async (data) => {
      try {
        const { messageId } = data;
        
        // Update message status
        await prisma.message.update({
          where: { id: messageId },
          data: { status: 'read' }
        });

        // Notify sender
        const message = await prisma.message.findUnique({
          where: { id: messageId },
          select: { senderId: true, roomId: true }
        });

        if (message && message.senderId !== user.userId) {
          // Notify the sender that message was read
          const senderSockets = this.connectedUsers.get(message.senderId);
          if (senderSockets) {
            for (const socketId of senderSockets) {
              this.io.to(socketId).emit('message_read', { messageId });
            }
          }
        }
        
      } catch (error) {
        console.error('❌ Error marking message as read:', error);
      }
    });
  }

  private handleTypingEvents(socket: any, user: SocketUser) {
    socket.on('typing', (data) => {
      const { isTyping, chatRoomId } = data;
      
      if (socket.data.currentChatRoom === chatRoomId) {
        socket.to(`chat_${chatRoomId}`).emit('user_typing', {
          userId: user.userId,
          isTyping,
          chatRoomId
        });
      }
    });
  }

  private handleStatusEvents(socket: any, user: SocketUser) {
    socket.on('update_status', (data) => {
      const { status, chatRoomId } = data;
      
      if (socket.data.currentChatRoom === chatRoomId) {
        socket.to(`chat_${chatRoomId}`).emit('user_status_updated', {
          userId: user.userId,
          status,
          chatRoomId
        });
      }
    });
  }

  private async verifyChatAccess(chatRoomId: string, userId: string): Promise<boolean> {
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      select: { participant1Id: true, participant2Id: true }
    });

    if (!chatRoom) return false;
    
    return chatRoom.participant1Id === userId || chatRoom.participant2Id === userId;
  }

  private async getRecentMessages(chatRoomId: string, limit: number = 50): Promise<ChatMessage[]> {
    const messages = await prisma.message.findMany({
      where: { roomId: chatRoomId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            vaProfile: { select: { name: true, avatarUrl: true } },
            company: { select: { name: true, logoUrl: true } }
          }
        }
      }
    });

    return messages.reverse().map(message => ({
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      content: message.content,
      type: message.type,
      status: message.status,
      createdAt: message.createdAt,
      sender: {
        id: message.sender.id,
        name: message.sender.vaProfile?.name || message.sender.company?.name || message.sender.email,
        avatar: message.sender.vaProfile?.avatarUrl || message.sender.company?.logoUrl,
        role: message.sender.vaProfile ? 'va' : 'company'
      }
    }));
  }

  private async notifyOtherParticipants(chatRoomId: string, senderId: string, message: any) {
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      select: { participant1Id: true, participant2Id: true }
    });

    if (!chatRoom) return;

    const otherParticipantId = chatRoom.participant1Id === senderId 
      ? chatRoom.participant2Id 
      : chatRoom.participant1Id;

    if (otherParticipantId) {
      await pushNotificationService.sendNotification(otherParticipantId, {
        title: 'New Message',
        body: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
        type: 'chat_message',
        data: { 
          chatRoomId,
          messageId: message.id,
          senderId: senderId
        }
      });
    }
  }

  // Public methods for sending notifications
  async sendNotification(userId: string, notification: any) {
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets && userSockets.size > 0) {
      this.io.to(`user_${userId}`).emit('notification', notification);
    }
  }

  async broadcastToChat(chatRoomId: string, event: string, data: any) {
    this.io.to(`chat_${chatRoomId}`).emit(event, data);
  }

  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}