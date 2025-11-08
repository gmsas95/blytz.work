import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { requireAuth } from "../plugins/firebaseAuth.js";
import { 
  createVAProfileSchema, 
  updateVAProfileSchema,
  CreateVAProfile,
  UpdateVAProfile
} from "../utils/validation.js";

export default async function vaRoutes(app: FastifyInstance) {
  // Get VA profile
  app.get("/va/profile", {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const user = request.user as any;
    
    try {
      const profile = await prisma.vAProfile.findUnique({
        where: { userId: user.uid },
        include: { user: true }
      });

      if (!profile) {
        return reply.code(404).send({ error: "VA profile not found" });
      }

      return profile;
    } catch (error) {
      return reply.code(500).send({ error: "Failed to fetch VA profile" });
    }
  });

  // Create VA profile
  app.post("/va/profile", {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const user = request.user as any;
    const data = request.body as CreateVAProfile;

    try {
      // Check if user already has a profile
      const existingProfile = await prisma.vAProfile.findUnique({
        where: { userId: user.uid }
      });

      if (existingProfile) {
        return reply.code(400).send({ error: "VA profile already exists" });
      }

      // Check if user role is VA
      const userData = await prisma.user.findUnique({
        where: { id: user.uid }
      });

      if (!userData || userData.role !== "va") {
        return reply.code(403).send({ error: "User is not a VA" });
      }

      const profile = await prisma.vAProfile.create({
        data: {
          ...data,
          userId: user.uid,
        },
        include: { user: true }
      });

      return reply.code(201).send(profile);
    } catch (error) {
      return reply.code(500).send({ error: "Failed to create VA profile" });
    }
  });

  // Update VA profile
  app.put("/va/profile", {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const user = request.user as any;
    const data = request.body as UpdateVAProfile;

    try {
      const profile = await prisma.vAProfile.update({
        where: { userId: user.uid },
        data,
        include: { user: true }
      });

      return profile;
    } catch (error) {
      return reply.code(500).send({ error: "Failed to update VA profile" });
    }
  });
}