import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ItemStatus, JobStatus, ItemCondition, Job } from '../types';
import { Briefcase, Camera, CheckCircle, AlertTriangle, Calendar, ChevronRight, Plus, TrendingUp, Activity, Download, Check, Database } from 'lucide-react';

const DashboardScreen: React.FC = () => {
  const { state, navigateTo, loadDemoData } = useAppContext();
  const [exportCopied, setExportCopied] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const exportData = () => {
    const exportPayload = {
      inventory: state.inventory.map(item => ({
        name: item.name,
        category: item.category,
        status: item.status,
        condition: item.condition,
        value: item.value,
        weight: item.weight,
        storageCase: item.storageCase,
        notes: item.notes,
        qrCode: item.qrCode
      })),
      jobs: state.jobs.map(job => ({
        name: job.name,
        status: job.status,
        startDate: job.startDate,
        endDate: job.endDate,
        gearListCount: job.gearList.length
      })),
      kits: state.kits.map(kit => ({
        name: kit.name,
        itemCount: kit.itemIds.length
      }))
    };
    navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
    setExportCopied(true);
    setTimeout(() => setExportCopied(false), 3000);
  };

  const handleLoadDemoData = async () => {
    setLoadingDemo(true);
    await loadDemoData();
    setLoadingDemo(false);
  };

  // Stats Calculation
  const upcomingJobs = state.jobs.filter(j => j.status === JobStatus.UPCOMING);
  const activeJobs = state.jobs.filter(j => j.status === JobStatus.IN_PROGRESS);
  const gearOut = state.inventory.filter(i => i.status === ItemStatus.CHECKED_OUT).length;
  const gearDamaged = state.inventory.filter(i => i.status === ItemStatus.IN_MAINTENANCE || i.condition === ItemCondition.DAMAGED || i.condition === ItemCondition.LOST);

  // Helper Components
  const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; colorClass: string; onClick?: () => void }> = ({ title, value, icon, colorClass, onClick }) => (
    <div onClick={onClick} className={`bg-white dark:bg-slate-800 rounded-3xl p-6 flex items-center shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${onClick ? 'cursor-pointer' : ''}`}>
        <div className={`rounded-2xl p-4 ${colorClass} text-white shadow-lg`}>
            {icon}
        </div>
        <div className="ml-5">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
  );

  const JobRow: React.FC<{ job: Job }> = ({ job }) => {
      const producer = state.users.find(u => u.id === job.producerId);
      const checkedOutCount = state.inventory.filter(i => i.status === ItemStatus.CHECKED_OUT && i.history[0]?.jobId === job.id).length;
      const totalItems = job.gearList.length;
      const isStarted = job.status === JobStatus.IN_PROGRESS;

      return (
          <div
            onClick={() => navigateTo('JOB_DETAIL', { jobId: job.id })}
            className="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 hover:border-emerald-200 dark:hover:border-emerald-700 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1"
          >
              <div className="flex justify-between items-start mb-3">
                  <div>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{job.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{producer?.name || 'Unknown Producer'}</p>
                  </div>
                  <span className={`px-4 py-1.5 text-xs font-bold rounded-full border ${isStarted ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700'}`}>
                      {isStarted ? 'Active' : 'Upcoming'}
                  </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <div className="flex items-center gap-1.5">
                      <Calendar size={16} />
                      <span>{new Date(job.startDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})} - {new Date(job.endDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                      <Camera size={16} />
                      <span className="font-medium">{checkedOutCount}/{totalItems} Items Out</span>
                  </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isStarted ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    style={{ width: `${totalItems > 0 ? (checkedOutCount / totalItems) * 100 : 0}%` }}
                  ></div>
              </div>
          </div>
      );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">Dashboard</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Overview for {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-3">
            {state.inventory.length === 0 && (
                <button
                    onClick={handleLoadDemoData}
                    disabled={loadingDemo}
                    className="font-bold py-3 px-5 rounded-xl transition-all flex items-center gap-2 bg-violet-500 hover:bg-violet-600 text-white disabled:bg-violet-400"
                    title="Load sample inventory data"
                >
                    <Database size={20} />
                    {loadingDemo ? 'Loading...' : 'Load Demo Data'}
                </button>
            )}
            <button
                onClick={exportData}
                className={`font-bold py-3 px-5 rounded-xl transition-all flex items-center gap-2 ${
                    exportCopied
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white'
                }`}
                title="Export data for demo"
            >
                {exportCopied ? <Check size={20} /> : <Download size={20} />}
                {exportCopied ? 'Copied!' : 'Export'}
            </button>
            <button
                onClick={() => navigateTo('ADD_JOB')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 flex items-center gap-2"
            >
                <Plus size={20} /> New Job
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN - OPERATIONAL LISTS (The "Items on the left") */}
          <div className="lg:col-span-2 space-y-8">
              
              {/* Active & Upcoming Jobs */}
              <section>
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Briefcase size={24} className="text-emerald-600 dark:text-emerald-400"/> Priority Jobs
                      </h3>
                      <button onClick={() => navigateTo('JOB_LIST')} className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">View All</button>
                  </div>

                  <div className="space-y-4">
                      {activeJobs.length > 0 ? (
                          activeJobs.map(job => <JobRow key={job.id} job={job} />)
                      ) : upcomingJobs.length > 0 ? (
                          upcomingJobs.slice(0, 3).map(job => <JobRow key={job.id} job={job} />)
                      ) : (
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                              <p className="text-slate-500 dark:text-slate-400 mb-3 text-lg">No active or upcoming jobs.</p>
                              <button onClick={() => navigateTo('ADD_JOB')} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Create a Job</button>
                          </div>
                      )}
                  </div>
              </section>

              {/* Maintenance / Alerts List */}
              <section>
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <AlertTriangle size={24} className="text-amber-600 dark:text-amber-400"/> Needs Attention
                      </h3>
                      <button onClick={() => navigateTo('INVENTORY')} className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">View Inventory</button>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
                      {gearDamaged.length > 0 ? (
                          <div className="divide-y divide-slate-100 dark:divide-slate-700">
                              {gearDamaged.slice(0, 5).map(item => (
                                  <div
                                    key={item.id}
                                    onClick={() => navigateTo('ITEM_DETAIL', { itemId: item.id })}
                                    className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer flex justify-between items-center group"
                                  >
                                      <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden shadow-sm">
                                              <img src={item.imageUrl} alt="" className="w-full h-full object-cover"/>
                                          </div>
                                          <div>
                                              <p className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{item.name}</p>
                                              <p className="text-sm text-amber-600 dark:text-amber-400 font-semibold">{item.condition}</p>
                                          </div>
                                      </div>
                                      <ChevronRight size={18} className="text-slate-400 group-hover:text-emerald-500 transition-colors"/>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="p-10 text-center">
                              <CheckCircle size={48} className="text-emerald-500 mx-auto mb-3" />
                              <p className="text-slate-900 dark:text-white font-bold text-lg">All gear is in good condition!</p>
                              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">No maintenance required</p>
                          </div>
                      )}
                  </div>
              </section>

          </div>

          {/* RIGHT COLUMN - STATS & SUMMARY */}
          <div className="space-y-8">
              
              {/* Quick Stats Grid */}
              <section>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <TrendingUp size={24} className="text-emerald-600 dark:text-emerald-400"/> Overview
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                      <StatCard
                        title="Active Jobs"
                        value={activeJobs.length}
                        icon={<Briefcase size={22}/>}
                        colorClass="bg-gradient-to-br from-emerald-600 to-teal-600"
                        onClick={() => navigateTo('JOB_LIST')}
                      />
                      <StatCard
                        title="Gear Out"
                        value={gearOut}
                        icon={<Camera size={22}/>}
                        colorClass="bg-gradient-to-br from-amber-500 to-orange-600"
                        onClick={() => navigateTo('INVENTORY')}
                      />
                      <StatCard
                        title="Upcoming"
                        value={upcomingJobs.length}
                        icon={<Calendar size={22}/>}
                        colorClass="bg-gradient-to-br from-blue-500 to-indigo-600"
                        onClick={() => navigateTo('JOB_LIST')}
                      />
                      <StatCard
                        title="Issues"
                        value={gearDamaged.length}
                        icon={<AlertTriangle size={22}/>}
                        colorClass="bg-gradient-to-br from-red-500 to-pink-600" 
                        onClick={() => navigateTo('INVENTORY')}
                      />
                  </div>
              </section>

              {/* Recent Activity Feed */}
              <section>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Activity size={20} className="text-violet-500"/> Recent Activity
                  </h3>
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm h-96 overflow-y-auto">
                      {state.transactions.length > 0 ? (
                          <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-6">
                              {state.transactions.slice(0, 8).map(tx => {
                                  const job = state.jobs.find(j => j.id === tx.jobId);
                                  const user = state.users.find(u => u.id === tx.userId);
                                  const isCheckout = tx.type === 'Check-out';
                                  return (
                                      <div key={tx.id} className="ml-6 relative">
                                          <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${isCheckout ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                              {isCheckout ? 'Checked Out' : 'Returned'}
                                          </p>
                                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                              {new Date(tx.timestamp).toLocaleDateString()} • {new Date(tx.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                          </p>
                                          <div className="text-xs bg-slate-50 dark:bg-slate-700/50 p-2 rounded border border-slate-100 dark:border-slate-700">
                                              <span className="font-medium text-slate-700 dark:text-slate-300">{user?.name || 'User'}</span>
                                              <span className="text-slate-400"> for </span>
                                              <span className="text-sky-600 dark:text-sky-400 truncate block">{job?.name || 'Unknown Job'}</span>
                                              <div className="mt-1 pt-1 border-t border-slate-200 dark:border-slate-600 text-slate-500">
                                                  {tx.items.length} items
                                              </div>
                                          </div>
                                      </div>
                                  )
                              })}
                          </div>
                      ) : (
                          <p className="text-center text-slate-400 text-sm mt-10">No recent activity.</p>
                      )}
                  </div>
              </section>

          </div>
      </div>
    </div>
  );
};

export default DashboardScreen;