// Contract Service - Business Logic Layer
import { ContractRepository } from '../repositories/contractRepository.js';
import { JobRepository } from '../repositories/jobRepository.js';
import { CompanyRepository } from '../repositories/companyRepository.js';
import { VAProfileRepository } from '../repositories/vaProfileRepository.js';
import { NotificationService } from './notificationService.js';

export class ContractService {
  private contractRepo: ContractRepository;
  private jobRepo: JobRepository;
  private companyRepo: CompanyRepository;
  private vaProfileRepo: VAProfileRepository;
  private notificationService: NotificationService;

  constructor(
    contractRepo?: ContractRepository,
    jobRepo?: JobRepository,
    companyRepo?: CompanyRepository,
    vaProfileRepo?: VAProfileRepository,
    notificationService?: NotificationService
  ) {
    this.contractRepo = contractRepo || new ContractRepository();
    this.jobRepo = jobRepo || new JobRepository();
    this.companyRepo = companyRepo || new CompanyRepository();
    this.vaProfileRepo = vaProfileRepo || new VAProfileRepository();
    this.notificationService = notificationService || new NotificationService();
  }

  async createContractFromProposal(
    proposalId: string,
    companyId: string,
    startDate: string,
    endDate?: string,
    contractTerms?: any
  ) {
    // Get proposal details
    const proposal = await this.getProposalDetails(proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    // Get company details
    const company = await this.companyRepo.findById(companyId);
    if (!company) {
      throw new Error('Company profile not found');
    }

    // Business rule: Validate company owns the job posting
    if (proposal.jobPosting.companyId !== company.id) {
      throw new Error('You do not own this proposal\'s job posting');
    }

    // Create job
    const job = await this.jobRepo.create({
      jobPostingId: proposal.jobPostingId,
      vaProfileId: proposal.vaProfileId,
      companyId: company.id,
      status: 'active',
      title: proposal.jobPosting.title,
      description: proposal.jobPosting.description,
      budget: proposal.bidType === 'fixed' ? proposal.bidAmount : undefined,
      hourlyRate: proposal.bidType === 'hourly' ? proposal.bidAmount : undefined,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined
    });

    // Create contract
    const contract = await this.contractRepo.create({
      jobId: job.id,
      jobPostingId: proposal.jobPostingId,
      vaProfileId: proposal.vaProfileId,
      companyId: company.id,
      proposalId: proposal.id,
      contractType: proposal.bidType,
      amount: proposal.bidAmount,
      hourlyRate: proposal.bidType === 'hourly' ? proposal.bidAmount : undefined,
      currency: 'USD',
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      status: 'active',
      terms: contractTerms,
      deliverables: (proposal.jobPosting.requirements as any[]) || [],
      milestonesData: []
    });

    // Notify VA about new contract
    await this.notificationService.notifyContractCreated(
      proposal.vaProfile.userId,
      contract
    );

    return contract;
  }

  async getContract(contractId: string) {
    const contract = await this.contractRepo.findById(contractId, {
      job: {
        include: {
          vaProfile: true,
          company: true
        }
      },
      jobPosting: true,
      milestones: true
    });

    if (!contract) {
      throw new Error('Contract not found');
    }

    return contract;
  }

  async getCompanyContracts(companyId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    return await this.contractRepo.findByCompanyId(companyId, { skip, take: limit });
  }

  async getVAContracts(vaProfileId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    return await this.contractRepo.findByVAProfileId(vaProfileId, { skip, take: limit });
  }

  async updateContractStatus(contractId: string, status: string) {
    // Business rule: Validate status transition
    const validStatuses = ['pending', 'active', 'paused', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid contract status');
    }

    return await this.contractRepo.updateStatus(contractId, status);
  }

  // Helper method to get proposal details (would normally be in ProposalRepository)
  private async getProposalDetails(proposalId: string) {
    // For now, using Prisma directly - this should be in ProposalRepository
    const { prisma } = await import('../utils/prisma.js');
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        jobPosting: true,
        vaProfile: {
          include: {
            user: true
          }
        }
      }
    });

    return proposal;
  }
}
