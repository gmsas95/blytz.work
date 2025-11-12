import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { requireAuth } from "../plugins/firebaseAuth.js";
import { voteSchema, Vote } from "../utils/validation.js";

export default async function matchingRoutes(app: FastifyInstance) {
  // Get VA recommendations for a job
  app.get("/matches/discover", {
    preHandler: [requireAuth],
    schema: {
      querystring: {
        type: "object",
        required: ["jobPostingId"],
        properties: {
          jobPostingId: { type: "string" }
        }
      },
    },
  }, async (request, reply) => {
    const user = request.user as any;
    const { jobPostingId } = request.query as { jobPostingId: string };

    try {
      // Verify job belongs to user's company
      const job = await prisma.jobPosting.findFirst({
        where: {
          id: jobPostingId,
          company: { userId: user.uid }
        }
      });

      if (!job) {
        return reply.code(404).send({ error: "Job posting not found" });
      }

      // Get VAs that haven't been voted on yet
      const votedVaIds = await prisma.matchVote.findMany({
        where: { jobPostingId },
        select: { vaProfileId: true }
      });

      const excludeVaIds = votedVaIds.map(vote => vote.vaProfileId);

      // Get available VAs with basic matching
      const recommendations = await prisma.vAProfile.findMany({
        where: {
          availability: true,
          id: { notIn: excludeVaIds },
          user: { role: "va" }
        },
        include: { user: true },
        // Basic matching: rate range and country preference
        orderBy: [
          // Prioritize same country (simple matching)
          { country: 'asc' },
          // Then by rate (closer to job rate range first)
          { hourlyRate: 'asc' }
        ],
        take: 20 // Limit recommendations
      });

      return recommendations;
    } catch (error) {
      return reply.code(500).send({ error: "Failed to get recommendations" });
    }
  });

  // Vote on a match (like/skip)
  app.post("/matches/vote", {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const user = request.user as any;
    const { jobPostingId, vaProfileId, vote } = request.body as Vote;

    try {
      // Verify job belongs to user's company
      const job = await prisma.jobPosting.findFirst({
        where: {
          id: jobPostingId,
          company: { userId: user.uid }
        }
      });

      if (!job) {
        return reply.code(404).send({ error: "Job posting not found" });
      }

      // Create or update vote
      const matchVote = await prisma.matchVote.upsert({
        where: {
          jobPostingId_vaProfileId: {
            jobPostingId,
            vaProfileId
          }
        },
        update: {
          voteByCompany: vote
        },
        create: {
          jobPostingId,
          vaProfileId,
          voteByCompany: vote
        }
      });

      // Check if it's a mutual match
      if (vote && matchVote.voteByVA) {
        // Create match record
        const match = await prisma.match.create({
          data: {
            jobPostingId,
            vaProfileId,
          },
          include: {
            jobPosting: { include: { company: true } },
            vaProfile: { include: { user: true } }
          }
        });

        return { 
          match: true, 
          data: match,
          message: "It's a match! Payment required to unlock contact information."
        };
      }

      return { match: false, data: matchVote };
    } catch (error) {
      return reply.code(500).send({ error: "Failed to record vote" });
    }
  });

  // Get user's matches
  app.get("/matches", {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const user = request.user as any;

    try {
      let matches;

      if (user.role === "company") {
        matches = await prisma.match.findMany({
          where: {
            jobPosting: {
              company: { userId: user.uid }
            }
          },
          include: {
            jobPosting: { include: { company: true } },
            vaProfile: { include: { user: true } }
          },
          orderBy: { id: 'desc' }
        });
      } else {
        matches = await prisma.match.findMany({
          where: {
            vaProfile: { userId: user.uid }
          },
          include: {
            jobPosting: { include: { company: true } },
            vaProfile: { include: { user: true } }
          },
          orderBy: { id: 'desc' }
        });
      }

      return matches;
    } catch (error) {
      return reply.code(500).send({ error: "Failed to fetch matches" });
    }
  });
}