
import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { ItemCondition, TransactionItem, ItemStatus, TransactionType, User } from '../types';
import SignaturePad, { SignaturePadRef } from '../components/SignaturePad';
import { CheckSquare, Square } from 'lucide-react';

interface CheckoutItemState extends TransactionItem {
  scanned: boolean;
  name: string;
  status: ItemStatus;
}

const CheckoutScreen: React.FC<{ jobId: number }> = ({ jobId }) => {
  const { state, createTransaction, findJob, findItem, navigateTo } = useAppContext();
  const job = findJob(jobId);
  const signaturePadRef = useRef<SignaturePadRef>(null);
  
  // Get pre-selected items from navigation params
  const preSelectedIds: number[] = state.currentView.params?.preSelectedIds || [];
  
  const [items, setItems] = useState<CheckoutItemState[]>(() => 
    job?.gearList.map(({ itemId }) => {
      const item = findItem(itemId);
      // If Item is AVAILABLE and was selected in previous screen, mark as scanned
      const shouldPreSelect = preSelectedIds.includes(itemId) && item?.status === ItemStatus.AVAILABLE;
      
      return {
        itemId,
        name: item?.name || 'Unknown Item',
        startCondition: item?.condition || ItemCondition.GOOD,
        scanned: shouldPreSelect, 
        status: item?.status || ItemStatus.UNAVAILABLE
      };
    }) || []
  );
  
  const [assignedToId, setAssignedToId] = useState<string>(state.currentUser?.id || '');
  const [isSigning, setIsSigning] = useState(false);

  if (!job) return <div>Job not found</div>;

  const handleScanItem = (itemId: number) => {
    setItems(currentItems => currentItems.map(item =>
      item.itemId === itemId ? { ...item, scanned: !item.scanned } : item
    ));
  };

  const handleSelectAll = () => {
      const allAvailableAreScanned = items
          .filter(i => i.status === ItemStatus.AVAILABLE)
          .every(i => i.scanned);

      setItems(currentItems => currentItems.map(item => {
          // Only toggle available items
          if (item.status !== ItemStatus.AVAILABLE) return item;
          return { ...item, scanned: !allAvailableAreScanned };
      }));
  };

  const handleConditionChange = (itemId: number, condition: ItemCondition) => {
    setItems(currentItems => currentItems.map(item =>
      item.itemId === itemId ? { ...item, startCondition: condition } : item
    ));
  };
  
  const handleCompleteCheckout = async () => {
      if (!state.currentUser) return;
      
      const signature = signaturePadRef.current?.getSignature();
      if (!signature) {
          alert('Please provide a signature.');
          return;
      }

      const scannedItems = items.filter(i => i.scanned);

      const success = await createTransaction(
          {
              jobId,
              type: TransactionType.CHECKOUT,
              userId: state.currentUser.id,
              assignedToId,
              items: scannedItems,
              signature,
              organization_id: state.currentUser.organization_id,
          },
          scannedItems.map(item => ({
              itemId: item.itemId,
              newStatus: ItemStatus.CHECKED_OUT, // STRICT STATUS UPDATE
              newCondition: item.startCondition,
              notes: item.notes,
          }))
      );

      if (success) {
          alert('Checkout complete!');
          navigateTo('JOB_DETAIL', { jobId });
      }
  };

  const scannedCount = items.filter(i => i.scanned).length;
  const availableCount = items.filter(i => i.status === ItemStatus.AVAILABLE).length;

  if (isSigning) {
      return (
          <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Signature Confirmation</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">The person taking responsibility for the gear should sign below.</p>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 space-y-4 border border-slate-200 dark:border-slate-700">
                  <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-2">Responsible Party</label>
                      <select
                          value={assignedToId}
                          onChange={(e) => setAssignedToId(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                      >
                          {state.users.map((user: User) => <option key={user.id} value={user.id}>{user.name}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-2">Signature</label>
                      <div className="bg-slate-700 rounded-lg overflow-hidden">
                        <SignaturePad ref={signaturePadRef} />
                      </div>
                      <button onClick={() => signaturePadRef.current?.clearSignature()} className="text-xs text-sky-500 hover:underline mt-2">Clear</button>
                  </div>
                  <div className="flex gap-4 pt-4">
                      <button onClick={() => setIsSigning(false)} className="w-full bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-white font-bold py-3 px-4 rounded-lg transition-colors">Back</button>
                      <button onClick={handleCompleteCheckout} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">Confirm Checkout</button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div>
        <div className="flex justify-between items-end mb-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Check-Out for "{job.name}"</h2>
                <p className="text-slate-500 dark:text-slate-400">Review items and proceed to signature.</p>
            </div>
            <button 
                onClick={handleSelectAll}
                className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-2 mb-1"
            >
                {scannedCount === availableCount && availableCount > 0 ? <CheckSquare size={18}/> : <Square size={18}/>}
                {scannedCount === availableCount ? 'Deselect All' : 'Select All Available'}
            </button>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {items.map(item => {
                    const isAvailable = item.status === ItemStatus.AVAILABLE;
                    
                    return (
                        <li key={item.itemId} className={`p-4 transition-colors ${item.scanned ? 'bg-green-50 dark:bg-green-500/10' : ''} ${!isAvailable ? 'opacity-50 bg-slate-50 dark:bg-slate-900/50' : ''}`}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex-grow">
                                    <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                                    <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
                                        <span>ID: {item.itemId}</span>
                                        {!isAvailable && <span className="text-red-500 font-bold uppercase">({item.status === ItemStatus.CHECKED_OUT ? 'UNAVAILABLE' : item.status})</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <select 
                                        value={item.startCondition} 
                                        onChange={(e) => handleConditionChange(item.itemId, e.target.value as ItemCondition)}
                                        disabled={!isAvailable}
                                        className="bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600 disabled:opacity-50"
                                    >
                                        {Object.values(ItemCondition).filter(c => c !== ItemCondition.RETIRED && c !== ItemCondition.LOST).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <button 
                                        onClick={() => isAvailable && handleScanItem(item.itemId)} 
                                        disabled={!isAvailable}
                                        className={`font-bold py-2 px-4 rounded-lg text-sm min-w-[90px] ${
                                            item.scanned 
                                            ? 'bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-white' 
                                            : 'bg-sky-500 hover:bg-sky-600 text-white disabled:bg-slate-300 dark:disabled:bg-slate-700'
                                        }`}
                                    >
                                        {item.scanned ? 'Selected' : 'Select'}
                                    </button>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>

        <div className="sticky bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 mt-6 border-t border-slate-200 dark:border-slate-700 z-20">
            <div className="container mx-auto flex justify-between items-center">
                <p className="font-bold text-slate-900 dark:text-white">{scannedCount} items selected</p>
                <button 
                    onClick={() => setIsSigning(true)} 
                    disabled={scannedCount === 0}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    Proceed to Signature
                </button>
            </div>
        </div>
    </div>
  );
};

export default CheckoutScreen;
