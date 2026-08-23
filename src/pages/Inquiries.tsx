import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Table } from '../components/Table';
import { Pagination } from '../components/Pagination';
import { Users } from 'lucide-react';

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  subject: string;
  status: string;
  createdAt: string;
}

const Inquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [paginationData, setPaginationData] = useState({ total: 0, totalPages: 1 });

  useEffect(() => {
    const fetchInquiries = async () => {
      setIsLoading(true);
      try {
        const response = await axiosClient.get('/inquiries', { params: { page, limit } });
        setInquiries(response.data.data || []);
        if (response.data.pagination) {
          setPaginationData(response.data.pagination);
        }
      } catch (error) {
        console.error('Error fetching inquiries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiries();
  }, [page, limit]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const columns = [
    {
      header: 'Name',
      cell: (item: Inquiry) => (
        <span className="font-medium text-slate-700">{item.name}</span>
      ),
    },
    { header: 'Email', accessorKey: 'email' as keyof Inquiry },
    { header: 'Subject', accessorKey: 'subject' as keyof Inquiry },
    {
      header: 'Status',
      cell: (item: Inquiry) => {
        const statusStyles: Record<string, string> = {
          'Resolved': 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
          'In Progress': 'bg-blue-50 text-blue-700 ring-blue-600/10',
        };
        const defaultStyle = 'bg-amber-50 text-amber-700 ring-amber-600/10';
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${
            statusStyles[item.status] || defaultStyle
          }`}>
            {item.status}
          </span>
        );
      },
    },
    {
      header: 'Date',
      cell: (item: Inquiry) => (
        <span className="text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Inquiries</h1>
            <p className="text-sm text-slate-400">View and manage customer inquiries</p>
          </div>
        </div>
      </div>

      <Table 
        columns={columns} 
        data={inquiries} 
        isLoading={isLoading} 
        pagination={
          inquiries.length > 0 ? (
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

export default Inquiries;
