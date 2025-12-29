// Auth Service - Business Logic Layer
import admin from 'firebase-admin';
import { UserRepository } from '../repositories/userRepository.js';
import { EmailService } from './emailService.js';

export class AuthService {
  private userRepo: UserRepository;
  private emailService: EmailService;

  constructor(userRepo?: UserRepository, emailService?: EmailService) {
    this.userRepo = userRepo || new UserRepository();
    this.emailService = emailService || new EmailService();
  }

  async createUser(data: { uid: string; email: string; displayName?: string }) {
    // Business validation
    if (!data.uid || !data.email) {
      throw new Error('UID and email are required');
    }

    // Check if user already exists
    const existingUser = await this.userRepo.findByUid(data.uid);
    if (existingUser) {
      return {
        success: true,
        data: existingUser,
        message: 'User already exists'
      };
    }

    // Create new user with defaults
    const user = await this.userRepo.create({
      id: data.uid,
      email: data.email,
      role: 'va', // Default role, updated during onboarding
      profileComplete: false,
      emailVerified: false
    });

    return {
      success: true,
      data: user,
      message: 'User created successfully'
    };
  }

  async getProfile(uid: string) {
    const profile = await this.userRepo.getProfileWithRelations(uid);

    if (!profile) {
      throw new Error('User not found');
    }

    return profile;
  }

  async updateProfile(uid: string, data: {
    email?: string;
    role?: 'company' | 'va';
    profileComplete?: boolean;
  }) {
    // Business rule: Check if email is being changed and is unique
    if (data.email) {
      const existingUser = await this.userRepo.findByEmail(data.email);
      if (existingUser && existingUser.id !== uid) {
        throw new Error('Email already exists');
      }
    }

    // Business rule: Role validation
    if (data.role && !['company', 'va'].includes(data.role)) {
      throw new Error('Invalid role');
    }

    const updatedUser = await this.userRepo.update(uid, data);

    return {
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    };
  }

  async requestPasswordReset(email: string) {
    // Business rule: Get user from Firebase
    const authInstance = admin.auth();
    const userRecord = await authInstance.getUserByEmail(email.toLowerCase())
      .catch((error: any) => {
        if (error.code === 'auth/user-not-found') {
          return null;
        }
        throw error;
      });

    // Security: Don't reveal if email exists or not
    if (!userRecord) {
      return {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent'
      };
    }

    // Generate password reset link
    const link = await admin.auth().generatePasswordResetLink(email);

    // Send password reset email
    await this.emailService.sendPasswordReset(email, link);

    return {
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent'
    };
  }

  async updateRole(uid: string, role: 'va' | 'company' | 'admin') {
    // Business rule: Role validation
    if (!['va', 'company', 'admin'].includes(role)) {
      throw new Error('Invalid role');
    }

    const updatedUser = await this.userRepo.updateRole(uid, role);

    return {
      success: true,
      data: updatedUser,
      message: 'User role updated successfully'
    };
  }

  async generateCustomToken(uid: string) {
    // Business rule: Generate Firebase custom token
    const customToken = await admin.auth().createCustomToken(uid);

    return {
      success: true,
      data: {
        token: customToken,
        expiresIn: '1h'
      }
    };
  }
}
