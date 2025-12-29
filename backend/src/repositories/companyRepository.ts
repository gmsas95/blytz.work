// Company Repository - Data Access Layer
import { prisma } from '../utils/prisma.js';

export class CompanyRepository {
  async findById(id: string) {
    return await prisma.company.findUnique({
      where: { id }
    });
  }

  async findByUserId(userId: string) {
    return await prisma.company.findUnique({
      where: { userId }
    });
  }

  async create(data: {
    userId: string;
    name: string;
    bio?: string;
    country: string;
    website?: string;
    logoUrl?: string;
    industry?: string;
    companySize?: string;
    foundedYear?: number;
    description?: string;
    mission?: string;
    values?: any;
    benefits?: any;
    email?: string;
    phone?: string;
  }) {
    return await prisma.company.create({
      data
    });
  }

  async update(id: string, data: any) {
    return await prisma.company.update({
      where: { id },
      data
    });
  }

  async list(pagination?: { skip?: number; take?: number }, filters?: {
    industry?: string;
    companySize?: string;
    country?: string;
    featured?: boolean;
  }) {
    return await prisma.company.findMany({
      where: filters,
      ...pagination,
      orderBy: { updatedAt: 'desc' }
    });
  }

  async search(query: string, pagination?: { skip?: number; take?: number }) {
    return await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { industry: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      ...pagination,
      orderBy: { updatedAt: 'desc' }
    });
  }
}
