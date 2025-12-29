// Job Service - Business Logic Layer
import { JobRepository } from '../repositories/jobRepository.js';
import { CompanyRepository } from '../repositories/companyRepository.js';
import { VAProfileRepository } from '../repositories/vaProfileRepository.js';
import { NotificationService } from './notificationService.js';

export class JobService {
  private jobRepo: JobRepository;
  private companyRepo: CompanyRepository;
  private vaProfileRepo: VAProfileRepository;
  private notificationService: NotificationService;

  constructor(
    jobRepo?: JobRepository,
    companyRepo?: CompanyRepository,
    vaProfileRepo?: VAProfileRepository,
    notificationService?: NotificationService
  ) {
    this.jobRepo = jobRepo || new JobRepository();
    this.companyRepo = companyRepo || new CompanyRepository();
    this.vaProfileRepo = vaProfileRepo || new VAProfileRepository();
    this.notificationService = notificationService || new NotificationService();
  }

  async createJobFromContract(contractId: string) {
    const contract = await this.getContractDetails(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const job = await this.jobRepo.create({
      jobPostingId: contract.jobPostingId,
      vaProfileId: contract.vaProfileId,
      companyId: contract.companyId,
      status: 'active',
      title: contract.job?.title || 'Job',
      description: contract.job?.description || '',
      budget: contract.job?.budget ?? undefined,
      hourlyRate: contract.job?.hourlyRate ?? undefined,
      startDate: contract.startDate,
      endDate: contract.endDate ?? undefined
    });

    return job;
  }

  async getJob(jobId: string) {
    const job = await this.jobRepo.findById(jobId, {
      vaProfile: true,
      company: true,
      jobPosting: true,
      contracts: true,
      payments: true
    });

    if (!job) {
      throw new Error('Job not found');
    }

    return job;
  }

  async getCompanyJobs(companyId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    return await this.jobRepo.findByCompanyId(companyId, { skip, take: limit });
  }

  async getVAJobs(vaProfileId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    return await this.jobRepo.findByVAProfileId(vaProfileId, { skip, take: limit });
  }

  async updateJobStatus(jobId: string, status: string) {
    // Business rule: Validate status
    const validStatuses = ['pending', 'active', 'paused', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid job status');
    }

    const job = await this.jobRepo.updateStatus(jobId, status);

    // Notify if job is completed
    if (status === 'completed') {
      const jobDetails = await this.jobRepo.findById(jobId);
      if (jobDetails) {
        await this.notificationService.notifyJobCompleted(
          jobDetails.companyId,
          jobDetails.vaProfileId,
          jobId
        );
      }
    }

    return job;
  }

  // Helper method to get contract details
  private async getContractDetails(contractId: string) {
    const { prisma } = await import('../utils/prisma.js');
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        job: true
      }
    });

    return contract;
  }
}
