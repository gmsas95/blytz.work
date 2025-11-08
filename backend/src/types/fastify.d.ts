import { FastifyRequest } from "fastify";

declare module "fastify" {
  export interface FastifyRequest {
    user?: {
      uid: string;
      email: string;
      role?: string;
    };
  }
}