import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { requireAuth } from "../plugins/firebaseAuth.js";
import { 
  createCompanySchema,
  createJobPostingSchema,
  CreateCompany,
  CreateJobPosting
} from "../utils/validation.js";

export default async function companyRoutes(app: FastifyInstance) {
  // Get company profile
  app.get("/company", {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const user = request.user as any;
    
    try {
      const company = await prisma.company.findUnique({
        where: { userId: user.uid },
        include: { 
          user: true,
          jobPostings: {
            where: { isActive: true },
            orderBy: { id: 'desc' }
          }
        }
      });

      if (!company) {
        return reply.code(404).send({ error: "Company profile not found" });
      }

      return company;
    } catch (error) {
      return reply.code(500).send({ error: "Failed to fetch company profile" });
    }
  });

  // Create company profile
  app.post("/company", {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const user = request.user as any;
    const data = request.body as CreateCompany;

    try {
      // Check if user already has a company
      const existingCompany = await prisma.company.findUnique({
        where: { userId: user.uid }
      });

      if (existingCompany) {
        return reply.code(400).send({ error: "Company profile already exists" });
      }

      // Check if user role is company
      const userData = await prisma.user.findUnique({
        where: { id: user.uid }
      });

      if (!userData || userData.role !== "company") {
        return reply.code(403).send({ error: "User is not a company" });
      }

      const company = await prisma.company.create({
        data: {
          ...data,
          userId: user.uid,
        },
        include: { user: true }
      });

      return reply.code(201).send(company);
    } catch (error) {
      return reply.code(500).send({ error: "Failed to create company profile" });
    }
  });

  // Get company job postings
  app.get("/company/jobs", {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const user = request.user as any;
    
    try {
      const company = await prisma.company.findUnique({
        where: { userId: user.uid }
      });

      if (!company) {
        return reply.code(404).send({ error: "Company profile not found" });
      }

      const jobs = await prisma.jobPosting.findMany({
        where: { companyId: company.id },
        include: { company: true },
        orderBy: { id: 'desc' }
      });

      return jobs;
    } catch (error) {
      return reply.code(500).send({ error: "Failed to fetch job postings" });
    }
  });

  // Create job posting
  app.post("/company/jobs", {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const user = request.user as any;
    const data = request.body as CreateJobPosting;

    try {
      const company = await prisma.company.findUnique({
        where: { userId: user.uid }
      });

      if (!company) {
        return reply.code(404).send({ error: "Company profile not found" });
      }

      const job = await prisma.jobPosting.create({
        data: {
          ...data,
          companyId: company.id,
        },
        include: { company: true }
      });

      return reply.code(201).send(job);
    } catch (error) {
      return reply.code(500).send({ error: "Failed to create job posting" });
    }
  });
}