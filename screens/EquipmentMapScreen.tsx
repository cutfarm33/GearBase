import React, { useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ItemStatus, TransactionType } from '../types';
import { ArrowLeft, MapPin, Package, List } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationCluster {
    latitude: number;
    longitude: number;
    locationName?: string;
    jobName?: string;
    jobId?: number;
    assignedToName?: string;
    itemCount: number;
    categoryCounts: Record<string, number>;
    timestamp: string;
}

const EquipmentMapScreen: React.FC = () => {
    const { state, navigateTo, findItem, findJob } = useAppContext();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const [showList, setShowList] = React.useState(false);

    const clusters = useMemo(() => {
        const checkedOutItems = state.inventory.filter(i => i.status === ItemStatus.CHECKED_OUT);
        if (checkedOutItems.length === 0) return [];

        const locationMap = new Map<string, LocationCluster>();

        for (const item of checkedOutItems) {
            const tx = state.transactions
                .filter(t => t.type === TransactionType.CHECKOUT && t.latitude && t.longitude && t.items.some(ti => ti.itemId === item.id))
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

            if (!tx || !tx.latitude || !tx.longitude) continue;

            const key = `${tx.latitude.toFixed(4)},${tx.longitude.toFixed(4)}`;

            if (!locationMap.has(key)) {
                const job = tx.jobId ? findJob(tx.jobId) : undefined;
                locationMap.set(key, {
                    latitude: tx.latitude,
                    longitude: tx.longitude,
                    locationName: tx.locationName,
                    jobName: job?.name,
                    jobId: tx.jobId || undefined,
                    assignedToName: tx.assignedToName,
                    itemCount: 0,
                    categoryCounts: {},
                    timestamp: tx.timestamp,
                });
            }

            const cluster = locationMap.get(key)!;
            cluster.itemCount++;
            cluster.categoryCounts[item.category] = (cluster.categoryCounts[item.category] || 0) + 1;
        }

        return Array.from(locationMap.values());
    }, [state.inventory, state.transactions, findJob]);

    const totalItemsOnMap = clusters.reduce((sum, c) => sum + c.itemCount, 0);

    useEffect(() => {
        if (!mapRef.current || showList) return;

        if (!mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapRef.current).setView([39.8, -98.5], 4);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(mapInstanceRef.current);
        }

        const map = mapInstanceRef.current;

        map.eachLayer(layer => {
            if (layer instanceof L.Marker) map.removeLayer(layer);
        });

        const markers: L.Marker[] = [];
        clusters.forEach(cluster => {
            const size = cluster.itemCount > 99 ? 44 : cluster.itemCount > 9 ? 40 : 36;
            const icon = L.divIcon({
                className: '',
                html: `<div style="
                    background:#1e293b; color:white; border-radius:50%;
                    width:${size}px; height:${size}px; display:flex;
                    align-items:center; justify-content:center;
                    font-weight:bold; font-size:${cluster.itemCount > 99 ? 12 : 14}px;
                    border:3px solid white; box-shadow:0 2px 8px rgba(0,0,0,0.3);
                ">${cluster.itemCount}</div>`,
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2],
            });

            const categoryLines = Object.entries(cluster.categoryCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([cat, count]) => `<div style="display:flex;justify-content:space-between;font-size:12px;padding:2px 0;"><span>${cat}</span><span style="font-weight:600;margin-left:12px;">${count}</span></div>`)
                .join('');
            const moreCategories = Object.keys(cluster.categoryCounts).length > 6
                ? `<p style="font-size:11px;color:#94a3b8;">+${Object.keys(cluster.categoryCounts).length - 6} more categories</p>` : '';

            const popupContent = `
                <div style="min-width:180px;max-width:260px;">
                    ${cluster.locationName ? `<p style="font-weight:bold;font-size:14px;margin:0 0 4px;">${cluster.locationName}</p>` : ''}
                    ${cluster.jobName ? `<p style="font-size:12px;color:#64748b;margin:0 0 2px;">Job: ${cluster.jobName}</p>` : ''}
                    ${cluster.assignedToName ? `<p style="font-size:12px;color:#64748b;margin:0 0 6px;">With: ${cluster.assignedToName}</p>` : ''}
                    <p style="font-size:14px;font-weight:700;margin:0 0 6px;border-bottom:1px solid #e2e8f0;padding-bottom:4px;">${cluster.itemCount} items</p>
                    ${categoryLines}
                    ${moreCategories}
                    <p style="font-size:11px;color:#94a3b8;margin:6px 0 0;">${new Date(cluster.timestamp).toLocaleDateString()}</p>
                </div>
            `;

            const marker = L.marker([cluster.latitude, cluster.longitude], { icon })
                .bindPopup(popupContent)
                .addTo(map);
            markers.push(marker);
        });

        if (markers.length > 0) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.2));
        }
    }, [clusters, showList]);

    useEffect(() => {
        return () => {
            mapInstanceRef.current?.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    return (
        <div className="pb-6">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => navigateTo('DASHBOARD')}
                    className="flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 transition-colors font-semibold"
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
                <button
                    onClick={() => setShowList(!showList)}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-semibold px-3 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                    {showList ? <MapPin size={16} /> : <List size={16} />}
                    {showList ? 'Map View' : 'List View'}
                </button>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Equipment Map</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">
                {totalItemsOnMap > 0
                    ? `${totalItemsOnMap} item${totalItemsOnMap !== 1 ? 's' : ''} at ${clusters.length} location${clusters.length !== 1 ? 's' : ''}`
                    : 'No checked-out equipment with location data'}
            </p>

            {!showList ? (
                <div
                    ref={mapRef}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg"
                    style={{ height: 'calc(100vh - 220px)', minHeight: '400px' }}
                />
            ) : (
                <div className="space-y-3">
                    {clusters.length === 0 && (
                        <div className="text-center py-16 text-slate-400">
                            <MapPin size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No location data yet</p>
                            <p className="text-sm mt-1">Add a location during checkout using GPS or by entering an address.</p>
                        </div>
                    )}
                    {clusters.map((cluster, idx) => (
                        <div
                            key={idx}
                            onClick={() => cluster.jobId && navigateTo('JOB_DETAIL', { jobId: cluster.jobId })}
                            className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm ${cluster.jobId ? 'cursor-pointer hover:border-sky-300 dark:hover:border-sky-700 transition-colors' : ''}`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <MapPin size={16} className="text-sky-500" />
                                        {cluster.locationName || `${cluster.latitude.toFixed(4)}, ${cluster.longitude.toFixed(4)}`}
                                    </h3>
                                    {cluster.jobName && <p className="text-sm text-sky-500 mt-0.5">{cluster.jobName}</p>}
                                    {cluster.assignedToName && <p className="text-sm text-slate-500 dark:text-slate-400">With: {cluster.assignedToName}</p>}
                                </div>
                                <span className="flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                                    <Package size={14} /> {cluster.itemCount}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {Object.entries(cluster.categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([cat, count]) => (
                                    <span key={cat} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                                        {cat}: {count}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-slate-400 mt-2">{new Date(cluster.timestamp).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EquipmentMapScreen;
