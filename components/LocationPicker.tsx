import React, { useState } from 'react';
import { MapPin, Check, Loader2, Search } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { geocodeAddress } from '../lib/geocode';

interface LocationPickerProps {
    location: { latitude: number; longitude: number } | null;
    locationName: string;
    onLocationChange: (loc: { latitude: number; longitude: number } | null) => void;
    onLocationNameChange: (name: string) => void;
    compact?: boolean;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ location, locationName, onLocationChange, onLocationNameChange, compact }) => {
    const { getPosition, loading: geoLoading, error: geoError } = useGeolocation();
    const [geocoding, setGeocoding] = useState(false);
    const [geocodeError, setGeocodeError] = useState<string | null>(null);

    const handleGeocode = async () => {
        if (!locationName.trim()) return;
        setGeocoding(true);
        setGeocodeError(null);
        const result = await geocodeAddress(locationName.trim());
        if (result) {
            onLocationChange({ latitude: result.latitude, longitude: result.longitude });
            onLocationNameChange(locationName.trim());
        } else {
            setGeocodeError('Address not found. Try a city name, zip code, or full address.');
        }
        setGeocoding(false);
    };

    const handleGPS = async () => {
        const pos = await getPosition();
        if (pos) onLocationChange(pos);
    };

    const labelClass = compact
        ? 'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2'
        : 'block text-sm font-medium text-slate-500 dark:text-slate-300 mb-2';

    const inputClass = compact
        ? 'flex-1 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 outline-none'
        : 'flex-1 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600';

    const btnClass = 'flex items-center gap-1.5 px-3 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap text-sm';

    return (
        <div>
            <label className={labelClass}>
                {compact && <MapPin size={14} />}
                Location <span className={compact ? 'font-normal normal-case' : 'text-slate-400 font-normal'}>(optional)</span>
            </label>
            <div className="flex gap-2 mb-1">
                <input
                    type="text"
                    value={locationName}
                    onChange={(e) => { onLocationNameChange(e.target.value); setGeocodeError(null); }}
                    placeholder="City, zip, or address"
                    className={inputClass}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleGeocode(); } }}
                />
                <button
                    type="button"
                    onClick={handleGeocode}
                    disabled={geocoding || !locationName.trim()}
                    className={`${btnClass} bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-500 disabled:opacity-40`}
                    title="Search address"
                >
                    {geocoding ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                </button>
                <button
                    type="button"
                    onClick={handleGPS}
                    disabled={geoLoading || !!location}
                    className={`${btnClass} ${
                        location
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700'
                            : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-500'
                    }`}
                    title="Use GPS"
                >
                    {geoLoading ? <Loader2 size={14} className="animate-spin" /> : location ? <Check size={14} /> : <MapPin size={14} />}
                    {geoLoading ? '...' : location ? 'GPS' : 'GPS'}
                </button>
            </div>
            {location && (
                <p className="text-xs text-green-600 dark:text-green-400">
                    {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                    <button onClick={() => onLocationChange(null)} className="ml-2 text-slate-400 hover:text-red-500 underline">Clear</button>
                </p>
            )}
            {geocodeError && <p className="text-xs text-amber-500">{geocodeError}</p>}
            {geoError && !geocodeError && <p className="text-xs text-amber-500">{geoError}</p>}
        </div>
    );
};

export default LocationPicker;
