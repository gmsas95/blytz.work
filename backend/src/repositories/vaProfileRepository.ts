// VA Profile Repository - Data Access Layer
import { prisma } from '../utils/prisma.js';

export class VAProfileRepository {
  async findById(id: string) {
    return await prisma.vAProfile.findUnique({
      where: { id }
    });
  }

  async findByUserId(userId: string) {
    return await prisma.vAProfile.findUnique({
      where: { userId }
    });
  }

  async create(data: {
    userId: string;
    name: string;
    country: string;
    hourlyRate: number;
    skills: string[];
    bio?: string;
    email?: string;
    phone?: string;
    timezone?: string;
    languages?: any;
    workExperience?: any;
    education?: any;
    availability?: boolean;
  }) {
    return await prisma.vAProfile.create({
      data,
      include: {
        user: true
      }
    });
  }

  async update(id: string, data: any) {
    return await prisma.vAProfile.update({
      where: { id },
      data,
      include: {
        user: true,
        portfolioItems: true,
        skillsAssessments: true
      }
    });
  }

  async list(pagination?: { skip?: number; take?: number }, filters?: {
    country?: string;
    skills?: string[];
    hourlyRate?: { min?: number; max?: number };
    availability?: boolean;
    featured?: boolean;
  }) {
    const whereClause: any = {};

    if (filters) {
      if (filters.country) {
        whereClause.country = filters.country;
      }
      if (filters.skills) {
        whereClause.skills = { hasSome: filters.skills };
      }
      if (filters.hourlyRate) {
        if (filters.hourlyRate.min !== undefined) {
          whereClause.hourlyRate = { ...whereClause.hourlyRate, gte: filters.hourlyRate.min };
        }
        if (filters.hourlyRate.max !== undefined) {
          whereClause.hourlyRate = { ...whereClause.hourlyRate, lte: filters.hourlyRate.max };
        }
      }
      if (filters.availability !== undefined) {
        whereClause.availability = filters.availability;
      }
      if (filters.featured !== undefined) {
        whereClause.featured = filters.featured;
      }
    }

    return await prisma.vAProfile.findMany({
      where: whereClause,
      ...pagination,
      include: {
        user: true,
        portfolioItems: true,
        skillsAssessments: true
      },
      orderBy: { profileViews: 'desc' }
    });
  }

  async search(query: string, filters?: any, pagination?: { skip?: number; take?: number }) {
    return await prisma.vAProfile.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { bio: { contains: query, mode: 'insensitive' } }
            ]
          },
          filters || {}
        ]
      },
      ...pagination,
      include: {
        user: true,
        portfolioItems: true
      },
      orderBy: { profileViews: 'desc' }
    });
  }

  async incrementProfileViews(id: string) {
    return await prisma.vAProfile.update({
      where: { id },
      data: { profileViews: { increment: 1 } }
    });
  }

  async updateRating(id: string, rating: number) {
    const profile = await this.findById(id);
    const totalReviews = (profile?.totalReviews || 0) + 1;
    const newAverageRating = ((profile?.averageRating || 0) * (totalReviews - 1) + rating) / totalReviews;

    return await prisma.vAProfile.update({
      where: { id },
      data: {
        averageRating: newAverageRating,
        totalReviews: totalReviews
      }
    });
  }
}
