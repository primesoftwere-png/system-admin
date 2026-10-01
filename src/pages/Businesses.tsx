import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Table } from '../components/Table';
import { Pagination } from '../components/Pagination';
import { Briefcase, Filter, Search, Upload, X, Download, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Business {
  _id: string;
  name: string;
  email: string;
  niche: string;
  city: string;
  country: string;
  phoneNumber: string;
  isWeb: boolean;
  rating?: number;
  reviewCount?: number;
  googleMapsUrl?: string;
}

const Businesses = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
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
    isSend: '',
    rating: ''
  });
  
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importNiche, setImportNiche] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const initialAddBusinessData = {
    name: '', niche: '', address: '', city: '', state: '', country: '',
    email: '', phoneNumber: '', webUrl: '', isWeb: false, googleMapsUrl: '',
    rating: 0, reviewCount: 0
  };
  const [addBusinessData, setAddBusinessData] = useState(initialAddBusinessData);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile || !importNiche) return;
    
    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('niche', importNiche);
      
      await axiosClient.post('/businesses/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setIsImportModalOpen(false);
      setImportFile(null);
      setImportNiche('');
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error('Error importing businesses:', error);
      const errorMessage = error.response?.data?.message || 'Failed to import businesses. Please check the console for details.';
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  const handleAddBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await axiosClient.post('/businesses', addBusinessData);
      setIsAddModalOpen(false);
      setAddBusinessData(initialAddBusinessData);
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error('Error adding business:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add business. Please check the console for details.';
      toast.error(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

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
  }, [refreshTrigger]);

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
  }, [page, limit, debouncedFilters, refreshTrigger]);

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
      header: 'Rating (Reviews)',
      cell: (item: Business) => (
        <div className="flex items-center gap-1 text-sm">
          <span className="font-medium text-slate-700">{item.rating || 0}</span>
          <span className="text-slate-400">({item.reviewCount || 0})</span>
        </div>
      )
    },
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
    {
      header: 'Google Link',
      cell: (item: Business) => (
        item.googleMapsUrl ? (
          <a href={item.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">
            View on Maps
          </a>
        ) : '-'
      )
    }
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
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2 flex-1 sm:flex-none justify-center"
          >
            <Plus className="w-4 h-4" />
            Manually Add
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 flex-1 sm:flex-none justify-center"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
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
          <div className="grid grid-cols-3 gap-2">
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
            <select
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              value={filters.rating}
              onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
            >
              <option value="">Rating: All</option>
              <option value="high">High</option>
              <option value="low">Low</option>
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

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Import Businesses</h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleImport} className="p-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Excel File
                  </label>
                  <a
                    href="http://localhost:3000/api/businesses/import/template"
                    download="template.xlsx"
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Download Template
                  </a>
                </div>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Niche Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Plumbers"
                  value={importNiche}
                  onChange={(e) => setImportNiche(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImporting || !importFile || !importNiche}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isImporting ? 'Importing...' : 'Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Business Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-auto animate-fade-in-up">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Add Business</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddBusiness} className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                  <input type="text" value={addBusinessData.name} onChange={e => setAddBusinessData({...addBusinessData, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Niche</label>
                  <input type="text" value={addBusinessData.niche} onChange={e => setAddBusinessData({...addBusinessData, niche: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <input type="text" value={addBusinessData.address} onChange={e => setAddBusinessData({...addBusinessData, address: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input type="text" value={addBusinessData.city} onChange={e => setAddBusinessData({...addBusinessData, city: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input type="text" value={addBusinessData.state} onChange={e => setAddBusinessData({...addBusinessData, state: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                  <input type="text" value={addBusinessData.country} onChange={e => setAddBusinessData({...addBusinessData, country: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" value={addBusinessData.email} onChange={e => setAddBusinessData({...addBusinessData, email: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input type="text" value={addBusinessData.phoneNumber} onChange={e => setAddBusinessData({...addBusinessData, phoneNumber: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Website URL</label>
                  <input type="url" value={addBusinessData.webUrl} onChange={e => setAddBusinessData({...addBusinessData, webUrl: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Google Maps URL</label>
                  <input type="url" value={addBusinessData.googleMapsUrl} onChange={e => setAddBusinessData({...addBusinessData, googleMapsUrl: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
                  <input type="number" step="0.1" value={addBusinessData.rating} onChange={e => setAddBusinessData({...addBusinessData, rating: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Review Count</label>
                  <input type="number" value={addBusinessData.reviewCount} onChange={e => setAddBusinessData({...addBusinessData, reviewCount: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div className="flex items-center sm:mt-7">
                  <input type="checkbox" id="isWeb" checked={addBusinessData.isWeb} onChange={e => setAddBusinessData({...addBusinessData, isWeb: e.target.checked})} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                  <label htmlFor="isWeb" className="ml-2 text-sm font-medium text-slate-700">Has Website?</label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isAdding} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isAdding ? 'Adding...' : 'Add Business'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Businesses;
