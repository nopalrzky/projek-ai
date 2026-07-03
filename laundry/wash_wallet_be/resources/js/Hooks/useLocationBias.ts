import { useState, useEffect, useCallback, useRef } from "react";

interface LocationBias {
    north: number;
    south: number;
    east: number;
    west: number;
}

interface UseLocationBiasProps {
    provinceName?: string | null;
    cityName?: string | null;
    districtName?: string | null;
    villageName?: string | null;
    isLoaded: boolean;
}

export const useLocationBias = ({
    provinceName,
    cityName,
    districtName,
    villageName,
    isLoaded,
}: UseLocationBiasProps) => {
    const [locationBias, setLocationBias] = useState<LocationBias | null>(null);
    const [isResolving, setIsResolving] = useState(false);
    const cache = useRef<{ [key: string]: LocationBias }>({});

    const resolveBias = useCallback(async () => {
        if (!isLoaded || !window.google?.maps?.Geocoder) return;

        const addressParts = [
            villageName,
            districtName,
            cityName,
            provinceName,
            "Indonesia",
        ].filter(Boolean);

        if (addressParts.length < 2) {
            setLocationBias(null);
            return;
        }

        const query = addressParts.join(", ");
        
        if (cache.current[query]) {
            setLocationBias(cache.current[query]);
            return;
        }

        setIsResolving(true);
        const geocoder = new window.google.maps.Geocoder();

        try {
            const response = await geocoder.geocode({ address: query });
            if (response.results && response.results[0]?.geometry?.viewport) {
                const viewport = response.results[0].geometry.viewport;
                const bias = {
                    north: viewport.getNorthEast().lat(),
                    east: viewport.getNorthEast().lng(),
                    south: viewport.getSouthWest().lat(),
                    west: viewport.getSouthWest().lng(),
                };
                cache.current[query] = bias;
                setLocationBias(bias);
            }
        } catch (error) {
            console.error("Geocoding failed for bias:", error);
            setLocationBias(null);
        } finally {
            setIsResolving(false);
        }
    }, [isLoaded, provinceName, cityName, districtName, villageName]);

    useEffect(() => {
        resolveBias();
    }, [resolveBias]);

    return { locationBias, isResolving };
};
