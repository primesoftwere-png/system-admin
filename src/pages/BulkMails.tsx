import { useState, useEffect } from 'react';
import { getCampaigns, triggerEmailSending, checkEmailStatus } from '../api/campaignApi';
import type { Campaign } from '../api/campaignApi';

import toast from 'react-hot-toast';

const BulkMails = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await getCampaigns(1, 100);
      setCampaigns(res.data);
    } catch (error: any) {
      console.error('Failed to fetch campaigns', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch campaigns';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTrigger = async (campaignId: string) => {
    try {
      const res = await triggerEmailSending(campaignId);
      toast.success(res.message || 'Email sending triggered successfully');
      fetchCampaigns();
    } catch (error: any) {
      console.error('Failed to trigger email', error);
      const errorMessage = error.response?.data?.message || 'Error triggering emails';
      toast.error(errorMessage);
    }
  };

  const handleStatusCheck = async (campaignId: string) => {
    try {
      const res = await checkEmailStatus(campaignId);
      toast.success(`Status: ${res.data.emailStatus}, Sent: ${res.data.emailSentCount}/${res.data.emailTotalCount}`);
    } catch (error: any) {
      console.error('Failed to check status', error);
      const errorMessage = error.response?.data?.message || 'Error checking status';
      toast.error(errorMessage);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Bulk Mails</h2>
        <p className="text-sm text-slate-500 mt-1">Manage and send bulk email campaigns.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Campaign ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3 rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No campaigns found.
                </td>
              </tr>
            ) : (
              campaigns.map((camp) => (
                <tr key={camp._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-700">{camp.campaignId}</td>
                  <td className="px-4 py-3">{camp.campaignName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      camp.emailStatus === 'completed' ? 'bg-green-100 text-green-700' : 
                      camp.emailStatus === 'sending' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {camp.emailStatus || 'pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {camp.emailSentCount ?? 0} / {camp.emailTotalCount ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleTrigger(camp.campaignId)}
                        className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Send
                      </button>
                      <button 
                        onClick={() => handleStatusCheck(camp.campaignId)}
                        className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        Status
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BulkMails;
