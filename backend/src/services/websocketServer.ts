import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { prisma } from '../utils/prisma.js';
import { getAuth } from '../config/firebaseConfig-simplified.js';

export interface SocketUser {
  userId: string;
  email: string;
  role: 'va' | 'company' | 'admin';
}

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  createdAt: Date;
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
    this.io.use(async (socket: any, next: any) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        // Verify Firebase token
        const decodedToken = await getAuth().verifyIdToken(token);
        const userId = decodedToken.uid;
        
        // Get user data from database
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, role: true }
        });

        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        socket.user = {
          userId: user.id,
          email: user.email,
          role: user.role as 'va' | 'company' | 'admin'
        };

        next();
      } catch (error: any) {
        console.error('Socket authentication error:', error.message);
        next(new Error('Authentication error'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: any) => {
      console.log(`User connected: ${socket.user?.userId}`);
      
      // Add user to connected users
      const userId = socket.user?.userId;
      if (userId) {
        if (!this.connectedUsers.has(userId)) {
          this.connectedUsers.set(userId, new Set());
        }
        this.connectedUsers.get(userId)?.add(socket.id);
      }

      // Handle joining chat rooms
      socket.on('join-chat', async (data: { recipientId: string }) => {
        try {
          const { recipientId } = data;
          const roomId = this.getRoomId(userId, recipientId);
          socket.join(roomId);
          console.log(`User ${userId} joined chat room ${roomId}`);
          
          // Send recent messages
          const recentMessages = await this.getRecentMessages(userId, recipientId, 20);
          socket.emit('chat-history', recentMessages);
        } catch (error: any) {
          console.error('Error joining chat:', error.message);
          socket.emit('error', { message: 'Failed to join chat' });
        }
      });

      // Handle sending messages
      socket.on('send-message', async (data: { recipientId: string; content: string }) => {
        try {
          const { recipientId, content } = data;
          
          // Create notification as message
          const notification = await prisma.notification.create({
            data: {
              userId: recipientId,
              type: 'chat_message',
              title: 'New Message',
              message: content,
              data: {
                senderId: userId,
                senderName: socket.user?.email,
                senderRole: socket.user?.role,
                timestamp: new Date().toISOString()
              }
            }
          });

          // Emit to recipient if online
          const recipientSockets = this.connectedUsers.get(recipientId);
          if (recipientSockets && recipientSockets.size > 0) {
            const messageData = {
              id: String(notification.id),
              content: notification.message,
              senderId: userId,
              senderName: socket.user?.email,
              senderRole: socket.user?.role,
              createdAt: notification.createdAt
            };

            recipientSockets.forEach(socketId => {
              this.io.to(socketId).emit('new-message', messageData);
            });
          }

          // Send confirmation back to sender
          socket.emit('message-sent', {
            messageId: String(notification.id),
            createdAt: notification.createdAt
          });

        } catch (error: any) {
          console.error('Error sending message:', error.message);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle marking messages as read
      socket.on('mark-as-read', async (data: { messageId: string }) => {
        try {
          const { messageId } = data;
          
          await prisma.notification.update({
            where: { id: messageId },
            data: { read: true }
          });

          socket.emit('message-read', { messageId });
        } catch (error: any) {
          console.error('Error marking as read:', error.message);
          socket.emit('error', { message: 'Failed to mark message as read' });
        }
      });

      // Handle getting unread count
      socket.on('get-unread-count', async () => {
        try {
          const unreadCount = await prisma.notification.count({
            where: {
              userId: userId,
              type: 'chat_message',
              read: false
            }
          });

          socket.emit('unread-count', { count: unreadCount });
        } catch (error: any) {
          console.error('Error getting unread count:', error.message);
          socket.emit('error', { message: 'Failed to get unread count' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${userId}`);
        if (userId) {
          const userSockets = this.connectedUsers.get(userId);
          if (userSockets) {
            userSockets.delete(socket.id);
            if (userSockets.size === 0) {
              this.connectedUsers.delete(userId);
            }
          }
        }
      });
    });
  }

  private getRoomId(userId1: string, userId2: string): string {
    // Create consistent room ID regardless of order
    return [userId1, userId2].sort().join('-');
  }

  private async getRecentMessages(userId1: string, userId2: string, limit: number = 20): Promise<ChatMessage[]> {
    try {
      // Get messages between these two users
      const notifications = await prisma.notification.findMany({
        where: {
          OR: [
            {
              userId: userId2,
              type: 'chat_message',
              data: {
                path: ['senderId'],
                equals: userId1
              }
            },
            {
              userId: userId1,
              type: 'chat_message',
              data: {
                path: ['senderId'],
                equals: userId2
              }
            }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return notifications.reverse().map(notification => {
        const notificationData = notification.data as Record<string, any>;
        
        return {
          id: String(notification.id),
          content: notification.message,
          senderId: String(notificationData?.senderId || ""),
          senderName: String(notificationData?.senderName || "Unknown"),
          senderRole: String(notificationData?.senderRole || "unknown"),
          createdAt: notification.createdAt
        };
      });
    } catch (error: any) {
      console.error('Error getting recent messages:', error.message);
      return [];
    }
  }

  // Method to emit events to specific users
  public emitToUser(userId: string, event: string, data: any) {
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets && userSockets.size > 0) {
      userSockets.forEach(socketId => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  // Method to broadcast to all connected users
  public broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }
}