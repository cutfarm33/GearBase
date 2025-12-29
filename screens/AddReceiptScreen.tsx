
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useVertical } from '../hooks/useVertical';
import { ExpenseCategory, PaymentMethod, Receipt } from '../types';
import { ArrowLeft, Save, Camera, Image as ImageIcon, X, Trash2, Car, Sparkles, Loader2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const EXPENSE_CATEGORIES = Object.values(ExpenseCategory);
const PAYMENT_METHODS = Object.values(PaymentMethod);

// 2024 IRS Standard Mileage Rate
const MILEAGE_RATE = 0.67;

// Map common receipt categories to our ExpenseCategory enum
const mapToExpenseCategory = (category: string): ExpenseCategory => {
  const lower = category.toLowerCase();
  if (lower.includes('meal') || lower.includes('food') || lower.includes('restaurant') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('breakfast')) {
    return ExpenseCategory.MEALS_TRAVEL;
  }
  if (lower.includes('craft') || lower.includes('snack') || lower.includes('beverage')) {
    return ExpenseCategory.CRAFTY;
  }
  if (lower.includes('hotel') || lower.includes('lodging') || lower.includes('motel') || lower.includes('airbnb')) {
    return ExpenseCategory.HOTEL;
  }
  if (lower.includes('gas') || lower.includes('fuel') || lower.includes('petrol')) {
    return ExpenseCategory.GAS;
  }
  if (lower.includes('parking')) {
    return ExpenseCategory.PARKING;
  }
  if (lower.includes('toll')) {
    return ExpenseCategory.TOLLS;
  }
  if (lower.includes('taxi') || lower.includes('uber') || lower.includes('lyft') || lower.includes('train') || lower.includes('bus') || lower.includes('transit')) {
    return ExpenseCategory.TAXI_TRAIN_BUS;
  }
  if (lower.includes('car rental') || lower.includes('rental car') || lower.includes('hertz') || lower.includes('enterprise') || lower.includes('avis')) {
    return ExpenseCategory.CAR_RENTAL;
  }
  if (lower.includes('air') || lower.includes('flight') || lower.includes('airline')) {
    return ExpenseCategory.AIR_TRAVEL;
  }
  if (lower.includes('equipment') || lower.includes('rental')) {
    return ExpenseCategory.EQUIPMENT_RENTAL;
  }
  if (lower.includes('supplies') || lower.includes('office') || lower.includes('hardware')) {
    return ExpenseCategory.SUPPLIES;
  }
  if (lower.includes('tip') || lower.includes('gratuity')) {
    return ExpenseCategory.TIPS_GRATUITIES;
  }
  return ExpenseCategory.OTHER;
};

interface AddReceiptScreenProps {
  receiptId?: number;
}

const AddReceiptScreen: React.FC<AddReceiptScreenProps> = ({ receiptId }) => {
  const { state, navigateTo, createReceipt, updateReceipt, deleteReceipt, uploadReceiptImage, findUser, findJob } = useAppContext();
  const { t, vertical } = useVertical();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!receiptId;
  const existingReceipt = receiptId ? state.receipts.find(r => r.id === receiptId) : null;

  // Check if current user can add receipts for others
  const canSelectUser = ['Admin', 'Producer'].includes(state.currentUser?.role || '');

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    category: ExpenseCategory.OTHER as ExpenseCategory,
    vendor_name: '',
    payment_method: PaymentMethod.PERSONAL_CARD as PaymentMethod,
    job_id: null as number | null,
    user_id: state.currentUser?.id || '',
    notes: '',
    receipt_image_url: '',
    mileage_miles: '',
  });
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [newJobName, setNewJobName] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Load existing receipt data when editing
  useEffect(() => {
    if (existingReceipt) {
      setFormData({
        amount: existingReceipt.amount.toString(),
        description: existingReceipt.description,
        expense_date: existingReceipt.expense_date,
        category: existingReceipt.category,
        vendor_name: existingReceipt.vendor_name || '',
        payment_method: existingReceipt.payment_method,
        job_id: existingReceipt.job_id,
        user_id: existingReceipt.user_id,
        notes: existingReceipt.notes || '',
        receipt_image_url: existingReceipt.receipt_image_url || '',
        mileage_miles: existingReceipt.mileage_miles?.toString() || '',
      });
      if (existingReceipt.receipt_image_url) {
        setPreviewUrl(existingReceipt.receipt_image_url);
      }
    }
  }, [existingReceipt]);

  // Pre-select job if navigated from job detail
  useEffect(() => {
    const params = state.currentView.params;
    if (params?.jobId && !isEditing) {
      setFormData(prev => ({ ...prev, job_id: params.jobId }));
    }
  }, [state.currentView.params, isEditing]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData(prev => ({ ...prev, receipt_image_url: '' }));
      setScanError(null);
    }
  };

  // Scan receipt image with AI to extract data
  const handleScanReceipt = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setScanError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(selectedFile);
      const base64Image = await base64Promise;

      // Call the Supabase Edge Function for receipt scanning
      const { supabase } = await import('../context/AppContext');
      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        body: {
          image: base64Image,
          mimeType: selectedFile.type,
        },
      });

      if (error) throw error;

      if (data && data.success) {
        const extracted = data.data;

        // Update form with extracted data
        setFormData(prev => ({
          ...prev,
          amount: extracted.amount ? extracted.amount.toString() : prev.amount,
          description: extracted.description || prev.description,
          vendor_name: extracted.vendor || prev.vendor_name,
          expense_date: extracted.date || prev.expense_date,
          category: extracted.category ? mapToExpenseCategory(extracted.category) : prev.category,
        }));
      } else {
        throw new Error(data?.error || 'Failed to scan receipt');
      }
    } catch (err: any) {
      console.error('Receipt scan error:', err);
      setScanError(err.message || 'Failed to scan receipt. Please enter details manually.');
    } finally {
      setIsScanning(false);
    }
  };

  // Handle mileage changes - auto-calculate amount
  const handleMileageChange = (miles: string) => {
    const milesNum = parseFloat(miles);
    const calculatedAmount = !isNaN(milesNum) && milesNum > 0
      ? (milesNum * MILEAGE_RATE).toFixed(2)
      : '';
    setFormData(prev => ({
      ...prev,
      mileage_miles: miles,
      amount: calculatedAmount,
      description: miles && !isNaN(milesNum) ? `Mileage: ${miles} miles @ $${MILEAGE_RATE}/mile` : prev.description,
    }));
  };

  // Handle category change
  const handleCategoryChange = (category: ExpenseCategory) => {
    setFormData(prev => ({
      ...prev,
      category,
      // Clear mileage if switching away from Mileage category
      ...(category !== ExpenseCategory.MILEAGE ? { mileage_miles: '', amount: '', description: '' } : {}),
    }));
  };

  // Handle creating a new job
  const handleCreateJob = async () => {
    if (!newJobName.trim()) return;

    try {
      // Use snake_case for database columns
      const newJob = {
        name: newJobName.trim(),
        producer_id: state.currentUser?.id || '',
        start_date: formData.expense_date,
        end_date: formData.expense_date,
        status: 'Wrapped',
        gear_list: [],
        organization_id: state.currentUser?.active_organization_id || state.currentUser?.organization_id || '',
      };

      const { data, error } = await (await import('../context/AppContext')).supabase
        .from('jobs')
        .insert([newJob])
        .select()
        .single();

      if (error) throw error;

      // Refresh data to get the new job
      setFormData(prev => ({ ...prev, job_id: data.id }));
      setShowNewJobModal(false);
      setNewJobName('');

      // Trigger a data refresh
      window.location.reload();
    } catch (err: any) {
      alert('Failed to create job: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.amount) {
      alert('Description and Amount are required.');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }

    setIsSaving(true);

    try {
      let finalImageUrl = formData.receipt_image_url;

      // Upload image if selected
      if (selectedFile) {
        try {
          finalImageUrl = await uploadReceiptImage(selectedFile);
        } catch (uploadErr: any) {
          console.error("Upload failed", uploadErr);
          if (!confirm("Image upload failed: " + uploadErr.message + "\n\nDo you want to save the receipt without the image?")) {
            setIsSaving(false);
            return;
          }
        }
      }

      const receiptData = {
        organization_id: state.currentUser?.active_organization_id || state.currentUser?.organization_id || '',
        job_id: formData.job_id,
        user_id: formData.user_id,
        submitted_by_id: state.currentUser?.id || '',
        amount: amount,
        description: formData.description,
        expense_date: formData.expense_date,
        category: formData.category,
        vendor_name: formData.vendor_name || undefined,
        payment_method: formData.payment_method,
        receipt_image_url: finalImageUrl || undefined,
        notes: formData.notes || undefined,
        mileage_miles: formData.mileage_miles ? parseFloat(formData.mileage_miles) : undefined,
      };

      if (isEditing && existingReceipt) {
        await updateReceipt({
          ...existingReceipt,
          ...receiptData,
        });
      } else {
        await createReceipt(receiptData);
      }

      navigateTo('RECEIPTS');
    } catch (error: any) {
      console.error("Error saving receipt:", error);
      alert('Failed to save receipt: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (existingReceipt) {
      await deleteReceipt(existingReceipt.id);
      navigateTo('RECEIPTS');
    }
  };

  // Get jobs for dropdown (sorted by date, recent first)
  const availableJobs = [...state.jobs].sort((a, b) =>
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  // Debug: log jobs to console
  console.log('Available jobs for receipt:', state.jobs.length, availableJobs);

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Receipt"
        message="Are you sure you want to delete this receipt? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* New Job Modal */}
      {showNewJobModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Create New {t.job}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Create a quick {t.job.toLowerCase()} entry for this expense. You can edit the full details later.
            </p>
            <input
              type="text"
              placeholder={vertical === 'music' ? `${t.job} name (e.g., 'Wedding - Smith Family')` : `${t.job} name (e.g., 'Commercial - ABC Corp')`}
              className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-300 dark:border-slate-600 mb-4"
              value={newJobName}
              onChange={e => setNewJobName(e.target.value)}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCreateJob()}
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowNewJobModal(false);
                  setNewJobName('');
                }}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateJob}
                disabled={!newJobName.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create {t.job}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateTo('RECEIPTS')}
          className="flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 transition-colors font-semibold"
        >
          <ArrowLeft size={16} />
          Cancel
        </button>
        {isEditing && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-500 transition-colors font-semibold"
          >
            <Trash2 size={16} />
            Delete
          </button>
        )}
      </div>

      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
        {isEditing ? 'Edit Receipt' : 'Add Receipt'}
      </h2>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 space-y-6 border border-slate-200 dark:border-slate-700">

        {/* Amount - Most Important (read-only for Mileage category) */}
        <div>
          <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">
            Amount *
            {formData.category === ExpenseCategory.MILEAGE && (
              <span className="text-xs text-blue-500 ml-2">(auto-calculated from miles)</span>
            )}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">$</span>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              readOnly={formData.category === ExpenseCategory.MILEAGE}
              className={`w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white pl-8 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-300 dark:border-slate-600 text-xl font-bold ${
                formData.category === ExpenseCategory.MILEAGE ? 'cursor-not-allowed opacity-75' : ''
              }`}
              placeholder="0.00"
              value={formData.amount}
              onChange={e => formData.category !== ExpenseCategory.MILEAGE && setFormData({ ...formData, amount: e.target.value })}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Description *</label>
          <input
            type="text"
            required
            className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-300 dark:border-slate-600"
            placeholder="e.g., Lunch for crew"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Date *</label>
            <input
              type="date"
              required
              className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-300 dark:border-slate-600"
              value={formData.expense_date}
              onChange={e => setFormData({ ...formData, expense_date: e.target.value })}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Category *</label>
            <select
              required
              className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-300 dark:border-slate-600"
              value={formData.category}
              onChange={e => handleCategoryChange(e.target.value as ExpenseCategory)}
            >
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mileage Input - Only shown when Mileage category is selected */}
        {formData.category === ExpenseCategory.MILEAGE && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Car className="text-blue-600 dark:text-blue-400" size={20} />
              <span className="font-medium text-blue-800 dark:text-blue-200">Mileage Calculator</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Miles Driven *</label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="0.1"
                  className="w-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-blue-300 dark:border-blue-600"
                  placeholder="0.0"
                  value={formData.mileage_miles}
                  onChange={e => handleMileageChange(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Calculated Amount</label>
                <div className="bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg font-bold text-lg">
                  ${formData.amount || '0.00'}
                </div>
              </div>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              Rate: ${MILEAGE_RATE}/mile (2024 IRS Standard Mileage Rate)
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vendor */}
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Vendor Name</label>
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-300 dark:border-slate-600"
              placeholder="e.g., Home Depot, Uber"
              value={formData.vendor_name}
              onChange={e => setFormData({ ...formData, vendor_name: e.target.value })}
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Payment Method</label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-300 dark:border-slate-600"
              value={formData.payment_method}
              onChange={e => setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })}
            >
              {PAYMENT_METHODS.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Job Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">{t.job} (Optional)</label>
          <div className="flex gap-2">
            <select
              className="flex-1 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-300 dark:border-slate-600"
              value={formData.job_id ?? ''}
              onChange={e => setFormData({ ...formData, job_id: e.target.value ? parseInt(e.target.value) : null })}
            >
              <option value="">No {t.job}</option>
              {availableJobs.map(job => (
                <option key={job.id} value={job.id}>{job.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowNewJobModal(true)}
              className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 font-medium transition-colors whitespace-nowrap"
            >
              + New {t.job}
            </button>
          </div>
        </div>

        {/* Crew Member Selection (Admin/Producer only) */}
        {canSelectUser && (
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Expense For</label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-300 dark:border-slate-600"
              value={formData.user_id}
              onChange={e => setFormData({ ...formData, user_id: e.target.value })}
            >
              {state.users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.id === state.currentUser?.id ? '(Me)' : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">Select which crew member this expense is for</p>
          </div>
        )}

        {/* Receipt Image */}
        <div>
          <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-2">Receipt Photo</label>

          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* Preview Area */}
            <div className="w-32 h-32 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-600 relative flex-shrink-0">
              {previewUrl ? (
                <img src={previewUrl} alt="Receipt Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="text-slate-400" size={32} />
              )}
              {previewUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setFormData(prev => ({ ...prev, receipt_image_url: '' }));
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    setScanError(null);
                  }}
                  className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="flex-grow space-y-3">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg font-medium transition-colors"
                >
                  <Camera size={18} /> Take Photo / Upload
                </button>

                {/* AI Scan Button - only show when image is selected */}
                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleScanReceipt}
                    disabled={isScanning}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Scanning...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} /> Auto-Fill with AI
                      </>
                    )}
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-400">
                Take a photo of your receipt, then click "Auto-Fill with AI" to extract details
              </p>

              {/* Scan Error Message */}
              {scanError && (
                <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                  {scanError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Notes</label>
          <textarea
            className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-300 dark:border-slate-600 h-24"
            placeholder="Any additional details..."
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg disabled:opacity-50"
          >
            <Save size={20} />
            {isSaving ? 'Saving...' : (isEditing ? 'Update Receipt' : 'Save Receipt')}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddReceiptScreen;
