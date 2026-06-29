import { useState, useCallback, useEffect } from "react";
import axios from "axios";

interface Province {
    id: number;
    name: string;
}

interface Regency {
    id: number;
    name: string;
    province_id: number;
}

interface District {
    id: number;
    name: string;
    regency_id: number;
}

interface Village {
    id: number;
    name: string;
    district_id: number;
}

interface APIResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    meta?: {
        count: number;
        source: string;
        duration_ms: number;
    };
}

export const useLocationAPI = () => {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [regencies, setRegencies] = useState<Regency[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [villages, setVillages] = useState<Village[]>([]);

    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingRegencies, setLoadingRegencies] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingVillages, setLoadingVillages] = useState(false);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProvinces();
    }, []);

    const fetchProvinces = useCallback(async (): Promise<Province[]> => {
        setLoadingProvinces(true);
        setError(null);

        try {
            const response = await axios.get<APIResponse<Province>>(
                "/api/locations/provinces",
            );

            if (response.data.success) {
                setProvinces(response.data.data);
                return response.data.data;
            } else {
                throw new Error(
                    response.data.message || "Failed to fetch provinces",
                );
            }
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message || err.message
                : "Failed to fetch provinces";
            setError(errorMessage);
            console.error("Error fetching provinces:", err);
            return [];
        } finally {
            setLoadingProvinces(false);
        }
    }, []);

    const fetchRegencies = useCallback(
        async (provinceId: string | number): Promise<Regency[]> => {
            if (!provinceId) return [];

            setLoadingRegencies(true);
            setError(null);

            try {
                const response = await axios.get<APIResponse<Regency>>(
                    `/api/locations/regencies/${provinceId}`,
                );

                if (response.data.success) {
                    setRegencies(response.data.data);
                    return response.data.data;
                } else {
                    throw new Error(
                        response.data.message || "Failed to fetch regencies",
                    );
                }
            } catch (err) {
                const errorMessage = axios.isAxiosError(err)
                    ? err.response?.data?.message || err.message
                    : "Failed to fetch regencies";
                setError(errorMessage);
                console.error("Error fetching regencies:", err);
                setRegencies([]);
                return [];
            } finally {
                setLoadingRegencies(false);
            }
        },
        [],
    );

    const fetchDistricts = useCallback(
        async (regencyId: string | number): Promise<District[]> => {
            if (!regencyId) return [];

            setLoadingDistricts(true);
            setError(null);

            try {
                const response = await axios.get<APIResponse<District>>(
                    `/api/locations/districts/${regencyId}`,
                );

                if (response.data.success) {
                    setDistricts(response.data.data);
                    return response.data.data;
                } else {
                    throw new Error(
                        response.data.message || "Failed to fetch districts",
                    );
                }
            } catch (err) {
                const errorMessage = axios.isAxiosError(err)
                    ? err.response?.data?.message || err.message
                    : "Failed to fetch districts";
                setError(errorMessage);
                console.error("Error fetching districts:", err);
                setDistricts([]);
                return [];
            } finally {
                setLoadingDistricts(false);
            }
        },
        [],
    );

    const fetchVillages = useCallback(
        async (districtId: string | number): Promise<Village[]> => {
            if (!districtId) return [];

            setLoadingVillages(true);
            setError(null);

            try {
                const response = await axios.get<APIResponse<Village>>(
                    `/api/locations/villages/${districtId}`,
                );

                if (response.data.success) {
                    setVillages(response.data.data);
                    return response.data.data;
                } else {
                    throw new Error(
                        response.data.message || "Failed to fetch villages",
                    );
                }
            } catch (err) {
                const errorMessage = axios.isAxiosError(err)
                    ? err.response?.data?.message || err.message
                    : "Failed to fetch villages";
                setError(errorMessage);
                console.error("Error fetching villages:", err);
                setVillages([]);
                return [];
            } finally {
                setLoadingVillages(false);
            }
        },
        [],
    );

    const clearRegencies = useCallback(() => {
        setRegencies([]);
    }, []);

    const clearDistricts = useCallback(() => {
        setDistricts([]);
    }, []);

    const clearVillages = useCallback(() => {
        setVillages([]);
    }, []);

    const resetError = useCallback(() => {
        setError(null);
    }, []);

    return {
        provinces,
        regencies,
        districts,
        villages,

        loadingProvinces,
        loadingRegencies,
        loadingDistricts,
        loadingVillages,

        error,

        fetchProvinces,
        fetchRegencies,
        fetchDistricts,
        fetchVillages,
        clearRegencies,
        clearDistricts,
        clearVillages,
        resetError,
    };
};
