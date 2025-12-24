import { FastifyRequest } from "fastify";

import { AuthenticatedUser, UserRole } from './index.js';

declare module "fastify" {
  export interface FastifyRequest {
    user: AuthenticatedUser;
  }
  
  export interface FastifyInstance {
    log: any;
  }
}