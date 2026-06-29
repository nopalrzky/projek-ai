import React, { useCallback } from "react";
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
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import { Input, SelectInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { OutletCreateProps } from "./types";
import { useLocationAPI } from "@/Hooks/useLocationAPI";
import { useLocationBias } from "@/Hooks/useLocationBias";
import { useReverseGeocode } from "@/Hooks/useReverseGeocode";
import PlacesAutocompleteInput from "@/Components/GoogleMaps/PlacesAutocompleteInput";
import MapPickerModal from "@/Components/GoogleMaps/MapPickerModal";
import StaticMapPreview from "@/Components/GoogleMaps/StaticMapPreview";
import { useState } from "react";
import { OutletFormData } from "@/types";
import PageHeader from "@/Components/Page/PageHeader";
import { useGooglePlacesAutocomplete } from "@/Hooks/useGooglePlacesAutocomplete";

const OutletsCreate = ({ googleMapsApiKey }: OutletCreateProps) => {
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

    const { extractAdminAreas, fuzzyMatch } = useReverseGeocode();

    const { data, setData, post, processing, errors, clearErrors, reset } =
        useForm<OutletFormData>({
            name: "",
            email: "",
            phone: "",
            provinceId: null,
            provinceName: "",
            cityId: null,
            cityName: "",
            districtId: null,
            districtName: "",
            villageId: null,
            villageName: "",
            street: "",
            latitude: null,
            longitude: null,
        });

    const { isLoaded: isApiLoaded } =
        useGooglePlacesAutocomplete(googleMapsApiKey);

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
            const provinceId = e.target.value ? parseInt(e.target.value) : null;
            const provinceName = provinceId
                ? provinces.find((p) => p.id === provinceId)?.name || null
                : null;

            setData((prev) => ({
                ...prev,
                provinceId: provinceId,
                provinceName: provinceName,
                cityId: null,
                cityName: null,
                districtId: null,
                districtName: null,
                villageId: null,
                villageName: null,
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
            const cityId = e.target.value ? parseInt(e.target.value) : null;
            const cityName = cityId
                ? regencies.find((r) => r.id === cityId)?.name || ""
                : "";

            setData((prev) => ({
                ...prev,
                cityId: cityId,
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
            const districtId = e.target.value ? parseInt(e.target.value) : null;
            const districtName = districtId
                ? districts.find((d) => d.id === districtId)?.name || ""
                : "";

            setData((prev) => ({
                ...prev,
                districtId: districtId,
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
            const villageId = e.target.value ? parseInt(e.target.value) : null;
            const villageName = villageId
                ? villages.find((v) => v.id === villageId)?.name || ""
                : "";

            setData((prev) => ({
                ...prev,
                villageId: villageId,
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

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(route("outlets.store"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
            onError: (errors) => {
                console.error("Validation errors:", errors);
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
        });
    };

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
            <Head title="Buat Outlet Baru" />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Buat Outlet Baru"
                        subtitle="Formulir untuk menambahkan outlet baru."
                        icon={Building2}
                        animate={true}
                    />

                    {locationError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6"
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
                            <Form onSubmit={handleSubmit} className="space-y-8">
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
                                                Masukkan informasi dasar outlet
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
                                            value={data.email ?? ""}
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
                                                Pilih lokasi lengkap tempat
                                                outlet berada
                                            </p>
                                        </div>
                                    </div>

                                    {(data.provinceName ||
                                        data.cityName ||
                                        data.districtName ||
                                        data.villageName) && (
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
                                                    Lokasi Dipilih:
                                                </span>
                                            </div>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-primary)",
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
                                </div>{" "}
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
                                </div>{" "}
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

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={
                                            processing || !data.name.trim()
                                        }
                                        loading={processing}
                                        size="lg"
                                        leftIcon={<Save className="w-4 h-4" />}
                                    >
                                        Buat Outlet
                                    </Button>
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

OutletsCreate.layout = withAuthenticatedLayout({
    title: "Buat Outlet Baru",
    breadcrumbs: [
        { label: "Outlet", href: route("outlets.index") },
        { label: "Buat Baru" },
    ],
});

export default OutletsCreate;
