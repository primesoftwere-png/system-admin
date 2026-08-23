import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Users, Briefcase, Mail, Activity, TrendingUp, ArrowUpRight, Calendar } from 'lucide-react';
import Loader from '../components/Loader';

const Dashboard = () => {
  const [stats, setStats] = useState({
    businesses: 0,
    campaigns: 0,
    inquiries: 0,
    health: 'Unknown',
  });
  const [isLoading, setIsLoading] = useState(true);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, string> = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await axiosClient.get('/dashboard', { params });
        const { counts, systemStatus } = response.data.data;

        setStats({
          businesses: counts?.businesses || 0,
          campaigns: counts?.campaigns || 0,
          inquiries: counts?.inquiries || 0,
          health: systemStatus?.status || 'Unknown',
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [startDate, endDate]);

  const statCards = [
    {
      name: 'Total Businesses',
      value: stats.businesses,
      icon: Briefcase,
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
    {
      name: 'Total Campaigns',
      value: stats.campaigns,
      icon: Mail,
      gradient: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-500/20',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
    },
    {
      name: 'Total Inquiries',
      value: stats.inquiries,
      icon: Users,
      gradient: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/20',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
    },
    {
      name: 'System Status',
      value: stats.health,
      icon: Activity,
      gradient: (stats.health === 'Healthy' || stats.health === 'UP') ? 'from-emerald-500 to-teal-500' : 'from-rose-500 to-red-500',
      shadow: (stats.health === 'Healthy' || stats.health === 'UP') ? 'shadow-emerald-500/20' : 'shadow-rose-500/20',
      bg: (stats.health === 'Healthy' || stats.health === 'UP') ? 'bg-emerald-50' : 'bg-rose-50',
      text: (stats.health === 'Healthy' || stats.health === 'UP') ? 'text-emerald-600' : 'text-rose-600',
    },
  ];

  if (isLoading && stats.health === 'Unknown') {
    return <Loader text="Loading dashboard data..." />;
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Welcome back! Here's what's happening.</p>
        </div>

        {/* Date Filters */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
          <div className="flex items-center px-2">
            <Calendar className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm text-slate-600 border-none focus:ring-0 p-1 bg-transparent outline-none cursor-pointer"
              aria-label="Start Date"
            />
          </div>
          <div className="h-4 w-px bg-slate-200 mx-1"></div>
          <div className="flex items-center px-2">
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm text-slate-600 border-none focus:ring-0 p-1 bg-transparent outline-none cursor-pointer"
              aria-label="End Date"
            />
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`card-premium p-6 animate-slide-up stagger-${idx + 1}`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.shadow}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                  <ArrowUpRight className={`w-3.5 h-3.5 ${stat.text}`} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-400 font-medium">{stat.name}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1 tracking-tight">
                  {isLoading ? '...' : stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optional: Quick Info Panel */}
      <div className="mt-8 card-premium p-6 animate-slide-up stagger-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-700 text-sm">Quick Summary</h3>
            <p className="text-xs text-slate-400">Overview of your data</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 font-medium">Businesses</p>
            <p className="text-lg font-bold text-slate-700 mt-0.5">{isLoading ? '...' : stats.businesses}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 font-medium">Active Campaigns</p>
            <p className="text-lg font-bold text-slate-700 mt-0.5">{isLoading ? '...' : stats.campaigns}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 font-medium">Pending Inquiries</p>
            <p className="text-lg font-bold text-slate-700 mt-0.5">{isLoading ? '...' : stats.inquiries}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
