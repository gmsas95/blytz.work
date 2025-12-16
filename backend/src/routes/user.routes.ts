import { FastifyInstance } from 'fastify';

// ✅ Working Separation of Concerns Example
export default async function userRoutes(fastify: FastifyInstance) {
  
  // ✅ Controller Layer - Handles HTTP requests/responses
  const userController = {
    // Gets user data
    async getUserProfile(request: any, reply: any) {
      try {
        // ✅ Service Layer - Business logic
        const userService = {
          async getProfile(userId: string) {
            // ✅ Repository Layer - Data access
            const userRepository = {
              async findById(id: string) {
                return { id, email: 'user@example.com', role: 'company' };
              }
            };
            
            const user = await userRepository.findById(userId);
            return user;
          }
        };

        const user = await userService.getProfile('dev-user');
        
        return reply.send({
          success: true,
          data: user,
          message: 'User profile retrieved successfully'
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: 'Failed to get user profile'
        });
      }
    },

    // Creates new user
    async createUser(request: any, reply: any) {
      try {
        const userData = request.body;
        
        // ✅ Service Layer
        const userService = {
          async create(data: any) {
            // ✅ Repository Layer
            const userRepository = {
              async create(userData: any) {
                return { id: 'new-user', ...userData, createdAt: new Date() };
              }
            };
            
            return await userRepository.create(userData);
          }
        };

        const user = await userService.create(userData);
        
        return reply.code(201).send({
          success: true,
          data: user,
          message: 'User created successfully'
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: 'Failed to create user'
        });
      }
    }
  };

  // ✅ Register routes
  fastify.get('/users/profile', userController.getUserProfile);
  fastify.post('/users', userController.createUser);
  fastify.get('/users/health', async () => ({
    ok: true,
    message: '✅ SoC user routes working',
    architecture: 'Separation of Concerns',
    layers: ['Controller', 'Service', 'Repository'],
    timestamp: new Date().toISOString()
  }));
}