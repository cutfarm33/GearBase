
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Receipt, ExpenseCategory, PaymentMethod } from '../types';
import { Receipt as ReceiptIcon, Plus, Trash2, Download, FileText, Filter, List, Grid, DollarSign } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const EXPENSE_CATEGORIES = Object.values(ExpenseCategory);

const ReceiptsScreen: React.FC = () => {
  const { state, navigateTo, deleteReceipt, findUser, findJob } = useAppContext();
  const [receiptToDelete, setReceiptToDelete] = useState<Receipt | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [jobFilter, setJobFilter] = useState<number | 'All'>('All');
  const [userFilter, setUserFilter] = useState<string | 'All'>('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Check if current user can add receipts for others
  const canAddForOthers = ['Admin', 'Producer'].includes(state.currentUser?.role || '');

  // Filter receipts
  const filteredReceipts = state.receipts.filter(r => {
    // Search filter
    if (searchFilter) {
      const search = searchFilter.toLowerCase();
      const matchesSearch =
        r.description.toLowerCase().includes(search) ||
        (r.vendor_name?.toLowerCase().includes(search)) ||
        r.category.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }
    // Category filter
    if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;
    // Job filter
    if (jobFilter !== 'All' && r.job_id !== jobFilter) return false;
    // User filter
    if (userFilter !== 'All' && r.user_id !== userFilter) return false;
    return true;
  });

  // Calculate totals
  const totalAmount = filteredReceipts.reduce((sum, r) => sum + r.amount, 0);

  // Group receipts by category for summary
  const categoryTotals = filteredReceipts.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + r.amount;
    return acc;
  }, {} as Record<string, number>);

  const confirmDelete = (e: React.MouseEvent, receipt: Receipt) => {
    e.stopPropagation();
    setReceiptToDelete(receipt);
  };

  const handleDelete = async () => {
    if (receiptToDelete) {
      await deleteReceipt(receiptToDelete.id);
      setReceiptToDelete(null);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Vendor', 'Payment Method', 'Job', 'Crew Member', 'Notes'];
    const rows = filteredReceipts.map(r => {
      const user = findUser(r.user_id);
      const job = r.job_id ? findJob(r.job_id) : null;
      return [
        r.expense_date,
        `"${r.description.replace(/"/g, '""')}"`,
        r.amount.toFixed(2),
        r.category,
        r.vendor_name || '',
        r.payment_method,
        job?.name || 'No Job',
        user?.name || 'Unknown',
        r.notes ? `"${r.notes.replace(/"/g, '""')}"` : ''
      ];
    });

    rows.push(['', '', '', '', '', '', '', 'TOTAL:', totalAmount.toFixed(2)]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    doc.setFontSize(20);
    doc.text('Expense Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${date}`, 14, 28);
    doc.text(`Total: $${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 14, 35);
    doc.text(`${filteredReceipts.length} receipts`, 14, 42);

    autoTable(doc, {
      startY: 50,
      head: [['Date', 'Description', 'Category', 'Vendor', 'Amount']],
      body: filteredReceipts.map(r => [
        r.expense_date,
        r.description,
        r.category,
        r.vendor_name || '-',
        `$${r.amount.toFixed(2)}`
      ]),
      foot: [['', '', '', 'Total:', `$${totalAmount.toFixed(2)}`]],
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] }
    });

    doc.save(`expense_report_${new Date().toISOString().split('T')[0]}.pdf`);
    setShowExportMenu(false);
  };

  // Get unique jobs and users for filters
  const jobsWithReceipts = Array.from(new Set(state.receipts.map(r => r.job_id).filter(Boolean))) as number[];
  const usersWithReceipts = Array.from(new Set(state.receipts.map(r => r.user_id)));

  const ReceiptCard: React.FC<{ receipt: Receipt }> = ({ receipt }) => {
    const user = findUser(receipt.user_id);
    const job = receipt.job_id ? findJob(receipt.job_id) : null;

    return (
      <div
        onClick={() => navigateTo('ADD_RECEIPT', { receiptId: receipt.id })}
        className="bg-white dark:bg-slate-800 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-700 group hover:-translate-y-1"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {receipt.receipt_image_url ? (
              <img src={receipt.receipt_image_url} alt="Receipt" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="text-slate-400" size={20} />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {receipt.description}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                {receipt.vendor_name || receipt.category}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              ${receipt.amount.toFixed(2)}
            </span>
            <button
              onClick={(e) => confirmDelete(e, receipt)}
              className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
              title="Delete Receipt"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">{receipt.category}</span>
            {job && <span className="truncate max-w-[100px]">{job.name}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span>{user?.name || 'Unknown'}</span>
            <span>{new Date(receipt.expense_date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  };

  const ReceiptRow: React.FC<{ receipt: Receipt }> = ({ receipt }) => {
    const user = findUser(receipt.user_id);
    const job = receipt.job_id ? findJob(receipt.job_id) : null;

    return (
      <tr
        onClick={() => navigateTo('ADD_RECEIPT', { receiptId: receipt.id })}
        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer group transition-colors"
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            {receipt.receipt_image_url ? (
              <img src={receipt.receipt_image_url} alt="Receipt" className="w-10 h-10 object-cover rounded" />
            ) : (
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                <FileText className="text-slate-400" size={16} />
              </div>
            )}
            <div>
              <p className="font-medium text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {receipt.description}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{receipt.vendor_name || '-'}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{new Date(receipt.expense_date).toLocaleDateString()}</td>
        <td className="px-4 py-3">
          <span className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">
            {receipt.category}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{job?.name || '-'}</td>
        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{user?.name || 'Unknown'}</td>
        <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">${receipt.amount.toFixed(2)}</td>
        <td className="px-4 py-3 text-right">
          <button
            onClick={(e) => confirmDelete(e, receipt)}
            className="text-slate-400 hover:text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={16} />
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div>
      <ConfirmModal
        isOpen={!!receiptToDelete}
        title="Delete Receipt"
        message={`Are you sure you want to delete "${receiptToDelete?.description}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setReceiptToDelete(null)}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">Receipts</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {filteredReceipts.length} receipts totaling <span className="font-bold text-emerald-600 dark:text-emerald-400">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Export Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-semibold rounded-xl transition-colors"
            >
              <Download size={18} /> Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-10">
                <button onClick={exportToCSV} className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white">
                  Export as CSV
                </button>
                <button onClick={exportToPDF} className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white">
                  Export as PDF
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigateTo('ADD_RECEIPT')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 flex items-center gap-2"
          >
            <Plus size={20} /> Add Receipt
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          {Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([category, total]) => (
              <div key={category} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{category}</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">${total.toFixed(0)}</p>
              </div>
            ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search receipts..."
          className="flex-1 min-w-[200px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
        />

        <select
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          {EXPENSE_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={jobFilter === 'All' ? 'All' : jobFilter}
          onChange={(e) => setJobFilter(e.target.value === 'All' ? 'All' : parseInt(e.target.value))}
        >
          <option value="All">All Jobs</option>
          {jobsWithReceipts.map(jobId => {
            const job = findJob(jobId);
            return <option key={jobId} value={jobId}>{job?.name || `Job #${jobId}`}</option>;
          })}
        </select>

        <select
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
        >
          <option value="All">All Crew</option>
          {usersWithReceipts.map(userId => {
            const user = findUser(userId);
            return <option key={userId} value={userId}>{user?.name || 'Unknown'}</option>;
          })}
        </select>

        <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 ${viewMode === 'list' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 ${viewMode === 'grid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Grid size={18} />
          </button>
        </div>
      </div>

      {/* Receipt List */}
      {filteredReceipts.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReceipts.map(receipt => (
              <ReceiptCard key={receipt.id} receipt={receipt} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Job</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Crew</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Amount</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredReceipts.map(receipt => (
                  <ReceiptRow key={receipt.id} receipt={receipt} />
                ))}
              </tbody>
              <tfoot className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">Total:</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">${totalAmount.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
          <ReceiptIcon size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-3">
            {state.receipts.length === 0 ? 'No receipts yet' : 'No receipts match your filters'}
          </p>
          {state.receipts.length === 0 && (
            <button
              onClick={() => navigateTo('ADD_RECEIPT')}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              Add your first receipt
            </button>
          )}
        </div>
      )}

      {/* Click outside to close export menu */}
      {showExportMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setShowExportMenu(false)} />
      )}
    </div>
  );
};

export default ReceiptsScreen;
