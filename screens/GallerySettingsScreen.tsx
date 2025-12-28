
import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { PublicGallery } from '../types';
import { Share2, Copy, Check, Eye, EyeOff, Camera, Save, ExternalLink, CheckSquare, Square, Loader, Tag } from 'lucide-react';

const GallerySettingsScreen: React.FC = () => {
    const { state, supabase, navigateTo } = useAppContext();
    const [gallery, setGallery] = useState<PublicGallery | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [galleryName, setGalleryName] = useState('My Collection');
    const [isEnabled, setIsEnabled] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
    const [categoryFilter, setCategoryFilter] = useState<string>('All');

    // Get unique categories from inventory
    const categories = useMemo(() => {
        const cats = [...new Set(state.inventory.map(i => i.category))].sort();
        return ['All', ...cats];
    }, [state.inventory]);

    // Filter items by category
    const filteredItems = useMemo(() => {
        if (categoryFilter === 'All') return state.inventory;
        return state.inventory.filter(i => i.category === categoryFilter);
    }, [state.inventory, categoryFilter]);

    // Select all items in current category
    const selectCategory = () => {
        const categoryItemIds = filteredItems.map(i => i.id);
        setSelectedItemIds(prev => {
            const newIds = new Set(prev);
            categoryItemIds.forEach(id => newIds.add(id));
            return Array.from(newIds);
        });
    };

    // Deselect all items in current category
    const deselectCategory = () => {
        const categoryItemIds = new Set(filteredItems.map(i => i.id));
        setSelectedItemIds(prev => prev.filter(id => !categoryItemIds.has(id)));
    };

    // Check if all items in current category are selected
    const allCategorySelected = filteredItems.length > 0 && filteredItems.every(i => selectedItemIds.includes(i.id));

    const organizationId = state.currentUser?.active_organization_id || state.currentUser?.organization_id;

    // Load gallery settings on mount
    useEffect(() => {
        const loadGallery = async () => {
            if (!organizationId) return;

            try {
                const { data, error } = await supabase
                    .from('public_galleries')
                    .select('*')
                    .eq('organization_id', organizationId)
                    .single();

                if (data) {
                    setGallery(data);
                    setGalleryName(data.name || 'My Collection');
                    setIsEnabled(data.is_enabled);
                    setSelectedItemIds(data.visible_item_ids || []);
                }
            } catch (err) {
                // No gallery yet, that's ok
            } finally {
                setLoading(false);
            }
        };

        loadGallery();
    }, [organizationId, supabase]);

    // Generate a unique token
    const generateToken = () => {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `${organizationId?.slice(0, 8) || 'gallery'}-${timestamp}-${random}`;
    };

    // Save gallery settings
    const handleSave = async () => {
        if (!organizationId) return;

        setSaving(true);

        try {
            if (gallery) {
                // Update existing gallery
                const { error } = await supabase
                    .from('public_galleries')
                    .update({
                        name: galleryName,
                        is_enabled: isEnabled,
                        visible_item_ids: selectedItemIds,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', gallery.id);

                if (error) throw error;

                setGallery({
                    ...gallery,
                    name: galleryName,
                    is_enabled: isEnabled,
                    visible_item_ids: selectedItemIds
                });
            } else {
                // Create new gallery
                const newToken = generateToken();
                const { data, error } = await supabase
                    .from('public_galleries')
                    .insert({
                        organization_id: organizationId,
                        token: newToken,
                        name: galleryName,
                        is_enabled: isEnabled,
                        visible_item_ids: selectedItemIds
                    })
                    .select()
                    .single();

                if (error) throw error;
                setGallery(data);
            }

            alert('Gallery settings saved!');
        } catch (err: any) {
            console.error('Error saving gallery:', err);
            if (err.message?.includes('does not exist')) {
                alert('Database table not found. Please run the public_galleries migration in Supabase SQL Editor.');
            } else {
                alert('Failed to save gallery settings: ' + err.message);
            }
        } finally {
            setSaving(false);
        }
    };

    // Copy link to clipboard
    const copyLink = () => {
        if (!gallery?.token) return;
        const link = `${window.location.origin}/#/gallery/${gallery.token}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Preview the gallery
    const previewGallery = () => {
        if (!gallery?.token) return;
        navigateTo('PUBLIC_GALLERY', { token: gallery.token });
    };

    // Toggle item selection
    const toggleItem = (itemId: number) => {
        setSelectedItemIds(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    // Select/deselect all items
    const toggleSelectAll = () => {
        if (selectedItemIds.length === state.inventory.length) {
            setSelectedItemIds([]);
        } else {
            setSelectedItemIds(state.inventory.map(i => i.id));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader className="animate-spin text-emerald-500" size={32} />
            </div>
        );
    }

    const shareableLink = gallery?.token ? `${window.location.origin}/#/gallery/${gallery.token}` : null;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <Share2 size={24} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Public Gallery</h2>
                    <p className="text-slate-500 dark:text-slate-400">Share your collection with a public link</p>
                </div>
            </div>

            {/* Settings Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Gallery Settings</h3>

                {/* Enable Toggle */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                    <div>
                        <p className="font-medium text-slate-900 dark:text-white">Enable Public Gallery</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Anyone with the link can view selected items</p>
                    </div>
                    <button
                        onClick={() => setIsEnabled(!isEnabled)}
                        className={`relative w-14 h-8 rounded-full transition-colors ${
                            isEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                    >
                        <span className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${
                            isEnabled ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                    </button>
                </div>

                {/* Gallery Name */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Gallery Name
                    </label>
                    <input
                        type="text"
                        value={galleryName}
                        onChange={(e) => setGalleryName(e.target.value)}
                        placeholder="My Collection"
                        className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                {/* Shareable Link */}
                {shareableLink && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Shareable Link
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={shareableLink}
                                className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 text-sm"
                            />
                            <button
                                onClick={copyLink}
                                className="px-4 py-3 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 rounded-lg transition-colors flex items-center gap-2"
                            >
                                {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} className="text-slate-600 dark:text-slate-300" />}
                            </button>
                            <button
                                onClick={previewGallery}
                                className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <ExternalLink size={18} />
                                Preview
                            </button>
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <Loader className="animate-spin" size={18} />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            Save Settings
                        </>
                    )}
                </button>
            </div>

            {/* Item Selection */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Select Items to Share</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {selectedItemIds.length} of {state.inventory.length} items selected
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={allCategorySelected ? deselectCategory : selectCategory}
                            className="text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5"
                        >
                            {allCategorySelected ? <EyeOff size={14} /> : <Eye size={14} />}
                            {allCategorySelected ? 'Deselect' : 'Select'} {categoryFilter === 'All' ? 'All' : categoryFilter}
                        </button>
                        <button
                            onClick={toggleSelectAll}
                            className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium flex items-center gap-1.5"
                        >
                            {selectedItemIds.length === state.inventory.length ? 'Clear All' : 'Select All'}
                        </button>
                    </div>
                </div>

                {/* Category Filter Tabs */}
                {categories.length > 2 && (
                    <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                        {categories.map(cat => {
                            const itemCount = cat === 'All'
                                ? state.inventory.length
                                : state.inventory.filter(i => i.category === cat).length;
                            const selectedCount = cat === 'All'
                                ? selectedItemIds.length
                                : state.inventory.filter(i => i.category === cat && selectedItemIds.includes(i.id)).length;

                            return (
                                <button
                                    key={cat}
                                    onClick={() => setCategoryFilter(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                        categoryFilter === cat
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                                >
                                    <Tag size={14} />
                                    {cat}
                                    <span className={`text-xs ${categoryFilter === cat ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'}`}>
                                        {selectedCount}/{itemCount}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {state.inventory.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <Camera size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No items in your inventory yet.</p>
                        <button
                            onClick={() => navigateTo('ADD_ITEM')}
                            className="mt-4 text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                        >
                            Add your first item
                        </button>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <Tag size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No items in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto">
                        {filteredItems.map(item => {
                            const isSelected = selectedItemIds.includes(item.id);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => toggleItem(item.id)}
                                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                        isSelected
                                            ? 'border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-800'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                                >
                                    {/* Image */}
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                            <Camera size={24} className="text-slate-400" />
                                        </div>
                                    )}

                                    {/* Selection Indicator */}
                                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                                        isSelected ? 'bg-emerald-500' : 'bg-white/80 dark:bg-slate-800/80'
                                    }`}>
                                        {isSelected ? (
                                            <Check size={14} className="text-white" />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-500" />
                                        )}
                                    </div>

                                    {/* Name Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                        <p className="text-white text-xs font-medium truncate">
                                            {item.name}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GallerySettingsScreen;
