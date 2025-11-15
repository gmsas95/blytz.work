import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import auth from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = Router();
const prisma = new PrismaClient();

// CREATE NEW CONTRACT (Employer only)
router.post('/contracts', auth, [
  body('title').notEmpty().withMessage('Contract title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('skills').isArray().withMessage('Skills must be an array'),
  body('experienceLevel').isIn(['junior', 'mid', 'senior']).withMessage('Invalid experience level'),
  body('duration').isIn(['short-term', 'long-term', 'ongoing']).withMessage('Invalid duration'),
  body('budgetMin').isNumeric().withMessage('Minimum budget must be numeric'),
  body('budgetMax').isNumeric().withMessage('Maximum budget must be numeric'),
  body('workingHours').isIn(['flexible', '9-5', 'evenings', 'weekends']).withMessage('Invalid working hours'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      skills,
      experienceLevel,
      duration,
      budgetMin,
      budgetMax,
      workingHours,
      timezone,
      communication,
      tools,
      additionalRequirements
    } = req.body;

    // Create contract
    const contract = await prisma.contract.create({
      data: {
        title,
        description,
        skills,
        experienceLevel,
        duration,
        budgetMin,
        budgetMax,
        workingHours,
        timezone,
        communication,
        tools,
        additionalRequirements,
        employerId: req.user.id,
        status: 'active', // Active for VA applications
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Contract created successfully',
      contract
    });
  } catch (error) {
    console.error('Contract creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create contract' 
    });
  }
});

// GET ALL ACTIVE CONTRACTS (Public feed for VAs)
router.get('/contracts/feed', async (req, res) => {
  try {
    const { page = 1, limit = 10, skills, experienceLevel, budgetMin, budgetMax, sortBy = 'createdAt' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    // Build filter conditions
    const where = {
      status: 'active', // Only active contracts
      ...(skills && { skills: { hasSome: skills.split(',') } }),
      ...(experienceLevel && { experienceLevel }),
      ...(budgetMin && { budgetMin: { gte: Number(budgetMin) } }),
      ...(budgetMax && { budgetMax: { lte: Number(budgetMax) } })
    };

    const contracts = await prisma.contract.findMany({
      where,
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            company: true,
            avatar: true,
            rating: true
          }
        }
      },
      orderBy: {
        [sortBy as string]: 'desc'
      },
      skip,
      take: Number(limit)
    });

    const total = await prisma.contract.count({ where });

    res.status(200).json({
      success: true,
      contracts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Contract feed error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch contracts' 
    });
  }
});

// GET CONTRACT DETAILS
router.get('/contracts/:id', async (req, res) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: req.params.id },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            company: true,
            avatar: true,
            rating: true,
            createdAt: true
          }
        },
        applications: {
          include: {
            va: {
              select: {
                id: true,
                name: true,
                avatar: true,
                rating: true,
                skills: true,
                hourlyRate: true
              }
            }
          }
        }
      }
    });

    if (!contract) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contract not found' 
      });
    }

    res.status(200).json({
      success: true,
      contract
    });
  } catch (error) {
    console.error('Contract details error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch contract details' 
    });
  }
});

// VA APPLY FOR CONTRACT
router.post('/contracts/:id/apply', auth, async (req, res) => {
  try {
    const { message, proposedRate, availability } = req.body;
    const contractId = req.params.id;
    const vaId = req.user.id;

    // Check if contract exists and is active
    const contract = await prisma.contract.findUnique({
      where: { id: contractId }
    });

    if (!contract) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contract not found' 
      });
    }

    if (contract.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        message: 'Contract is not accepting applications' 
      });
    }

    // Check if VA already applied
    const existingApplication = await prisma.application.findFirst({
      where: {
        contractId,
        vaId
      }
    });

    if (existingApplication) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already applied for this contract' 
      });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        contractId,
        vaId,
        message,
        proposedRate,
        availability,
        status: 'pending', // Pending employer review
        appliedAt: new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Contract application error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit application' 
    });
  }
});

// GET CONTRACTS BY EMPLOYER
router.get('/employer/contracts', auth, async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    
    const where = {
      employerId: req.user.id,
      ...(status !== 'all' && { status })
    };

    const contracts = await prisma.contract.findMany({
      where,
      include: {
        applications: {
          include: {
            va: {
              select: {
                id: true,
                name: true,
                avatar: true,
                rating: true,
                hourlyRate: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      contracts
    });
  } catch (error) {
    console.error('Employer contracts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch contracts' 
    });
  }
});

// UPDATE CONTRACT STATUS (Employer only)
router.patch('/contracts/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const contractId = req.params.id;

    // Verify ownership
    const contract = await prisma.contract.findFirst({
      where: {
        id: contractId,
        employerId: req.user.id
      }
    });

    if (!contract) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contract not found or access denied' 
      });
    }

    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: { 
        status,
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Contract status updated successfully',
      contract: updatedContract
    });
  } catch (error) {
    console.error('Contract status update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update contract status' 
    });
  }
});

export default router;
