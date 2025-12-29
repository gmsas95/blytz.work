// User Repository - Data Access Layer
import { prisma } from '../utils/prisma.js';

export class UserRepository {
  async findByUid(uid: string) {
    return await prisma.user.findUnique({
      where: { id: uid }
    });
  }

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
  }

  async create(data: {
    id: string;
    email: string;
    role: string;
    profileComplete?: boolean;
    emailVerified?: boolean;
  }) {
    return await prisma.user.create({
      data: {
        id: data.id,
        email: data.email.toLowerCase(),
        role: data.role,
        profileComplete: data.profileComplete ?? false,
        emailVerified: data.emailVerified ?? false
      }
    });
  }

  async update(uid: string, data: {
    email?: string;
    role?: string;
    profileComplete?: boolean;
    emailVerified?: boolean;
  }) {
    return await prisma.user.update({
      where: { id: uid },
      data
    });
  }

  async updateRole(uid: string, role: string) {
    return await prisma.user.update({
      where: { id: uid },
      data: { role }
    });
  }

  async getProfileWithRelations(uid: string) {
    return await prisma.user.findUnique({
      where: { id: uid },
      include: {
        vaProfile: true,
        company: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return !!user;
  }

  async existsByUid(uid: string): Promise<boolean> {
    const user = await this.findByUid(uid);
    return !!user;
  }
}
