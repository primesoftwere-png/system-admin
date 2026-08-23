import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Table } from '../components/Table';
import { Pagination } from '../components/Pagination';
import { Briefcase, Filter, Search } from 'lucide-react';

interface Business {
  _id: string;
  name: string;
  email: string;
  niche: string;
  city: string;
  country: string;
  phoneNumber: string;
  isWeb: boolean;
}

const Businesses = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [paginationData, setPaginationData] = useState({ total: 0, totalPages: 1 });

  const [niches, setNiches] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    niche: '',
    city: '',
    country: '',
    isWeb: '',
    isSend: ''
  });
  
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [nichesRes, citiesRes, countriesRes] = await Promise.all([
          axiosClient.get('/businesses/niches'),
          axiosClient.get('/businesses/cities'),
          axiosClient.get('/businesses/countries')
        ]);
        setNiches(nichesRes.data.data || []);
        setCities(citiesRes.data.data || []);
        setCountries(countriesRes.data.data || []);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setIsLoading(true);
      try {
        const activeFilters = Object.fromEntries(
          Object.entries(debouncedFilters).filter(([_, v]) => v !== '')
        );
        const response = await axiosClient.get('/businesses', { 
          params: { page, limit, ...activeFilters } 
        });
        setBusinesses(response.data.data || []);
        if (response.data.pagination) {
          setPaginationData(response.data.pagination);
        }
      } catch (error) {
        console.error('Error fetching businesses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinesses();
  }, [page, limit, debouncedFilters]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const columns = [
    { header: 'Name', cell: (item: Business) => item.name || '-' },
    { header: 'Email', cell: (item: Business) => item.email || '-' },
    { header: 'Niche', cell: (item: Business) => item.niche || '-' },
    { 
      header: 'Location', 
      cell: (item: Business) => {
        const city = item.city || '-';
        const country = item.country || '-';
        return city === '-' && country === '-' ? '-' : `${city}, ${country}`;
      } 
    },
    { header: 'Phone', cell: (item: Business) => item.phoneNumber || '-' },
    {
      header: 'Website',
      cell: (item: Business) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          item.isWeb ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
        }`}>
          {item.isWeb ? 'Yes' : 'No'}
        </span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Businesses</h1>
            <p className="text-sm text-slate-400">Manage all registered businesses</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-700">Filters</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="relative xl:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, phone, city, etc..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <input
            type="date"
            placeholder="Start Date"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-slate-500"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
          />
          <input
            type="date"
            placeholder="End Date"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-slate-500"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
          />
          <select
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            value={filters.niche}
            onChange={(e) => setFilters(prev => ({ ...prev, niche: e.target.value }))}
          >
            <option value="">All Niches</option>
            {niches.map((n, i) => <option key={i} value={n}>{n}</option>)}
          </select>
          <select
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            value={filters.city}
            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
          >
            <option value="">All Cities</option>
            {cities.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
          <select
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            value={filters.country}
            onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
          >
            <option value="">All Countries</option>
            {countries.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              value={filters.isWeb}
              onChange={(e) => setFilters(prev => ({ ...prev, isWeb: e.target.value }))}
            >
              <option value="">Website: All</option>
              <option value="true">Has Website</option>
              <option value="false">No Website</option>
            </select>
            <select
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              value={filters.isSend}
              onChange={(e) => setFilters(prev => ({ ...prev, isSend: e.target.value }))}
            >
              <option value="">Send: All</option>
              <option value="true">Sent</option>
              <option value="false">Not Sent</option>
            </select>
          </div>
        </div>
      </div>

      <Table 
        columns={columns} 
        data={businesses} 
        isLoading={isLoading} 
        pagination={
          businesses.length > 0 ? (
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

export default Businesses;
