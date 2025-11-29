
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Job, JobStatus } from '../types';
import { Trash2, Briefcase, Zap, Plus, CheckSquare } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const JobStatusBadge: React.FC<{ status: JobStatus }> = ({ status }) => {
  const colorClasses = {
    [JobStatus.UPCOMING]: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 border-2',
    [JobStatus.IN_PROGRESS]: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 border-2',
    [JobStatus.WRAPPED]: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 border-2',
    [JobStatus.CANCELED]: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 border-2',
  };
  return <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${colorClasses[status]}`}>{status}</span>;
};

const JobListScreen: React.FC = () => {
  const { state, navigateTo, deleteJob } = useAppContext();
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  // Separate jobs into regular jobs and quick use
  const regularJobs = state.jobs.filter(job => !job.name.startsWith('Quick Use:'));
  const activeQuickUseJobs = state.jobs.filter(job => job.name.startsWith('Quick Use:') && job.status !== JobStatus.WRAPPED);
  const completedQuickUseJobs = state.jobs.filter(job => job.name.startsWith('Quick Use:') && job.status === JobStatus.WRAPPED);

  const confirmDelete = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    setJobToDelete(job);
  };

  const handleDelete = async () => {
    if (jobToDelete) {
      await deleteJob(jobToDelete.id);
      setJobToDelete(null);
    }
  };

  const JobCard: React.FC<{ job: Job; isQuickUse?: boolean }> = ({ job, isQuickUse = false }) => {
    const producer = state.users.find(u => u.id === job.producerId);
    return (
      <div
        onClick={() => navigateTo('JOB_DETAIL', { jobId: job.id })}
        className="bg-white dark:bg-slate-800 rounded-3xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-700 group hover:-translate-y-1"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {isQuickUse && <Zap size={16} className="text-amber-500 flex-shrink-0" />}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {isQuickUse ? job.name.replace('Quick Use: ', '') : job.name}
              </h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Producer: {producer?.name || 'Unknown'}</p>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <JobStatusBadge status={job.status} />
            <button
              onClick={(e) => confirmDelete(e, job)}
              className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
              title="Delete Job"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="text-slate-500 dark:text-slate-400">
            <span className="font-medium">{new Date(job.startDate).toLocaleDateString()}</span>
            <span className="mx-2">→</span>
            <span className="font-medium">{new Date(job.endDate).toLocaleDateString()}</span>
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            {job.gearList.length} {job.gearList.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <ConfirmModal
        isOpen={!!jobToDelete}
        title="Delete Job"
        message={`Are you sure you want to delete "${jobToDelete?.name}"? This will permanently remove the job and its history.`}
        confirmText="Delete Job"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setJobToDelete(null)}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">Jobs</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {regularJobs.length} production jobs, {activeQuickUseJobs.length} active quick use
          </p>
        </div>
        <button
          onClick={() => navigateTo('ADD_JOB')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 flex items-center gap-2"
        >
          <Plus size={20} /> New Job
        </button>
      </div>

      {/* Regular Jobs Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Briefcase size={24} className="text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Production Jobs</h3>
          <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-semibold">
            {regularJobs.length}
          </span>
        </div>

        {regularJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
            <Briefcase size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-3">No production jobs yet</p>
            <button
              onClick={() => navigateTo('ADD_JOB')}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              Create your first job
            </button>
          </div>
        )}
      </section>

      {/* Active Quick Use Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Zap size={24} className="text-amber-600 dark:text-amber-400" />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Active Quick Use</h3>
          <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-semibold">
            {activeQuickUseJobs.length}
          </span>
        </div>

        {activeQuickUseJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeQuickUseJobs.map((job) => (
              <JobCard key={job.id} job={job} isQuickUse />
            ))}
          </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-900/10 rounded-3xl p-10 text-center border-2 border-dashed border-amber-200 dark:border-amber-800">
            <Zap size={48} className="text-amber-300 dark:text-amber-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-2">No quick use items currently out</p>
            <p className="text-sm text-slate-500 dark:text-slate-500">Quick use items are automatically created when you check out equipment without assigning it to a job</p>
          </div>
        )}
      </section>

      {/* Completed Quick Use Section - Only show if there are any */}
      {completedQuickUseJobs.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <CheckSquare size={24} className="text-slate-500 dark:text-slate-400" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Completed Quick Use</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-semibold">
              {completedQuickUseJobs.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedQuickUseJobs.map((job) => (
              <JobCard key={job.id} job={job} isQuickUse />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default JobListScreen;
