
import React, { useState, useEffect } from 'react';
import { supabase } from '../context/AppContext';
import { InventoryItem, PublicGallery, ItemStatus, ItemCondition } from '../types';
import { Camera, DollarSign, Tag, FileText, AlertCircle, Loader } from 'lucide-react';

interface PublicGalleryScreenProps {
    token?: string;
}

const ConditionBadge: React.FC<{ condition: ItemCondition }> = ({ condition }) => {
    const colorClasses: Record<ItemCondition, string> = {
        [ItemCondition.GOOD]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        [ItemCondition.USED]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        [ItemCondition.DAMAGED]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        [ItemCondition.IN_REPAIR]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        [ItemCondition.LOST]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        [ItemCondition.RETIRED]: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClasses[condition] || colorClasses[ItemCondition.GOOD]}`}>{condition}</span>;
};

const PublicGalleryScreen: React.FC<PublicGalleryScreenProps> = ({ token }) => {
    const [gallery, setGallery] = useState<PublicGallery | null>(null);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadGallery = async () => {
            if (!token) {
                setError('No gallery token provided');
                setLoading(false);
                return;
            }

            try {
                // Fetch gallery by token
                const { data: galleryData, error: galleryError } = await supabase
                    .from('public_galleries')
                    .select('*')
                    .eq('token', token)
                    .single();

                if (galleryError || !galleryData) {
                    setError('Gallery not found');
                    setLoading(false);
                    return;
                }

                if (!galleryData.is_enabled) {
                    setError('This gallery is currently disabled');
                    setLoading(false);
                    return;
                }

                setGallery(galleryData);

                // Fetch inventory items that are in the visible list
                if (galleryData.visible_item_ids && galleryData.visible_item_ids.length > 0) {
                    const { data: itemsData, error: itemsError } = await supabase
                        .from('inventory')
                        .select('*')
                        .in('id', galleryData.visible_item_ids)
                        .order('category')
                        .order('name');

                    if (itemsError) {
                        console.error('Error fetching items:', itemsError);
                    } else {
                        // Map database fields to frontend types
                        const formattedItems: InventoryItem[] = (itemsData || []).map((i: any) => ({
                            id: i.id,
                            name: i.name,
                            category: i.category,
                            status: i.status || ItemStatus.AVAILABLE,
                            condition: i.condition || ItemCondition.GOOD,
                            value: i.value || 0,
                            notes: i.notes || '',
                            imageUrl: i.image_url || '',
                            qrCode: i.qr_code || '',
                            weight: i.weight || 0,
                            purchaseDate: i.purchase_date,
                            serialNumber: i.serial_number,
                            manufacturer: i.manufacturer,
                            model: i.model,
                            organization_id: i.organization_id,
                            history: [],
                        }));
                        setItems(formattedItems);
                    }
                }
            } catch (err) {
                console.error('Error loading gallery:', err);
                setError('Failed to load gallery');
            } finally {
                setLoading(false);
            }
        };

        loadGallery();
    }, [token]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="animate-spin text-emerald-500 mx-auto mb-4" size={48} />
                    <p className="text-slate-500 dark:text-slate-400">Loading gallery...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} className="text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Gallery Not Available</h1>
                    <p className="text-slate-500 dark:text-slate-400">{error}</p>
                </div>
            </div>
        );
    }

    // Calculate stats
    const totalValue = items.reduce((sum, item) => sum + (item.value || 0), 0);
    const categories = [...new Set(items.map(i => i.category))];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                {gallery?.name || 'Collection'}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                {items.length} items • ${totalValue.toLocaleString()} total value
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 dark:text-slate-500">Powered by</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">Gear Base</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Items Grid */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {items.length === 0 ? (
                    <div className="text-center py-16">
                        <Camera size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">No items in this gallery yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map(item => (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {/* Image */}
                                <div className="aspect-square bg-slate-100 dark:bg-slate-700 relative">
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Camera size={48} className="text-slate-300 dark:text-slate-600" />
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="p-4">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2 line-clamp-2">
                                        {item.name}
                                    </h3>

                                    <div className="flex items-center gap-2 mb-3">
                                        <Tag size={14} className="text-slate-400" />
                                        <span className="text-sm text-slate-500 dark:text-slate-400">{item.category}</span>
                                    </div>

                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-1">
                                            <DollarSign size={16} className="text-emerald-500" />
                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                {item.value ? `$${item.value.toLocaleString()}` : 'N/A'}
                                            </span>
                                        </div>
                                        <ConditionBadge condition={item.condition} />
                                    </div>

                                    {item.notes && (
                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                                            <div className="flex items-start gap-2">
                                                <FileText size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                                    {item.notes}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-6 mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                        This is a read-only public gallery.
                        <a
                            href="https://mygearbase.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-500 hover:text-emerald-600 ml-1"
                        >
                            Learn more about Gear Base
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default PublicGalleryScreen;
