
import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { ItemStatus, ItemCondition, PREDEFINED_CATEGORIES } from '../types';
import { ArrowLeft, Upload, AlertTriangle, FileText, Link as LinkIcon, Download, Tag } from 'lucide-react';

const ImportInventoryScreen: React.FC = () => {
  const { navigateTo, supabase, refreshData, state } = useAppContext();
  const [textInput, setTextInput] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);
  const [error, setError] = useState('');
  const [defaultCategory, setDefaultCategory] = useState('General');
  const [selectedFileName, setSelectedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get existing categories AND predefined ones for autocomplete
  const existingCategories = Array.from(new Set([
      ...PREDEFINED_CATEGORIES,
      ...state.inventory.map(i => i.category)
  ])).sort();

  // Handle file upload (CSV, TSV, Excel, JSON)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];

    if (!file) return;

    const fileName = file.name.toLowerCase();
    setSelectedFileName(file.name);

    // Handle JSON files
    if (fileName.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);
          convertJsonToCsv(jsonData);
        } catch (err) {
          setError('Invalid JSON file. Please check the format.');
        }
      };
      reader.onerror = () => {
        setError('Failed to read JSON file.');
      };
      reader.readAsText(file);
      return;
    }

    // Handle Excel files (.xlsx, .xls) - note: requires parsing library in production
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      setError('Excel files (.xlsx/.xls) are not directly supported. Please export as CSV from Excel: File → Save As → CSV');
      return;
    }

    // Handle text-based files (CSV, TSV, TXT)
    if (fileName.endsWith('.csv') || fileName.endsWith('.txt') || fileName.endsWith('.tsv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvText = event.target?.result as string;
        setTextInput(csvText);
        setError('');
      };
      reader.onerror = () => {
        setError('Failed to read file. Please try again.');
      };
      reader.readAsText(file);
      return;
    }

    setError('Unsupported file format. Please use CSV, TSV, TXT, or JSON files.');
  };

  // Convert JSON array to CSV text
  const convertJsonToCsv = (jsonData: any) => {
    try {
      // Handle array of objects
      if (Array.isArray(jsonData)) {
        if (jsonData.length === 0) {
          setError('JSON file is empty.');
          return;
        }

        // Extract headers from first object
        const headers = Object.keys(jsonData[0]);
        const csvLines = [headers.join(',')];

        // Convert each object to CSV row
        jsonData.forEach(item => {
          const row = headers.map(header => {
            const value = item[header] || '';
            // Escape commas and quotes
            const stringValue = String(value).replace(/"/g, '""');
            return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
          });
          csvLines.push(row.join(','));
        });

        setTextInput(csvLines.join('\n'));
        setError('');
      } else {
        setError('JSON must be an array of objects. Example: [{"name": "Camera", "category": "Equipment"}]');
      }
    } catch (err) {
      setError('Failed to convert JSON to CSV format.');
    }
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Fetch data from Google Sheet URL
  const fetchGoogleSheet = async () => {
      setError('');
      if (!sheetUrl) {
          setError('Please enter a Google Sheet URL.');
          return;
      }

      // Extract Spreadsheet ID using Regex
      const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!match || !match[1]) {
          setError('Invalid Google Sheet URL. It should look like: docs.google.com/spreadsheets/d/LONG_ID_HERE/...');
          return;
      }

      const spreadsheetId = match[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;

      setIsLoadingSheet(true);
      try {
          const response = await fetch(csvUrl);
          
          if (!response.ok) {
              throw new Error(`Failed to fetch. Status: ${response.status}`);
          }

          const csvText = await response.text();
          
          if (csvText.includes('<!DOCTYPE html>')) {
              throw new Error('Privacy Error: The sheet is likely private.');
          }

          setTextInput(csvText);
          setError(''); // Clear error on success
          // Optional: Automatically trigger parse?
          // parseText(csvText); 
      } catch (err) {
          console.error(err);
          setError('Could not download sheet data. Please ensure the sheet Sharing settings are set to "Anyone with the link" or "Published to Web".');
      } finally {
          setIsLoadingSheet(false);
      }
  };

  // Simple CSV/TSV Parser
  const parseText = () => {
    setError('');
    if (!textInput.trim()) {
        setError('Please paste some data or import a sheet first.');
        return;
    }

    // normalize line endings
    const normalizedText = textInput.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedText.split('\n');
    const data = [];
    
    // Heuristic to detect delimiter (comma or tab)
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';

    let startIndex = 0;
    const headerLower = firstLine.toLowerCase();
    
    // Mappings
    let nameIdx = 0;
    let catIdx = -1; // Default to -1 (not found)
    let valIdx = 2;
    let qrIdx = 3;
    let noteIdx = 4;

    // Basic Header Detection
    if (headerLower.includes('name')) {
        const headers = firstLine.split(delimiter).map(h => h.trim().toLowerCase());
        nameIdx = headers.findIndex(h => h.includes('name'));
        catIdx = headers.findIndex(h => h.includes('category') || h.includes('type'));
        valIdx = headers.findIndex(h => h.includes('value') || h.includes('price') || h.includes('cost'));
        qrIdx = headers.findIndex(h => h.includes('qr') || h.includes('barcode') || h.includes('serial'));
        noteIdx = headers.findIndex(h => h.includes('note') || h.includes('desc'));
        startIndex = 1; // Skip header row
    }

    for (let i = startIndex; i < lines.length; i++) {
        const row = lines[i].split(delimiter);
        // Handle cases where CSV row might have fewer columns than expected
        if (row.length < 1 || !row[0].trim()) continue;

        // Helper to safely get value
        const getVal = (idx: number) => (idx >= 0 && row[idx]) ? row[idx].trim().replace(/^"|"$/g, '') : '';

        const name = getVal(nameIdx);
        if (!name) continue; // Name is required

        // Logic: If category column exists and has value, use it. Otherwise use defaultCategory state.
        const categoryFromRow = getVal(catIdx);
        const finalCategory = categoryFromRow || defaultCategory;

        // Robust number parsing
        let parsedValue: number | null = null;
        const rawValue = getVal(valIdx);
        if (rawValue) {
            // Remove currency symbols and commas, keep digits and decimal
            const cleanValue = rawValue.replace(/[^0-9.]/g, '');
            const num = parseFloat(cleanValue);
            if (!isNaN(num)) {
                parsedValue = num;
            }
        }

        data.push({
            name: name,
            category: finalCategory,
            value: parsedValue,
            qr_code: getVal(qrIdx) || `GT-${Date.now()}-${i}`,
            notes: getVal(noteIdx) || '',
            status: ItemStatus.AVAILABLE,
            condition: ItemCondition.GOOD,
            image_url: `https://picsum.photos/seed/${name.replace(/\s/g,'')}/200`,
            organization_id: state.currentUser?.organization_id || '00000000-0000-0000-0000-000000000000',
            purchase_date: new Date().toISOString().split('T')[0] // Default to today
            // Note: history is not a database column, it's computed from transactions table
        });
    }

    if (data.length === 0) {
        setError('Could not parse any valid items. Ensure you have at least a "Name" column.');
    } else {
        setParsedData(data);
        setIsPreviewing(true);
    }
  };

  const handleImport = async () => {
      setIsUploading(true);
      setError(''); // Clear previous errors
      try {
          console.log('=== CSV IMPORT DEBUG ===');
          console.log('Current user organization_id:', state.currentUser?.organization_id);
          console.log('Starting import of', parsedData.length, 'items');
          console.log('Sample data with organization_id:', parsedData[0]);

          const { data, error } = await supabase.from('inventory').insert(parsedData).select();

          if (error) {
              console.error('Supabase insert error:', error);
              throw error;
          }

          console.log('Import successful! Inserted records:', data);
          console.log('Refreshing data...');
          await refreshData();
          console.log('Data refresh complete');
          alert(`Successfully imported ${parsedData.length} items! Check the Inventory screen.`);
          navigateTo('INVENTORY');
      } catch (err: any) {
          console.error('Import failed:', err);
          const errorMessage = err.message || err.toString() || 'Failed to upload data.';
          setError(`Import failed: ${errorMessage}`);
          alert(`Import failed: ${errorMessage}`); // Show alert for immediate feedback
      } finally {
          setIsUploading(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <button 
        onClick={() => navigateTo('INVENTORY')}
        className="flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 mb-6 transition-colors font-semibold"
      >
        <ArrowLeft size={16} />
        Cancel
      </button>

      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Bulk Import Inventory</h2>

      {!isPreviewing ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700 space-y-8">

            {/* Section 1: CSV File Upload */}
            <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Upload size={20} className="text-emerald-600"/> Upload CSV File
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    Upload a CSV file from your computer. Supports Excel exports and standard CSV files.
                </p>
                <div className="space-y-3">
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept=".csv,.txt,.tsv,.json"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <button
                            onClick={triggerFileUpload}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                        >
                            <Upload size={18}/> Choose File
                        </button>
                        {selectedFileName && (
                            <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                <FileText size={16} className="text-emerald-500"/>
                                {selectedFileName}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Supported formats: CSV, TSV, TXT, JSON
                    </p>
                </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700"></div>

            {/* Section 2: Google Sheet URL */}
            <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <LinkIcon size={20} className="text-green-600"/> Import from Google Sheet
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    Paste the URL of a Google Sheet. <span className="font-bold text-amber-600 dark:text-amber-400">Important:</span> You must set the Sheet's sharing permissions to <strong>"Anyone with the link"</strong> for this to work.
                </p>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        className="flex-grow bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        value={sheetUrl}
                        onChange={(e) => setSheetUrl(e.target.value)}
                    />
                    <button 
                        onClick={fetchGoogleSheet}
                        disabled={isLoadingSheet}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isLoadingSheet ? 'Fetching...' : <><Download size={18}/> Fetch Data</>}
                    </button>
                </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700"></div>

            {/* Section 2: Manual Paste */}
            <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <FileText size={20} className="text-sky-600"/> Or Paste CSV Data
                </h3>
                <div className="mb-3 p-4 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg">
                    <p className="text-sm text-sky-900 dark:text-sky-200 mb-2">
                        Copy and paste cells directly from Excel or Sheets.
                    </p>
                    <p className="text-sm text-sky-900 dark:text-sky-200 font-mono bg-white/50 dark:bg-black/20 p-2 rounded border border-sky-200 dark:border-sky-700">
                        Name, Category, Value, QR Code (Optional), Notes (Optional)
                    </p>
                </div>

                <textarea 
                    className="w-full h-48 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white p-4 rounded-lg border border-slate-300 dark:border-slate-600 font-mono text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder={`Camera A, Camera, 5000, CAM-001, Main camera body\nLens 50mm, Lens, 1200,, Great low light`}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                />
            </div>

            {/* Section 3: Default Category */}
            <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                 <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                     <Tag size={20} className="text-amber-500"/> Default Category
                 </h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                     If your data doesn't have a "Category" column, this category will be applied to all items.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="flex-grow w-full sm:w-1/2">
                        <input 
                            type="text" 
                            list="import-categories"
                            className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            placeholder="e.g. Camera, Lighting..."
                            value={defaultCategory}
                            onChange={(e) => setDefaultCategory(e.target.value)}
                        />
                        <datalist id="import-categories">
                            {existingCategories.map(c => <option key={c} value={c} />)}
                        </datalist>
                    </div>
                 </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 flex items-start gap-3">
                    <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5"/>
                    <div>
                        <p className="text-red-700 dark:text-red-300 font-bold text-sm">Import Error</p>
                        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                    </div>
                </div>
            )}

            <div className="flex justify-end">
                <button 
                    onClick={parseText}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg"
                >
                    Preview Data
                </button>
            </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Preview ({parsedData.length} items)</h3>
                <button 
                    onClick={() => setIsPreviewing(false)}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                    Edit Raw Data
                </button>
             </div>
             
             <div className="overflow-x-auto mb-6 border rounded-lg border-slate-200 dark:border-slate-700 max-h-96">
                 <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                     <thead className="bg-slate-50 dark:bg-slate-900/50">
                         <tr>
                             <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Category</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Value</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">QR Code</th>
                         </tr>
                     </thead>
                     <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                         {parsedData.map((item, idx) => (
                             <tr key={idx}>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{item.name}</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{item.category}</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{item.value ? `$${item.value}` : '-'}</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500 dark:text-slate-400">{item.qr_code}</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>

             {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

             <div className="flex justify-end gap-4">
                 <button 
                     onClick={() => setIsPreviewing(false)}
                     className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold py-3 px-6 rounded-lg transition-colors"
                     disabled={isUploading}
                 >
                     Back
                 </button>
                 <button 
                     onClick={handleImport}
                     disabled={isUploading}
                     className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg flex items-center gap-2"
                 >
                     {isUploading ? 'Importing...' : <><Upload size={20}/> Import Items</>}
                 </button>
             </div>
        </div>
      )}
    </div>
  );
};

export default ImportInventoryScreen;
