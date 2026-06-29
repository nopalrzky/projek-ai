import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Save,
    ArrowLeft,
    Shirt,
    Tag,
    Package,
    DollarSign,
    Clock,
    Boxes,
    CheckSquare,
    Edit,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import { Input, TextAreaInput, SelectInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { OutletLaundryServiceEditProps } from "./types";
import { OutletLaundryServiceFormData } from "@/types";
import PageHeader from "@/Components/Page/PageHeader";
import outletService from "@/Services/outlet.service";
import CourierEligibilityField from "./Partials/CourierEligibilityField";

const OutletLaundryServiceEdit = ({
    outlet,
    laundryService,
    categories = [],
    units = [],
}: OutletLaundryServiceEditProps) => {
    const { data, setData, put, processing, errors, clearErrors, isDirty } =
        useForm<OutletLaundryServiceFormData>({
            categoryId: laundryService.categoryId,
            unitId: laundryService.unitId,
            name: laundryService.name,
            description: laundryService.description || "",
            price: laundryService.price || 0,
            durationHours: laundryService.durationHours || 24,
            minQuantity: laundryService.minQuantity || 1,
            isActive: laundryService.isActive ?? true,
            supportsCourier: laundryService.supportsCourier ?? false,
        });

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        put(
            route("outlets.laundry-services.update", [
                outlet.id,
                laundryService.id,
            ]),
            {
                preserveScroll: true,
                onError: (errors) => {
                    console.error("Validation errors:", errors);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                },
                onSuccess: () => {
                    setHasUnsavedChanges(false);
                },
            },
        );
    };

    const handleDataChange = (
        key: keyof OutletLaundryServiceFormData,
        value: any,
    ) => {
        setData(key as string, value);

        if (errors[key]) {
            clearErrors(key as string);
        }

        if (!hasUnsavedChanges) {
            setHasUnsavedChanges(true);
        }
    };

    const handleCategoryChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const categoryId = parseInt(event.target.value, 10);
        handleDataChange("categoryId", isNaN(categoryId) ? 0 : categoryId);
    };

    const handleUnitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const unitId = parseInt(event.target.value, 10);
        handleDataChange("unitId", isNaN(unitId) ? 0 : unitId);
    };

    const categoryOptions = categories.map((category) => ({
        value: category.id.toString(),
        label: category.name,
        description: category.description || undefined,
    }));

    const unitOptions = units.map((unit) => ({
        value: unit.id.toString(),
        label: `${unit.name} (${unit.symbol})`,
        description: unit.description || undefined,
    }));

    const days = Math.floor(data.durationHours / 24);
    const remainingHours = data.durationHours % 24;

    const selectedUnit = units.find((unit) => unit.id === data.unitId);

    return (
        <>
            <Head
                title={`Edit Layanan: ${laundryService.name} - ${outlet.name}`}
            />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title={`Edit Layanan Laundry - ${outlet.name}`}
                        subtitle={`Edit layanan "${laundryService.name}" di outlet ${outlet.name} (${outlet.code})`}
                        icon={Edit}
                        variant="default"
                        actions={
                            <Button
                                onClick={() =>
                                    outletService.goToView(outlet.id)
                                }
                                variant="outline"
                                leftIcon={<ArrowLeft className="w-4 h-4" />}
                            >
                                Kembali
                            </Button>
                        }
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Card className="p-8">
                            <Form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Information */}
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
                                            <Shirt
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
                                                Informasi Layanan
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Edit detail dan spesifikasi
                                                layanan laundry
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <Input
                                            label="Nama Layanan"
                                            placeholder="Contoh: Cuci Kiloan, Setrika Express, dll"
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
                                                <Shirt className="w-5 h-5" />
                                            }
                                            hint="Nama layanan yang mudah diingat dan menggambarkan jenis pelayanan"
                                            autoFocus
                                            maxLength={100}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <SelectInput
                                                label="Kategori"
                                                placeholder="Pilih kategori layanan..."
                                                value={
                                                    data.categoryId > 0
                                                        ? data.categoryId.toString()
                                                        : ""
                                                }
                                                onChange={handleCategoryChange}
                                                error={errors.categoryId}
                                                required
                                                disabled={
                                                    processing ||
                                                    categories.length === 0
                                                }
                                                options={categoryOptions}
                                                multiple={false}
                                                searchable={true}
                                                clearable={true}
                                                leftIcon={
                                                    <Tag className="w-5 h-5" />
                                                }
                                                hint={
                                                    categories.length === 0
                                                        ? "Belum ada kategori tersedia. Buat kategori terlebih dahulu."
                                                        : "Pilih kategori yang sesuai untuk layanan ini"
                                                }
                                                noOptionsText="Tidak ada kategori tersedia"
                                            />

                                            <SelectInput
                                                label="Unit Satuan"
                                                placeholder="Pilih unit satuan..."
                                                value={
                                                    data.unitId > 0
                                                        ? data.unitId.toString()
                                                        : ""
                                                }
                                                onChange={handleUnitChange}
                                                error={errors.unitId}
                                                required
                                                disabled={
                                                    processing ||
                                                    units.length === 0
                                                }
                                                options={unitOptions}
                                                multiple={false}
                                                searchable={true}
                                                clearable={true}
                                                leftIcon={
                                                    <Package className="w-5 h-5" />
                                                }
                                                hint={
                                                    units.length === 0
                                                        ? "Belum ada unit tersedia"
                                                        : "Unit untuk menghitung tarif (kg, pcs, dll)"
                                                }
                                                noOptionsText="Tidak ada unit tersedia"
                                            />
                                        </div>

                                        <TextAreaInput
                                            label="Deskripsi Layanan"
                                            placeholder="Jelaskan detail layanan, termasuk proses dan keunggulan yang ditawarkan..."
                                            value={data.description}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "description",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.description}
                                            disabled={processing}
                                            hint="Deskripsi yang jelas akan membantu pelanggan memahami layanan (opsional)"
                                            rows={4}
                                            maxLength={500}
                                            showCharacterCount={true}
                                            autoResize={true}
                                            minRows={4}
                                            maxRows={8}
                                        />
                                    </div>
                                </div>

                                {/* Pricing & Service Details */}
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
                                                    "var(--color-success-100)",
                                            }}
                                        >
                                            <DollarSign
                                                className="w-6 h-6"
                                                style={{
                                                    color: "var(--color-success-600)",
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
                                                Harga & Detail Layanan
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Pengaturan tarif dan spesifikasi
                                                teknis
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Input
                                            label="Harga per Unit"
                                            type="number"
                                            placeholder="0"
                                            value={data.price}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "price",
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                                )
                                            }
                                            error={errors.price}
                                            required
                                            disabled={processing}
                                            leftIcon={
                                                <DollarSign className="w-5 h-5" />
                                            }
                                            hint="Tarif per unit yang dipilih"
                                            min={0}
                                            step={500}
                                        />

                                        <Input
                                            label="Durasi Pengerjaan (Jam)"
                                            type="number"
                                            placeholder="24"
                                            value={data.durationHours}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "durationHours",
                                                    parseInt(e.target.value) ||
                                                        24,
                                                )
                                            }
                                            error={errors.durationHours}
                                            required
                                            disabled={processing}
                                            leftIcon={
                                                <Clock className="w-5 h-5" />
                                            }
                                            hint={
                                                days > 0
                                                    ? `≈ ${days} hari${
                                                          remainingHours > 0
                                                              ? ` ${remainingHours} jam`
                                                              : ""
                                                      }`
                                                    : "Estimasi waktu penyelesaian"
                                            }
                                            min={1}
                                            step={1}
                                        />

                                        <Input
                                            label="Minimal Quantity"
                                            type="number"
                                            placeholder="1"
                                            value={data.minQuantity}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "minQuantity",
                                                    parseInt(e.target.value) ||
                                                        1,
                                                )
                                            }
                                            error={errors.minQuantity}
                                            required
                                            disabled={processing}
                                            leftIcon={
                                                <Boxes className="w-5 h-5" />
                                            }
                                            hint="Jumlah minimal pesanan"
                                            min={1}
                                            step={1}
                                        />
                                    </div>
                                </div>

                                {/* Status & Settings */}
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
                                            <CheckSquare
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
                                                Status Layanan
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Ubah status layanan
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
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
                                                className="w-5 h-5 rounded border-2 transition-all duration-200"
                                                style={{
                                                    borderColor:
                                                        "var(--color-border)",
                                                    backgroundColor:
                                                        data.isActive
                                                            ? "var(--color-primary-500)"
                                                            : "var(--color-surface)",
                                                    accentColor:
                                                        "var(--color-primary-500)",
                                                }}
                                            />
                                            <label
                                                htmlFor="isActive"
                                                className="text-sm font-medium cursor-pointer"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Layanan Aktif
                                            </label>
                                            <span
                                                className="text-xs"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                (Layanan aktif dapat dipilih
                                                saat transaksi)
                                            </span>
                                        </div>

                                        <div className="mt-4">
                                            <CourierEligibilityField
                                                value={
                                                    data.supportsCourier ??
                                                    false
                                                }
                                                onChange={(v) =>
                                                    handleDataChange(
                                                        "supportsCourier",
                                                        v,
                                                    )
                                                }
                                                disabled={processing}
                                                error={errors.supportsCourier}
                                            />
                                        </div>

                                        {!data.isActive && (
                                            <Alert
                                                variant="warning"
                                                description="Menonaktifkan layanan ini akan membuatnya tidak tersedia untuk transaksi baru."
                                                className="text-sm"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Form Actions */}
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
                                        {isDirty && hasUnsavedChanges && (
                                            <span
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                Ada perubahan yang belum
                                                disimpan
                                            </span>
                                        )}

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled={
                                                processing ||
                                                !data.name.trim() ||
                                                data.categoryId === 0 ||
                                                data.unitId === 0 ||
                                                data.price <= 0 ||
                                                data.durationHours < 1 ||
                                                data.minQuantity < 1 ||
                                                (!isDirty && !hasUnsavedChanges)
                                            }
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
        </>
    );
};

OutletLaundryServiceEdit.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Edit Layanan Laundry",
        breadcrumbs: [
            { label: "Outlets", href: route("outlets.index") },
            {
                label: page.props.outlet?.name || "Detail",
                href: route("outlets.show", page.props.outlet?.id),
            },
            { label: "Edit Layanan" },
        ],
    })(page);

export default OutletLaundryServiceEdit;
