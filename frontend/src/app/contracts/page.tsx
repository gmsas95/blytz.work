// Contract Management - View and Manage Active Contracts
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase';
import { apiClient, handleAPIError } from '@/lib/api';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  PauseCircle,
  MoreHorizontal,
  Download,
  MessageSquare,
  Play,
  Square,
  ExternalLink
} from 'lucide-react';
import { useAlert } from '@/components/ui/Alert';

interface Contract {
  id: string;
  contractType: string;
  amount: number;
  hourlyRate?: number;
  currency: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled' | 'paused' | 'terminated';
  totalPaid: number;
  totalHours?: number;
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
  };
  jobPosting: {
    id: string;
    title: string;
    category: string;
    tags: string[];
  };
  vaProfile?: {
    id: string;
    name: string;
    country: string;
    bio: string;
    averageRating: number;
    totalReviews: number;
    skills: string[];
    hourlyRate: number;
    avatarUrl?: string;
  };
  company?: {
    id: string;
    name: string;
    country: string;
    bio: string;
    logoUrl?: string;
    verificationLevel: string;
    totalReviews: number;
  };
  proposal?: {
    id: string;
    coverLetter: string;
    bidAmount: number;
    bidType: string;
  };
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    amount: number;
    status: string;
    dueDate?: string;
    completedAt?: string;
    approvedAt?: string;
  }>;
  timesheets: Array<{
    id: string;
    date: string;
    totalHours: number;
    description: string;
    status: string;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  metrics?: {
    milestoneProgress: number;
    timesheetProgress: number;
    totalHours: number;
    totalPaid: number;
    amountRemaining: number;
  };
}

interface ContractMetrics {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  totalEarnings: number;
  totalSpending: number;
  averageContractValue: number;
}

export default function ContractsPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [metrics, setMetrics] = useState<ContractMetrics | null>(null);

  const { addAlert, AlertContainer } = useAlert();

  // Load contracts
  useEffect(() => {
    if (user) {
      loadContracts();
    }
  }, [user, activeTab]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        type: activeTab
      });

      const response = await apiClient.get(`/contracts?${queryParams}`);
      
      setContracts(response.data.contracts);
      calculateMetrics(response.data.contracts);
    } catch (error: any) {
      setError(handleAPIError(error).message);
      addAlert('error', handleAPIError(error).message);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (contractsList: Contract[]) => {
    const metrics: ContractMetrics = {
      totalContracts: contractsList.length,
      activeContracts: contractsList.filter(c => c.status === 'active').length,
      completedContracts: contractsList.filter(c => c.status === 'completed').length,
      totalEarnings: contractsList
        .filter(c => c.status === 'completed')
        .reduce((sum, c) => sum + (c.amount - c.totalPaid), 0),
      totalSpending: contractsList
        .filter(c => c.status === 'completed')
        .reduce((sum, c) => sum + c.totalPaid, 0),
      averageContractValue: contractsList.length > 0 
        ? contractsList.reduce((sum, c) => sum + c.amount, 0) / contractsList.length 
        : 0
    };

    setMetrics(metrics);
  };

  const handleContractAction = async (contractId: string, action: string) => {
    try {
      const updateData: any = {};
      
      switch (action) {
        case 'pause':
          updateData.status = 'paused';
          break;
        case 'resume':
          updateData.status = 'active';
          break;
        case 'complete':
          updateData.status = 'completed';
          updateData.endDate = new Date().toISOString();
          break;
        case 'cancel':
          updateData.status = 'cancelled';
          break;
      }

      await apiClient.put(`/contracts/${contractId}`, updateData);
      
      setContracts(prev => 
        prev.map(contract => 
          contract.id === contractId 
            ? { ...contract, ...updateData, updatedAt: new Date().toISOString() }
            : contract
        )
      );

      addAlert('success', `Contract ${action}d successfully`);
      calculateMetrics(contracts);
    } catch (error: any) {
      addAlert('error', handleAPIError(error).message);
    }
  };

  const downloadContract = async (contractId: string) => {
    try {
      const response = await apiClient.get(`/contracts/${contractId}/pdf`);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract-${contractId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      addAlert('success', 'Contract downloaded successfully');
    } catch (error: any) {
      addAlert('error', 'Failed to download contract');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <PlayCircle className="w-5 h-5 text-green-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'paused':
        return <PauseCircle className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
      case 'terminated':
        return <Square className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatProgress = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  if (error) {
    return (
      <>
        <AlertContainer />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <FileText className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Contracts</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={loadContracts} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AlertContainer />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
                <p className="text-gray-600 mt-1">
                  Manage your active and completed contracts
                </p>
              </div>
              <button
                onClick={() => window.location.href = user?.role === 'company' ? '/company/dashboard' : '/va/dashboard'}
                className="btn-secondary"
              >
                Back to Dashboard
              </button>
            </div>

            {/* Metrics Cards */}
            {metrics && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Total Contracts</p>
                      <p className="text-xl font-semibold text-gray-900">{metrics.totalContracts}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <PlayCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Active</p>
                      <p className="text-xl font-semibold text-gray-900">{metrics.activeContracts}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">
                        {user?.role === 'va' ? 'Total Earnings' : 'Total Spending'}
                      </p>
                      <p className="text-xl font-semibold text-gray-900">
                        {formatCurrency(
                          user?.role === 'va' ? metrics.totalEarnings : metrics.totalSpending
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-xl font-semibold text-gray-900">{metrics.completedContracts}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="mt-6">
              <div className="flex space-x-8">
                {(['active', 'completed', 'all'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} Contracts
                    {tab === 'active' && metrics && (
                      <span className="ml-2 bg-primary-100 text-primary-600 px-2 py-1 rounded-full text-xs">
                        {metrics.activeContracts}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contracts List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : contracts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} contracts</h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'active' 
                  ? 'You have no active contracts at the moment.'
                  : `You haven't ${activeTab === 'completed' ? 'completed' : 'any'} contracts yet.`
                }
              </p>
              <button
                onClick={() => window.location.href = '/jobs/marketplace'}
                className="btn-primary"
              >
                Find Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div key={contract.id} className="bg-white rounded-lg shadow-sm p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getStatusIcon(contract.status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {contract.job.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {user?.role === 'va' ? 'with' : 'for'}{' '}
                          {user?.role === 'va' ? contract.company?.name : contract.vaProfile?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                        {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                      </span>
                      <div className="relative">
                        <button
                          onClick={() => setSelectedContract(contract.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </button>
                        {selectedContract === contract.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <button
                              onClick={() => {
                                setShowDetails(true);
                                setSelectedContract(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              View Details
                            </button>
                            <button
                              onClick={() => downloadContract(contract.id)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </button>
                            <button
                              onClick={() => window.location.href = `/messages?contract=${contract.id}`}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Send Message
                            </button>
                            {contract.status === 'active' && user?.role === 'company' && (
                              <>
                                <button
                                  onClick={() => {
                                    handleContractAction(contract.id, 'pause');
                                    setSelectedContract(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <PauseCircle className="w-4 h-4 mr-2" />
                                  Pause Contract
                                </button>
                                <button
                                  onClick={() => {
                                    handleContractAction(contract.id, 'complete');
                                    setSelectedContract(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark Complete
                                </button>
                              </>
                            )}
                            {contract.status === 'paused' && user?.role === 'company' && (
                              <button
                                onClick={() => {
                                  handleContractAction(contract.id, 'resume');
                                  setSelectedContract(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Resume Contract
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contract Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600">Amount</span>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(contract.amount, contract.currency)}
                      </p>
                      {contract.contractType === 'hourly' && contract.hourlyRate && (
                        <p className="text-sm text-gray-500">
                          {formatCurrency(contract.hourlyRate, contract.currency)}/hour
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Start Date</span>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(contract.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    {contract.endDate && (
                      <div>
                        <span className="text-sm text-gray-600">End Date</span>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(contract.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-gray-600">Paid</span>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(contract.totalPaid, contract.currency)}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${formatProgress(contract.totalPaid, contract.amount)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  {contract.metrics && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">Milestone Progress</span>
                          <p className="text-lg font-semibold text-gray-900">
                            {contract.metrics.milestoneProgress}%
                          </p>
                        </div>
                        {contract.contractType === 'hourly' && (
                          <div>
                            <span className="text-sm text-gray-600">Hours Logged</span>
                            <p className="text-lg font-semibold text-gray-900">
                              {contract.metrics.totalHours.toFixed(1)}h
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-sm text-gray-600">Remaining</span>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(contract.metrics.amountRemaining, contract.currency)}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Next Payment</span>
                          <p className="text-sm font-medium text-gray-900">
                            {contract.contractType === 'milestone' ? 'Milestone' : 'End of contract'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(contract.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{new Date(contract.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.location.href = `/contracts/${contract.id}`}
                        className="btn-primary text-sm"
                      >
                        View Details
                      </button>
                      {user?.role === 'va' && contract.contractType === 'hourly' && (
                        <button
                          onClick={() => window.location.href = `/contracts/${contract.id}/timesheet`}
                          className="btn-secondary text-sm"
                        >
                          Log Hours
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}