import { FastifyInstance } from 'fastify';
import { prisma } from '../utils/prisma.js';
import { verifyAuth } from '../plugins/firebaseAuth.js';
import { z } from 'zod';

export default async function chatRoutes(app: FastifyInstance) {
  // Get user's chat rooms
  app.get('/chat/rooms', {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    
    try {
      const rooms = await prisma.chatRoom.findMany({
        where: {
          OR: [
            { participant1Id: user.uid },
            { participant2Id: user.uid }
          ]
        },
        include: {
          participant1: {
            select: {
              id: true,
              email: true,
              vaProfile: { select: { name: true, avatarUrl: true } },
              company: { select: { name: true, logoUrl: true } }
            }
          },
          participant2: {
            select: {
              id: true,
              email: true,
              vaProfile: { select: { name: true, avatarUrl: true } },
              company: { select: { name: true, logoUrl: true } }
            }
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              content: true,
              createdAt: true,
              senderId: true
            }
          }
        },
        orderBy: { lastMessageAt: 'desc' }
      });

      const formattedRooms = rooms.map(room => {
        const otherParticipant = room.participant1Id === user.uid ? room.participant2 : room.participant1;
        const lastMessage = room.messages[0];
        
        return {
          id: room.id,
          type: room.type,
          status: room.status,
          lastMessageAt: room.lastMessageAt,
          otherParticipant: {
            id: otherParticipant.id,
            name: otherParticipant.vaProfile?.name || otherParticipant.company?.name || otherParticipant.email,
            avatar: otherParticipant.vaProfile?.avatarUrl || otherParticipant.company?.logoUrl,
            role: otherParticipant.vaProfile ? 'va' : 'company'
          },
          lastMessage: lastMessage ? {
            id: lastMessage.id,
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            isOwn: lastMessage.senderId === user.uid
          } : null
        };
      });

      return {
        success: true,
        data: formattedRooms
      };
      
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to fetch chat rooms',
        details: error.message
      });
    }
  });

  // Get chat room messages
  app.get('/chat/rooms/:roomId/messages', {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { roomId } = request.params;
    const { limit = 50, before } = request.query as any;
    
    try {
      // Verify user has access to this chat room
      const hasAccess = await prisma.chatRoom.findFirst({
        where: {
          id: roomId,
          OR: [
            { participant1Id: user.uid },
            { participant2Id: user.uid }
          ]
        }
      });

      if (!hasAccess) {
        return reply.code(403).send({
          error: 'Access denied to this chat room'
        });
      }

      const messages = await prisma.message.findMany({
        where: {
          roomId,
          ...(before && { createdAt: { lt: new Date(before) } })
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
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

      const formattedMessages = messages.reverse().map(message => ({
        id: message.id,
        content: message.content,
        type: message.type,
        status: message.status,
        createdAt: message.createdAt,
        isOwn: message.senderId === user.uid,
        sender: {
          id: message.sender.id,
          name: message.sender.vaProfile?.name || message.sender.company?.name || message.sender.email,
          avatar: message.sender.vaProfile?.avatarUrl || message.sender.company?.logoUrl,
          role: message.sender.vaProfile ? 'va' : 'company'
        }
      }));

      return {
        success: true,
        data: formattedMessages
      };
      
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to fetch messages',
        details: error.message
      });
    }
  });

  // Create new chat room
  app.post('/chat/rooms', {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const schema = z.object({
      participantId: z.string(),
      type: z.enum(['direct', 'support']).optional()
    });

    const { participantId, type = 'direct' } = schema.parse(request.body);
    
    try {
      // Prevent creating chat with yourself
      if (participantId === user.uid) {
        return reply.code(400).send({
          error: 'Cannot create chat with yourself'
        });
      }

      // Check if chat already exists
      const existingChat = await prisma.chatRoom.findFirst({
        where: {
          OR: [
            { participant1Id: user.uid, participant2Id: participantId },
            { participant1Id: participantId, participant2Id: user.uid }
          ]
        }
      });

      if (existingChat) {
        return {
          success: true,
          data: { roomId: existingChat.id, existing: true }
        };
      }

      // Create new chat room
      const chatRoom = await prisma.chatRoom.create({
        data: {
          participant1Id: user.uid,
          participant2Id: participantId,
          type,
          status: 'active'
        }
      });

      return {
        success: true,
        data: { roomId: chatRoom.id, existing: false }
      };
      
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to create chat room',
        details: error.message
      });
    }
  });

  // Send message (for HTTP fallback)
  app.post('/chat/rooms/:roomId/messages', {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { roomId } = request.params;
    const schema = z.object({
      content: z.string().min(1).max(1000),
      type: z.enum(['text', 'image', 'file']).optional()
    });

    const { content, type = 'text' } = schema.parse(request.body);
    
    try {
      // Verify user has access to this chat room
      const hasAccess = await prisma.chatRoom.findFirst({
        where: {
          id: roomId,
          OR: [
            { participant1Id: user.uid },
            { participant2Id: user.uid }
          ]
        }
      });

      if (!hasAccess) {
        return reply.code(403).send({
          error: 'Access denied to this chat room'
        });
      }

      // Create message
      const message = await prisma.message.create({
        data: {
          roomId,
          senderId: user.uid,
          content,
          type,
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
        where: { id: roomId },
        data: { lastMessageAt: new Date() }
      });

      const formattedMessage = {
        id: message.id,
        content: message.content,
        type: message.type,
        status: message.status,
        createdAt: message.createdAt,
        isOwn: true,
        sender: {
          id: message.sender.id,
          name: message.sender.vaProfile?.name || message.sender.company?.name || message.sender.email,
          avatar: message.sender.vaProfile?.avatarUrl || message.sender.company?.logoUrl,
          role: message.sender.vaProfile ? 'va' : 'company'
        }
      };

      return {
        success: true,
        data: formattedMessage
      };
      
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to send message',
        details: error.message
      });
    }
  });

  // Mark message as read
  app.put('/chat/messages/:messageId/read', {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { messageId } = request.params;
    
    try {
      // Find the message and verify user has access
      const message = await prisma.message.findFirst({
        where: {
          id: messageId,
          room: {
            OR: [
              { participant1Id: user.uid },
              { participant2Id: user.uid }
            ]
          }
        }
      });

      if (!message) {
        return reply.code(404).send({
          error: 'Message not found or access denied'
        });
      }

      // Update message status
      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: { status: 'read' }
      });

      return {
        success: true,
        data: { messageId: updatedMessage.id, status: updatedMessage.status }
      };
      
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to mark message as read',
        details: error.message
      });
    }
  });

  // Get unread message count
  app.get('/chat/unread-count', {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    
    try {
      const unreadCount = await prisma.message.count({
        where: {
          senderId: { not: user.uid }, // Not sent by current user
          status: 'sent', // Not read
          room: {
            OR: [
              { participant1Id: user.uid },
              { participant2Id: user.uid }
            ]
          }
        }
      });

      return {
        success: true,
        data: { count: unreadCount }
      };
      
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to get unread count',
        details: error.message
      });
    }
  });
}