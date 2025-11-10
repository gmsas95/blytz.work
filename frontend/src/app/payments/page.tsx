// Payment History - View all payments, transactions, and financial summary
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase';
import { apiClient, handleAPIError } from '@/lib/api';
import { 
  DollarSign, 
  Download, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  FileText,
  Calendar,
  ChevronDown,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Receipt
} from 'lucide-react';
import { useAlert } from '@/components/ui/Alert';

interface Payment {
  id: string;
  jobId?: string;
  contractId?: string;
  milestoneId?: string;
  invoiceId?: string;
  userId: string;
  receiverId: string;
  amount: number;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  stripeFee: number;
  platformFee: number;
  method: 'card' | 'bank' | 'crypto';
  type: 'payment' | 'refund' | 'payout';
  metadata?: any;
  refundAmount?: number;
  refundedAt?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  contract?: {
    id: string;
    title: string;
    status: string;
  };
  milestone?: {
    id: string;
    title: string;
    status: string;
  };
  job?: {
    id: string;
    title: string;
    status: string;
  };
}

interface FinancialSummary {
  summary: {
    totalSent: number;
    totalReceived: number;
    netEarnings: number;
    totalPlatformFees: number;
    userEarnings?: number;
    companySpending?: number;
  };
  transactions: {
    sentCount: number;
    receivedCount: number;
    totalCount: number;
  };
  period: string;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sent' | 'received' | 'all'>('all');
  const [period, setPeriod] = useState<'all' | 'month' | 'year'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  const { addAlert, AlertContainer } = useAlert();

  // Load payments and summary
  useEffect(() => {
    if (user) {
      loadPayments();
      loadSummary();
    }
  }, [user, activeTab, period, searchQuery, status, pagination.page]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        type: activeTab,
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (status) queryParams.set('status', status);
      if (period !== 'all') queryParams.set('period', period);

      const response = await apiClient.get(`/payments/history?${queryParams}`);
      
      setPayments(response.data.payments);
      setPagination(response.data.pagination);
    } catch (error: any) {
      setError(handleAPIError(error).message);
      addAlert('error', handleAPIError(error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const queryParams = new URLSearchParams({ period });
      const response = await apiClient.get(`/payments/summary?${queryParams}`);
      setSummary(response.data);
    } catch (error: any) {
      console.error('Failed to load summary:', error);
    }
  };

  const handleDownloadStatement = async () => {
    try {
      const queryParams = new URLSearchParams({
        type: activeTab,
        period
      });

      const response = await apiClient.get(`/payments/statement?${queryParams}`);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-statement-${period}-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      addAlert('success', 'Payment statement downloaded successfully');
    } catch (error: any) {
      addAlert('error', 'Failed to download statement');
    }
  };

  const getStatusIcon = (status: string, type: string) => {
    if (type === 'refund') {
      return <ArrowDownRight className="w-4 h-4 text-green-600" />;
    }
    if (type === 'payment') {
      return <ArrowUpRight className="w-4 h-4 text-blue-600" />;
    }
    return <Receipt className="w-4 h-4 text-gray-600" />;
  };

  const getStatusColor = (status: string, type: string) => {
    if (type === 'refund') return 'bg-green-100 text-green-800';
    
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentDescription = (payment: Payment) => {
    if (payment.job) {
      return `Payment for "${payment.job.title}"`;
    }
    if (payment.milestone) {
      return `Milestone: "${payment.milestone.title}"`;
    }
    if (payment.contract) {
      return `Payment for contract`;
    }
    return 'Payment';
  };

  if (error) {
    return (
      <>
        <AlertContainer />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <CreditCard className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Payments</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={loadPayments} className="btn-primary">
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
                <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
                <p className="text-gray-600 mt-1">
                  View and manage all your payments and transactions
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
                <button
                  onClick={handleDownloadStatement}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Statement</span>
                </button>
              </div>
            </div>

            {/* Financial Summary */}
            {summary && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Total Sent</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {formatCurrency(summary.summary.totalSent)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Total Received</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {formatCurrency(summary.summary.totalReceived)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingDown className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Net Earnings</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {formatCurrency(summary.summary.netEarnings)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Receipt className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Platform Fees</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {formatCurrency(summary.summary.totalPlatformFees)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">
                        {user?.role === 'va' ? 'Total Earnings' : 'Total Spending'}
                      </p>
                      <p className="text-xl font-semibold text-gray-900">
                        {formatCurrency(
                          user?.role === 'va' 
                            ? (summary.summary.userEarnings || 0)
                            : (summary.summary.companySpending || 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Summary */}
            {summary && (
              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-900">
                      {summary.transactions.totalCount}
                    </p>
                    <p className="text-sm text-blue-700">Total Transactions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-900">
                      {summary.transactions.sentCount}
                    </p>
                    <p className="text-sm text-blue-700">Payments Sent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-900">
                      {summary.transactions.receivedCount}
                    </p>
                    <p className="text-sm text-blue-700">Payments Received</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="mt-6">
              <div className="flex space-x-8">
                {(['all', 'sent', 'received'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'all' ? 'All Payments' : 
                     tab === 'sent' ? 'Payments Sent' : 'Payments Received'}
                  </button>
                ))}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mt-6 flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search payments..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {(status || showFilters) && (
                  <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                    {(status ? 1 : 0) + (showFilters ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Filters */}
          {showFilters && (
            <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="succeeded">Succeeded</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => {
                  setStatus('');
                  setShowFilters(false);
                }}
                className="mt-4 btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Payments List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments Found</h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'all' 
                  ? "You haven't made any transactions yet."
                  : `You haven't ${activeTab === 'sent' ? 'sent' : 'received'} any payments yet.`
                }
              </p>
              <button
                onClick={() => window.location.href = '/jobs/marketplace'}
                className="btn-primary"
              >
                {user?.role === 'va' ? 'Find Jobs' : 'Post Jobs'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getStatusIcon(payment.status, payment.type)}
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {getPaymentDescription(payment)}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status, payment.type)}`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {payment.method === 'card' && <CreditCard className="w-4 h-4 inline mr-1" />}
                            {payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}
                          </span>
                          <span className="text-sm text-gray-600 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(payment.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {payment.type === 'refund' 
                          ? `-${formatCurrency(payment.refundAmount || 0)}`
                          : (payment.userId === user?.uid 
                            ? `-${formatCurrency(payment.amount)}`
                            : `+${formatCurrency(payment.amount - payment.stripeFee - payment.platformFee)}`
                          )
                        }
                      </div>
                      {payment.platformFee > 0 && (
                        <p className="text-sm text-gray-600">
                          Fee: {formatCurrency(payment.platformFee)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Additional Details */}
                  {payment.refundAmount && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Refund Amount:</span>
                        <span className="text-green-600 font-medium">
                          {formatCurrency(payment.refundAmount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">Refunded:</span>
                        <span className="text-gray-900">
                          {payment.refundedAt ? formatDate(payment.refundedAt) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Transaction Details */}
                  <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Payment ID:</span>
                      <p className="text-gray-900 font-mono">{payment.id.slice(0, 10)}...</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Gross Amount:</span>
                      <p className="text-gray-900">{formatCurrency(payment.amount)}</p>
                    </div>
                    {payment.stripeFee > 0 && (
                      <div>
                        <span className="text-gray-600">Processing Fee:</span>
                        <p className="text-gray-900">{formatCurrency(payment.stripeFee)}</p>
                      </div>
                    )}
                    {payment.processedAt && (
                      <div>
                        <span className="text-gray-600">Processed:</span>
                        <p className="text-gray-900">{formatDate(payment.processedAt)}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center justify-end space-x-2">
                    <button className="btn-secondary text-sm">
                      <Receipt className="w-4 h-4 mr-1" />
                      View Receipt
                    </button>
                    {payment.status === 'succeeded' && payment.userId === user?.uid && (
                      <button className="btn-secondary text-sm text-red-600">
                        Request Refund
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} payments
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                    className={`px-3 py-1 text-sm ${
                      pagination.page === i + 1
                        ? 'bg-primary-600 text-white'
                        : 'btn-secondary'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}