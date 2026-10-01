import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Table } from '../components/Table';
import { Pagination } from '../components/Pagination';
import { Mail, Plus, Edit2, X, Filter, Search, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface BusinessRef {
  _id: string;
  name: string;
  email: string;
}

interface Campaign {
  _id: string;
  campaignId: string;
  campaignName?: string;
  emailSubject?: string;
  emailBody?: string;
  dateTime: string;
  sendingDateTime: string;
  businessRef: BusinessRef[];
  message: string;
}

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [paginationData, setPaginationData] = useState({ total: 0, totalPages: 1 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentCampaign, setCurrentCampaign] = useState<Partial<any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewCampaignData, setViewCampaignData] = useState<any>(null);
  const [isViewLoading, setIsViewLoading] = useState(false);

  // Business Picker State
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [bPage, setBPage] = useState(1);
  const [bLimit, setBLimit] = useState(10);
  const [bPagination, setBPagination] = useState({ total: 0, totalPages: 1 });
  const [bData, setBData] = useState<any[]>([]);
  const [bLoading, setBLoading] = useState(false);
  
  const [niches, setNiches] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);

  const [bFilters, setBFilters] = useState({
    search: '', startDate: '', endDate: '', niche: '', city: '', country: '', isWeb: '', isSend: ''
  });
  const [debouncedBFilters, setDebouncedBFilters] = useState(bFilters);

  // Main Campaigns Fetch
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

  useEffect(() => {
    fetchCampaigns();
  }, [page, limit]);

  // Business Picker Effects
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBFilters(bFilters);
      setBPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [bFilters]);

  useEffect(() => {
    if (!isBusinessModalOpen) return;
    if (niches.length > 0) return; // already fetched
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
  }, [isBusinessModalOpen, niches.length]);

  useEffect(() => {
    if (!isBusinessModalOpen) return;
    const fetchBData = async () => {
      setBLoading(true);
      try {
        const activeFilters = Object.fromEntries(
          Object.entries(debouncedBFilters).filter(([_, v]) => v !== '')
        );
        const response = await axiosClient.get('/businesses', { 
          params: { page: bPage, limit: bLimit, ...activeFilters } 
        });
        setBData(response.data.data || []);
        if (response.data.pagination) setBPagination(response.data.pagination);
      } catch (error) {
        console.error('Error fetching businesses:', error);
      } finally {
        setBLoading(false);
      }
    };
    fetchBData();
  }, [bPage, bLimit, debouncedBFilters, isBusinessModalOpen]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const openViewModal = async (campaign: Campaign) => {
    setIsViewModalOpen(true);
    setIsViewLoading(true);
    setViewCampaignData(null);
    try {
      // The API endpoint specified by the user
      const response = await axiosClient.get(`/campaigns/${campaign._id}`);
      setViewCampaignData(response.data.data || response.data);
    } catch (error: any) {
      console.error('Error fetching campaign details:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load campaign details.';
      toast.error(errorMessage);
    } finally {
      setIsViewLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentCampaign({
      campaignId: `CAMP-${Math.floor(1000 + Math.random() * 9000)}`,
      campaignName: '',
      emailSubject: '',
      emailBody: '',
      dateTime: '',
      sendingDateTime: '',
      businessRef: [],
      message: '',
      _businessNames: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (campaign: Campaign) => {
    setModalMode('edit');
    const safeRefs = Array.isArray(campaign.businessRef) ? campaign.businessRef : (campaign.businessRef ? [campaign.businessRef] : []);
    setCurrentCampaign({
      ...campaign,
      dateTime: campaign.dateTime ? new Date(campaign.dateTime).toISOString().slice(0, 16) : '',
      sendingDateTime: campaign.sendingDateTime ? new Date(campaign.sendingDateTime).toISOString().slice(0, 16) : '',
      businessRef: safeRefs.map((b: any) => typeof b === 'string' ? b : b._id).filter(Boolean),
      _businessNames: safeRefs.map((b: any) => typeof b === 'string' ? '' : b.name).filter(Boolean)
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentCampaign((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleBusiness = (id: string, name: string) => {
    setCurrentCampaign((prev: any) => {
      const currentRefs = Array.isArray(prev.businessRef) ? [...prev.businessRef] : (prev.businessRef ? [prev.businessRef] : []);
      const currentNames = Array.isArray(prev._businessNames) ? [...prev._businessNames] : (prev._businessNames ? [prev._businessNames] : []);
      
      if (currentRefs.includes(id)) {
        return {
          ...prev,
          businessRef: currentRefs.filter((r: string) => r !== id),
          _businessNames: currentNames.filter((n: string) => n !== name)
        };
      } else {
        return {
          ...prev,
          businessRef: [...currentRefs, id],
          _businessNames: [...currentNames, name]
        };
      }
    });
  };

  const handleSelectAll = async (checked: boolean) => {
    setBLoading(true);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(debouncedBFilters).filter(([_, v]) => v !== '')
      );
      const response = await axiosClient.get('/businesses', {
        params: { limit: 100000, ...activeFilters }
      });
      const allFiltered = response.data.data || [];
      
      setCurrentCampaign((prev: any) => {
        let newRefs = Array.isArray(prev.businessRef) ? [...prev.businessRef] : (prev.businessRef ? [prev.businessRef] : []);
        let newNames = Array.isArray(prev._businessNames) ? [...prev._businessNames] : (prev._businessNames ? [prev._businessNames] : []);

        if (checked) {
          allFiltered.forEach((item: any) => {
            if (!newRefs.includes(item._id)) {
              newRefs.push(item._id);
              newNames.push(item.name);
            }
          });
        } else {
          const filteredIds = new Set(allFiltered.map((b: any) => b._id));
          const finalRefs: string[] = [];
          const finalNames: string[] = [];
          
          for (let i = 0; i < newRefs.length; i++) {
            if (!filteredIds.has(newRefs[i])) {
              finalRefs.push(newRefs[i]);
              finalNames.push(newNames[i]);
            }
          }
          newRefs = finalRefs;
          newNames = finalNames;
        }

        return {
          ...prev,
          businessRef: newRefs,
          _businessNames: newNames
        };
      });
    } catch (error: any) {
      console.error("Error bulk selecting businesses:", error);
      const errorMessage = error.response?.data?.message || 'Failed to bulk select businesses. Please try again.';
      toast.error(errorMessage);
    } finally {
      setBLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await axiosClient.delete(`/campaigns/${id}`);
      fetchCampaigns();
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete campaign.';
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = {};
      
      if (currentCampaign.campaignId !== undefined) payload.campaignId = currentCampaign.campaignId;
      if (currentCampaign.campaignName !== undefined) payload.campaignName = currentCampaign.campaignName;
      if (currentCampaign.emailSubject !== undefined) payload.emailSubject = currentCampaign.emailSubject;
      if (currentCampaign.emailBody !== undefined) payload.emailBody = currentCampaign.emailBody;
      if (currentCampaign.message !== undefined) payload.message = currentCampaign.message;
      
      // Ensure businessRef is strictly a flat array of string IDs to prevent CastError
      if (currentCampaign.businessRef !== undefined) {
        const refs = Array.isArray(currentCampaign.businessRef) ? currentCampaign.businessRef : [currentCampaign.businessRef];
        payload.businessRef = refs.filter(id => typeof id === 'string' && id.length > 5);
      }

      if (currentCampaign.dateTime) payload.dateTime = new Date(currentCampaign.dateTime).toISOString();
      if (currentCampaign.sendingDateTime) payload.sendingDateTime = new Date(currentCampaign.sendingDateTime).toISOString();

      if (modalMode === 'create') {
        await axiosClient.post('/campaigns', payload);
      } else {
        await axiosClient.put(`/campaigns/${currentCampaign._id}`, payload);
      }
      setIsModalOpen(false);
      fetchCampaigns();
    } catch (error: any) {
      console.error('Error saving campaign:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save campaign.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { header: 'Campaign ID', accessorKey: 'campaignId' as keyof Campaign },
    { header: 'Campaign Name', accessorKey: 'campaignName' as keyof Campaign },
    {
      header: 'Message',
      cell: (item: Campaign) => {
        const msg = item.message || '';
        return (
          <span className="text-slate-600" title={msg}>
            {msg.length > 30 ? msg.substring(0, 30) + '...' : msg || 'N/A'}
          </span>
        );
      },
    },
    {
      header: 'Businesses',
      cell: (item: Campaign) => {
        const count = Array.isArray(item.businessRef) ? item.businessRef.length : 0;
        return <span className="font-medium text-slate-700">{count} selected</span>;
      },
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
    {
      header: 'Actions',
      cell: (item: Campaign) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openViewModal(item)}
            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(item)}
            className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(item._id)}
            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const bColumns = [
    {
      header: 'Select',
      cell: (item: any) => (
        <input
          type="checkbox"
          checked={(currentCampaign.businessRef || []).includes(item._id)}
          onChange={() => handleToggleBusiness(item._id, item.name)}
          className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
        />
      ),
    },
    { header: 'Name', cell: (item: any) => item.name || '-' },
    { header: 'Email', cell: (item: any) => item.email || '-' },
    { header: 'Niche', cell: (item: any) => item.niche || '-' },
    { 
      header: 'Location', 
      cell: (item: any) => {
        const city = item.city || '-';
        const country = item.country || '-';
        return city === '-' && country === '-' ? '-' : `${city}, ${country}`;
      } 
    },
  ];

  return (
    <div className="animate-fade-in relative">
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
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
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

      {/* Campaign Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800">
                {modalMode === 'create' ? 'Create Campaign' : 'Edit Campaign'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Campaign ID</label>
                  <input
                    type="text"
                    name="campaignId"
                    required
                    readOnly
                    value={currentCampaign.campaignId || ''}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Name</label>
                  <input
                    type="text"
                    name="campaignName"
                    value={currentCampaign.campaignName || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter campaign name"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Businesses</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsBusinessModalOpen(true)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      {currentCampaign.businessRef && currentCampaign.businessRef.length > 0 ? 'Change Businesses' : 'Select Businesses'}
                    </button>
                    {currentCampaign._businessNames && currentCampaign._businessNames.length > 0 && (
                      <span className="text-sm font-medium text-slate-700">
                        Selected: <span className="text-emerald-600">{currentCampaign._businessNames.length} businesses</span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    name="dateTime"
                    value={currentCampaign.dateTime || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sending Date & Time</label>
                  <input
                    type="datetime-local"
                    name="sendingDateTime"
                    value={currentCampaign.sendingDateTime || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Subject</label>
                  <input
                    type="text"
                    name="emailSubject"
                    value={currentCampaign.emailSubject || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter email subject"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Body</label>
                  <textarea
                    name="emailBody"
                    rows={4}
                    value={currentCampaign.emailBody || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter email body (HTML or plain text)"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                  <textarea
                    name="message"
                    rows={4}
                    value={currentCampaign.message || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Campaign Modal */}
      {isViewModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800">Campaign Details</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {isViewLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : viewCampaignData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-500">Campaign ID</h3>
                      <p className="text-base text-slate-800 font-medium">{viewCampaignData.campaignId || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-500">Campaign Name</h3>
                      <p className="text-base text-slate-800 font-medium">{viewCampaignData.campaignName || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-500">Created Date</h3>
                      <p className="text-base text-slate-800">
                        {viewCampaignData.dateTime ? new Date(viewCampaignData.dateTime).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-500">Scheduled Send Date</h3>
                      <p className="text-base text-slate-800">
                        {viewCampaignData.sendingDateTime ? new Date(viewCampaignData.sendingDateTime).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Email Subject</h3>
                    <div className="mt-1 p-3 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-wrap border border-slate-200">
                      {viewCampaignData.emailSubject || 'No subject provided.'}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Email Body</h3>
                    <div className="mt-1 p-4 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-wrap border border-slate-200">
                      {viewCampaignData.emailBody || 'No email body provided.'}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Message (SMS)</h3>
                    <div className="mt-1 p-4 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-wrap border border-slate-200">
                      {viewCampaignData.message || 'No message provided.'}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-2">
                      Targeted Businesses ({viewCampaignData.businessRef ? viewCampaignData.businessRef.length : 0})
                    </h3>
                    {viewCampaignData.businessRef && viewCampaignData.businessRef.length > 0 ? (
                      <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                        {viewCampaignData.businessRef.map((b: any, index: number) => (
                          <div key={b._id || index} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-slate-800">{b.name || 'Unknown Business'}</p>
                              {b.email && <p className="text-xs text-slate-500">{b.email}</p>}
                            </div>
                            {(b.city || b.country) && (
                              <div className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                                {b.city}{b.city && b.country ? ', ' : ''}{b.country}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No businesses targeted.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-center text-slate-500">Failed to load campaign data.</p>
              )}
            </div>
            <div className="flex justify-end p-6 border-t border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Business Picker Modal */}
      {isBusinessModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 shrink-0">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">Select Businesses</h2>
                <p className="text-sm text-slate-500">Check the boxes next to the businesses you want to assign to this bulk campaign.</p>
              </div>
              <button onClick={() => setIsBusinessModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
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
                      placeholder="Search by name, email, phone, city..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      value={bFilters.search}
                      onChange={(e) => setBFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                  </div>
                  <input
                    type="date"
                    placeholder="Start Date"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={bFilters.startDate}
                    onChange={(e) => setBFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                  <input
                    type="date"
                    placeholder="End Date"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={bFilters.endDate}
                    onChange={(e) => setBFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={bFilters.niche}
                    onChange={(e) => setBFilters(prev => ({ ...prev, niche: e.target.value }))}
                  >
                    <option value="">All Niches</option>
                    {niches.map((n, i) => <option key={i} value={n}>{n}</option>)}
                  </select>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={bFilters.city}
                    onChange={(e) => setBFilters(prev => ({ ...prev, city: e.target.value }))}
                  >
                    <option value="">All Cities</option>
                    {cities.map((c, i) => <option key={i} value={c}>{c}</option>)}
                  </select>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={bFilters.country}
                    onChange={(e) => setBFilters(prev => ({ ...prev, country: e.target.value }))}
                  >
                    <option value="">All Countries</option>
                    {countries.map((c, i) => <option key={i} value={c}>{c}</option>)}
                  </select>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={bFilters.isWeb}
                    onChange={(e) => setBFilters(prev => ({ ...prev, isWeb: e.target.value }))}
                  >
                    <option value="">Website: All</option>
                    <option value="true">Has Website</option>
                    <option value="false">No Website</option>
                  </select>
                </div>
              </div>

              <div className="mb-4 flex items-center px-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={bData.length > 0 && bData.every(item => (currentCampaign.businessRef || []).includes(item._id))}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  Select All filtered businesses
                </label>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <Table 
                  columns={bColumns} 
                  data={bData} 
                  isLoading={bLoading} 
                  pagination={
                    bData.length > 0 ? (
                      <Pagination
                        currentPage={bPage}
                        totalPages={bPagination.totalPages}
                        totalItems={bPagination.total}
                        limit={bLimit}
                        onPageChange={setBPage}
                        onLimitChange={(newLimit) => { setBLimit(newLimit); setBPage(1); }}
                      />
                    ) : undefined
                  }
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-slate-200 shrink-0 bg-white">
              <button
                type="button"
                onClick={() => setIsBusinessModalOpen(false)}
                className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Confirm Selection ({currentCampaign.businessRef?.length || 0})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
