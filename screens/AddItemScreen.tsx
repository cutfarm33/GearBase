
import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useVertical } from '../hooks/useVertical';
import { ItemStatus, ItemCondition } from '../types';
import { ArrowLeft, Save, X, Camera, Image as ImageIcon, Database, Check, Copy } from 'lucide-react';

const AddItemScreen: React.FC = () => {
  const { state, navigateTo, supabase, refreshData, uploadImage } = useAppContext();
  const { categories: verticalCategories, t, vertical } = useVertical();
  const [isSaving, setIsSaving] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Error Handling for Missing Columns
  const [showDbError, setShowDbError] = useState(false);
  const [copied, setCopied] = useState(false);

  // Suggest categories based on existing items AND vertical-specific predefined list
  const categories = Array.from(new Set([
      ...verticalCategories,
      ...state.inventory.map(i => i.category)
  ])).sort();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    qrCode: '',
    purchaseDate: '',
    value: '',
    weight: '',
    storageCase: '',
    imageUrl: '',
    notes: '',
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setSelectedFile(file);
          
          // Create local preview
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
          // Clear manual URL input to avoid confusion
          setFormData(prev => ({...prev, imageUrl: ''}));
      }
  };

  const copySql = () => {
      const sql = "alter table inventory add column if not exists weight numeric;\nalter table inventory add column if not exists storage_case text;";
      navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
        alert('Name and Category are required.');
        return;
    }

    setIsSaving(true);

    try {
        let finalImageUrl = formData.imageUrl;

        // Upload File if selected
        if (selectedFile) {
            try {
                finalImageUrl = await uploadImage(selectedFile);
            } catch (uploadErr: any) {
                console.error("Upload failed", uploadErr);
                // Ask user if they want to continue without image
                if (!confirm("Image upload failed: " + uploadErr.message + "\n\nDo you want to save the item without the image?")) {
                    setIsSaving(false);
                    return;
                }
            }
        }

        // Fallback image
        if (!finalImageUrl) {
            finalImageUrl = `https://picsum.photos/seed/${formData.name.replace(/[^a-zA-Z0-9]/g,'')}/200`;
        }

        // Get the organization ID for the new item
        const organizationId = state.currentUser?.active_organization_id || state.currentUser?.organization_id;
        if (!organizationId) {
            alert('Error: No organization found. Please log out and log back in.');
            setIsSaving(false);
            return;
        }

        const newItem = {
            name: formData.name,
            category: formData.category,
            qr_code: formData.qrCode || `GT-${Date.now()}`, // Auto-generate if empty
            status: ItemStatus.AVAILABLE,
            condition: ItemCondition.GOOD,
            purchase_date: formData.purchaseDate || null,
            value: formData.value ? parseFloat(formData.value) : null,
            weight: formData.weight ? parseFloat(formData.weight) : null,
            storage_case: formData.storageCase || null,
            image_url: finalImageUrl,
            notes: formData.notes || null,
            organization_id: organizationId,
        };

        const { error } = await supabase.from('inventory').insert(newItem);

        if (error) {
            // Check for "Undefined Column" error (42703) specifically for 'weight' or 'storage_case'
            if (error.code === '42703') {
                setShowDbError(true);
                setIsSaving(false);
                return;
            }
            throw error;
        }

        await refreshData();
        navigateTo('INVENTORY');

    } catch (error: any) {
        console.error("Error adding item:", error);
        alert('Failed to add item: ' + error.message);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      
      {/* DB ERROR MODAL */}
      {showDbError && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                      <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400">
                          <Database size={24} />
                      </div>
                      <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Database Update Needed</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">New columns (Weight/Case) are missing.</p>
                      </div>
                  </div>
                  
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/30">
                      <p className="text-slate-700 dark:text-slate-300 mb-4 text-sm">
                          Run this in your Supabase SQL Editor:
                      </p>
                      <div className="relative">
                          <pre className="bg-slate-900 text-slate-200 p-3 rounded text-xs font-mono overflow-x-auto border border-slate-700">
                              alter table inventory add column if not exists weight numeric;{'\n'}
                              alter table inventory add column if not exists storage_case text;
                          </pre>
                          <button 
                              onClick={copySql}
                              className="absolute top-2 right-2 p-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                          >
                              {copied ? <Check size={14} className="text-green-400"/> : <Copy size={14}/>}
                          </button>
                      </div>
                  </div>

                  <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                      <button 
                          onClick={() => setShowDbError(false)}
                          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg transition-colors"
                      >
                          Okay, I ran it
                      </button>
                  </div>
              </div>
          </div>
      )}

      <button 
        onClick={() => navigateTo('INVENTORY')}
        className="flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 mb-6 transition-colors font-semibold"
      >
        <ArrowLeft size={16} />
        Cancel
      </button>

      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Add New Equipment</h2>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 space-y-6 border border-slate-200 dark:border-slate-700">
        
        <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Item Name *</label>
            <input 
                type="text" 
                required
                className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                placeholder={vertical === 'music' ? 'e.g., Fender Stratocaster' : vertical === 'photo' ? 'e.g., Canon EOS R5' : vertical === 'general' ? 'e.g., MacBook Pro' : 'e.g., Canon C70 Body'}
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Category *</label>
                {isCustomCategory ? (
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            required
                            autoFocus
                            className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                            placeholder="Enter new category"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        />
                        <button 
                            type="button"
                            onClick={() => setIsCustomCategory(false)}
                            className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                            title="Select from list"
                        >
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    <select
                        required
                        className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                        value={formData.category}
                        onChange={(e) => {
                            if (e.target.value === '__NEW__') {
                                setIsCustomCategory(true);
                                setFormData({...formData, category: ''});
                            } else {
                                setFormData({...formData, category: e.target.value});
                            }
                        }}
                    >
                        <option value="">-- Select Category --</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        <option disabled>──────────</option>
                        <option value="__NEW__">+ Create New Category</option>
                    </select>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">QR/Barcode (Optional)</label>
                <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600 font-mono"
                    placeholder="Leave blank to auto-generate"
                    value={formData.qrCode}
                    onChange={e => setFormData({...formData, qrCode: e.target.value})}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Purchase Date</label>
                <input 
                    type="date" 
                    className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                    value={formData.purchaseDate}
                    onChange={e => setFormData({...formData, purchaseDate: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Value ($)</label>
                <input 
                    type="number"
                    min="0" 
                    step="0.01"
                    className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                    placeholder="0.00"
                    value={formData.value}
                    onChange={e => setFormData({...formData, value: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Weight (lbs)</label>
                <input 
                    type="number"
                    min="0" 
                    step="0.1"
                    className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                    placeholder="0.0"
                    value={formData.weight}
                    onChange={e => setFormData({...formData, weight: e.target.value})}
                />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Case / Bin Location</label>
            <input 
                type="text" 
                className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                placeholder="e.g. Lens Case A, Shelf 2"
                value={formData.storageCase}
                onChange={e => setFormData({...formData, storageCase: e.target.value})}
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-2">Photo</label>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Preview Area */}
                <div className="w-32 h-32 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-600 relative flex-shrink-0">
                    {previewUrl || formData.imageUrl ? (
                        <img src={previewUrl || formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="text-slate-400" size={32} />
                    )}
                    {(previewUrl || formData.imageUrl) && (
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedFile(null);
                                setPreviewUrl(null);
                                setFormData(prev => ({...prev, imageUrl: ''}));
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>

                <div className="flex-grow space-y-3">
                    {/* File Upload Button */}
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                    />
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg font-medium transition-colors"
                    >
                        <Camera size={18} /> Take Photo / Upload
                    </button>
                    
                    <div className="relative flex items-center py-1">
                        <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                        <span className="flex-shrink-0 mx-3 text-slate-400 text-xs">OR USE URL</span>
                        <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                    </div>

                    <input 
                        type="url" 
                        className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600 text-sm"
                        placeholder="https://example.com/image.jpg"
                        value={formData.imageUrl}
                        onChange={e => {
                            setFormData({...formData, imageUrl: e.target.value});
                            setSelectedFile(null);
                            setPreviewUrl(null);
                        }}
                        disabled={!!selectedFile}
                    />
                </div>
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Notes</label>
            <textarea 
                className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600 h-24"
                placeholder="Any initial notes about the item..."
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
            />
        </div>

        <div className="flex justify-end pt-4">
            <button 
                type="submit" 
                disabled={isSaving}
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg disabled:opacity-50"
            >
                <Save size={20} />
                {isSaving ? 'Uploading...' : 'Add Item'}
            </button>
        </div>

      </form>
    </div>
  );
};

export default AddItemScreen;
