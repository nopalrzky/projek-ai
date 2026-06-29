import { useState, useCallback, useRef, useEffect } from "react";

interface Suggestion {
    description: string;
    placeId: string;
}

interface PlaceDetails {
    latitude: number;
    longitude: number;
    formattedAddress: string;
    addressComponents: any[];
}

interface UseGooglePlacesAutocompleteReturn {
    suggestions: Suggestion[];
    isLoading: boolean;
    error: string | null;
    fetchSuggestions: (
        input: string,
        locationBias?: {
            north: number;
            south: number;
            east: number;
            west: number;
        },
    ) => void;
    getPlaceDetails: (placeId: string) => Promise<PlaceDetails | null>;
    clearSuggestions: () => void;
    isLoaded: boolean;
}

declare global {
    interface Window {
        google: any;
        initMap: () => void;
    }
}

export const useGooglePlacesAutocomplete = (
    apiKey: string,
): UseGooglePlacesAutocompleteReturn => {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const sessionToken = useRef<any>(null);

    useEffect(() => {
        if (!apiKey) return;
        if (window.google && window.google.maps && window.google.maps.places) {
            setIsLoaded(true);
            return;
        }

        if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
            const interval = setInterval(() => {
                if (
                    window.google &&
                    window.google.maps &&
                    window.google.maps.places
                ) {
                    setIsLoaded(true);
                    clearInterval(interval);
                }
            }, 200);
            return () => clearInterval(interval);
        }

        window.initMap = () => {
            setIsLoaded(true);
        };

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&v=beta&loading=async&callback=initMap`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
            setError("Gagal memuat Google Maps API.");
        };
        document.head.appendChild(script);
    }, [apiKey]);

    useEffect(() => {
        if (isLoaded && window.google?.maps?.places?.AutocompleteSessionToken) {
            sessionToken.current =
                new window.google.maps.places.AutocompleteSessionToken();
        }
    }, [isLoaded]);

    const fetchSuggestions = useCallback(
        async (input: string, locationBias?: {
            north: number;
            south: number;
            east: number;
            west: number;
        }) => {
            if (!input.trim() || !isLoaded || !window.google?.maps?.places) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const request: any = {
                    input,
                    sessionToken: sessionToken.current,
                    includedRegionCodes: ["id"],
                };

                if (locationBias) {
                    request.locationBias = locationBias;
                }

                const { suggestions: gmapSuggestions } =
                    await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
                        request,
                    );

                setSuggestions(
                    gmapSuggestions
                        .filter((s: any) => s.placePrediction)
                        .map((s: any) => ({
                            description: s.placePrediction.text.text,
                            placeId: s.placePrediction.placeId,
                        })),
                );
            } catch (err: any) {
                if (err?.message?.includes("ZERO_RESULTS")) {
                    setSuggestions([]);
                } else {
                    console.error("Autocomplete failed:", err);
                    setSuggestions([]);
                }
            } finally {
                setIsLoading(false);
            }
        },
        [isLoaded],
    );

    const getPlaceDetails = useCallback(
        async (placeId: string): Promise<PlaceDetails | null> => {
            if (!window.google?.maps?.places || !placeId) return null;

            try {
                const place = new window.google.maps.places.Place({
                    id: placeId,
                });
                await place.fetchFields({
                    fields: ["location", "formattedAddress", "addressComponents"],
                });

                sessionToken.current =
                    new window.google.maps.places.AutocompleteSessionToken();

                return {
                    latitude: place.location.lat(),
                    longitude: place.location.lng(),
                    formattedAddress: place.formattedAddress ?? "",
                    addressComponents: place.addressComponents ?? [],
                };
            } catch (err) {
                console.error("Place details failed:", err);
                return null;
            }
        },
        [],
    );

    const clearSuggestions = useCallback(() => {
        setSuggestions([]);
    }, []);

    return {
        suggestions,
        isLoading,
        error,
        fetchSuggestions,
        getPlaceDetails,
        clearSuggestions,
        isLoaded,
    };
};
