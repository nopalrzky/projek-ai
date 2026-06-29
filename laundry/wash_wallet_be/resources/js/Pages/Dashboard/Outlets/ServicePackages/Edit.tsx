import React, { useState, useEffect } from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Save,
    ArrowLeft,
    Package,
    DollarSign,
    Plus,
    Trash2,
    Calendar,
    Layers,
    Edit,
    CheckSquare,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/Page/PageHeader";
import { Form } from "@/Components/Form";
import {
    Input,
    NumberInput,
    TextAreaInput,
    SelectInput,
} from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import { Alert } from "@/Components/Alert";
import {
    LaundryService,
    OutletServicePackageFormData,
    ServicePackageItemFormData,
} from "@/types";
import { OutletServicePackageEditProps } from "./types";
import { formatCurrency } from "@/lib/utils";
import outletService from "@/Services/outlet.service";

const OutletServicePackageEdit = ({
    outlet,
    servicePackage,
    laundryServices,
}: OutletServicePackageEditProps) => {
    const { data, setData, put, processing, errors, clearErrors, isDirty } =
        useForm<OutletServicePackageFormData>({
            name: servicePackage.name || "",
            description: servicePackage.description || "",
            price: servicePackage.price || 0,
            validityDays: servicePackage.validityDays || null,
            isActive: servicePackage.isActive ?? true,
            servicePackageItems:
                servicePackage.servicePackageItems?.map((item) => ({
                    laundryServiceId: item.laundryServiceId,
                    quantity: item.quantity,
                })) || [],
        });

    const [servicePackageItems, setServicePackageItems] = useState<
        ServicePackageItemFormData[]
    >(
        servicePackage.servicePackageItems?.map((item) => ({
            laundryServiceId: item.laundryServiceId,
            quantity: item.quantity,
        })) || [],
    );
    const [totalRetailValue, setTotalRetailValue] = useState(0);
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        const total = servicePackageItems.reduce((sum, item) => {
            const laundryService = findLaundryServiceById(
                item.laundryServiceId,
            );
            return sum + (laundryService?.price || 0) * item.quantity;
        }, 0);
        setTotalRetailValue(total);

        if (total > 0 && data.price > 0) {
            const discount = ((total - data.price) / total) * 100;
            setDiscountPercentage(discount);
        } else {
            setDiscountPercentage(0);
        }
    }, [servicePackageItems, data.price]);

    const findLaundryServiceById = (
        laundryServiceId: number,
    ): LaundryService | undefined => {
        return laundryServices.find((v) => v.id === laundryServiceId);
    };

    const handleAddLaundryServiceItem = () => {
        if (laundryServices.length === 0) {
            alert("Tidak ada layanan tersedia di outlet ini");
            return;
        }

        const newItems = [
            ...servicePackageItems,
            { laundryServiceId: 0, quantity: 1 },
        ];
        setServicePackageItems(newItems);
        setData("servicePackageItems", newItems);
        setHasUnsavedChanges(true);
    };

    const handleRemoveServiceItem = (index: number) => {
        const newItems = servicePackageItems.filter((_, i) => i !== index);
        setServicePackageItems(newItems);
        setData("servicePackageItems", newItems);
        setHasUnsavedChanges(true);
    };

    const handleServiceItemChange = (
        index: number,
        field: keyof ServicePackageItemFormData,
        value: number,
    ) => {
        const newItems = [...servicePackageItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setServicePackageItems(newItems);
        setData("servicePackageItems", newItems);
        setHasUnsavedChanges(true);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (servicePackageItems.length === 0) {
            alert("Minimal harus ada 1 item dalam paket");
            return;
        }

        const hasInvalidLaundryService = servicePackageItems.some(
            (item) => !item.laundryServiceId || item.laundryServiceId === 0,
        );
        if (hasInvalidLaundryService) {
            alert("Semua item harus memilih layanan");
            return;
        }

        setData("servicePackageItems", servicePackageItems);

        put(
            route("outlets.service-packages.update", [
                outlet.id,
                servicePackage.id,
            ]),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setHasUnsavedChanges(false);
                },
                onError: (errors) => {
                    console.error("Validation errors:", errors);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                },
            },
        );
    };

    const handleDataChange = (
        key: keyof OutletServicePackageFormData,
        value: any,
    ) => {
        setData(key, value);
        if (errors[key]) {
            clearErrors(key);
        }
        if (!hasUnsavedChanges) {
            setHasUnsavedChanges(true);
        }
    };

    const getLaundryServiceOptions = () => {
        if (laundryServices.length === 0) {
            return [{ value: "", label: "Tidak ada layanan tersedia" }];
        }

        const grouped = laundryServices.reduce(
            (acc, service) => {
                const categoryName = service.category?.name || "Lainnya";
                if (!acc[categoryName]) {
                    acc[categoryName] = [];
                }
                acc[categoryName].push({
                    value: service.id.toString(),
                    label: service.name,
                    description: formatCurrency(service.price),
                    group: categoryName,
                });
                return acc;
            },
            {} as Record<string, any[]>,
        );

        return Object.values(grouped).flat();
    };

    const isFormValid =
        data.name.trim() !== "" &&
        data.price > 0 &&
        servicePackageItems.length > 0;

    const hasSubscriptions =
        (servicePackage.customerSubscriptionsCount || 0) > 0;

    return (
        <>
            <Head
                title={`Edit Paket: ${servicePackage.name} - ${outlet.name}`}
            />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title={`Edit Paket Layanan - ${outlet.name}`}
                        subtitle={`Edit paket "${servicePackage.name}" di outlet ${outlet.name} (${outlet.code})`}
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

                    {laundryServices.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Alert
                                variant="warning"
                                title="Tidak Ada Layanan"
                                description="Outlet ini belum memiliki layanan aktif. Tambahkan layanan terlebih dahulu untuk mengedit item paket."
                            />
                        </motion.div>
                    )}

                    {hasSubscriptions && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Alert
                                variant="info"
                                title="Informasi Langganan"
                                description={`Paket ini memiliki ${servicePackage.customerSubscriptionsCount} langganan aktif. Perubahan harga atau item tidak akan mempengaruhi langganan yang sudah berjalan.`}
                            />
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <Card className="p-6 relative z-20">
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
                                            <Package
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
                                                Informasi Paket
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Edit detail dasar paket layanan
                                                berlangganan
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Input
                                            label="Nama Paket"
                                            value={data.name}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "name",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.name}
                                            required
                                            placeholder="Contoh: Paket Cuci Hemat, Paket Premium"
                                            disabled={processing}
                                            leftIcon={
                                                <Package className="w-5 h-5" />
                                            }
                                            hint="Nama paket yang menarik dan deskriptif"
                                            autoFocus
                                            maxLength={255}
                                        />

                                        <TextAreaInput
                                            label="Deskripsi Paket"
                                            value={data.description || ""}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "description",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.description}
                                            placeholder="Jelaskan manfaat dan ketentuan paket ini..."
                                            rows={3}
                                            disabled={processing}
                                            hint="Deskripsi detail tentang paket (opsional)"
                                            maxLength={500}
                                            showCharacterCount={true}
                                            autoResize={true}
                                            minRows={3}
                                            maxRows={6}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <NumberInput
                                                label="Harga Paket"
                                                value={data.price}
                                                onValueChange={(value) =>
                                                    handleDataChange(
                                                        "price",
                                                        value || 0,
                                                    )
                                                }
                                                error={errors.price}
                                                required
                                                min={0}
                                                max={99999999999.99}
                                                prefix="Rp "
                                                placeholder="0"
                                                disabled={processing}
                                                allowNegative={false}
                                                allowDecimal={true}
                                                thousandSeparator=","
                                                leftIcon={
                                                    <DollarSign className="w-5 h-5" />
                                                }
                                                hint="Harga jual paket kepada pelanggan"
                                            />

                                            <NumberInput
                                                label="Masa Berlaku (Hari)"
                                                value={
                                                    data.validityDays ||
                                                    undefined
                                                }
                                                onValueChange={(value) =>
                                                    handleDataChange(
                                                        "validityDays",
                                                        value || null,
                                                    )
                                                }
                                                error={errors.validityDays}
                                                min={1}
                                                max={3650}
                                                placeholder="Kosongkan untuk tidak terbatas"
                                                disabled={processing}
                                                allowNegative={false}
                                                allowDecimal={false}
                                                leftIcon={
                                                    <Calendar className="w-5 h-5" />
                                                }
                                                hint="Durasi berlaku paket dalam hari (opsional)"
                                                suffix="hari"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Package Items */}
                            <Card className="p-6 relative z-10">
                                <div className="space-y-6">
                                    <div
                                        className="flex justify-between items-center pb-4 border-b"
                                        style={{
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="p-3 rounded-lg"
                                                style={{
                                                    backgroundColor:
                                                        "var(--color-success-100)",
                                                }}
                                            >
                                                <Layers
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
                                                    Item Paket
                                                </h2>
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Edit layanan yang termasuk
                                                    dalam paket
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="primary"
                                            size="sm"
                                            onClick={
                                                handleAddLaundryServiceItem
                                            }
                                            disabled={
                                                laundryServices.length === 0 ||
                                                processing
                                            }
                                            leftIcon={
                                                <Plus className="w-4 h-4" />
                                            }
                                        >
                                            Tambah Item
                                        </Button>
                                    </div>

                                    {servicePackageItems.length === 0 ? (
                                        <Alert
                                            variant="warning"
                                            title="Belum Ada Item"
                                            description="Belum ada item dalam paket. Tambahkan minimal 1 item untuk melanjutkan."
                                        />
                                    ) : (
                                        <div className="space-y-4">
                                            {servicePackageItems.map(
                                                (item, index) => {
                                                    const laundryService =
                                                        findLaundryServiceById(
                                                            item.laundryServiceId,
                                                        );
                                                    const itemTotal =
                                                        (laundryService?.price ||
                                                            0) * item.quantity;

                                                    return (
                                                        <div
                                                            key={`item-${index}`}
                                                            className="border rounded-lg p-4"
                                                            style={{
                                                                borderColor:
                                                                    "var(--color-border)",
                                                                backgroundColor:
                                                                    "var(--color-surface)",
                                                            }}
                                                        >
                                                            <div className="flex justify-between items-start mb-4">
                                                                <h3
                                                                    className="font-medium"
                                                                    style={{
                                                                        color: "var(--color-text-primary)",
                                                                    }}
                                                                >
                                                                    Item #
                                                                    {index + 1}
                                                                </h3>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleRemoveServiceItem(
                                                                            index,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    leftIcon={
                                                                        <Trash2 className="w-4 h-4" />
                                                                    }
                                                                >
                                                                    Hapus
                                                                </Button>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <SelectInput
                                                                    label="Layanan"
                                                                    value={item.laundryServiceId.toString()}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleServiceItemChange(
                                                                            index,
                                                                            "laundryServiceId",
                                                                            parseInt(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                        )
                                                                    }
                                                                    options={getLaundryServiceOptions()}
                                                                    groupBy="group"
                                                                    placeholder="Pilih Layanan"
                                                                    error={
                                                                        errors[
                                                                            `servicePackageItems.${index}.laundryServiceId`
                                                                        ]
                                                                    }
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    searchable
                                                                    required
                                                                />

                                                                <NumberInput
                                                                    label="Kuantitas"
                                                                    value={
                                                                        item.quantity
                                                                    }
                                                                    onValueChange={(
                                                                        value,
                                                                    ) =>
                                                                        handleServiceItemChange(
                                                                            index,
                                                                            "quantity",
                                                                            value ||
                                                                                1,
                                                                        )
                                                                    }
                                                                    error={
                                                                        errors[
                                                                            `servicePackageItems.${index}.quantity`
                                                                        ]
                                                                    }
                                                                    min={0.1}
                                                                    step={0.1}
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    allowNegative={
                                                                        false
                                                                    }
                                                                    allowDecimal={
                                                                        true
                                                                    }
                                                                    required
                                                                    placeholder="1"
                                                                />
                                                            </div>

                                                            {laundryService && (
                                                                <div
                                                                    className="mt-3 pt-3 border-t"
                                                                    style={{
                                                                        borderColor:
                                                                            "var(--color-border)",
                                                                    }}
                                                                >
                                                                    <div className="flex justify-between text-sm">
                                                                        <span
                                                                            style={{
                                                                                color: "var(--color-text-secondary)",
                                                                            }}
                                                                        >
                                                                            Harga
                                                                            Satuan:
                                                                        </span>
                                                                        <span
                                                                            className="font-medium"
                                                                            style={{
                                                                                color: "var(--color-text-primary)",
                                                                            }}
                                                                        >
                                                                            {formatCurrency(
                                                                                laundryService.price,
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm mt-1">
                                                                        <span
                                                                            style={{
                                                                                color: "var(--color-text-secondary)",
                                                                            }}
                                                                        >
                                                                            Subtotal:
                                                                        </span>
                                                                        <span
                                                                            className="font-medium"
                                                                            style={{
                                                                                color: "var(--color-primary-600)",
                                                                            }}
                                                                        >
                                                                            {formatCurrency(
                                                                                itemTotal,
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    )}

                                    {errors.servicePackageItems && (
                                        <p className="text-sm text-red-600 mt-2">
                                            {errors.servicePackageItems}
                                        </p>
                                    )}
                                </div>
                            </Card>

                            {/* Price Summary */}
                            <Card className="p-6">
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
                                                    "var(--color-warning-100)",
                                            }}
                                        >
                                            <DollarSign
                                                className="w-6 h-6"
                                                style={{
                                                    color: "var(--color-warning-600)",
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
                                                Ringkasan Harga
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Detail perhitungan harga paket
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Total Nilai Retail:
                                            </span>
                                            <span
                                                className="font-medium"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {formatCurrency(
                                                    totalRetailValue,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Harga Paket:
                                            </span>
                                            <span
                                                className="font-medium"
                                                style={{
                                                    color: "var(--color-primary-600)",
                                                }}
                                            >
                                                {formatCurrency(data.price)}
                                            </span>
                                        </div>
                                        {data.price > 0 &&
                                            totalRetailValue > 0 && (
                                                <div
                                                    className="flex justify-between pt-3 border-t"
                                                    style={{
                                                        borderColor:
                                                            "var(--color-border)",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        Hemat:
                                                    </span>
                                                    <span
                                                        className="font-semibold"
                                                        style={{
                                                            color: "var(--color-success-600)",
                                                        }}
                                                    >
                                                        {formatCurrency(
                                                            totalRetailValue -
                                                                data.price,
                                                        )}{" "}
                                                        (
                                                        {discountPercentage.toFixed(
                                                            1,
                                                        )}
                                                        %)
                                                    </span>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </Card>

                            {/* Status & Settings */}
                            <Card className="p-6">
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
                                                Status Paket
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Ubah status paket layanan
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
                                                Paket Aktif
                                            </label>
                                            <span
                                                className="text-xs"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                (Paket aktif dapat dibeli oleh
                                                pelanggan)
                                            </span>
                                        </div>

                                        {!data.isActive && (
                                            <Alert
                                                variant="warning"
                                                description="Menonaktifkan paket ini akan membuatnya tidak tersedia untuk pembelian baru. Langganan yang sudah ada tetap berlaku."
                                                className="text-sm"
                                            />
                                        )}

                                        {hasSubscriptions && (
                                            <Alert
                                                variant="info"
                                                title="Informasi Langganan"
                                                description={`Paket ini memiliki ${servicePackage.customerSubscriptionsCount} langganan aktif. Perubahan harga atau item tidak akan mempengaruhi langganan yang sudah berjalan.`}
                                                className="text-sm"
                                            />
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Validation Errors */}
                            {Object.keys(errors).length > 0 && (
                                <Alert
                                    variant="error"
                                    title="Terdapat kesalahan pada form"
                                    description="Silakan periksa kembali semua field yang bertanda merah."
                                />
                            )}

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
                                    leftIcon={<ArrowLeft className="w-4 h-4" />}
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
                                            Ada perubahan yang belum disimpan
                                        </span>
                                    )}

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={
                                            processing ||
                                            !isFormValid ||
                                            (!isDirty && !hasUnsavedChanges)
                                        }
                                        loading={processing}
                                        size="lg"
                                        leftIcon={<Save className="w-4 h-4" />}
                                    >
                                        {processing
                                            ? "Menyimpan..."
                                            : "Simpan Perubahan"}
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

OutletServicePackageEdit.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Edit Paket Layanan",
        breadcrumbs: [
            { label: "Outlets", href: route("outlets.index") },
            {
                label: page.props.outlet?.name || "Detail",
                href: route("outlets.show", page.props.outlet?.id),
            },
            { label: "Edit Paket" },
        ],
    })(page);

export default OutletServicePackageEdit;
