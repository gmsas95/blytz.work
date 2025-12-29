// Profile Service - Business Logic Layer
import { calculateProfileCompletion, calculateCompanyCompletion } from './profileHelpers.js';
import { UserRepository } from '../repositories/userRepository.js';
import { CompanyRepository } from '../repositories/companyRepository.js';
import { VAProfileRepository } from '../repositories/vaProfileRepository.js';

export class ProfileService {
  private userRepo: UserRepository;
  private companyRepo: CompanyRepository;
  private vaProfileRepo: VAProfileRepository;

  constructor(
    userRepo?: UserRepository,
    companyRepo?: CompanyRepository,
    vaProfileRepo?: VAProfileRepository
  ) {
    this.userRepo = userRepo || new UserRepository();
    this.companyRepo = companyRepo || new CompanyRepository();
    this.vaProfileRepo = vaProfileRepo || new VAProfileRepository();
  }

  async getVAProfile(userId: string) {
    const profile = await this.vaProfileRepo.findByUserId(userId);

    if (!profile) {
      throw new Error('VA profile not found');
    }

    // Calculate profile completion
    const completion = calculateProfileCompletion(profile);

    return {
      ...profile,
      completion
    };
  }

  async getCompanyProfile(userId: string) {
    const profile = await this.companyRepo.findByUserId(userId);

    if (!profile) {
      throw new Error('Company profile not found');
    }

    // Calculate profile completion
    const completion = calculateCompanyCompletion(profile);

    return {
      ...profile,
      completion
    };
  }

  async createVAProfile(userId: string, data: any) {
    // Business rule: Check if VA profile already exists
    const existingProfile = await this.vaProfileRepo.findByUserId(userId);
    if (existingProfile) {
      throw new Error('VA profile already exists');
    }

    // Create VA profile
    const profile = await this.vaProfileRepo.create({
      userId,
      ...data
    });

    // Update user role to va
    await this.userRepo.updateRole(userId, 'va');

    return profile;
  }

  async createCompanyProfile(userId: string, data: any) {
    // Business rule: Check if company profile already exists
    const existingProfile = await this.companyRepo.findByUserId(userId);
    if (existingProfile) {
      throw new Error('Company profile already exists');
    }

    // Create company profile
    const profile = await this.companyRepo.create({
      userId,
      ...data
    });

    // Update user role to company
    await this.userRepo.updateRole(userId, 'company');

    return profile;
  }

  async updateVAProfile(profileId: string, data: any) {
    const profile = await this.vaProfileRepo.update(profileId, data);

    if (!profile) {
      throw new Error('VA profile not found');
    }

    return profile;
  }

  async updateCompanyProfile(profileId: string, data: any) {
    const profile = await this.companyRepo.update(profileId, data);

    if (!profile) {
      throw new Error('Company profile not found');
    }

    return profile;
  }

  async searchVAProfiles(query: string, filters?: any, pagination?: { page: number; limit: number }) {
    const skip = pagination ? (pagination.page - 1) * pagination.limit : 0;
    const take = pagination?.limit || 20;

    const profiles = await this.vaProfileRepo.search(query, filters, { skip, take });

    // Add profile completion to each result
    return profiles.map(profile => ({
      ...profile,
      completion: calculateProfileCompletion(profile)
    }));
  }

  async searchCompanies(query: string, pagination?: { page: number; limit: number }) {
    const skip = pagination ? (pagination.page - 1) * pagination.limit : 0;
    const take = pagination?.limit || 20;

    return await this.companyRepo.search(query, { skip, take });
  }
}
