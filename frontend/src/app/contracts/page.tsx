'use client';

import { useState, useEffect } from 'react';
import { useImprovedAlert } from '@/contexts/ImprovedAlertContext';
import { useAuth } from '@/components/AuthProvider';
import Navbar from "@/components/Navbar";
import { 
  FileText, 
  ExternalLink,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Eye,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui-shadcn/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui-shadcn/card';
import { Badge } from '@/components/ui-shadcn/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui-shadcn/tabs';
import { Separator } from '@/components/ui-shadcn/separator';
import { Skeleton } from '@/components/ui-shadcn/skeleton';

interface Contract {
  id: string;
  title: string;
  vaName: string;
  vaAvatar?: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending';
  value: number;
  description: string;
  hoursWorked?: number;
  totalHours?: number;
  milestones?: Array<{
    id: string;
    title: string;
    completed: boolean;
    dueDate: string;
  }>;
  company?: {
    name: string;
    logoUrl?: string;
  };
}

const mockContracts: Contract[] = [
  {
    id: '1',
    title: 'Virtual Assistant - Part Time',
    vaName: 'Sarah Johnson',
    vaAvatar: 'https://via.placeholder.com/40x40/FFD600/000000?text=SJ',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    status: 'active',
    value: 2500,
    description: '20 hours/week virtual assistant services including email management, scheduling, and customer support.',
    hoursWorked: 120,
    totalHours: 160,
    milestones: [
      { id: '1', title: 'Onboarding Complete', completed: true, dueDate: '2024-01-20' },
      { id: '2', title: 'First Deliverable', completed: false, dueDate: '2024-01-30' }
    ],
    company: {
      name: 'TechCorp Solutions',
      logoUrl: 'https://via.placeholder.com/40x40/FFD600/000000?text=TC'
    }
  },
  {
    id: '2',
    title: 'Content Creation Specialist',
    vaName: 'Mike Chen',
    vaAvatar: 'https://via.placeholder.com/40x40/FFD600/000000?text=MC',
    startDate: '2023-12-01',
    endDate: '2024-01-15',
    status: 'completed',
    value: 1800,
    description: 'Blog writing, social media content creation, and email newsletter management.',
    hoursWorked: 80,
    totalHours: 80,
    milestones: [
      { id: '1', title: 'Content Calendar', completed: true, dueDate: '2023-12-15' },
      { id: '2', title: 'Blog Posts', completed: true, dueDate: '2024-01-01' }
    ]
  },
  {
    id: '3',
    title: 'Customer Support Representative',
    vaName: 'Emily Davis',
    vaAvatar: 'https://via.placeholder.com/40x40/FFD600/000000?text=ED',
    startDate: '2024-02-01',
    endDate: '2024-04-01',
    status: 'pending',
    value: 3200,
    description: 'Full-time customer support with email and chat handling.',
    hoursWorked: 0,
    totalHours: 240,
    milestones: [
      { id: '1', title: 'Training Complete', completed: false, dueDate: '2024-02-15' }
    ]
  }
];

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  
  const { user } = useAuth();
  const { addAlert } = useImprovedAlert();

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // API call with fallback to mock data
      const response = await fetch('/api/contracts');
      
      if (!response.ok) {
        console.warn('Contracts API not available, using mock data');
        setContracts(mockContracts);
        return;
      }
      
      const result = await response.json();
      setContracts(result.data);
    } catch (err) {
      console.error('Failed to load contracts:', err);
      setContracts(mockContracts);
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    if (activeTab === 'all') return true;
    return contract.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500 text-white">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusStats = () => {
    const active = contracts.filter(c => c.status === 'active').length;
    const completed = contracts.filter(c => c.status === 'completed').length;
    const pending = contracts.filter(c => c.status === 'pending').length;
    const totalValue = contracts.reduce((sum, c) => sum + c.value, 0);
    
    return { active, completed, pending, totalValue };
  };

  const stats = getStatusStats();

  if (loading && contracts.length === 0) {
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
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
            <h1 className="text-4xl font-bold text-white mb-2">Contracts</h1>
            <p className="text-gray-400 text-lg">Manage your virtual assistant contracts and track performance</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Active Contracts</p>
                    <p className="text-3xl font-bold text-green-400">{stats.active}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Completed</p>
                    <p className="text-3xl font-bold text-blue-400">{stats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Pending</p>
                    <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Value</p>
                    <p className="text-3xl font-bold text-yellow-400">${stats.totalValue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-8">
            <TabsList className="bg-gray-800/50 border-gray-700">
              <TabsTrigger value="active" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
                Active ({stats.active})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
                Completed ({stats.completed})
              </TabsTrigger>
              <TabsTrigger value="all" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
                All ({contracts.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Contracts Grid */}
          {error ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-400 text-lg mb-4">{error}</p>
                <Button onClick={loadContracts} className="bg-red-500 hover:bg-red-600">
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No {activeTab} contracts</h3>
              <p className="text-gray-400 text-lg">
                {activeTab === 'all' 
                  ? "You haven't created any contracts yet."
                  : `No ${activeTab} contracts found.`
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredContracts.map((contract) => (
                <Card key={contract.id} className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-yellow-400/50 transition-colors">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
                          {contract.vaAvatar ? (
                            <img src={contract.vaAvatar} alt={contract.vaName} className="w-10 h-10 rounded-full" />
                          ) : (
                            <Users className="h-5 w-5 text-yellow-400" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg text-white">{contract.title}</CardTitle>
                          <CardDescription className="text-gray-400">{contract.vaName}</CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(contract.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="pb-4">
                    <div className="flex items-center text-sm text-gray-400 mb-3">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                    </div>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{contract.description}</p>

                    {/* Progress for active contracts */}
                    {contract.status === 'active' && contract.hoursWorked !== undefined && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-yellow-400">{Math.round((contract.hoursWorked / contract.totalHours!) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${(contract.hoursWorked / contract.totalHours!) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-gray-400">{contract.hoursWorked}h</span>
                          <span className="text-gray-400">{contract.totalHours}h total</span>
                        </div>
                      </div>
                    )}

                    <Separator className="bg-gray-700 mb-4" />

                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-400">Contract Value</span>
                      <span className="text-xl font-bold text-green-400">${contract.value.toLocaleString()}</span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <div className="flex space-x-2 w-full">
                      <Button
                        onClick={() => setSelectedContract(contract)}
                        className="flex-1 bg-yellow-400 text-gray-900 hover:bg-yellow-300"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        className="border-gray-600 text-gray-400 hover:bg-gray-700"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contract Details Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-800/95 backdrop-blur-lg border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl text-white mb-2">{selectedContract.title}</CardTitle>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center">
                    {selectedContract.vaAvatar ? (
                      <img src={selectedContract.vaAvatar} alt={selectedContract.vaName} className="w-12 h-12 rounded-full" />
                    ) : (
                      <Users className="h-6 w-6 text-yellow-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">{selectedContract.vaName}</p>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(selectedContract.status)}
                      <span className="text-gray-400 text-sm">Contract ID: {selectedContract.id}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedContract(null)}
                className="text-gray-400 hover:text-white"
              >
                <AlertCircle className="h-6 w-6" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Contract Description</h3>
                <p className="text-gray-300">{selectedContract.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-white mb-1">Start Date</h4>
                  <p className="text-gray-300">{formatDate(selectedContract.startDate)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">End Date</h4>
                  <p className="text-gray-300">{formatDate(selectedContract.endDate)}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-white">Total Contract Value</h4>
                <span className="text-2xl font-bold text-green-400">${selectedContract.value.toLocaleString()}</span>
              </div>

              {/* Milestones */}
              {selectedContract.milestones && selectedContract.milestones.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Milestones</h3>
                  <div className="space-y-3">
                    {selectedContract.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            milestone.completed ? 'bg-green-500' : 'bg-gray-600'
                          }`}>
                            {milestone.completed && (
                              <CheckCircle className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white">{milestone.title}</p>
                            <p className="text-sm text-gray-400">Due: {formatDate(milestone.dueDate)}</p>
                          </div>
                        </div>
                        <Badge className={milestone.completed ? "bg-green-500" : "bg-yellow-500"}>
                          {milestone.completed ? "Completed" : "Pending"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex space-x-3">
              <Button className="flex-1 bg-yellow-400 text-gray-900 hover:bg-yellow-300">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Contract
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}