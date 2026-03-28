/**
 * Geocode an address/city/zip to lat/lng using Nominatim (OpenStreetMap).
 * Free, no API key required. Rate limited to 1 req/sec.
 */
export async function geocodeAddress(query: string): Promise<{ latitude: number; longitude: number; displayName: string } | null> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
            { headers: { 'User-Agent': 'GearBase/1.0' } }
        );
        const data = await res.json();
        if (data && data.length > 0) {
            return {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon),
                displayName: data[0].display_name,
            };
        }
        return null;
    } catch {
        return null;
    }
}
