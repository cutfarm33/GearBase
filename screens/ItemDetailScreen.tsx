
import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { ItemStatus, ItemCondition, InventoryItem, JobStatus, TransactionType, PREDEFINED_CATEGORIES } from '../types';
import { ArrowLeft, Trash2, Edit, Save, X, LogOut, LogIn, PackagePlus, FileSignature, Camera, Image as ImageIcon, Database, Check, Copy, Calendar, Briefcase, User, AlertCircle, Link, QrCode } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import SignaturePad, { SignaturePadRef } from '../components/SignaturePad';
import { getItemDeepLink, copyToClipboard } from '../utils/deepLinks';

const ItemDetailScreen: React.FC<{ itemId: number }> = ({ itemId }) => {
  const { state, dispatch, findItem, findJob, findUser, navigateTo, deleteInventoryItem, supabase, refreshData, uploadImage, createTransaction } = useAppContext();
  const item = findItem(itemId);

  // --- EDIT STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<InventoryItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- FILE UPLOAD STATE ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- SIGNATURE PAD REF ---
  const signaturePadRef = useRef<SignaturePadRef>(null);

  // --- VIEW STATE ---
  const [viewSignature, setViewSignature] = useState<string | null>(null);
  const [showDbError, setShowDbError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // --- QUICK ACTION STATE ---
  const [quickAction, setQuickAction] = useState<'checkout' | 'checkin' | null>(null);
  const [checkoutTab, setCheckoutTab] = useState<'job' | 'adhoc'>('job');
  const [quickForm, setQuickForm] = useState({
      jobId: '',
      assignedToId: '',
      returnDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      condition: ItemCondition.GOOD,
      notes: ''
  });
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<{ jobName: string, start: string, end: string } | null>(null);

  // --- PACKAGE STATE ---
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [targetKitId, setTargetKitId] = useState<string>('');
  const [isAddingToKit, setIsAddingToKit] = useState(false);

  const fromView = state.currentView.params?.from;
  const fromJobId = state.currentView.params?.jobId;

  const handleBack = () => {
    if (isEditing) {
        setIsEditing(false);
        setIsCustomCategory(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
    }
    if (fromView === 'JOB_DETAIL' && fromJobId) {
      navigateTo('JOB_DETAIL', { jobId: fromJobId });
    } else {
      navigateTo('INVENTORY');
    }
  };

  const copySql = () => {
      const sql = "alter table inventory add column if not exists weight numeric;\nalter table inventory add column if not exists storage_case text;";
      navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const startEdit = () => {
      if (item) {
          setEditForm(item);
          setIsEditing(true);
          setIsCustomCategory(false);
          setPreviewUrl(null);
          setSelectedFile(null);
      }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setSelectedFile(file);
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
          if (editForm) setEditForm({...editForm, imageUrl: ''});
      }
  };

  const handleSave = async () => {
      if (!editForm) return;
      setIsSaving(true);

      try {
          let finalImageUrl = editForm.imageUrl;

          if (selectedFile) {
              try {
                  finalImageUrl = await uploadImage(selectedFile);
              } catch (uploadErr: any) {
                  if (!confirm("Image upload failed: " + uploadErr.message + "\n\nSave changes without updating the image?")) {
                      setIsSaving(false);
                      return;
                  }
                  finalImageUrl = item?.imageUrl || '';
              }
          }

          const updatedItem = { ...editForm, imageUrl: finalImageUrl };

          const { error } = await supabase.from('inventory').update({
              name: updatedItem.name,
              category: updatedItem.category,
              qr_code: updatedItem.qrCode,
              status: updatedItem.status,
              condition: updatedItem.condition,
              purchase_date: updatedItem.purchaseDate || null,
              value: updatedItem.value,
              weight: updatedItem.weight, 
              storage_case: updatedItem.storageCase,
              image_url: updatedItem.imageUrl,
              notes: updatedItem.notes
          }).eq('id', updatedItem.id);

          if (error) {
              if (error.code === '42703') {
                  setShowDbError(true);
                  setIsSaving(false);
                  return;
              }
              throw error;
          }

          dispatch({ type: 'UPDATE_INVENTORY_ITEM_LOCAL', payload: updatedItem });
          setIsEditing(false);
      } catch (error: any) {
          alert('Failed to save: ' + error.message);
      } finally {
          setIsSaving(false);
      }
  };

  const handleDelete = async () => {
    if (item) {
        await deleteInventoryItem(item.id);
        navigateTo('INVENTORY');
    }
  };

  const openQuickAction = (type: 'checkout' | 'checkin') => {
      if (!item) return;
      
      let defaultAssignedId = state.currentUser?.id || '';
      let defaultJobId = '';
      let defaultCondition = item.condition;

      if (type === 'checkin' && item.history.length > 0) {
          // Find the last checkout transaction to autofill job/user
          const lastTx = item.history.find(h => h.type === TransactionType.CHECKOUT);
          if (lastTx && lastTx.jobId) {
              defaultJobId = lastTx.jobId.toString();
              defaultAssignedId = lastTx.assignedToId || lastTx.userId;
          }
      }

      setQuickForm({
          jobId: defaultJobId,
          assignedToId: defaultAssignedId,
          returnDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          condition: defaultCondition,
          notes: ''
      });

      // Clear signature pad
      setTimeout(() => {
          signaturePadRef.current?.clearSignature();
      }, 0);

      setCheckoutTab('job');
      setQuickAction(type);
  };

  const handleQuickSubmit = async () => {
      if (!item || !state.currentUser) return;

      // Validate signature
      const signature = signaturePadRef.current?.getSignature();
      if (!signature) {
          alert('Please provide a signature.');
          return;
      }

      setIsProcessingAction(true);

      try {
          if (quickAction === 'checkout') {
              let finalJobId: number;

              if (checkoutTab === 'job') {
                  if (!quickForm.jobId) throw new Error("Please select a job.");
                  finalJobId = parseInt(quickForm.jobId);
              } else {
                  // AD-HOC (QUICK USE)
                  const startDate = new Date().toISOString().split('T')[0];
                  
                  const conflictJob = state.jobs.find(j => {
                      if (j.status === JobStatus.CANCELED || j.status === JobStatus.WRAPPED) return false;
                      if (!j.gearList.some(g => g.itemId === item.id)) return false;
                      
                      const jStart = new Date(j.startDate).getTime();
                      const jEnd = new Date(j.endDate).getTime();
                      const rStart = new Date(startDate).getTime();
                      const rEnd = new Date(quickForm.returnDate).getTime();
                      
                      return (rStart <= jEnd && rEnd >= jStart);
                  });

                  if (conflictJob) {
                      setConflictWarning({ 
                          jobName: conflictJob.name, 
                          start: new Date(conflictJob.startDate).toLocaleDateString(), 
                          end: new Date(conflictJob.endDate).toLocaleDateString() 
                      });
                      setIsProcessingAction(false);
                      return;
                  }

                  const { data: jobData, error: jobError } = await supabase.from('jobs').insert({
                      name: `Quick Use: ${item.name}`,
                      producer_id: state.currentUser.id,
                      start_date: startDate,
                      end_date: quickForm.returnDate,
                      status: JobStatus.IN_PROGRESS
                  }).select().single();

                  if (jobError) throw jobError;
                  finalJobId = jobData.id;

                  const { error: linkError } = await supabase.from('job_items').insert({
                      job_id: finalJobId,
                      item_id: item.id
                  });
                  if (linkError) throw linkError;
              }

              // *** STRICT CHECKOUT ***
              await createTransaction({
                  jobId: finalJobId,
                  type: TransactionType.CHECKOUT,
                  userId: state.currentUser.id,
                  assignedToId: quickForm.assignedToId,
                  items: [{
                      itemId: item.id,
                      startCondition: item.condition,
                      endCondition: item.condition,
                      notes: quickForm.notes,
                      isMissing: false
                  }],
                  signature: signature
              }, [{
                  itemId: item.id,
                  newStatus: ItemStatus.CHECKED_OUT, // Force Unavailable
                  newCondition: item.condition,
                  notes: quickForm.notes || item.notes
              }]);

          } else {
              // For check-in: try to get job from form, then from last checkout in history
              const jobIdNum = quickForm.jobId ? parseInt(quickForm.jobId) : (item.history[0]?.jobId || null);

              // Check if this is a quick use job (starts with "Quick Use:")
              const job = jobIdNum ? state.jobs.find(j => j.id === jobIdNum) : null;
              const isQuickUseJob = job?.name.startsWith('Quick Use:');

              await createTransaction({
                  jobId: jobIdNum,
                  type: TransactionType.CHECKIN,
                  userId: state.currentUser.id,
                  items: [{
                      itemId: item.id,
                      startCondition: item.condition,
                      endCondition: quickForm.condition,
                      notes: quickForm.notes,
                      isMissing: false
                  }],
                  signature: signature
              }, [{
                  itemId: item.id,
                  newStatus: ItemStatus.AVAILABLE, // Force Available
                  newCondition: quickForm.condition,
                  notes: quickForm.notes || item.notes
              }]);

              // Mark quick use job as WRAPPED after successful checkin
              if (isQuickUseJob && jobIdNum) {
                  await supabase.from('jobs').update({ status: JobStatus.WRAPPED }).eq('id', jobIdNum);
                  await refreshData(true);
              }
          }

          setQuickAction(null);
          signaturePadRef.current?.clearSignature();

      } catch (err: any) {
          console.error("Quick Action Failed:", err);
          let message = "Action Failed";
          if (typeof err === 'string') message = err;
          else if (err.message) message = err.message;
          else if (err.details) message = err.details;
          else if (err.hint) message = err.hint;
          else message = JSON.stringify(err);

          alert("Action Failed: " + message);
      } finally {
          setIsProcessingAction(false);
      }
  };
  
  const handleAddToPackage = async () => {
      if (!targetKitId) return;
      setIsAddingToKit(true);
      try {
          const kitIdNum = parseInt(targetKitId);
          const existing = state.kits.find(k => k.id === kitIdNum);
          if (existing && existing.itemIds.includes(itemId)) {
              alert('Item is already in this package.');
              setIsAddingToKit(false);
              return;
          }
          const { error } = await supabase.from('kit_items').insert({ kit_id: kitIdNum, item_id: itemId });
          if (error) throw error;
          await refreshData(true);
          setIsPackageModalOpen(false);
          setTargetKitId('');
      } catch (error: any) {
          alert('Failed to add to package: ' + error.message);
      } finally {
          setIsAddingToKit(false);
      }
  };

  if (!item) return <div className="text-slate-900 dark:text-white">Item not found.</div>;

  const categories = Array.from(new Set([...PREDEFINED_CATEGORIES, ...state.inventory.map(i => i.category)])).sort();
  const activeJobs = state.jobs.filter(j => j.status === JobStatus.UPCOMING || j.status === JobStatus.IN_PROGRESS);
  const currentJob = item.status === ItemStatus.CHECKED_OUT && item.history.length > 0 && item.history[0].jobId ? findJob(item.history[0].jobId) : null;
  const currentUser = item.status === ItemStatus.CHECKED_OUT && item.history.length > 0 ? findUser(item.history[0].assignedToId || item.history[0].userId) : null;

  const isUnavailable = item.status === ItemStatus.CHECKED_OUT || item.status === ItemStatus.UNAVAILABLE;

  return (
    <div className="pb-20">
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Item"
        message={`Are you sure you want to permanently delete "${item.name}"?`}
        confirmText="Delete Item"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* CONFLICT WARNING MODAL */}
      {conflictWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-lg shadow-2xl border border-red-200 dark:border-red-900 overflow-hidden">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 bg-red-50 dark:bg-red-900/20">
                      <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full text-red-600 dark:text-red-400">
                          <AlertCircle size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Item Unavailable</h3>
                  </div>
                  <div className="p-6">
                      <p className="text-slate-700 dark:text-slate-300 mb-4">
                          This item is already booked for:
                      </p>
                      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                          <p className="font-bold text-slate-900 dark:text-white mb-1">{conflictWarning.jobName}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{conflictWarning.start} - {conflictWarning.end}</p>
                      </div>
                  </div>
                  <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                      <button 
                          onClick={() => setConflictWarning(null)}
                          className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-lg transition-colors"
                      >
                          Close
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* DB ERROR MODAL */}
      {showDbError && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                      <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400"><Database size={24} /></div>
                      <div><h3 className="text-xl font-bold text-slate-900 dark:text-white">Database Update Needed</h3><p className="text-sm text-slate-500 dark:text-slate-400">New columns missing.</p></div>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/30">
                      <div className="relative"><pre className="bg-slate-900 text-slate-200 p-3 rounded text-xs font-mono overflow-x-auto border border-slate-700">alter table inventory add column if not exists weight numeric;{'\n'}alter table inventory add column if not exists storage_case text;</pre><button onClick={copySql} className="absolute top-2 right-2 p-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors">{copied ? <Check size={14} className="text-green-400"/> : <Copy size={14}/>}</button></div>
                  </div>
                  <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2"><button onClick={() => setShowDbError(false)} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg transition-colors">Okay, I ran it</button></div>
              </div>
          </div>
      )}

      {/* QUICK ACTION MODAL */}
      {quickAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">
                  
                  <div className={`p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center ${quickAction === 'checkout' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                      <h3 className={`text-xl font-bold flex items-center gap-2 ${quickAction === 'checkout' ? 'text-amber-700 dark:text-amber-400' : 'text-green-700 dark:text-green-400'}`}>
                          {quickAction === 'checkout' ? <LogOut size={24}/> : <LogIn size={24}/>}
                          {quickAction === 'checkout' ? 'Check Out' : 'Check In'}
                      </h3>
                      <button
                          onClick={() => {
                              setQuickAction(null);
                              signaturePadRef.current?.clearSignature();
                          }}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                          <X size={24}/>
                      </button>
                  </div>

                  <div className="p-6 space-y-5">
                      
                      {quickAction === 'checkout' && (
                          <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-lg mb-2">
                              <button 
                                  onClick={() => setCheckoutTab('job')}
                                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${checkoutTab === 'job' ? 'bg-white dark:bg-slate-600 text-sky-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                              >
                                  <Briefcase size={16}/> Assign to Job
                              </button>
                              <button 
                                  onClick={() => setCheckoutTab('adhoc')}
                                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${checkoutTab === 'adhoc' ? 'bg-white dark:bg-slate-600 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                              >
                                  <Calendar size={16}/> Quick Use
                              </button>
                          </div>
                      )}

                      <div className="space-y-4">
                          
                          {quickAction === 'checkout' && checkoutTab === 'job' && (
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Select Job</label>
                                  <select
                                      className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-3 rounded-lg border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 outline-none"
                                      value={quickForm.jobId}
                                      onChange={(e) => setQuickForm({ ...quickForm, jobId: e.target.value })}
                                  >
                                      <option value="">-- Choose Active Job --</option>
                                      {activeJobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                                  </select>
                                  {activeJobs.length === 0 && <p className="text-xs text-red-500 mt-1">No active jobs found.</p>}
                              </div>
                          )}

                          {quickAction === 'checkout' && checkoutTab === 'adhoc' && (
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Expected Return</label>
                                  <input 
                                      type="date"
                                      className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-3 rounded-lg border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-amber-500 outline-none"
                                      value={quickForm.returnDate}
                                      onChange={(e) => setQuickForm({ ...quickForm, returnDate: e.target.value })}
                                  />
                                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><AlertCircle size={12}/> A temporary job will be created.</p>
                              </div>
                          )}

                          {quickAction === 'checkout' && (
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Assigned To</label>
                                  <div className="relative">
                                      <User className="absolute left-3 top-3.5 text-slate-400" size={18}/>
                                      <select
                                          className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white pl-10 pr-3 py-3 rounded-lg border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 outline-none"
                                          value={quickForm.assignedToId}
                                          onChange={(e) => setQuickForm({ ...quickForm, assignedToId: e.target.value })}
                                      >
                                          {state.users.map(u => <option key={u.id} value={u.id}>{u.name} {u.id === state.currentUser?.id ? '(Me)' : ''}</option>)}
                                      </select>
                                  </div>
                              </div>
                          )}

                          {quickAction === 'checkin' && (
                              <>
                                  {currentJob && (
                                      <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Returning From</p>
                                          <p className="font-bold text-slate-900 dark:text-white">{currentJob.name}</p>
                                      </div>
                                  )}
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Condition In</label>
                                      <select
                                          className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-3 rounded-lg border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-green-500 outline-none"
                                          value={quickForm.condition}
                                          onChange={(e) => setQuickForm({ ...quickForm, condition: e.target.value as ItemCondition })}
                                      >
                                          {Object.values(ItemCondition).map(c => <option key={c} value={c}>{c}</option>)}
                                      </select>
                                  </div>
                              </>
                          )}

                          <div>
                              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Notes</label>
                              <textarea
                                  className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 h-20 text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                                  placeholder="Optional notes..."
                                  value={quickForm.notes}
                                  onChange={(e) => setQuickForm({ ...quickForm, notes: e.target.value })}
                              />
                          </div>

                          <div>
                              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                  <FileSignature size={14} /> Signature
                              </label>
                              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg p-3">
                                  <SignaturePad ref={signaturePadRef} />
                              </div>
                              <button
                                  type="button"
                                  onClick={() => signaturePadRef.current?.clearSignature()}
                                  className="text-xs text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 mt-2 font-medium"
                              >
                                  Clear Signature
                              </button>
                          </div>
                      </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                      <button
                          onClick={() => {
                              setQuickAction(null);
                              signaturePadRef.current?.clearSignature();
                          }}
                          className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          disabled={isProcessingAction}
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleQuickSubmit}
                          disabled={isProcessingAction}
                          className={`px-6 py-2 rounded-lg font-bold text-white shadow-md transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                              quickAction === 'checkout' 
                                  ? 'bg-amber-500 hover:bg-amber-600' 
                                  : 'bg-green-500 hover:bg-green-600'
                          }`}
                      >
                          {isProcessingAction ? 'Saving...' : 'Confirm'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {viewSignature && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                      <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><FileSignature className="text-sky-500" /> Digital Signature</h3>
                      <button onClick={() => setViewSignature(null)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white"><X size={20} /></button>
                  </div>
                  <div className="p-6 flex justify-center bg-slate-900"><img src={viewSignature} alt="Signature" className="max-w-full h-auto border border-slate-700 rounded bg-slate-800/50" /></div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 text-center"><button onClick={() => setViewSignature(null)} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-lg transition-colors">Close</button></div>
              </div>
          </div>
      )}

      {isPackageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="p-6">
                      <div className="flex items-center gap-3 mb-4"><PackagePlus className="text-sky-500" size={24} /><h3 className="text-xl font-bold text-slate-900 dark:text-white">Add to Package</h3></div>
                      <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">Select a package to add <strong>{item.name}</strong> to.</p>
                      <div>
                          <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Select Package</label>
                          <select className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-3 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 outline-none" value={targetKitId} onChange={(e) => setTargetKitId(e.target.value)}>
                              <option value="">-- Choose a Package --</option>
                              {state.kits.map(kit => {
                                  const isAlreadyIn = kit.itemIds.includes(item.id);
                                  return <option key={kit.id} value={kit.id} disabled={isAlreadyIn}>{kit.name} {isAlreadyIn ? '(Already Added)' : ''}</option>;
                              })}
                          </select>
                          {state.kits.length === 0 && <p className="text-xs text-amber-500 mt-2">No packages available.</p>}
                      </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 flex justify-end gap-3">
                      <button onClick={() => setIsPackageModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">Cancel</button>
                      <button onClick={handleAddToPackage} disabled={!targetKitId || isAddingToKit} className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50">{isAddingToKit ? 'Adding...' : 'Add to Package'}</button>
                  </div>
              </div>
          </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <button onClick={handleBack} className="flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 transition-colors font-semibold">
            {isEditing ? <X size={16} /> : <ArrowLeft size={16} />} {isEditing ? 'Cancel' : 'Back'}
        </button>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {!isEditing ? (
                <>
                    <button onClick={startEdit} className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 transition-colors font-semibold px-3 py-1 rounded hover:bg-sky-100 dark:hover:bg-sky-500/10"><Edit size={16} /> Edit</button>
                    <button onClick={() => { if(isUnavailable) { alert("Check in first."); return; } setShowDeleteModal(true); }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 transition-colors font-semibold px-3 py-1 rounded hover:bg-red-100 dark:hover:bg-red-500/10"><Trash2 size={16} /> Delete</button>
                </>
            ) : (
                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 text-sm bg-green-500 hover:bg-green-600 text-white transition-colors font-bold px-4 py-2 rounded shadow disabled:opacity-50"><Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}</button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700">
              {!isEditing ? (
                  <>
                      <div className="relative">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-auto object-cover rounded-lg mb-4"/>
                          {/* UPDATED STATUS BADGE */}
                          <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${isUnavailable ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>{isUnavailable ? 'UNAVAILABLE' : item.status}</div>
                      </div>
                      
                      <div className="mb-6 space-y-3">
                          <div className="flex gap-2">
                            {!isUnavailable && (
                                <button onClick={() => openQuickAction('checkout')} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
                                    <LogOut size={18} /> Quick Check-Out
                                </button>
                            )}
                            {isUnavailable && (
                                <button onClick={() => openQuickAction('checkin')} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
                                    <LogIn size={18} /> Return Item
                                </button>
                            )}
                          </div>
                          <button onClick={() => setIsPackageModalOpen(true)} className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm border border-slate-200 dark:border-slate-600"><PackagePlus size={18} /> Add to Package</button>
                      </div>

                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{item.name}</h2>
                      <p className="text-slate-500 dark:text-slate-400">{item.category}</p>
                  </>
              ) : (
                  <div className="space-y-4">
                      {/* ... EDIT FORM (No Changes needed here) ... */}
                      <div>
                          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Image</label>
                          <div className="flex flex-col gap-3">
                              <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-600">
                                  {previewUrl || editForm?.imageUrl ? (
                                      <img src={previewUrl || editForm?.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                  ) : <ImageIcon className="text-slate-400" size={32} />}
                                  {(previewUrl || editForm?.imageUrl) && <button type="button" onClick={() => { setPreviewUrl(null); setSelectedFile(null); if(editForm) setEditForm({...editForm, imageUrl: ''}); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"><X size={16} /></button>}
                              </div>
                              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg font-medium transition-colors"><Camera size={18} /> Change Photo</button>
                              <input type="text" className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded border border-slate-300 dark:border-slate-600 text-sm" placeholder="Image URL..." value={editForm?.imageUrl || ''} onChange={(e) => editForm && setEditForm({...editForm, imageUrl: e.target.value})} disabled={!!selectedFile} />
                          </div>
                      </div>
                      <div><label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Name</label><input type="text" className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded border border-slate-300 dark:border-slate-600 font-bold text-lg" value={editForm?.name || ''} onChange={(e) => editForm && setEditForm({...editForm, name: e.target.value})} /></div>
                      <div>
                          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Category</label>
                          {isCustomCategory ? (
                              <div className="flex gap-2"><input type="text" autoFocus className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded border border-slate-300 dark:border-slate-600 text-sm" value={editForm?.category || ''} onChange={(e) => editForm && setEditForm({...editForm, category: e.target.value})} placeholder="Enter custom category" /><button onClick={() => setIsCustomCategory(false)} className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300"><X size={16} /></button></div>
                          ) : (
                              <select className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded border border-slate-300 dark:border-slate-600 text-sm" value={editForm?.category || ''} onChange={(e) => { if (e.target.value === '__NEW__') { setIsCustomCategory(true); if(editForm) setEditForm({...editForm, category: ''}); } else { if(editForm) setEditForm({...editForm, category: e.target.value}); } }}>
                                  <option value="">-- Select Category --</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}{editForm?.category && !categories.includes(editForm.category) && <option value={editForm.category}>{editForm.category}</option>}<option disabled>──────────</option><option value="__NEW__">+ Create New Category</option>
                              </select>
                          )}
                      </div>
                      
                      {/* STATUS OVERRIDE DROPDOWN */}
                      <div>
                          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Status (Manual Override)</label>
                          <select 
                              className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded border border-slate-300 dark:border-slate-600 text-sm"
                              value={editForm?.status || ItemStatus.AVAILABLE}
                              onChange={(e) => editForm && setEditForm({...editForm, status: e.target.value as ItemStatus})}
                          >
                              <option value={ItemStatus.AVAILABLE}>Available</option>
                              <option value={ItemStatus.CHECKED_OUT}>Unavailable / Checked Out</option>
                              <option value={ItemStatus.IN_MAINTENANCE}>In Maintenance</option>
                          </select>
                      </div>

                      <div><label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">QR Code</label><input type="text" className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded border border-slate-300 dark:border-slate-600 font-mono text-sm" value={editForm?.qrCode || ''} onChange={(e) => editForm && setEditForm({...editForm, qrCode: e.target.value})} /></div>
                      <div className="grid grid-cols-2 gap-3">
                          <div><label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Value ($)</label><input type="number" className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-2 py-2 rounded border border-slate-300 dark:border-slate-600 text-sm" value={editForm?.value || ''} onChange={(e) => editForm && setEditForm({...editForm, value: Number(e.target.value)})} /></div>
                          <div><label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Weight (lbs)</label><input type="number" className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-2 py-2 rounded border border-slate-300 dark:border-slate-600 text-sm" value={editForm?.weight || ''} onChange={(e) => editForm && setEditForm({...editForm, weight: Number(e.target.value)})} /></div>
                      </div>
                      <div><label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Case / Bin</label><input type="text" className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded border border-slate-300 dark:border-slate-600 text-sm" value={editForm?.storageCase || ''} onChange={(e) => editForm && setEditForm({...editForm, storageCase: e.target.value})} /></div>
                  </div>
              )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Details</h3>
              {!isEditing ? (
                  <ul className="space-y-2 text-sm">
                      <li className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">QR Code:</span> <span className="text-slate-700 dark:text-white font-mono">{item.qrCode}</span></li>
                      <li className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Condition:</span> <span className="font-semibold text-amber-600 dark:text-amber-400">{item.condition}</span></li>
                      <li className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Purchase:</span> <span className="text-slate-700 dark:text-white">{item.purchaseDate || '-'}</span></li>
                      <li className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Value:</span> <span className="text-slate-700 dark:text-white">${item.value?.toLocaleString() || '-'}</span></li>
                      <li className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Weight:</span> <span className="text-slate-700 dark:text-white">{item.weight ? `${item.weight} lbs` : '-'}</span></li>
                      <li className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Case/Bin:</span> <span className="text-slate-700 dark:text-white">{item.storageCase || '-'}</span></li>
                  </ul>
              ) : <p className="text-center text-slate-500 italic text-sm">Editing above...</p>}
          </div>

          {!isEditing && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-lg shadow-lg p-6 border-2 border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 mb-3">
                      <QrCode className="text-emerald-600 dark:text-emerald-400" size={20} />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">QR Code Link</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Use this URL in your QR code stickers. Scanning will take users directly to this item's detail page.
                  </p>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-emerald-200 dark:border-emerald-700 mb-3">
                      <code className="text-xs text-slate-700 dark:text-slate-300 break-all font-mono">
                          {getItemDeepLink(item.id)}
                      </code>
                  </div>
                  <button
                      onClick={async () => {
                          const success = await copyToClipboard(getItemDeepLink(item.id));
                          if (success) {
                              setLinkCopied(true);
                              setTimeout(() => setLinkCopied(false), 2000);
                          }
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2"
                  >
                      {linkCopied ? (
                          <>
                              <Check size={18} />
                              Copied!
                          </>
                      ) : (
                          <>
                              <Copy size={18} />
                              Copy Link for QR Code
                          </>
                      )}
                  </button>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
                      💡 Paste this link into any QR code generator to create stickers for your equipment
                  </p>
              </div>
          )}

           {currentJob && !isEditing && (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Current Assignment</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Job: <span onClick={() => navigateTo('JOB_DETAIL', {jobId: currentJob.id})} className="text-sky-600 dark:text-white hover:underline cursor-pointer">{currentJob.name}</span></p>
                  {currentUser && <p className="text-sm text-slate-500 dark:text-slate-400">With: <span className="text-slate-900 dark:text-white">{currentUser.name}</span></p>}
              </div>
           )}

           {(item.notes || isEditing) && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Notes</h3>
                    {!isEditing ? (
                        <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{item.notes}"</p>
                    ) : (
                        <textarea className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded border border-slate-300 dark:border-slate-600 text-sm h-24" value={editForm?.notes || ''} onChange={(e) => editForm && setEditForm({...editForm, notes: e.target.value})} placeholder="Item notes..." />
                    )}
                </div>
           )}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">History</h3>
          <div className="space-y-4">
              {item.history.length > 0 ? item.history.map(log => {
                  const job = log.jobId ? findJob(log.jobId) : null;
                  const user = findUser(log.userId);
                  const tx = state.transactions.find(t => t.id === log.transactionId);
                  return (
                      <div key={log.transactionId} className="border-l-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-r-lg border-slate-200 dark:border-transparent" style={{ borderColor: log.type === 'Check-out' ? '#f59e0b' : '#22c55e' }}>
                          <div className="flex justify-between items-start">
                              <div>
                                <div className="flex justify-between items-center mb-1"><p className="font-bold text-slate-900 dark:text-white">{log.type}{job ? ` for "${job.name}"` : ''}</p></div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{new Date(log.date).toLocaleString()}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300">Operator: {user?.name || 'Unknown'}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300">Condition: {log.condition}</p>
                                {log.notes && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 italic">Notes: "{log.notes}"</p>}
                              </div>
                              {tx?.signature && <button onClick={() => setViewSignature(tx.signature || null)} className="text-xs bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-white px-3 py-1.5 rounded border border-slate-200 dark:border-slate-600 flex items-center gap-1 transition-colors"><FileSignature size={12}/> View Sig</button>}
                          </div>
                      </div>
                  )
              }) : <p className="text-slate-500 dark:text-slate-400">No history for this item.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailScreen;
