
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Edit, Trash2, Package, Search, Weight, FileText } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Kit, InventoryItem } from '../types';

const PackagesScreen: React.FC = () => {
    const { state, navigateTo, deleteKit } = useAppContext();
    const [search, setSearch] = useState('');
    const [kitToDelete, setKitToDelete] = useState<{id: number, name: string} | null>(null);

    const filteredKits = state.kits.filter(k => 
        k.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async () => {
        if (kitToDelete) {
            await deleteKit(kitToDelete.id);
            setKitToDelete(null);
        }
    };

    // Download PDF for a specific package
    const downloadPackagePDF = (kit: Kit) => {
        const items = kit.itemIds
            .map(id => state.inventory.find(i => i.id === id))
            .filter((item): item is InventoryItem => item !== undefined);

        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.setTextColor(79, 70, 229); // Indigo color
        doc.text(kit.name, 14, 20);

        // Subtitle
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Package Contents - Generated: ${date}`, 14, 28);

        // Summary stats
        const totalValue = items.reduce((sum, i) => sum + (i.value || 0), 0);
        const totalWeight = items.reduce((sum, i) => sum + (i.weight || 0), 0);

        doc.setFontSize(9);
        doc.text(`Total Items: ${items.length}  |  Total Value: $${totalValue.toLocaleString()}  |  Total Weight: ${totalWeight.toFixed(1)} lbs`, 14, 35);

        // Group by category
        const byCategory: Record<string, InventoryItem[]> = {};
        items.forEach(item => {
            if (!byCategory[item.category]) byCategory[item.category] = [];
            byCategory[item.category].push(item);
        });

        let yPosition = 45;

        Object.keys(byCategory).sort().forEach(category => {
            const categoryItems = byCategory[category].sort((a, b) => a.name.localeCompare(b.name));

            // Category header
            doc.setFontSize(12);
            doc.setTextColor(30, 41, 59);
            doc.text(`${category} (${categoryItems.length})`, 14, yPosition);
            yPosition += 2;

            // Table for this category
            autoTable(doc, {
                startY: yPosition,
                head: [['Name', 'QR Code', 'Condition', 'Value', 'Weight']],
                body: categoryItems.map(item => [
                    item.name,
                    item.qrCode,
                    item.condition,
                    item.value ? `$${item.value.toLocaleString()}` : '-',
                    item.weight ? `${item.weight} lbs` : '-'
                ]),
                theme: 'striped',
                headStyles: {
                    fillColor: [79, 70, 229], // Indigo
                    fontSize: 8,
                    fontStyle: 'bold'
                },
                bodyStyles: { fontSize: 8 },
                columnStyles: {
                    0: { cellWidth: 60 },
                    1: { cellWidth: 35 },
                    2: { cellWidth: 30 },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 25 }
                },
                margin: { left: 14, right: 14 }
            });

            yPosition = (doc as any).lastAutoTable.finalY + 10;

            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
        });

        // Footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(`Gear Base - ${kit.name} - Page ${i} of ${pageCount}`, 14, 290);
        }

        const filename = `package_${kit.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
    };

    return (
        <div>
            <ConfirmModal 
                isOpen={!!kitToDelete}
                title="Delete Package"
                message={`Are you sure you want to delete "${kitToDelete?.name}"? This will remove the package template, but will not affect jobs that already used it.`}
                confirmText="Delete Package"
                isDestructive={true}
                onConfirm={handleDelete}
                onCancel={() => setKitToDelete(null)}
            />

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Packages</h2>
                <button 
                    onClick={() => navigateTo('PACKAGE_FORM')}
                    className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    <Plus size={20} />
                    Create Package
                </button>
            </div>

            <div className="mb-6">
                 <div className="relative">
                     <input 
                        type="text"
                        placeholder="Search packages..."
                        className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 pl-10 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                     />
                     <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredKits.map(kit => {
                    // Calculate Weight
                    const totalWeight = kit.itemIds.reduce((sum, id) => {
                        const item = state.inventory.find(i => i.id === id);
                        return sum + (item?.weight || 0);
                    }, 0);

                    return (
                        <div key={kit.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                    <Package size={24} />
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => downloadPackagePDF(kit)}
                                        className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"
                                        title="Download PDF"
                                    >
                                        <FileText size={18} />
                                    </button>
                                    <button
                                        onClick={() => navigateTo('PACKAGE_FORM', { kitId: kit.id })}
                                        className="p-2 text-slate-400 hover:text-sky-500 transition-colors"
                                        title="Edit Package"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => setKitToDelete({id: kit.id, name: kit.name})}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                        title="Delete Package"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{kit.name}</h3>
                            <div className="flex gap-4 mb-4">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{kit.itemIds.length} items</p>
                                {totalWeight > 0 && (
                                    <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
                                        <Weight size={14}/> {totalWeight.toFixed(1)} lbs
                                    </p>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {kit.itemIds.slice(0, 3).map(id => {
                                    const item = state.inventory.find(i => i.id === id);
                                    return item ? (
                                        <span key={id} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                                            {item.name}
                                        </span>
                                    ) : null;
                                })}
                                {kit.itemIds.length > 3 && (
                                    <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-1 rounded">
                                        +{kit.itemIds.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
                {filteredKits.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Package size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-semibold">No packages found.</p>
                        <p>Create standard kits to speed up your workflow.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PackagesScreen;
