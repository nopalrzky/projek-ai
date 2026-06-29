import { useCallback } from "react";

declare global {
    interface Window {
        google: any;
    }
}

interface ReverseGeocodeResult {
    provinceName: string | null;
    cityName: string | null;
    districtName: string | null;
    villageName: string | null;
    formattedAddress: string;
    addressComponents: any[];
}

export const useReverseGeocode = () => {
    const extractAdminAreas = useCallback(
        (
            components: any[],
        ): Partial<ReverseGeocodeResult> => {
            const result: Partial<ReverseGeocodeResult> = {
                provinceName: null,
                cityName: null,
                districtName: null,
                villageName: null,
            };

            components.forEach((component) => {
                const name = component.longText ?? component.long_name ?? "";
                const types: string[] = Array.isArray(component.types)
                    ? component.types.map((t: any) =>
                          typeof t === "string" ? t : t.toString(),
                      )
                    : [];

                if (types.includes("administrative_area_level_1")) {
                    result.provinceName = name;
                } else if (types.includes("administrative_area_level_2")) {
                    result.cityName = name;
                } else if (types.includes("administrative_area_level_3")) {
                    result.districtName = name;
                } else if (
                    types.includes("administrative_area_level_4") ||
                    types.includes("sublocality_level_1") ||
                    types.includes("neighborhood")
                ) {
                    result.villageName = name;
                }
            });

            return result;
        },
        [],
    );

    const reverseGeocode = useCallback(
        async (lat: number, lng: number): Promise<ReverseGeocodeResult | null> => {
            if (!window.google?.maps?.Geocoder) return null;

            const geocoder = new window.google.maps.Geocoder();
            try {
                const response = await geocoder.geocode({
                    location: { lat, lng },
                });
                if (response.results && response.results[0]) {
                    const result = response.results[0];
                    const adminAreas = extractAdminAreas(
                        result.address_components,
                    );
                    return {
                        ...adminAreas,
                        provinceName: adminAreas.provinceName || null,
                        cityName: adminAreas.cityName || null,
                        districtName: adminAreas.districtName || null,
                        villageName: adminAreas.villageName || null,
                        formattedAddress: result.formatted_address,
                        addressComponents: result.address_components,
                    };
                }
            } catch (error) {
                console.error("Reverse geocoding failed:", error);
            }
            return null;
        },
        [extractAdminAreas],
    );

    const fuzzyMatch = useCallback((source: string, target: string) => {
        if (!source || !target) return false;
        const expand = (str: string) =>
            str.toLowerCase()
                .replace(/\bkec\.\s*/g, "kecamatan ")
                .replace(/\bkel\.\s*/g, "kelurahan ")
                .replace(/\bkab\.\s*/g, "kabupaten ")
                .replace(/\btj\.\s*/g, "tanjung ")
                .replace(/^(kota|kabupaten|kecamatan|kelurahan|desa)\s+/, "")
                .trim();
        const s = expand(source);
        const t = expand(target);
        return s.includes(t) || t.includes(s);
    }, []);

    return { reverseGeocode, extractAdminAreas, fuzzyMatch };
};
