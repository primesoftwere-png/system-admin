import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Table } from '../components/Table';
import { Pagination } from '../components/Pagination';
import { Mail } from 'lucide-react';

interface Campaign {
  _id: string;
  campaignId: string;
  for: string;
  messageTitle: string;
  sendingDateTime: string;
  businessRef: {
    _id: string;
    name: string;
    email: string;
  };
}

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [paginationData, setPaginationData] = useState({ total: 0, totalPages: 1 });

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        const response = await axiosClient.get('/campaigns', { params: { page, limit } });
        setCampaigns(response.data.data || []);
        if (response.data.pagination) {
          setPaginationData(response.data.pagination);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [page, limit]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const columns = [
    { header: 'Campaign ID', accessorKey: 'campaignId' as keyof Campaign },
    {
      header: 'Type',
      cell: (item: Campaign) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          {item.for}
        </span>
      ),
    },
    { header: 'Title', accessorKey: 'messageTitle' as keyof Campaign },
    {
      header: 'Business',
      cell: (item: Campaign) => (
        <span className="font-medium text-slate-700">{item.businessRef?.name || 'N/A'}</span>
      ),
    },
    {
      header: 'Scheduled Time',
      cell: (item: Campaign) => (
        <span className="text-slate-500">
          {item.sendingDateTime
            ? new Date(item.sendingDateTime).toLocaleString()
            : <span className="text-slate-300 italic">Not scheduled</span>
          }
        </span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Mail className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Campaigns</h1>
            <p className="text-sm text-slate-400">Track and manage all campaigns</p>
          </div>
        </div>
      </div>

      <Table 
        columns={columns} 
        data={campaigns} 
        isLoading={isLoading} 
        pagination={
          campaigns.length > 0 ? (
            <Pagination
              currentPage={page}
              totalPages={paginationData.totalPages}
              totalItems={paginationData.total}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={handleLimitChange}
            />
          ) : undefined
        }
      />
    </div>
  );
};

export default Campaigns;
