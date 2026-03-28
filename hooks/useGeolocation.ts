import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

interface Position {
    latitude: number;
    longitude: number;
}

export function useGeolocation() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getPosition = async (): Promise<Position | null> => {
        setLoading(true);
        setError(null);
        try {
            if (Capacitor.isNativePlatform()) {
                const perm = await Geolocation.requestPermissions();
                if (perm.location !== 'granted') {
                    setError('Location permission denied');
                    setLoading(false);
                    return null;
                }
                const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
                setLoading(false);
                return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
            } else {
                return await new Promise<Position | null>((resolve) => {
                    if (!navigator.geolocation) {
                        setError('Geolocation not supported');
                        setLoading(false);
                        resolve(null);
                        return;
                    }
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            setLoading(false);
                            resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                        },
                        (err) => {
                            setError(err.message);
                            setLoading(false);
                            resolve(null);
                        },
                        { enableHighAccuracy: true, timeout: 10000 }
                    );
                });
            }
        } catch (err: any) {
            setError(err.message || 'Failed to get location');
            setLoading(false);
            return null;
        }
    };

    return { getPosition, loading, error };
}
