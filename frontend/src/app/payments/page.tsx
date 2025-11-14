'use client';

import { useState, useEffect } from 'react';
import { useImprovedAlert } from '@/contexts/ImprovedAlertContext';
import { useAuth } from '@/components/AuthProvider';
import Navbar from "@/components/Navbar";
import { 
  CreditCard,
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui-shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui-shadcn/card';
import { Badge } from '@/components/ui-shadcn/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui-shadcn/tabs';
import { Separator } from '@/components/ui-shadcn/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui-shadcn/select';
import { Skeleton } from '@/components/ui-shadcn/skeleton';

interface Transaction {
  id: string;
  type: 'payment' | 'refund' | 'fee';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  invoice?: string;
  metadata?: {
    vaName?: string;
    contractTitle?: string;
    hoursWorked?: number;
  };
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  lastFour: string;
  brand?: string;
  isDefault: boolean;
  status: 'active' | 'expired';
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'payment',
    amount: 2500,
    description: 'Monthly VA Payment - Sarah Johnson',
    status: 'completed',
    date: '2024-01-15T10:00:00Z',
    invoice: 'INV-2024-001',
    metadata: {
      vaName: 'Sarah Johnson',
      contractTitle: 'Virtual Assistant - Part Time',
      hoursWorked: 160
    }
  },
  {
    id: '2',
    type: 'fee',
    amount: 29.99,
    description: 'Platform Fee - Contract Connection',
    status: 'completed',
    date: '2024-01-14T14:30:00Z',
    invoice: 'FEE-2024-001'
  },
  {
    id: '3',
    type: 'payment',
    amount: 1800,
    description: 'Project Payment - Mike Chen',
    status: 'pending',
    date: '2024-01-13T09:15:00Z',
    invoice: 'INV-2024-002',
    metadata: {
      vaName: 'Mike Chen',
      contractTitle: 'Content Creation Specialist',
      hoursWorked: 80
    }
  }
];

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    lastFour: '4242',
    brand: 'Visa',
    isDefault: true,
    status: 'active'
  },
  {
    id: '2',
    type: 'card',
    lastFour: '8888',
    brand: 'Mastercard',
    isDefault: false,
    status: 'active'
  }
];

export default function PaymentsPage() {
  const { user } = useAuth();
  const { addAlert } = useImprovedAlert();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'methods'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedType, setSelectedType] = useState<'all' | 'payments' | 'refunds' | 'fees'>('all');

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    setLoading(true);
    
    try {
      // Load transactions
      const transactionsResponse = await fetch('/api/payments/transactions');
      
      if (!transactionsResponse.ok) {
        console.warn('Transactions API not available, using mock data');
        setTransactions(mockTransactions);
      } else {
        const result = await transactionsResponse.json();
        setTransactions(result.data);
      }

      // Load payment methods
      const methodsResponse = await fetch('/api/payments/methods');
      
      if (!methodsResponse.ok) {
        console.warn('Payment methods API not available, using mock data');
        setPaymentMethods(mockPaymentMethods);
      } else {
        const result = await methodsResponse.json();
        setPaymentMethods(result.data);
      }
    } catch (error) {
      console.error('Failed to load payment data:', error);
      setTransactions(mockTransactions);
      setPaymentMethods(mockPaymentMethods);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 text-white">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'payment':
        return <Badge className="bg-blue-500 text-white">Payment</Badge>;
      case 'refund':
        return <Badge className="bg-purple-500 text-white">Refund</Badge>;
      case 'fee':
        return <Badge className="bg-orange-500 text-white">Fee</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const calculateStats = () => {
    const totalSpent = transactions
      .filter(t => t.type === 'payment' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalFees = transactions
      .filter(t => t.type === 'fee' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const pendingPayments = transactions
      .filter(t => t.type === 'payment' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const recentTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return transactionDate > thirtyDaysAgo;
    }).length;

    return { totalSpent, totalFees, pendingPayments, recentTransactions };
  };

  const stats = calculateStats();

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedType === 'all') return true;
    return transaction.type === selectedType.slice(0, -1); // Remove 's' from plural form
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number, type: string) => {
    const prefix = type === 'refund' ? '-' : '';
    const color = type === 'refund' ? 'text-green-400' : 'text-white';
    
    return (
      <span className={`font-bold ${color}`}>
        {prefix}${amount.toLocaleString()}
      </span>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-900 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Skeleton className="h-10 w-48 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Payments</h1>
            <p className="text-gray-400 text-lg">Manage your transactions and payment methods</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Spent</p>
                    <p className="text-3xl font-bold text-white">${stats.totalSpent.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Platform Fees</p>
                    <p className="text-3xl font-bold text-white">${stats.totalFees.toLocaleString()}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Pending</p>
                    <p className="text-3xl font-bold text-yellow-400">${stats.pendingPayments.toLocaleString()}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Recent Activity</p>
                    <p className="text-3xl font-bold text-blue-400">{stats.recentTransactions}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-8">
            <TabsList className="bg-gray-800/50 border-gray-700">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
                Overview
              </TabsTrigger>
              <TabsTrigger value="transactions" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
                Transactions
              </TabsTrigger>
              <TabsTrigger value="methods" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
                Payment Methods
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Transactions</CardTitle>
                    <CardDescription className="text-gray-400">
                      Latest payment activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              transaction.type === 'payment' ? 'bg-blue-500/20' :
                              transaction.type === 'refund' ? 'bg-green-500/20' :
                              'bg-orange-500/20'
                            }`}>
                              {transaction.type === 'payment' && <DollarSign className="h-5 w-5 text-blue-400" />}
                              {transaction.type === 'refund' && <ArrowUpRight className="h-5 w-5 text-green-400" />}
                              {transaction.type === 'fee' && <CreditCard className="h-5 w-5 text-orange-400" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{transaction.description}</p>
                              <p className="text-xs text-gray-400">{formatDate(transaction.date)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {formatAmount(transaction.amount, transaction.type)}
                            {getStatusBadge(transaction.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Payment Methods</CardTitle>
                    <CardDescription className="text-gray-400">
                      Your saved payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-white">
                                {method.brand} •••• {method.lastFour}
                              </p>
                              <p className="text-xs text-gray-400">
                                {method.isDefault ? 'Default' : 'Secondary'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={method.status === 'active' ? 'bg-green-500' : 'bg-red-500'}>
                              {method.status}
                            </Badge>
                            {method.isDefault && (
                              <Badge className="bg-yellow-400 text-gray-900">Default</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Select
                    value={selectedType}
                    onValueChange={(value) => setSelectedType(value as any)}
                  >
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="all" className="text-white">All Types</SelectItem>
                      <SelectItem value="payments" className="text-white">Payments</SelectItem>
                      <SelectItem value="refunds" className="text-white">Refunds</SelectItem>
                      <SelectItem value="fees" className="text-white">Fees</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedPeriod}
                    onValueChange={(value) => setSelectedPeriod(value as any)}
                  >
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="week" className="text-white">Last Week</SelectItem>
                      <SelectItem value="month" className="text-white">Last Month</SelectItem>
                      <SelectItem value="quarter" className="text-white">Last Quarter</SelectItem>
                      <SelectItem value="year" className="text-white">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700/50">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-gray-300">Transaction</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-300">Date</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-300">Type</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                          <th className="text-right p-4 text-sm font-medium text-gray-300">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {filteredTransactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-700/30">
                            <td className="p-4">
                              <div>
                                <p className="text-sm font-medium text-white">{transaction.description}</p>
                                {transaction.invoice && (
                                  <p className="text-xs text-gray-400">{transaction.invoice}</p>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-300">
                              {formatDate(transaction.date)}
                            </td>
                            <td className="p-4">
                              {getTypeBadge(transaction.type)}
                            </td>
                            <td className="p-4">
                              {getStatusBadge(transaction.status)}
                            </td>
                            <td className="p-4 text-right">
                              {formatAmount(transaction.amount, transaction.type)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Methods Tab */}
            <TabsContent value="methods" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Payment Methods</h2>
                <Button className="bg-yellow-400 text-gray-900 hover:bg-yellow-300">
                  Add Payment Method
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paymentMethods.map((method) => (
                  <Card key={method.id} className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="text-lg font-semibold text-white">
                              {method.brand} •••• {method.lastFour}
                            </p>
                            <p className="text-sm text-gray-400">
                              {method.isDefault ? 'Default payment method' : 'Secondary payment method'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={method.status === 'active' ? 'bg-green-500' : 'bg-red-500'}>
                            {method.status}
                          </Badge>
                          {method.isDefault && (
                            <Badge className="bg-yellow-400 text-gray-900">Default</Badge>
                          )}
                        </div>
                      </div>

                      <Separator className="bg-gray-700 mb-4" />

                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Edit
                        </Button>
                        {!method.isDefault && (
                          <Button
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            Remove
                          </Button>
                        )}
                        {method.isDefault && (
                          <Button
                            variant="outline"
                            disabled
                            className="border-gray-600 text-gray-500"
                          >
                            Set as Default
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}