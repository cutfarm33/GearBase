
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useVertical } from '../hooks/useVertical';
import { Plus, Edit, Trash2, Package, Search, Weight, FileText, Eye, X, DollarSign } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Kit, InventoryItem } from '../types';

const PackagesScreen: React.FC = () => {
    const { state, navigateTo, deleteKit } = useAppContext();
    const { t } = useVertical();

    // Derive singular form from plural (Packages -> Package, Kits -> Kit, Sets -> Set)
    const packageSingular = t.packages.endsWith('s') ? t.packages.slice(0, -1) : t.packages;

    const [search, setSearch] = useState('');
    const [kitToDelete, setKitToDelete] = useState<{id: number, name: string} | null>(null);
    const [previewKit, setPreviewKit] = useState<Kit | null>(null);

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
        doc.text(`${packageSingular} Contents - Generated: ${date}`, 14, 28);

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
                title={`Delete ${packageSingular}`}
                message={`Are you sure you want to delete "${kitToDelete?.name}"? This will remove the ${packageSingular.toLowerCase()} template, but will not affect ${t.jobPlural.toLowerCase()} that already used it.`}
                confirmText={`Delete ${packageSingular}`}
                isDestructive={true}
                onConfirm={handleDelete}
                onCancel={() => setKitToDelete(null)}
            />

            {/* Quick View Modal */}
            {previewKit && (() => {
                const items = previewKit.itemIds
                    .map(id => state.inventory.find(i => i.id === id))
                    .filter((item): item is InventoryItem => item !== undefined);

                const totalValue = items.reduce((sum, i) => sum + (i.value || 0), 0);
                const totalWeight = items.reduce((sum, i) => sum + (i.weight || 0), 0);

                // Group by category
                const byCategory: Record<string, InventoryItem[]> = {};
                items.forEach(item => {
                    if (!byCategory[item.category]) byCategory[item.category] = [];
                    byCategory[item.category].push(item);
                });

                return (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setPreviewKit(null)}>
                        <div
                            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Package size={24} />
                                    <div>
                                        <h3 className="text-xl font-bold">{previewKit.name}</h3>
                                        <p className="text-indigo-200 text-sm">{items.length} items</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setPreviewKit(null)}
                                    className="p-2 hover:bg-indigo-500 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Summary Stats */}
                            <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <DollarSign size={16} className="text-green-500" />
                                    <span className="font-medium">${totalValue.toLocaleString()}</span>
                                    <span className="text-slate-400">total value</span>
                                </div>
                                {totalWeight > 0 && (
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                        <Weight size={16} className="text-blue-500" />
                                        <span className="font-medium">{totalWeight.toFixed(1)} lbs</span>
                                    </div>
                                )}
                            </div>

                            {/* Items List */}
                            <div className="overflow-y-auto max-h-[50vh] p-4">
                                {Object.keys(byCategory).sort().map(category => (
                                    <div key={category} className="mb-4">
                                        <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                            {category} ({byCategory[category].length})
                                        </h4>
                                        <div className="space-y-2">
                                            {byCategory[category].sort((a, b) => a.name.localeCompare(b.name)).map(item => (
                                                <div
                                                    key={item.id}
                                                    className="flex justify-between items-center bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2"
                                                >
                                                    <div>
                                                        <span className="text-slate-900 dark:text-white font-medium">{item.name}</span>
                                                        <span className="text-xs text-slate-400 ml-2">{item.qrCode}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                            item.condition === 'Good' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            item.condition === 'Used but OK' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                            item.condition === 'In Repair' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                            {item.condition}
                                                        </span>
                                                        {item.value && (
                                                            <span className="text-slate-500 dark:text-slate-400">${item.value.toLocaleString()}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {items.length === 0 && (
                                    <div className="text-center py-8 text-slate-400">
                                        <Package size={32} className="mx-auto mb-2 opacity-50" />
                                        <p>No items in this {packageSingular.toLowerCase()}</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 border-t border-slate-200 dark:border-slate-600 flex gap-2 justify-end">
                                <button
                                    onClick={() => {
                                        downloadPackagePDF(previewKit);
                                    }}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <FileText size={16} />
                                    Download PDF
                                </button>
                                <button
                                    onClick={() => {
                                        navigateTo('PACKAGE_FORM', { kitId: previewKit.id });
                                        setPreviewKit(null);
                                    }}
                                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Edit size={16} />
                                    Edit {packageSingular}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t.packages}</h2>
                <button
                    onClick={() => navigateTo('PACKAGE_FORM')}
                    className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    <Plus size={20} />
                    Create {packageSingular}
                </button>
            </div>

            <div className="mb-6">
                 <div className="relative">
                     <input 
                        type="text"
                        placeholder={`Search ${t.packages.toLowerCase()}...`}
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
                            <div className="mb-4">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 w-fit">
                                    <Package size={24} />
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

                            <div className="flex flex-wrap gap-2 mb-4">
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

                            {/* Action Buttons - Centered at Bottom */}
                            <div className="flex justify-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <button
                                    onClick={() => setPreviewKit(kit)}
                                    className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                    title="Quick View"
                                >
                                    <Eye size={18} />
                                </button>
                                <button
                                    onClick={() => downloadPackagePDF(kit)}
                                    className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                    title="Download PDF"
                                >
                                    <FileText size={18} />
                                </button>
                                <button
                                    onClick={() => navigateTo('PACKAGE_FORM', { kitId: kit.id })}
                                    className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                                    title="Edit Package"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => setKitToDelete({id: kit.id, name: kit.name})}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete Package"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
                {filteredKits.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Package size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-semibold">No {t.packages.toLowerCase()} found.</p>
                        <p>Create standard {t.packages.toLowerCase()} to speed up your workflow.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PackagesScreen;
