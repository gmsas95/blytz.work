'use client';

import { AlertContainer } from "@/components/ui/Alert";
import { useAlert } from "@/components/ui/Alert";
import { useState, useEffect } from 'react';
import { useAlert } from "@/components/ui/Alert";
import { useAuth } from '@/lib/firebase';
import { 
  FileText, 
  ExternalLink,
  Download,
  AlertCircle,
  Check,
  Clock,
  TrendingUp
} from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  vaName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending';
  value: number;
  description: string;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  
  const { user, addAlert, removeAlert } = useAlert();

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock data for now
      const mockContracts: Contract[] = [
        {
          id: '1',
          title: 'Virtual Assistant - Part Time',
          vaName: 'Sarah Johnson',
          startDate: '2024-01-15',
          endDate: '2024-02-15',
          status: 'active',
          value: 2500,
          description: '20 hours/week virtual assistant services including email management, scheduling, and customer support.'
        },
        {
          id: '2',
          title: 'Content Creation Specialist',
          vaName: 'Mike Chen',
          startDate: '2023-12-01',
          endDate: '2024-01-15',
          status: 'completed',
          value: 1800,
          description: 'Blog writing, social media content creation, and email newsletter management.'
        }
      ];
      
      setContracts(mockContracts);
    } catch (err) {
      setError('Failed to load contracts');
      addAlert('Failed to load contracts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    if (activeTab === 'all') return true;
    return contract.status === activeTab;
  });

  return (
    <>
      <AlertContainer />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Contracts</h1>
            <p className="text-gray-600">Manage your virtual assistant contracts and track performance</p>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {['active', 'completed', 'all'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`${
                      activeTab === tab
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm capitalize`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contracts Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
                <button
                  onClick={loadContracts}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} contracts</h3>
              <p className="text-gray-500">
                {activeTab === 'all' 
                  ? "You haven't created any contracts yet."
                  : `No ${activeTab} contracts found.`
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        contract.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : contract.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {contract.status}
                      </span>
                      <span className="text-sm text-gray-500">${contract.value}</span>
                    </div>

                    {/* Contract Info */}
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{contract.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{contract.vaName}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {contract.startDate} - {contract.endDate}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">{contract.description}</p>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedContract(contract)}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700"
                      >
                        View Details
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded">
                        <Download className="h-4 w-4" />
                      </button>
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
