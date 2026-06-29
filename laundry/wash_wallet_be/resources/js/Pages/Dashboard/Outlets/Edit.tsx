import React, { useCallback, useEffect } from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Save,
    ArrowLeft,
    Building2,
    Mail,
    MapPin,
    Phone,
    Map,
    Navigation,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import { Input, TextAreaInput, SelectInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import PageHeader from "@/Components/Page/PageHeader";
import { useLocationAPI } from "@/Hooks/useLocationAPI";
import { useLocationBias } from "@/Hooks/useLocationBias";
import { useReverseGeocode } from "@/Hooks/useReverseGeocode";
import { useGooglePlacesAutocomplete } from "@/Hooks/useGooglePlacesAutocomplete";
import { OutletEditProps } from "./types";
import { OutletFormData } from "@/types";
import PlacesAutocompleteInput from "@/Components/GoogleMaps/PlacesAutocompleteInput";
import MapPickerModal from "@/Components/GoogleMaps/MapPickerModal";
import StaticMapPreview from "@/Components/GoogleMaps/StaticMapPreview";
import { useState } from "react";

const OutletsEdit = ({ outlet, googleMapsApiKey }: OutletEditProps) => {
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const {
        provinces,
        regencies,
        districts,
        villages,
        loadingProvinces,
        loadingRegencies,
        loadingDistricts,
        loadingVillages,
        error: locationError,
        fetchRegencies,
        fetchDistricts,
        fetchVillages,
        clearRegencies,
        clearDistricts,
        clearVillages,
        resetError,
    } = useLocationAPI();

    const { reverseGeocode, extractAdminAreas, fuzzyMatch } =
        useReverseGeocode();

    const { data, setData, put, processing, errors, isDirty, clearErrors } =
        useForm<OutletFormData>({
            name: outlet.name || "",
            email: outlet.email || "",
            phone: outlet.phone || "",
            provinceId: outlet.provinceId || null,
            provinceName: outlet.provinceName || "",
            cityId: outlet.cityId || null,
            cityName: outlet.cityName || "",
            districtId: outlet.districtId || null,
            districtName: outlet.districtName || "",
            villageId: outlet.villageId || null,
            villageName: outlet.villageName || "",
            street: outlet.street || "",
            isActive: outlet.status === "active",
            latitude: outlet.latitude || null,
            longitude: outlet.longitude || null,
        });

    useEffect(() => {
        const loadLocationHierarchy = async () => {
            try {
                if (data.provinceId) {
                    await fetchRegencies(data.provinceId.toString());
                    if (data.cityId) {
                        await fetchDistricts(data.cityId.toString());
                        if (data.districtId) {
                            await fetchVillages(data.districtId.toString());
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load location hierarchy:", error);
            }
        };

        if (outlet.provinceId || outlet.cityId || outlet.districtId) {
            loadLocationHierarchy();
        }
    }, [outlet, fetchRegencies, fetchDistricts, fetchVillages]);

    const {
        suggestions,
        isLoading: isSearching,
        fetchSuggestions,
        getPlaceDetails,
        clearSuggestions,
        isLoaded: isApiLoaded,
    } = useGooglePlacesAutocomplete(googleMapsApiKey);

    const { locationBias } = useLocationBias({
        provinceName: data.provinceName,
        cityName: data.cityName,
        districtName: data.districtName,
        villageName: data.villageName,
        isLoaded: isApiLoaded,
    });

    const handleDataChange = (key: keyof OutletFormData, value: any) => {
        setData(key as string, value);

        if (errors[key]) {
            clearErrors(key as string);
        }
    };

    const handleProvinceChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const provinceId = e.target.value;
            const provinceName = provinceId
                ? provinces.find((p) => p.id.toString() === provinceId)?.name ||
                  ""
                : "";

            setData((prev) => ({
                ...prev,
                provinceId: provinceId ? Number(provinceId) : null,
                provinceName: provinceName,
                cityId: null,
                cityName: "",
                districtId: null,
                districtName: "",
                villageId: null,
                villageName: "",
            }));

            clearRegencies();
            clearDistricts();
            clearVillages();
            resetError();

            if (errors.provinceId) {
                clearErrors("provinceId");
            }

            if (provinceId) {
                fetchRegencies(provinceId);
            }
        },
        [
            setData,
            provinces,
            fetchRegencies,
            clearRegencies,
            clearDistricts,
            clearVillages,
            resetError,
            errors.provinceId,
            clearErrors,
        ],
    );

    const handleCityChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const cityId = e.target.value;
            const cityName = cityId
                ? regencies.find((r) => r.id.toString() === cityId)?.name || ""
                : "";

            setData((prev) => ({
                ...prev,
                cityId: cityId ? Number(cityId) : null,
                cityName: cityName,
                districtId: null,
                districtName: "",
                villageId: null,
                villageName: "",
            }));

            clearDistricts();
            clearVillages();
            resetError();

            if (errors.cityId) {
                clearErrors("cityId");
            }

            if (cityId) {
                fetchDistricts(cityId);
            }
        },
        [
            setData,
            regencies,
            fetchDistricts,
            clearDistricts,
            clearVillages,
            resetError,
            errors.cityId,
            clearErrors,
        ],
    );

    const handleDistrictChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const districtId = e.target.value;
            const districtName = districtId
                ? districts.find((d) => d.id.toString() === districtId)?.name ||
                  ""
                : "";

            setData((prev) => ({
                ...prev,
                districtId: districtId ? Number(districtId) : null,
                districtName: districtName,
                villageId: null,
                villageName: "",
            }));

            clearVillages();
            resetError();

            if (errors.districtId) {
                clearErrors("districtId");
            }

            if (districtId) {
                fetchVillages(districtId);
            }
        },
        [
            setData,
            districts,
            fetchVillages,
            clearVillages,
            resetError,
            errors.districtId,
            clearErrors,
        ],
    );

    const handleVillageChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const villageId = e.target.value;
            const villageName = villageId
                ? villages.find((v) => v.id.toString() === villageId)?.name ||
                  ""
                : "";

            setData((prev) => ({
                ...prev,
                villageId: villageId ? Number(villageId) : null,
                villageName: villageName,
            }));

            if (errors.villageId) {
                clearErrors("villageId");
            }
        },
        [setData, villages, errors.villageId, clearErrors],
    );

    const autoFillAdminAreas = useCallback(
        async (addressComponents: any[]) => {
            if (!provinces || provinces.length === 0) return;
            const adminAreas = extractAdminAreas(addressComponents);

            if (adminAreas.provinceName) {
                const matchedProvince = provinces.find((p) =>
                    fuzzyMatch(p.name, adminAreas.provinceName!),
                );
                if (matchedProvince) {
                    setData((prev) => ({
                        ...prev,
                        provinceId: matchedProvince.id,
                        provinceName: matchedProvince.name,
                        cityId: null,
                        cityName: "",
                        districtId: null,
                        districtName: "",
                        villageId: null,
                        villageName: "",
                    }));

                    const fetchedRegencies = await fetchRegencies(
                        matchedProvince.id.toString(),
                    );

                    if (adminAreas.cityName && fetchedRegencies.length > 0) {
                        const matchedCity = fetchedRegencies.find((r) =>
                            fuzzyMatch(r.name, adminAreas.cityName!),
                        );
                        if (matchedCity) {
                            setData((prev) => ({
                                ...prev,
                                cityId: matchedCity.id,
                                cityName: matchedCity.name,
                                districtId: null,
                                districtName: "",
                                villageId: null,
                                villageName: "",
                            }));

                            const fetchedDistricts = await fetchDistricts(
                                matchedCity.id.toString(),
                            );

                            if (
                                adminAreas.districtName &&
                                fetchedDistricts.length > 0
                            ) {
                                const matchedDistrict = fetchedDistricts.find(
                                    (d) =>
                                        fuzzyMatch(
                                            d.name,
                                            adminAreas.districtName!,
                                        ),
                                );
                                if (matchedDistrict) {
                                    setData((prev) => ({
                                        ...prev,
                                        districtId: matchedDistrict.id,
                                        districtName: matchedDistrict.name,
                                        villageId: null,
                                        villageName: "",
                                    }));

                                    const fetchedVillages = await fetchVillages(
                                        matchedDistrict.id.toString(),
                                    );

                                    if (
                                        adminAreas.villageName &&
                                        fetchedVillages.length > 0
                                    ) {
                                        const matchedVillage =
                                            fetchedVillages.find((v) =>
                                                fuzzyMatch(
                                                    v.name,
                                                    adminAreas.villageName!,
                                                ),
                                            );
                                        if (matchedVillage) {
                                            setData((prev) => ({
                                                ...prev,
                                                villageId: matchedVillage.id,
                                                villageName:
                                                    matchedVillage.name,
                                            }));
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        [
            provinces,
            extractAdminAreas,
            fuzzyMatch,
            setData,
            fetchRegencies,
            fetchDistricts,
            fetchVillages,
        ],
    );

    const handlePlaceSelected = async (details: {
        latitude: number;
        longitude: number;
        formattedAddress: string;
        addressComponents?: any[];
    }) => {
        setData((prev) => ({
            ...prev,
            street: details.formattedAddress,
            latitude: details.latitude,
            longitude: details.longitude,
        }));

        if (details.addressComponents) {
            await autoFillAdminAreas(details.addressComponents);
        }
    };

    const handleMapLocationConfirmed = async (location: {
        latitude: number;
        longitude: number;
        address?: string;
        addressComponents?: any[];
    }) => {
        setData((prev) => ({
            ...prev,
            latitude: location.latitude,
            longitude: location.longitude,
            street: location.address || prev.street,
        }));

        if (location.addressComponents) {
            await autoFillAdminAreas(location.addressComponents);
        }
    };

    const handleUpdate = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            put(route("outlets.update", outlet.id), {
                preserveScroll: true,
                onSuccess: () => {
                    console.log("Outlet updated successfully");
                },
                onError: (errors) => {
                    console.error("Validation errors:", errors);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                },
            });
        },
        [outlet.id, put],
    );

    const provinceOptions = [
        { value: "", label: "Pilih Provinsi" },
        ...provinces.map((province) => ({
            value: province.id.toString(),
            label: province.name,
            icon: <Map className="w-4 h-4" />,
        })),
    ];

    const cityOptions = [
        {
            value: "",
            label: data.provinceId
                ? loadingRegencies
                    ? "Memuat kota/kabupaten..."
                    : "Pilih Kota/Kabupaten"
                : "Pilih provinsi terlebih dahulu",
        },
        ...regencies.map((regency) => ({
            value: regency.id.toString(),
            label: regency.name,
            icon: <MapPin className="w-4 h-4" />,
        })),
    ];

    const districtOptions = [
        {
            value: "",
            label: data.cityId
                ? loadingDistricts
                    ? "Memuat kecamatan..."
                    : "Pilih Kecamatan"
                : "Pilih kota/kabupaten terlebih dahulu",
        },
        ...districts.map((district) => ({
            value: district.id.toString(),
            label: district.name,
            icon: <MapPin className="w-4 h-4" />,
        })),
    ];

    const villageOptions = [
        {
            value: "",
            label: data.districtId
                ? loadingVillages
                    ? "Memuat kelurahan/desa..."
                    : "Pilih Kelurahan/Desa"
                : "Pilih kecamatan terlebih dahulu",
        },
        ...villages.map((village) => ({
            value: village.id.toString(),
            label: village.name,
            icon: <MapPin className="w-4 h-4" />,
        })),
    ];

    return (
        <>
            <Head title={`Edit Outlet - ${outlet.name}`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title={`Edit Outlet - ${outlet.name}`}
                        subtitle={
                            <div className="flex items-center gap-2">
                                <span>
                                    Perbarui informasi outlet "{outlet.name}"
                                </span>
                                <Badge
                                    variant={
                                        outlet.status === "active"
                                            ? "success"
                                            : "secondary"
                                    }
                                >
                                    {outlet.status === "active"
                                        ? "Aktif"
                                        : "Nonaktif"}
                                </Badge>
                            </div>
                        }
                        icon={Building2}
                        animate={true}
                        actions={
                            <Button
                                variant="outline"
                                onClick={() => window.history.back()}
                                disabled={processing}
                                leftIcon={<ArrowLeft className="w-4 h-4" />}
                            >
                                Kembali
                            </Button>
                        }
                    />

                    {locationError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Alert
                                variant="error"
                                title="Gagal Memuat Data Lokasi"
                                description={locationError}
                            />
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Card className="p-8">
                            <Form onSubmit={handleUpdate} className="space-y-8">
                                <div className="space-y-6">
                                    <div
                                        className="flex items-center gap-3 pb-4 border-b"
                                        style={{
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        <div
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-primary-100)",
                                            }}
                                        >
                                            <Building2
                                                className="w-6 h-6"
                                                style={{
                                                    color: "var(--color-primary-600)",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h2
                                                className="text-xl font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Informasi Dasar Outlet
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Perbarui informasi dasar outlet
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Nama Outlet"
                                            placeholder="Contoh: Laundry Bersih Jakarta Pusat"
                                            value={data.name}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "name",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.name}
                                            required
                                            disabled={processing}
                                            leftIcon={
                                                <Building2 className="w-5 h-5" />
                                            }
                                            hint="Nama yang akan ditampilkan untuk outlet ini"
                                        />

                                        <Input
                                            label="Email Outlet"
                                            type="email"
                                            placeholder="outlet@example.com"
                                            value={data.email || ""}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "email",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.email}
                                            disabled={processing}
                                            leftIcon={
                                                <Mail className="w-5 h-5" />
                                            }
                                            hint="Email untuk login dan komunikasi"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div
                                        className="flex items-center gap-3 pb-4 border-b"
                                        style={{
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        <div
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-primary-100)",
                                            }}
                                        >
                                            <MapPin
                                                className="w-6 h-6"
                                                style={{
                                                    color: "var(--color-primary-600)",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h2
                                                className="text-xl font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Lokasi Outlet
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Perbarui lokasi lengkap tempat
                                                outlet berada
                                            </p>
                                        </div>
                                    </div>

                                    {(outlet.provinceName ||
                                        outlet.cityName ||
                                        outlet.districtName ||
                                        outlet.villageName) && (
                                        <div
                                            className="p-4 rounded-lg border"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-gray-50)",
                                                borderColor:
                                                    "var(--color-border)",
                                            }}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin
                                                    className="w-4 h-4"
                                                    style={{
                                                        color: "var(--color-text-quaternary)",
                                                    }}
                                                />
                                                <span
                                                    className="text-sm font-medium"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Lokasi Saat Ini:
                                                </span>
                                            </div>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {[
                                                    outlet.villageName,
                                                    outlet.districtName,
                                                    outlet.cityName,
                                                    outlet.provinceName,
                                                ]
                                                    .filter(Boolean)
                                                    .join(", ")}
                                            </p>
                                            {outlet.street && (
                                                <p
                                                    className="text-sm mt-1"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    {outlet.street}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {(data.provinceName ||
                                        data.cityName ||
                                        data.districtName ||
                                        data.villageName) &&
                                        (data.provinceName !==
                                            outlet.provinceName ||
                                            data.cityName !== outlet.cityName ||
                                            data.districtName !==
                                                outlet.districtName ||
                                            data.villageName !==
                                                outlet.villageName) && (
                                            <div
                                                className="p-4 rounded-lg border"
                                                style={{
                                                    backgroundColor:
                                                        "var(--color-primary-50)",
                                                    borderColor:
                                                        "var(--color-primary-200)",
                                                }}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <MapPin
                                                        className="w-4 h-4"
                                                        style={{
                                                            color: "var(--color-primary-600)",
                                                        }}
                                                    />
                                                    <span
                                                        className="text-sm font-medium"
                                                        style={{
                                                            color: "var(--color-primary-700)",
                                                        }}
                                                    >
                                                        Lokasi Baru:
                                                    </span>
                                                </div>
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-primary-800)",
                                                    }}
                                                >
                                                    {[
                                                        data.villageName,
                                                        data.districtName,
                                                        data.cityName,
                                                        data.provinceName,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(", ")}
                                                </p>
                                            </div>
                                        )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SelectInput
                                            label="Provinsi"
                                            value={
                                                data.provinceId?.toString() ||
                                                ""
                                            }
                                            onChange={handleProvinceChange}
                                            options={provinceOptions}
                                            placeholder="Pilih Provinsi"
                                            searchable={true}
                                            loading={loadingProvinces}
                                            disabled={
                                                processing || loadingProvinces
                                            }
                                            error={errors.provinceId}
                                            hint="Pilih provinsi terlebih dahulu"
                                        />

                                        <SelectInput
                                            label="Kota/Kabupaten"
                                            value={
                                                data.cityId?.toString() || ""
                                            }
                                            onChange={handleCityChange}
                                            options={cityOptions}
                                            placeholder="Pilih Kota/Kabupaten"
                                            searchable={true}
                                            loading={loadingRegencies}
                                            disabled={
                                                processing ||
                                                loadingRegencies ||
                                                !data.provinceId
                                            }
                                            error={errors.cityId}
                                            hint={
                                                !data.provinceId
                                                    ? "Pilih provinsi terlebih dahulu"
                                                    : "Pilih kota atau kabupaten"
                                            }
                                        />

                                        <SelectInput
                                            label="Kecamatan"
                                            value={
                                                data.districtId?.toString() ||
                                                ""
                                            }
                                            onChange={handleDistrictChange}
                                            options={districtOptions}
                                            placeholder="Pilih Kecamatan"
                                            searchable={true}
                                            loading={loadingDistricts}
                                            disabled={
                                                processing ||
                                                loadingDistricts ||
                                                !data.cityId
                                            }
                                            error={errors.districtId}
                                            hint={
                                                !data.cityId
                                                    ? "Pilih kota/kabupaten terlebih dahulu"
                                                    : "Pilih kecamatan (opsional)"
                                            }
                                        />

                                        <SelectInput
                                            label="Kelurahan/Desa"
                                            value={
                                                data.villageId?.toString() || ""
                                            }
                                            onChange={handleVillageChange}
                                            options={villageOptions}
                                            placeholder="Pilih Kelurahan/Desa"
                                            searchable={true}
                                            loading={loadingVillages}
                                            disabled={
                                                processing ||
                                                loadingVillages ||
                                                !data.districtId
                                            }
                                            error={errors.villageId}
                                            hint={
                                                !data.districtId
                                                    ? "Pilih kecamatan terlebih dahulu"
                                                    : "Pilih kelurahan/desa (opsional)"
                                            }
                                        />
                                    </div>

                                    <div className="space-y-4 pt-4 border-t">
                                        <div className="flex flex-col md:flex-row gap-4 items-end">
                                            <div className="flex-1">
                                                <PlacesAutocompleteInput
                                                    apiKey={googleMapsApiKey}
                                                    label="Alamat Jalan"
                                                    placeholder="Cari alamat atau ketik manual..."
                                                    value={data.street || ""}
                                                    onChange={(val) =>
                                                        handleDataChange(
                                                            "street",
                                                            val,
                                                        )
                                                    }
                                                    onPlaceSelected={
                                                        handlePlaceSelected
                                                    }
                                                    error={errors.street?.[0]}
                                                    disabled={processing}
                                                    locationBias={locationBias}
                                                    hint="Ketik alamat atau pilih dari saran"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="primary"
                                                size="lg"
                                                onClick={() =>
                                                    setIsMapModalOpen(true)
                                                }
                                                disabled={processing}
                                                className="h-11 px-6"
                                                leftIcon={
                                                    <MapPin className="w-4 h-4" />
                                                }
                                            >
                                                Pilih di Peta
                                            </Button>
                                        </div>

                                        {data.latitude && data.longitude && (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    height: 0,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    height: "auto",
                                                }}
                                                className="space-y-3"
                                            >
                                                <StaticMapPreview
                                                    latitude={data.latitude}
                                                    longitude={data.longitude}
                                                    apiKey={googleMapsApiKey}
                                                />
                                                <div className="flex items-center justify-between px-1">
                                                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                                                        <Navigation className="w-3.5 h-3.5" />
                                                        <span>
                                                            Koordinat:{" "}
                                                            {data.latitude.toFixed(
                                                                6,
                                                            )}
                                                            ,{" "}
                                                            {data.longitude.toFixed(
                                                                6,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs font-medium hover:underline flex items-center gap-1"
                                                        style={{
                                                            color: "var(--color-primary-600)",
                                                        }}
                                                    >
                                                        Lihat di Google Maps ↗
                                                    </a>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div
                                        className="flex items-center gap-3 pb-4 border-b"
                                        style={{
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        <div
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-primary-100)",
                                            }}
                                        >
                                            <Phone
                                                className="w-6 h-6"
                                                style={{
                                                    color: "var(--color-primary-600)",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h2
                                                className="text-xl font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Detail Kontak
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Informasi kontak tambahan
                                                (opsional)
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <Input
                                            label="Nomor Telepon"
                                            type="tel"
                                            placeholder="Contoh: 08123456789"
                                            value={data.phone || ""}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "phone",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.phone}
                                            disabled={processing}
                                            leftIcon={
                                                <Phone className="w-5 h-5" />
                                            }
                                            hint="Nomor telepon untuk dihubungi (opsional)"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div
                                        className="flex items-center gap-3 pb-4 border-b"
                                        style={{
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        <div
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-primary-100)",
                                            }}
                                        >
                                            <Building2
                                                className="w-6 h-6"
                                                style={{
                                                    color: "var(--color-primary-600)",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h2
                                                className="text-xl font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Status Outlet
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Atur status operasional outlet
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={data.isActive!}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "isActive",
                                                    e.target.checked,
                                                )
                                            }
                                            disabled={processing}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label
                                            htmlFor="isActive"
                                            className="text-sm font-medium"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            Outlet Aktif
                                        </label>
                                        <span
                                            className="text-xs"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            (Outlet yang aktif dapat login dan
                                            beroperasi)
                                        </span>
                                    </div>
                                </div>

                                {Object.keys(errors).length > 0 && (
                                    <Alert
                                        variant="error"
                                        title="Terdapat kesalahan pada form"
                                        description="Silakan periksa kembali semua field yang bertanda merah."
                                        className="mt-6"
                                    />
                                )}

                                <div
                                    className="flex items-center justify-between pt-6 border-t"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                        disabled={processing}
                                        leftIcon={
                                            <ArrowLeft className="w-4 h-4" />
                                        }
                                    >
                                        Batal
                                    </Button>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled={processing || !isDirty}
                                            loading={processing}
                                            size="lg"
                                            leftIcon={
                                                <Save className="w-4 h-4" />
                                            }
                                        >
                                            {processing
                                                ? "Menyimpan..."
                                                : "Simpan Perubahan"}
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        </Card>
                    </motion.div>
                </div>
            </div>

            <MapPickerModal
                isOpen={isMapModalOpen}
                onClose={() => setIsMapModalOpen(false)}
                onConfirm={handleMapLocationConfirmed}
                apiKey={googleMapsApiKey}
                initialLocation={
                    data.latitude && data.longitude
                        ? { latitude: data.latitude, longitude: data.longitude }
                        : undefined
                }
            />
        </>
    );
};

OutletsEdit.layout = (page:any) => withAuthenticatedLayout({
    title: `Edit ${page.props.outlet.name}`,
    breadcrumbs: [
        { label: "Outlet", href: route("outlets.index") },
        { label: `Edit ${page.props.outlet.name}`},
    ],
})(page);

export default OutletsEdit;
