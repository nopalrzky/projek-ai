import { useState, useCallback } from "react";

interface GeolocationPosition {
    latitude: number;
    longitude: number;
}

interface UseGeolocationReturn {
    getCurrentPosition: () => Promise<GeolocationPosition | null>;
    isLoading: boolean;
    error: string | null;
}

export const useGeolocation = (): UseGeolocationReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getCurrentPosition = useCallback((): Promise<GeolocationPosition | null> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                setError("Geolocation tidak didukung oleh browser Anda.");
                resolve(null);
                return;
            }

            setIsLoading(true);
            setError(null);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setIsLoading(false);
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (err) => {
                    setIsLoading(false);
                    let message = "Gagal mengambil lokasi.";
                    switch (err.code) {
                        case err.PERMISSION_DENIED:
                            message = "Izin lokasi ditolak oleh pengguna.";
                            break;
                        case err.POSITION_UNAVAILABLE:
                            message = "Informasi lokasi tidak tersedia.";
                            break;
                        case err.TIMEOUT:
                            message = "Waktu permintaan lokasi habis.";
                            break;
                    }
                    setError(message);
                    resolve(null);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                }
            );
        });
    }, []);

    return { getCurrentPosition, isLoading, error };
};
