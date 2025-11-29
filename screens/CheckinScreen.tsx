
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ItemCondition, ItemStatus, TransactionItem, TransactionType, InventoryItem } from '../types';
import { CheckSquare, Square } from 'lucide-react';

interface CheckinItemState extends TransactionItem {
  scanned: boolean;
  name: string;
  originalCondition: ItemCondition;
}

const CheckinScreen: React.FC<{ jobId: number }> = ({ jobId }) => {
  const { state, createTransaction, findJob, findItem, navigateTo, supabase, refreshData } = useAppContext();
  const job = findJob(jobId);

  const getItemsForCheckin = (): InventoryItem[] => {
      const transaction = state.transactions.slice().reverse().find(t => t.jobId === jobId && t.type === TransactionType.CHECKOUT);
      if (transaction) {
          return transaction.items.map(i => findItem(i.itemId)).filter(Boolean) as InventoryItem[];
      }
      return job?.gearList.map(g => findItem(g.itemId)).filter(item => item && item.status === ItemStatus.CHECKED_OUT) as InventoryItem[] || [];
  };

  const [items, setItems] = useState<CheckinItemState[]>(() =>
    getItemsForCheckin().map(item => ({
      itemId: item.id,
      name: item.name,
      startCondition: item.condition, // this will be updated to endCondition
      originalCondition: item.condition,
      scanned: false,
      isMissing: false
    }))
  );

  const handleScanItem = (itemId: number) => {
    setItems(currentItems => currentItems.map(item =>
      item.itemId === itemId ? { ...item, scanned: true, isMissing: false } : item
    ));
  };
  
  const handleMarkMissing = (itemId: number) => {
      setItems(currentItems => currentItems.map(item =>
          item.itemId === itemId ? { ...item, isMissing: true, scanned: false } : item
      ));
  };

  const handleConditionChange = (itemId: number, condition: ItemCondition) => {
    setItems(currentItems => currentItems.map(item =>
      item.itemId === itemId ? { ...item, startCondition: condition } : item
    ));
  };

  const allScanned = items.length > 0 && items.every(i => i.scanned);

  const handleSelectAll = () => {
      setItems(currentItems => currentItems.map(item => ({
          ...item,
          scanned: !allScanned,
          isMissing: !allScanned ? false : item.isMissing
      })));
  };

  const handleCompleteCheckin = async () => {
      if (!state.currentUser) return;

      const processedItems = items.filter(i => i.scanned || i.isMissing);

      if (processedItems.length === 0) {
          alert("Please scan or select at least one item to check in.");
          return;
      }

      const success = await createTransaction(
          {
              jobId,
              type: TransactionType.CHECKIN,
              userId: state.currentUser.id,
              items: processedItems.map(i => ({
                  itemId: i.itemId,
                  startCondition: i.originalCondition,
                  endCondition: i.startCondition,
                  isMissing: i.isMissing,
                  notes: i.notes
              })),
          },
          processedItems.map(item => ({
              itemId: item.itemId,
              // STRICT STATUS LOGIC: If Missing -> UNAVAILABLE (or custom missing logic), If Returned -> AVAILABLE
              newStatus: item.isMissing ? ItemStatus.UNAVAILABLE : ItemStatus.AVAILABLE,
              newCondition: item.isMissing ? ItemCondition.LOST : item.startCondition,
              notes: item.notes,
          }))
      );

      if (success) {
          // Check if this is a quick use job and mark it as wrapped
          const isQuickUseJob = job?.name.startsWith('Quick Use:');

          if (isQuickUseJob) {
              // Mark the quick use job as WRAPPED after successful checkin
              const { error } = await supabase.from('jobs').update({ status: 'Wrapped' }).eq('id', jobId);
              if (!error) {
                  await refreshData(true);
              }

              alert('Check-in complete! Quick use job marked as complete.');
              navigateTo('JOB_LIST');
          } else {
              alert('Check-in complete!');
              navigateTo('JOB_DETAIL', { jobId });
          }
      }
  };
  
  if (!job) return <div>Job not found</div>;
  if (items.length === 0) return (
    <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check-In for "{job.name}"</h2>
        <p className="text-slate-500 dark:text-slate-400">No items are currently checked out for this job.</p>
    </div>
  );

  const processedCount = items.filter(i => i.scanned || i.isMissing).length;

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Check-In for "{job.name}"</h2>
            <p className="text-slate-500 dark:text-slate-400">Scan items as they are returned.</p>
          </div>
          <button 
              onClick={handleSelectAll}
              className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-2 mb-1"
          >
              {allScanned ? <CheckSquare size={18}/> : <Square size={18}/>}
              {allScanned ? 'Deselect All' : 'Select All'}
          </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {items.map(item => (
                  <li key={item.itemId} className={`p-4 transition-colors ${item.scanned ? 'bg-green-50 dark:bg-green-500/10' : ''} ${item.isMissing ? 'bg-red-50 dark:bg-red-500/10' : ''}`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex-grow">
                              <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                              <p className="text-xs text-slate-500">Original Condition: {item.originalCondition}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                              <select 
                                  value={item.startCondition}
                                  onChange={(e) => handleConditionChange(item.itemId, e.target.value as ItemCondition)}
                                  className="bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                              >
                                  {Object.values(ItemCondition).filter(c => c !== ItemCondition.RETIRED && c !== ItemCondition.LOST).map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                              <button 
                                onClick={() => handleScanItem(item.itemId)} 
                                className={`font-bold py-2 px-4 rounded-lg text-sm ${item.scanned ? 'bg-green-600 text-white shadow-inner' : 'bg-sky-500 hover:bg-sky-600 text-white'}`}
                              >
                                {item.scanned ? 'Returned' : 'Scan Return'}
                              </button>
                              <button 
                                onClick={() => handleMarkMissing(item.itemId)} 
                                className={`font-bold py-2 px-4 rounded-lg text-sm ${item.isMissing ? 'bg-red-700 text-white shadow-inner' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                              >
                                Missing
                              </button>
                          </div>
                      </div>
                  </li>
              ))}
          </ul>
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 mt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="container mx-auto flex justify-between items-center">
              <p className="font-bold text-slate-900 dark:text-white">{processedCount} / {items.length} items processed</p>
              <button
                  onClick={handleCompleteCheckin}
                  disabled={processedCount === 0}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
              >
                  Complete Check-In
              </button>
          </div>
      </div>
    </div>
  );
};

export default CheckinScreen;
