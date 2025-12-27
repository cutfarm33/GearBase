
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useVertical } from '../hooks/useVertical';
import { JobStatus, Kit, InventoryItem } from '../types';
import { ArrowLeft, Save, AlertTriangle, Plus, X, Briefcase, Trash2, Package, ChevronDown, ChevronRight, FolderOpen, UserPlus, CheckCircle, Music } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const JobFormScreen: React.FC<{ jobId?: number }> = ({ jobId }) => {
    const { state, navigateTo, findJob, findItem, supabase, refreshData, deleteJob, addTeamMember } = useAppContext();
    const { t, vertical } = useVertical();
    const isEditing = !!jobId;
    const existingJob = jobId ? findJob(jobId) : undefined;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        producerId: state.currentUser?.id || '',
        startDate: '',
        endDate: '',
        status: JobStatus.UPCOMING,
        gearListIds: [] as number[],
    });

    // Load existing data if editing
    useEffect(() => {
        if (isEditing && existingJob) {
            setFormData({
                name: existingJob.name,
                producerId: existingJob.producerId,
                startDate: existingJob.startDate,
                endDate: existingJob.endDate,
                status: existingJob.status,
                gearListIds: existingJob.gearList.map(g => g.itemId),
            });
        }
    }, [isEditing, existingJob]);

    const [itemSearch, setItemSearch] = useState('');
    const [showItemDropdown, setShowItemDropdown] = useState(false);
    
    // State for collapsed kit folders (keyed by Kit ID)
    const [collapsedKits, setCollapsedKits] = useState<Record<number, boolean>>({});

    // Quick Add Producer Modal State
    const [showProducerModal, setShowProducerModal] = useState(false);
    const [newProducerName, setNewProducerName] = useState('');
    const [newProducerEmail, setNewProducerEmail] = useState('');
    const [isAddingProducer, setIsAddingProducer] = useState(false);

    // Conflict Warning Modal State
    const [conflictWarning, setConflictWarning] = useState<{ kitName: string, items: InventoryItem[] } | null>(null);

    const producers = state.users.filter(u => u.role === 'Producer' || u.role === 'Admin');
    const availableItems = state.inventory; 

    // Conflict Detection Logic
    const checkConflicts = (itemId: number): boolean => {
        if (!formData.startDate || !formData.endDate) return false;
        
        const start = new Date(formData.startDate).getTime();
        const end = new Date(formData.endDate).getTime();

        return state.jobs.some(j => {
            if (j.id === jobId) return false; // Ignore self
            if (j.status === JobStatus.CANCELED) return false;

            const jStart = new Date(j.startDate).getTime();
            const jEnd = new Date(j.endDate).getTime();

            // Overlap check
            const overlaps = (start <= jEnd) && (end >= jStart);
            
            if (overlaps) {
                return j.gearList.some(g => g.itemId === itemId);
            }
            return false;
        });
    };

    const handleAddItem = (itemId: number) => {
        if (!formData.gearListIds.includes(itemId)) {
            setFormData(prev => ({ ...prev, gearListIds: [...prev.gearListIds, itemId] }));
        }
        setShowItemDropdown(false);
        setItemSearch('');
    };

    const handleRemoveItem = (itemId: number) => {
        setFormData(prev => ({ ...prev, gearListIds: prev.gearListIds.filter(id => id !== itemId) }));
    };

    const handleAddKit = (kit: Kit) => {
        // 1. Enforce Date Selection
        if (!formData.startDate || !formData.endDate) {
            alert("Please select Start and End dates first. We need dates to check equipment availability.");
            return;
        }

        // 2. Check for Conflicts inside the kit
        const conflictingItems: InventoryItem[] = [];
        
        kit.itemIds.forEach(id => {
            if (checkConflicts(id)) {
                const item = findItem(id);
                if (item) conflictingItems.push(item);
            }
        });

        // 3. Block if conflicts exist
        if (conflictingItems.length > 0) {
            setConflictWarning({ kitName: kit.name, items: conflictingItems });
            return;
        }

        // 4. Add items if safe
        const newIds = kit.itemIds.filter(id => !formData.gearListIds.includes(id));
        if (newIds.length > 0) {
            setFormData(prev => ({ ...prev, gearListIds: [...prev.gearListIds, ...newIds] }));
        }
    };
    
    const handleRemoveKit = (kit: Kit) => {
        // Remove all items belonging to this kit from the selection
        setFormData(prev => ({ 
            ...prev, 
            gearListIds: prev.gearListIds.filter(id => !kit.itemIds.includes(id)) 
        }));
    };

    const toggleKitCollapse = (kitId: number) => {
        setCollapsedKits(prev => ({ ...prev, [kitId]: !prev[kitId] }));
    };

    const handleDelete = async () => {
        if (jobId) {
            await deleteJob(jobId);
            navigateTo('JOB_LIST');
        }
    };

    const handleQuickAddProducer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProducerName.trim()) return;

        setIsAddingProducer(true);
        try {
            console.log('Quick adding producer:', newProducerName);
            const newId = await addTeamMember(newProducerName, 'Producer', newProducerEmail || undefined);
            console.log('Producer added with ID:', newId);
            if (newId) {
                setFormData(prev => ({ ...prev, producerId: newId }));
                setShowProducerModal(false);
                setNewProducerName('');
                setNewProducerEmail('');
            } else {
                alert("Failed to add producer - no ID returned");
            }
        } catch (error: any) {
            console.error('Quick add producer error:', error);
            const msg = error?.message || error?.details || JSON.stringify(error) || 'Unknown error';
            alert("Failed to add producer: " + msg);
        } finally {
            setIsAddingProducer(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) return alert(`Please enter a ${t.job.toLowerCase()} name.`);
        if (!formData.producerId) return alert(`Please select a ${t.producer}.`);
        if (!formData.startDate || !formData.endDate) return alert('Please select start and end dates.');
        
        setIsSaving(true);
        
        try {
            // Get organization ID for the job
            const organizationId = state.currentUser?.active_organization_id || state.currentUser?.organization_id;
            if (!organizationId) {
                throw new Error('No organization found. Please log in again.');
            }

            // 1. Upsert Job in Supabase
            const jobPayload = {
                name: formData.name,
                producer_id: formData.producerId,
                start_date: formData.startDate,
                end_date: formData.endDate,
                status: formData.status,
                organization_id: organizationId
            };

            let activeJobId = jobId;

            if (isEditing && jobId) {
                const { error } = await supabase.from('jobs').update(jobPayload).eq('id', jobId);
                if (error) throw error;
                
                // Clear existing items to replace them (simple approach)
                await supabase.from('job_items').delete().eq('job_id', jobId);
            } else {
                const { data, error } = await supabase.from('jobs').insert(jobPayload).select().single();
                if (error) throw error;
                activeJobId = data.id;
            }

            if (activeJobId) {
                 // 2. Insert Job Items
                const itemsPayload = formData.gearListIds.map(id => ({
                    job_id: activeJobId,
                    item_id: id
                }));
                if (itemsPayload.length > 0) {
                    const { error: itemsError } = await supabase.from('job_items').insert(itemsPayload);
                    if (itemsError) throw itemsError;
                }
            }

            await refreshData();
            navigateTo('JOB_LIST');
        } catch (error: any) {
            console.error("Job Save Error:", error);
            alert(`Failed to save ${t.job.toLowerCase()}: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Search filtering
    const filteredItems = availableItems.filter(i => 
        i.name.toLowerCase().includes(itemSearch.toLowerCase()) || 
        i.category.toLowerCase().includes(itemSearch.toLowerCase())
    );

    // Helper to render a single item row
    const renderItemRow = (item: InventoryItem, isNested: boolean = false) => {
        const conflict = checkConflicts(item.id);
        return (
            <div key={item.id} className={`flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-3 ${isNested ? 'ml-8 border-l-2 border-slate-200 dark:border-slate-600 rounded-r-lg' : 'rounded-lg'} border-y border-r border-slate-200 dark:border-slate-700`}>
                <div className="flex items-center gap-3">
                    {conflict && (
                        <div className="text-amber-500 tooltip" title="This item is booked on another job during these dates">
                            <AlertTriangle size={18} />
                        </div>
                    )}
                    <div>
                        <p className="text-slate-900 dark:text-white font-medium">{item.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.category} | {item.qrCode}</p>
                    </div>
                </div>
                <button 
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1"
                    title="Remove Item"
                >
                    <X size={18} />
                </button>
            </div>
        );
    };

    // Logic to group selected items by Kit
    const renderGroupedGearList = () => {
        if (formData.gearListIds.length === 0) {
            return <p className="text-slate-500 dark:text-slate-500 italic">No items added yet.</p>;
        }

        const selectedIdsSet = new Set(formData.gearListIds);
        const usedIds = new Set<number>();
        const kitGroups = [];

        // 1. Identify complete (or partial) kits
        for (const kit of state.kits) {
            const itemsInThisKit = kit.itemIds.filter(id => selectedIdsSet.has(id));
            
            if (itemsInThisKit.length > 0) {
                // Mark these IDs as "used" so they don't appear in the loose list
                // Note: If an item belongs to multiple kits, it will appear in the first kit found. 
                // We filter out already used IDs to prevent duplicates.
                const uniqueItemsInKit = itemsInThisKit.filter(id => !usedIds.has(id));
                
                if (uniqueItemsInKit.length > 0) {
                    uniqueItemsInKit.forEach(id => usedIds.add(id));
                    kitGroups.push({ kit, items: uniqueItemsInKit });
                }
            }
        }

        // 2. Identify loose items (not in any displayed kit group)
        const looseItemIds = formData.gearListIds.filter(id => !usedIds.has(id));

        return (
            <div className="space-y-4">
                {/* Render Kit Groups */}
                {kitGroups.map(({ kit, items }) => {
                    const isCollapsed = collapsedKits[kit.id];
                    return (
                        <div key={`kit-${kit.id}`} className="border border-indigo-200 dark:border-indigo-900 rounded-lg overflow-hidden shadow-sm">
                            <div 
                                className="bg-indigo-50 dark:bg-slate-800 p-3 flex items-center justify-between cursor-pointer hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors"
                                onClick={() => toggleKitCollapse(kit.id)}
                            >
                                <div className="flex items-center gap-2">
                                    {isCollapsed ? <ChevronRight size={18} className="text-indigo-500"/> : <ChevronDown size={18} className="text-indigo-500"/>}
                                    <Package size={18} className="text-indigo-600 dark:text-indigo-400"/>
                                    <span className="font-bold text-slate-900 dark:text-white">{kit.name}</span>
                                    <span className="text-xs bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full">
                                        {items.length} items
                                    </span>
                                </div>
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveKit(kit);
                                    }}
                                    className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 hover:bg-white dark:hover:bg-slate-600 rounded"
                                    title="Remove Package"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            
                            {!isCollapsed && (
                                <div className="space-y-1 p-2 bg-white dark:bg-slate-800/50">
                                    {items.map(id => {
                                        const item = findItem(id);
                                        return item ? renderItemRow(item, true) : null;
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Render Loose Items */}
                {looseItemIds.length > 0 && (
                    <div className="space-y-2 mt-4">
                        {kitGroups.length > 0 && (
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <FolderOpen size={14}/> Individual Items
                            </h4>
                        )}
                        {looseItemIds.map(id => {
                            const item = findItem(id);
                            return item ? renderItemRow(item) : null;
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <ConfirmModal
                isOpen={showDeleteModal}
                title={`Delete ${t.job}`}
                message={`Are you sure you want to delete "${existingJob?.name}"? This cannot be undone.`}
                confirmText={`Delete ${t.job}`}
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
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Package Unavailable</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-slate-700 dark:text-slate-300 mb-4">
                                You cannot add <strong>{conflictWarning.kitName}</strong> because the following items are booked for these dates:
                            </p>
                            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 max-h-48 overflow-y-auto">
                                <ul className="space-y-2">
                                    {conflictWarning.items.map(item => (
                                        <li key={item.id} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                            <span className="text-red-500 font-bold">•</span>
                                            <span>{item.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                            <button 
                                onClick={() => setConflictWarning(null)}
                                className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-lg transition-colors"
                            >
                                Understood
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QUICK ADD PRODUCER MODAL */}
            {showProducerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Quick Add {t.producer}</h3>
                        </div>
                        <form onSubmit={handleQuickAddProducer} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 outline-none"
                                    placeholder={vertical === 'music' ? 'e.g. John Bandleader' : 'e.g. Sarah Producer'}
                                    value={newProducerName}
                                    onChange={e => setNewProducerName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Email (Optional)</label>
                                <input
                                    type="email"
                                    className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 outline-none"
                                    placeholder="email@example.com"
                                    value={newProducerEmail}
                                    onChange={e => setNewProducerEmail(e.target.value)}
                                />
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowProducerModal(false)}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAddingProducer}
                                    className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isAddingProducer ? 'Adding...' : `Add ${t.producer}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

             <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={() => navigateTo('JOB_LIST')}
                    className="flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 transition-colors font-semibold"
                >
                    <ArrowLeft size={16} />
                    Cancel
                </button>

                {isEditing && (
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 transition-colors font-semibold px-3 py-1 rounded hover:bg-red-100 dark:hover:bg-red-500/10"
                    >
                        <Trash2 size={16} />
                        Delete {t.job}
                    </button>
                )}
             </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{isEditing ? `Edit ${t.job}` : `Create New ${t.job}`}</h2>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info Section */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        {vertical === 'music' ? <Music size={20} /> : <Briefcase size={20} />} {t.job} Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">{t.job} Name</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">{t.producer}</label>
                            <div className="flex gap-2">
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                                    value={formData.producerId}
                                    onChange={e => setFormData({...formData, producerId: e.target.value})}
                                    required
                                >
                                    <option value="">-- Select {t.producer} --</option>
                                    {producers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setShowProducerModal(true)}
                                    className="bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 p-2 rounded-lg border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors"
                                    title={`Quick Add ${t.producer}`}
                                >
                                    <UserPlus size={20} />
                                </button>
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Status</label>
                            <select 
                                className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value as JobStatus})}
                            >
                                {Object.values(JobStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Start Date</label>
                            <input 
                                type="date" 
                                required
                                className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                                value={formData.startDate}
                                onChange={e => setFormData({...formData, startDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">End Date</label>
                            <input 
                                type="date" 
                                required
                                className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                                value={formData.endDate}
                                onChange={e => setFormData({...formData, endDate: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {/* Gear Selection Section */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700">
                     <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Plus size={20} /> Gear List
                    </h3>

                    {/* Quick Add Kits */}
                    <div className="mb-6">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Quick Add Kits:</p>
                        <div className="flex flex-wrap gap-2">
                            {state.kits.map(kit => {
                                const isUnavailable = formData.startDate && formData.endDate && kit.itemIds.some(id => checkConflicts(id));
                                return (
                                    <button 
                                        key={kit.id}
                                        type="button"
                                        onClick={() => handleAddKit(kit)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border flex items-center gap-1 ${
                                            isUnavailable 
                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-900/50' 
                                                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-sky-600 dark:text-sky-400 border-slate-200 dark:border-slate-600'
                                        }`}
                                        title={isUnavailable ? "Some items in this package are already booked" : ""}
                                    >
                                        {isUnavailable ? <AlertTriangle size={14}/> : <Plus size={14}/>} {kit.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Add Individual Item Search */}
                    <div className="relative mb-6">
                        <input 
                            type="text"
                            placeholder="Search item to add..."
                            className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                            value={itemSearch}
                            onChange={e => {
                                setItemSearch(e.target.value);
                                setShowItemDropdown(true);
                            }}
                            onFocus={() => setShowItemDropdown(true)}
                        />
                        {showItemDropdown && itemSearch && (
                            <div className="absolute z-10 w-full bg-white dark:bg-slate-700 mt-1 rounded-lg shadow-xl max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-600">
                                {filteredItems.length > 0 ? filteredItems.map(item => {
                                    const isAdded = formData.gearListIds.includes(item.id);
                                    const conflict = checkConflicts(item.id);
                                    const isDisabled = isAdded || conflict;
                                    
                                    return (
                                        <div 
                                            key={item.id}
                                            onClick={() => !isDisabled && handleAddItem(item.id)}
                                            className={`p-3 flex justify-between items-center border-b border-slate-100 dark:border-slate-600 last:border-b-0 ${
                                                isDisabled 
                                                ? 'bg-slate-50 dark:bg-slate-800/50 opacity-60 cursor-not-allowed' 
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer'
                                            }`}
                                        >
                                            <div>
                                                <p className="text-slate-900 dark:text-white font-medium">{item.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{item.category}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isAdded && (
                                                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                                                        <CheckCircle size={14}/> Added
                                                    </span>
                                                )}
                                                {conflict && !isAdded && (
                                                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                                                        <AlertTriangle size={14}/> Booked
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                }) : <div className="p-3 text-slate-500 dark:text-slate-400">No items found.</div>}
                            </div>
                        )}
                        {showItemDropdown && (
                            <div className="fixed inset-0 z-0" onClick={() => setShowItemDropdown(false)}></div>
                        )}
                    </div>

                    {/* Selected Gear List */}
                    <div>
                        {renderGroupedGearList()}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button 
                        type="submit" 
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg disabled:opacity-50"
                    >
                        <Save size={20} />
                        {isSaving ? 'Saving...' : (isEditing ? `Update ${t.job}` : `Create ${t.job}`)}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default JobFormScreen;
