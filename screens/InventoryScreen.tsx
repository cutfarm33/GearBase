
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { InventoryItem, ItemStatus, ItemCondition, PREDEFINED_CATEGORIES } from '../types';
import { LayoutGrid, List, Plus, Upload, Trash2, CheckSquare, Square, Edit2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const StatusBadge: React.FC<{ status: ItemStatus }> = ({ status }) => {
  // Strict check for checked out status
  const isUnavailable = status === ItemStatus.CHECKED_OUT || status === ItemStatus.UNAVAILABLE;

  // ALWAYS display "UNAVAILABLE" if checked out
  const label = isUnavailable ? 'UNAVAILABLE' : status;

  const colorClasses = {
    [ItemStatus.AVAILABLE]: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 border-2 font-bold',
    // Unified Red Style for Unavailable
    'UNAVAILABLE': 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 border-2 font-bold',
    [ItemStatus.IN_MAINTENANCE]: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700 border-2 font-bold',
  };

  const styleKey = isUnavailable ? 'UNAVAILABLE' : (colorClasses[status] ? status : ItemStatus.AVAILABLE);

  return <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${colorClasses[styleKey]}`}>{label}</span>;
};


const InventoryScreen: React.FC = () => {
  const { state, navigateTo, supabase, refreshData, dispatch, deleteInventoryItem, updateInventoryItem } = useAppContext();
  const [filter, setFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Multi-select State
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Single Delete State
  const [itemToDelete, setItemToDelete] = useState<{id: number, name: string} | null>(null);

  // Inline Edit State
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  // Combine PREDEFINED categories with any custom ones used in the database
  const categories = ['All', ...Array.from(new Set([
      ...PREDEFINED_CATEGORIES,
      ...state.inventory.map(i => i.category)
  ])).sort()];

  const filteredInventory = state.inventory.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(filter.toLowerCase());
      const categoryMatch = categoryFilter === 'All' || item.category === categoryFilter;
      return nameMatch && categoryMatch;
  });

  // Selection Logic
  const allSelected = filteredInventory.length > 0 && filteredInventory.every(i => selectedIds.has(i.id));

  const toggleSelectAll = () => {
      const newSet = new Set(selectedIds);
      if (allSelected) {
          filteredInventory.forEach(i => newSet.delete(i.id));
      } else {
          filteredInventory.forEach(i => newSet.add(i.id));
      }
      setSelectedIds(newSet);
  };

  const toggleSelection = (id: number) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedIds(newSet);
  };

  const confirmDelete = (e: React.MouseEvent, item: InventoryItem) => {
      e.stopPropagation();
      setItemToDelete({ id: item.id, name: item.name });
  };

  const handleDelete = async () => {
      if (itemToDelete) {
          await deleteInventoryItem(itemToDelete.id);
          setItemToDelete(null);
      }
  };

  const handleBulkDelete = async () => {
      setIsBulkDeleting(true);
      try {
          const ids = Array.from(selectedIds);
          
          await supabase.from('job_items').delete().in('item_id', ids);
          await supabase.from('transaction_items').delete().in('item_id', ids);
          await supabase.from('kit_items').delete().in('item_id', ids);
          
          const { error } = await supabase.from('inventory').delete().in('id', ids);
          
          if (error) throw error;

          ids.forEach(id => dispatch({ type: 'DELETE_INVENTORY_ITEM_LOCAL', payload: id }));
          
          setSelectedIds(new Set());
          setShowBulkDeleteModal(false);
          await refreshData(true);
          
      } catch (err: any) {
          console.error("Bulk delete failed:", err);
          alert("Bulk delete failed: " + err.message);
      } finally {
          setIsBulkDeleting(false);
      }
  };

  const handleCategoryChange = async (item: InventoryItem, newCategory: string) => {
      setEditingCategoryId(null); // Close dropdown
      if (item.category === newCategory) return;

      const updatedItem = { ...item, category: newCategory };
      await updateInventoryItem(updatedItem);
  };

  return (
    <div>
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${itemToDelete?.name}"?`}
        confirmText="Delete"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setItemToDelete(null)}
      />

      <ConfirmModal
        isOpen={showBulkDeleteModal}
        title={`Delete ${selectedIds.size} Items`}
        message={`Are you sure you want to delete ${selectedIds.size} items? This cannot be undone.`}
        confirmText={isBulkDeleting ? "Deleting..." : "Delete All"}
        isDestructive={true}
        onConfirm={handleBulkDelete}
        onCancel={() => setShowBulkDeleteModal(false)}
      />

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">Inventory</h2>
            {selectedIds.size > 0 && (
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-bold border border-emerald-200 dark:border-emerald-700">
                    {selectedIds.size} selected
                </span>
            )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
            <div className="flex gap-3 w-full sm:w-auto transition-all duration-300">
                {selectedIds.size > 0 ? (
                    <button
                        onClick={() => setShowBulkDeleteModal(true)}
                        className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 animate-in slide-in-from-right-5"
                    >
                        <Trash2 size={20} />
                        Delete {selectedIds.size} Items
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() => navigateTo('ADD_ITEM')}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30"
                        >
                            <Plus size={20} />
                            Add Item
                        </button>
                        <button
                            onClick={() => navigateTo('IMPORT_INVENTORY')}
                            className="w-full sm:w-auto bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 px-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700 transition-all flex items-center justify-center gap-2"
                            title="Bulk Import from CSV/Excel"
                        >
                            <Upload size={20} />
                            Import
                        </button>
                    </>
                )}
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
                <input
                    type="text"
                    placeholder="Search inventory..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full border border-slate-200 dark:border-slate-700"
                />
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-200 dark:border-slate-700"
                >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1.5 self-start sm:self-auto shadow-sm">
                <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    title="Grid View"
                >
                    <LayoutGrid size={20} />
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    title="List View"
                >
                    <List size={20} />
                </button>
            </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredInventory.map((item: InventoryItem) => {
                  const isUnavailable = item.status === ItemStatus.CHECKED_OUT || item.status === ItemStatus.UNAVAILABLE;
                  return (
                    <div key={item.id} onClick={() => navigateTo('ITEM_DETAIL', { itemId: item.id, from: 'INVENTORY' })} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-slate-100 dark:border-slate-700 relative">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity" />

                        <button
                            onClick={(e) => confirmDelete(e, item)}
                            className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 p-2.5 rounded-xl text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:text-red-600 hover:bg-white dark:hover:bg-slate-800 shadow-lg"
                        >
                            <Trash2 size={18} />
                        </button>

                        <div className="p-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" title={item.name}>{item.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">{item.category}</p>
                            <div className="flex justify-between items-center">
                                <StatusBadge status={item.status} />
                                <span className={`text-xs font-semibold truncate ml-2 ${
                                    item.condition === ItemCondition.GOOD ? 'text-slate-500 dark:text-slate-400' :
                                    item.condition === ItemCondition.USED ? 'text-blue-600 dark:text-blue-400' :
                                    'text-amber-600 dark:text-amber-400'
                                }`}>{item.condition}</span>
                            </div>
                        </div>
                        {isUnavailable && <div className="absolute inset-0 bg-red-500/5 pointer-events-none border-2 border-red-500/20 rounded-3xl"></div>}
                    </div>
                  );
              })}
          </div>
      ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                        <tr>
                            <th scope="col" className="px-4 py-3 w-10">
                                <button
                                    onClick={toggleSelectAll}
                                    className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                    title="Select All"
                                >
                                    {allSelected ? <CheckSquare size={20} className="text-emerald-600 dark:text-emerald-400"/> : <Square size={20}/>}
                                </button>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Item</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Category</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">QR Code</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Condition</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredInventory.map((item: InventoryItem) => {
                            const isSelected = selectedIds.has(item.id);
                            const isEditingCategory = editingCategoryId === item.id;
                            const isUnavailable = item.status === ItemStatus.CHECKED_OUT || item.status === ItemStatus.UNAVAILABLE;

                            return (
                                <tr
                                    key={item.id}
                                    onClick={() => navigateTo('ITEM_DETAIL', { itemId: item.id, from: 'INVENTORY' })}
                                    className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-all ${isSelected ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''} ${isUnavailable ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}
                                >
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleSelection(item.id); }}
                                            className={`p-1 rounded-lg transition-colors ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'}`}
                                        >
                                            {isSelected ? <CheckSquare size={20}/> : <Square size={20}/>}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <img className="h-10 w-10 rounded object-cover" src={item.imageUrl} alt="" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                        {isEditingCategory ? (
                                            <select 
                                                autoFocus
                                                className="bg-white dark:bg-slate-800 border border-sky-500 rounded px-2 py-1 outline-none"
                                                value={item.category}
                                                onChange={(e) => handleCategoryChange(item, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                onBlur={() => setEditingCategoryId(null)}
                                            >
                                                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        ) : (
                                            <div 
                                                className="group/cat flex items-center gap-2 cursor-text hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                                                onClick={(e) => { e.stopPropagation(); setEditingCategoryId(item.id); }}
                                                title="Click to change category"
                                            >
                                                {item.category}
                                                <Edit2 size={12} className="opacity-0 group-hover/cat:opacity-100 transition-opacity" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-mono">{item.qrCode}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={item.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`${
                                            item.condition === ItemCondition.GOOD ? 'text-slate-500 dark:text-slate-400' :
                                            item.condition === ItemCondition.USED ? 'text-blue-600 dark:text-blue-400' :
                                            'text-red-600 dark:text-red-400'
                                        }`}>
                                            {item.condition}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={(e) => confirmDelete(e, item)}
                                            className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                            title="Delete Item"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
              </div>
          </div>
      )}
    </div>
  );
};

export default InventoryScreen;
