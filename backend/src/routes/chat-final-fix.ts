import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { verifyAuth } from "../plugins/firebaseAuth.js";
import { z } from "zod";

export default async function chatRoutes(app: FastifyInstance) {
  // Simple messaging using existing notification system
  // This will work with the current database schema
  
  app.post('/chat/send-message', {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const schema = z.object({
      recipientId: z.string(),
      content: z.string().min(1).max(1000),
      type: z.enum(['text', 'image', 'file']).optional()
    });

    const { recipientId, content, type = 'text' } = schema.parse(request.body);
    
    try {
      // Validate recipient exists
      const recipient = await prisma.user.findUnique({
        where: { id: recipientId },
        select: { id: true, email: true }
      });

      if (!recipient) {
        return reply.code(404).send({
          error: 'Recipient not found'
        });
      }

      // Create notification as message
      const notification = await prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'chat_message',
          title: 'New Message',
          message: content,
          data: {
            senderId: user.uid,
            senderName: user.email,
            senderRole: user.role,
            type: type,
            timestamp: new Date().toISOString()
          }
        }
      });

      return {
        success: true,
        data: {
          messageId: String(notification.id),
          content: notification.message,
          createdAt: notification.createdAt,
          recipient: {
            id: recipient.id,
            email: recipient.email
          }
        }
      };
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(500).send({
        error: 'Failed to send message',
        details: errorMessage
      });
    }
  });

  // Get messages (notifications) for a user
  app.get('/chat/messages', {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { limit = 50, before } = request.query as any;
    
    try {
      const messages = await prisma.notification.findMany({
        where: {
          userId: user.uid,
          type: 'chat_message',
          ...(before && { createdAt: { lt: new Date(before) } })
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit)
      });

      const formattedMessages = messages.reverse().map(notification => {
        // Safely access notification data
        const notificationData = notification.data as Record<string, any>;
        
        return {
          id: String(notification.id),
          content: notification.message,
          type: notification.type,
          status: notification.read ? 'read' : 'sent',
          createdAt: notification.createdAt,
          sender: {
            id: String(notificationData?.senderId || "unknown"),
            name: String(notificationData?.senderName || "Unknown"),
            role: String(notificationData?.senderRole || "unknown")
          }
        };
      });

      return {
        success: true,
        data: formattedMessages
      };
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(500).send({
        error: 'Failed to fetch messages',
        details: errorMessage
      });
    }
  });

  // Mark message as read
  app.put('/chat/messages/:messageId/read', {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { messageId } = request.params as { messageId: string };
    
    try {
      // Update notification as read
      const updatedNotification = await prisma.notification.update({
        where: { 
          id: messageId,
          userId: user.uid // Ensure user can only update their own messages
        },
        data: { read: true }
      });

      return {
        success: true,
        data: { 
          messageId: String(updatedNotification.id), 
          status: 'read' 
        }
      };
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(500).send({
        error: 'Failed to mark message as read',
        details: errorMessage
      });
    }
  });

  // Delete message
  app.delete('/chat/messages/:messageId', {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { messageId } = request.params as { messageId: string };
    
    try {
      // Delete notification (message)
      await prisma.notification.delete({
        where: { 
          id: messageId,
          userId: user.uid // Ensure user can only delete their own messages
        }
      });

      return {
        success: true,
        data: { deleted: true }
      };
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(500).send({
        error: 'Failed to delete message',
        details: errorMessage
      });
    }
  });

  // Get unread message count
  app.get('/chat/unread-count', {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    
    try {
      const unreadCount = await prisma.notification.count({
        where: {
          userId: user.uid,
          type: 'chat_message',
          read: false
        }
      });

      return {
        success: true,
        data: { count: unreadCount }
      };
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(500).send({
        error: 'Failed to get unread count',
        details: errorMessage
      });
    }
  });
}