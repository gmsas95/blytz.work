import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { Server as HTTPServer } from 'http';
import { io as ClientIO, Socket as ClientSocket } from 'socket.io-client';
import { prisma } from './setup.js';

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

// Mock Firebase initialization
jest.mock('../src/config/firebaseConfig-simplified.js', () => ({
  getAuth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

describe('WebSocket Authentication Tests', () => {
  let httpServer: HTTPServer;
  let ioServer: SocketIOServer;
  let clientSocket: ClientSocket;
  let serverSocket: any;
  let testUser: any;
  let mockFirebaseAuth: any;

  beforeAll(async () => {
    // Create test user in database
    testUser = await prisma.user.create({
      data: {
        email: 'websocket@test.com',
        role: 'va',
        profileComplete: true,
      },
    });

    // Mock Firebase Auth
    const { getAuth } = require('../src/config/firebaseConfig-simplified.js');
    mockFirebaseAuth = getAuth();

    // Create HTTP server
    httpServer = createServer();

    // Create Socket.IO server with authentication
    ioServer = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Add authentication middleware (similar to websocketServer.ts)
    ioServer.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify Firebase token
        const decodedToken = await mockFirebaseAuth.verifyIdToken(token);
        
        // Get user from database
        const user = await prisma.user.findUnique({
          where: { email: decodedToken.email },
          select: { id: true, role: true, profileComplete: true, email: true }
        });

        if (!user) {
          return next(new Error('User not found in database'));
        }

        // Attach user to socket
        socket.data.user = {
          uid: user.id,
          email: user.email,
          role: user.role,
          profileComplete: user.profileComplete
        };

        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    // Handle connections
    ioServer.on('connection', (socket) => {
      serverSocket = socket;

      // Handle chat events
      socket.on('join-chat', async (data) => {
        const { chatId } = data;
        
        if (!socket.data.user) {
          socket.emit('error', { message: 'Authentication required' });
          return;
        }

        socket.join(`chat:${chatId}`);
        socket.emit('joined-chat', { chatId, user: socket.data.user });
      });

      socket.on('send-message', async (data) => {
        const { chatId, message } = data;
        
        if (!socket.data.user) {
          socket.emit('error', { message: 'Authentication required' });
          return;
        }

        // Broadcast message to chat room
        ioServer.to(`chat:${chatId}`).emit('new-message', {
          id: Date.now().toString(),
          chatId,
          message,
          sender: socket.data.user,
          timestamp: new Date().toISOString(),
        });
      });

      socket.on('mark-as-read', async (data) => {
        const { messageId } = data;
        
        if (!socket.data.user) {
          socket.emit('error', { message: 'Authentication required' });
          return;
        }

        // In a real implementation, this would update the database
        socket.emit('message-marked-read', { messageId, user: socket.data.user });
      });

      socket.on('get-unread-count', async () => {
        if (!socket.data.user) {
          socket.emit('error', { message: 'Authentication required' });
          return;
        }

        // In a real implementation, this would query the database
        socket.emit('unread-count', { count: 0, user: socket.data.user });
      });

      socket.on('disconnect', () => {
        // Handle disconnection
      });
    });

    // Start server
    httpServer.listen(0);
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: { contains: 'websocket@test.com' } }
    });

    // Close connections
    if (clientSocket) {
      clientSocket.disconnect();
    }
    if (serverSocket) {
      serverSocket.disconnect();
    }
    ioServer.close();
    httpServer.close();
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('WebSocket Authentication', () => {
    it('should authenticate user with valid token', (done) => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      // Connect client with valid token
      clientSocket = ClientIO(`http://localhost:${(httpServer.address() as any).port}`, {
        auth: {
          token: 'valid-firebase-token'
        }
      });

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        done();
      });

      clientSocket.on('connect_error', (error) => {
        done(error);
      });
    });

    it('should reject connection without token', (done) => {
      // Connect client without token
      const unauthClient = ClientIO(`http://localhost:${(httpServer.address() as any).port}`, {
        auth: {}
      });

      unauthClient.on('connect', () => {
        done(new Error('Connection should have been rejected'));
      });

      unauthClient.on('connect_error', (error) => {
        expect(error.message).toBe('Authentication token required');
        unauthClient.disconnect();
        done();
      });
    });

    it('should reject connection with invalid token', (done) => {
      // Mock token verification failure
      mockFirebaseAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      // Connect client with invalid token
      const unauthClient = ClientIO(`http://localhost:${(httpServer.address() as any).port}`, {
        auth: {
          token: 'invalid-firebase-token'
        }
      });

      unauthClient.on('connect', () => {
        done(new Error('Connection should have been rejected'));
      });

      unauthClient.on('connect_error', (error) => {
        expect(error.message).toBe('Authentication failed');
        unauthClient.disconnect();
        done();
      });
    });

    it('should reject connection for user not in database', (done) => {
      // Mock successful token verification but user not in database
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: 'non-existent-user',
        email: 'nonexistent@test.com',
      });

      // Connect client with valid token but non-existent user
      const unauthClient = ClientIO(`http://localhost:${(httpServer.address() as any).port}`, {
        auth: {
          token: 'valid-token-nonexistent-user'
        }
      });

      unauthClient.on('connect', () => {
        done(new Error('Connection should have been rejected'));
      });

      unauthClient.on('connect_error', (error) => {
        expect(error.message).toBe('User not found in database');
        unauthClient.disconnect();
        done();
      });
    });
  });

  describe('Authenticated WebSocket Events', () => {
    beforeEach((done) => {
      // Mock successful token verification for authenticated tests
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      // Connect authenticated client
      clientSocket = ClientIO(`http://localhost:${(httpServer.address() as any).port}`, {
        auth: {
          token: 'valid-firebase-token'
        }
      });

      clientSocket.on('connect', () => {
        done();
      });
    });

    afterEach(() => {
      if (clientSocket && clientSocket.connected) {
        clientSocket.disconnect();
      }
    });

    it('should handle join-chat event for authenticated user', (done) => {
      const chatId = 'test-chat-123';

      clientSocket.emit('join-chat', { chatId });

      clientSocket.on('joined-chat', (data) => {
        expect(data.chatId).toBe(chatId);
        expect(data.user).toHaveProperty('uid', testUser.id);
        expect(data.user).toHaveProperty('email', testUser.email);
        expect(data.user).toHaveProperty('role', 'va');
        done();
      });

      clientSocket.on('error', (error) => {
        done(error);
      });
    });

    it('should handle send-message event for authenticated user', (done) => {
      const chatId = 'test-chat-123';
      const message = 'Hello, this is a test message!';

      // Join chat first
      clientSocket.emit('join-chat', { chatId });

      clientSocket.on('joined-chat', () => {
        // Send message
        clientSocket.emit('send-message', { chatId, message });
      });

      clientSocket.on('new-message', (data) => {
        expect(data.chatId).toBe(chatId);
        expect(data.message).toBe(message);
        expect(data.sender).toHaveProperty('uid', testUser.id);
        expect(data.sender).toHaveProperty('email', testUser.email);
        expect(data).toHaveProperty('timestamp');
        done();
      });

      clientSocket.on('error', (error) => {
        done(error);
      });
    });

    it('should handle mark-as-read event for authenticated user', (done) => {
      const messageId = 'message-123';

      clientSocket.emit('mark-as-read', { messageId });

      clientSocket.on('message-marked-read', (data) => {
        expect(data.messageId).toBe(messageId);
        expect(data.user).toHaveProperty('uid', testUser.id);
        expect(data.user).toHaveProperty('email', testUser.email);
        done();
      });

      clientSocket.on('error', (error) => {
        done(error);
      });
    });

    it('should handle get-unread-count event for authenticated user', (done) => {
      clientSocket.emit('get-unread-count');

      clientSocket.on('unread-count', (data) => {
        expect(data).toHaveProperty('count');
        expect(data.user).toHaveProperty('uid', testUser.id);
        expect(data.user).toHaveProperty('email', testUser.email);
        done();
      });

      clientSocket.on('error', (error) => {
        done(error);
      });
    });
  });

  describe('WebSocket Security', () => {
    it('should prevent unauthorized access to chat events', (done) => {
      // Mock token verification failure
      mockFirebaseAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      // Connect unauthenticated client
      const unauthClient = ClientIO(`http://localhost:${(httpServer.address() as any).port}`, {
        auth: {
          token: 'invalid-token'
        }
      });

      unauthClient.on('connect_error', () => {
        // Connection should fail, so we can't test events
        unauthClient.disconnect();
        done();
      });
    });

    it('should handle token expiration during active connection', (done) => {
      // Mock initial successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValueOnce({
        uid: testUser.id,
        email: testUser.email,
      });

      // Connect authenticated client
      clientSocket = ClientIO(`http://localhost:${(httpServer.address() as any).port}`, {
        auth: {
          token: 'initially-valid-token'
        }
      });

      clientSocket.on('connect', () => {
        // Try to send message
        clientSocket.emit('send-message', { 
          chatId: 'test-chat', 
          message: 'Test message' 
        });

        // Should receive error since token is no longer valid
        clientSocket.on('error', (error) => {
          expect(error.message).toBe('Authentication required');
          done();
        });
      });
    });

    it('should handle concurrent connections from same user', (done) => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      let connectedCount = 0;
      const expectedConnections = 3;

      // Create multiple connections from same user
      const clients = Array.from({ length: expectedConnections }, (_, i) => {
        const client = ClientIO(`http://localhost:${(httpServer.address() as any).port}`, {
          auth: {
            token: `valid-token-${i}`
          }
        });

        client.on('connect', () => {
          connectedCount++;
          if (connectedCount === expectedConnections) {
            // All connections established
            clients.forEach(c => c.disconnect());
            done();
          }
        });

        return client;
      });
    });
  });

  describe('WebSocket Error Handling', () => {
    it('should handle database errors during authentication', (done) => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      // Mock database error
      const originalFindUnique = prisma.user.findUnique;
      prisma.user.findUnique = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      // Connect client
      const client = ClientIO(`http://localhost:${(httpServer.address() as any).port}`, {
        auth: {
          token: 'valid-token'
        }
      });

      client.on('connect_error', (error) => {
        expect(error.message).toBe('Authentication failed');
        client.disconnect();
        
        // Restore original method
        prisma.user.findUnique = originalFindUnique;
        done();
      });
    });

    it('should handle malformed event data', (done) => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      // Connect authenticated client
      clientSocket = ClientIO(`http://localhost:${(httpServer.address() as any).port}`, {
        auth: {
          token: 'valid-token'
        }
      });

      clientSocket.on('connect', () => {
        // Send malformed data
        clientSocket.emit('join-chat', null);

        clientSocket.on('error', (error) => {
          expect(error.message).toBeDefined();
          done();
        });
      });
    });
  });

  describe('WebSocket Performance and Scalability', () => {
    it('should handle multiple simultaneous messages', (done) => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      // Connect authenticated client
      clientSocket = ClientIO(`http://localhost:${(httpServer.address() as any).port}`, {
        auth: {
          token: 'valid-token'
        }
      });

      const messageCount = 10;
      let receivedCount = 0;

      clientSocket.on('connect', () => {
        // Join chat first
        clientSocket.emit('join-chat', { chatId: 'performance-test' });

        clientSocket.on('joined-chat', () => {
          // Send multiple messages rapidly
          for (let i = 0; i < messageCount; i++) {
            clientSocket.emit('send-message', {
              chatId: 'performance-test',
              message: `Message ${i}`
            });
          }
        });
      });

      clientSocket.on('new-message', (data) => {
        receivedCount++;
        if (receivedCount === messageCount) {
          expect(receivedCount).toBe(messageCount);
          done();
        }
      });
    });
  });
});