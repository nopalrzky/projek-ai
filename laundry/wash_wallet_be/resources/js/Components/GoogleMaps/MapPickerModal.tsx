import React, { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        google: any;
        initMap: () => void;
    }
}
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Navigation, MapPin, Search, Loader2, X } from "lucide-react";
import { useGeolocation } from "@/Hooks/useGeolocation";
import { useGooglePlacesAutocomplete } from "@/Hooks/useGooglePlacesAutocomplete";

interface MapPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (location: {
        latitude: number;
        longitude: number;
        address?: string;
        addressComponents?: any[];
    }) => void;
    initialLocation?: {
        latitude: number;
        longitude: number;
    };
    apiKey: string;
}

const MapPickerModal: React.FC<MapPickerModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    initialLocation,
    apiKey,
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [selectedLocation, setSelectedLocation] = useState(
        initialLocation || { latitude: -6.2088, longitude: 106.8456 },
    );
    const [address, setAddress] = useState("");
    const [addressComponents, setAddressComponents] = useState<any[]>([]);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);
    const { getCurrentPosition, isLoading: isLocating } = useGeolocation();
    const {
        suggestions,
        isLoading: isSearching,
        fetchSuggestions,
        getPlaceDetails,
        clearSuggestions,
        isLoaded: isApiLoaded,
    } = useGooglePlacesAutocomplete(apiKey);

    useEffect(() => {
        if (!isOpen) {
            setIsMapReady(false);
            return;
        }

        const timer = setTimeout(() => {
            setIsMapReady(true);
        }, 350);

        return () => clearTimeout(timer);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && initialLocation) {
            setSelectedLocation(initialLocation);
        }
    }, [isOpen, initialLocation]);

    useEffect(() => {
        if (
            !isApiLoaded ||
            !isOpen ||
            !isMapReady ||
            !mapRef.current ||
            googleMapRef.current
        )
            return;

        const google = window.google;
        const initialPos = {
            lat: selectedLocation.latitude,
            lng: selectedLocation.longitude,
        };

        const map = new google.maps.Map(mapRef.current, {
            center: initialPos,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            mapId: "DEMO_MAP_ID",
        });

        const marker = new google.maps.marker.AdvancedMarkerElement({
            position: initialPos,
            map: map,
            gmpDraggable: true,
        });

        googleMapRef.current = map;
        markerRef.current = marker;

        const resizeObserver = new ResizeObserver(() => {
            if (googleMapRef.current) {
                window.google.maps.event.trigger(
                    googleMapRef.current,
                    "resize",
                );
                googleMapRef.current.setCenter(initialPos);
            }
        });

        if (mapRef.current) {
            resizeObserver.observe(mapRef.current);
        }

        setTimeout(() => {
            if (googleMapRef.current) {
                window.google.maps.event.trigger(
                    googleMapRef.current,
                    "resize",
                );
                googleMapRef.current.setCenter(initialPos);
            }
        }, 100);

        marker.addListener("dragend", () => {
            const pos = marker.position as any;
            if (pos) {
                const newLoc = { latitude: pos.lat, longitude: pos.lng };
                setSelectedLocation(newLoc);
                reverseGeocode(newLoc);
            }
        });

        map.addListener("click", (e: any) => {
            const newLoc = {
                latitude: e.latLng.lat(),
                longitude: e.latLng.lng(),
            };
            marker.position = e.latLng;
            setSelectedLocation(newLoc);
            reverseGeocode(newLoc);
        });

        reverseGeocode(selectedLocation);

        return () => {
            resizeObserver.disconnect();
            googleMapRef.current = null;
            markerRef.current = null;
        };
    }, [isApiLoaded, isOpen, isMapReady]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchQuery(val);
        fetchSuggestions(val);
        setShowSuggestions(true);
    };

    const handleSuggestionClick = async (suggestion: any) => {
        setSearchQuery(suggestion.description);
        setShowSuggestions(false);
        const details = await getPlaceDetails(suggestion.placeId);
        if (details && googleMapRef.current && markerRef.current) {
            const pos = { lat: details.latitude, lng: details.longitude };
            googleMapRef.current.setCenter(pos);
            googleMapRef.current.setZoom(17);
            markerRef.current.position = pos;
            setSelectedLocation({
                latitude: details.latitude,
                longitude: details.longitude,
            });
            setAddress(details.formattedAddress);
            setAddressComponents(details.addressComponents || []);
        }
    };

    const reverseGeocode = async (pos: {
        latitude: number;
        longitude: number;
    }) => {
        if (!window.google?.maps?.Geocoder) return;
        setIsReverseGeocoding(true);
        const geocoder = new window.google.maps.Geocoder();
        try {
            const response = await geocoder.geocode({
                location: { lat: pos.latitude, lng: pos.longitude },
            });
            if (response.results && response.results[0]) {
                setAddress(response.results[0].formatted_address);
                setAddressComponents(response.results[0].address_components);
            }
        } catch (error) {
            console.error("Reverse geocoding failed:", error);
        } finally {
            setIsReverseGeocoding(false);
        }
    };

    const handleUseMyLocation = async () => {
        const pos = await getCurrentPosition();
        if (pos && googleMapRef.current && markerRef.current) {
            const googlePos = { lat: pos.latitude, lng: pos.longitude };
            googleMapRef.current.setCenter(googlePos);
            googleMapRef.current.setZoom(17);
            markerRef.current.position = googlePos;
            setSelectedLocation(pos);
            reverseGeocode(pos);
        }
    };

    const handleConfirm = () => {
        onConfirm({
            ...selectedLocation,
            address: address,
            addressComponents: addressComponents,
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" animation="fade">
            <ModalHeader
                title="Pilih Lokasi di Peta"
                icon={<MapPin className="w-5 h-5" />}
            />
            <ModalBody>
                <div className="space-y-4">
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] z-10">
                            {isSearching ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Search className="w-5 h-5" />
                            )}
                        </div>
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="Cari area atau alamat..."
                            className="w-full h-11 pl-11 pr-10 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none transition-all"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery("");
                                    clearSuggestions();
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--color-gray-100)] rounded-full transition-colors"
                            >
                                <X
                                    size={14}
                                    className="text-[var(--color-text-tertiary)]"
                                />
                            </button>
                        )}

                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                                {suggestions.map((s) => (
                                    <button
                                        key={s.placeId}
                                        type="button"
                                        className="w-full text-left p-3 hover:bg-[var(--color-gray-50)] flex items-start gap-3 border-b border-[var(--color-border)] last:border-0 transition-colors"
                                        onClick={() => handleSuggestionClick(s)}
                                    >
                                        <MapPin className="w-4 h-4 mt-0.5 text-[var(--color-text-tertiary)] flex-shrink-0" />
                                        <span className="text-sm text-[var(--color-text-primary)]">
                                            {s.description}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative h-[400px] rounded-xl overflow-hidden border border-[var(--color-border)]">
                        <div ref={mapRef} className="w-full h-full" />

                        <Button
                            variant="primary"
                            size="sm"
                            className="absolute bottom-6 right-6 shadow-xl"
                            onClick={handleUseMyLocation}
                            loading={isLocating}
                            leftIcon={<Navigation className="w-4 h-4" />}
                        >
                            Gunakan Lokasi Saya
                        </Button>

                        {!isApiLoaded && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-500)]" />
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-[var(--color-gray-50)] rounded-lg border border-[var(--color-border)]">
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-[var(--color-primary-600)] mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                                    Alamat Terpilih
                                </p>
                                <p className="text-sm text-[var(--color-text-primary)] mt-0.5 min-h-[1.25rem]">
                                    {isReverseGeocoding
                                        ? "Mencari alamat..."
                                        : address || "Pilih lokasi di peta..."}
                                </p>
                                <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1">
                                    Koordinat:{" "}
                                    {selectedLocation.latitude.toFixed(7)},{" "}
                                    {selectedLocation.longitude.toFixed(7)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button variant="outline" onClick={onClose}>
                    Batal
                </Button>
                <Button
                    variant="primary"
                    onClick={handleConfirm}
                    disabled={!isApiLoaded}
                >
                    Konfirmasi Lokasi
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default MapPickerModal;
