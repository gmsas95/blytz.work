// Minimal Working Contracts Route
import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { verifyAuth } from "../plugins/firebaseAuth.js";

export default async function contractRoutes(app: FastifyInstance) {
  // Get contracts - simplified
  app.get("/contracts", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    try {
      const contracts = await prisma.contract.findMany();
      
      reply.send({
        success: true,
        contracts
      });
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        message: "Failed to fetch contracts"
      });
    }
  });

  // Create contract - simplified
  app.post("/contracts", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    try {
      const data = request.body as any;
      
      const contract = await prisma.contract.create({
        data: {
          jobId: data.jobId,
          jobPostingId: data.jobPostingId,
          vaProfileId: data.vaProfileId,
          companyId: data.companyId,
          contractType: data.contractType,
          amount: data.amount,
          currency: "USD",
          startDate: new Date()
        }
      });

      reply.send({
        success: true,
        contract
      });
    } catch (error: any) {
      reply.status(400).send({
        success: false,
        message: error.message
      });
    }
  });

  // Get contract details - simplified
  app.get("/contracts/:id", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    
    try {
      const contract = await prisma.contract.findUnique({
        where: { id }
      });

      if (!contract) {
        return reply.status(404).send({
          success: false,
          message: "Contract not found"
        });
      }

      reply.send({
        success: true,
        contract
      });
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        message: "Failed to fetch contract"
      });
    }
  });
}
