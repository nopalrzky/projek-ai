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
    Building2,
    AlertCircle,
    Calendar,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/Page/PageHeader";
import { Form } from "@/Components/Form";
import {
    Input,
    NumberInput,
    TextAreaInput,
    SelectInput,
    CheckboxInput,
} from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import {
    LaundryService,
    ServicePackageFormData,
    ServicePackageItemFormData,
} from "@/types";
import { ServicePackageEditProps } from "./types";
import { formatCurrency } from "@/lib/utils";

const ServicePackageEdit = ({
    servicePackage,
    laundryServices,
}: ServicePackageEditProps) => {
    const { data, setData, put, processing, errors, clearErrors, isDirty } =
        useForm<ServicePackageFormData>({
            name: servicePackage.name || "",
            description: servicePackage.description || "",
            price: servicePackage.price || 0,
            validityDays: servicePackage.validityDays || null,
            outletId: servicePackage.outletId || null,
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

    useEffect(() => {
        const total = servicePackageItems.reduce((sum, item) => {
            const laundryServiceItem = findLaundryServiceById(
                item.laundryServiceId,
            );
            return sum + (laundryServiceItem?.price || 0) * item.quantity;
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

        setServicePackageItems([
            ...servicePackageItems,
            { laundryServiceId: 0, quantity: 1 },
        ]);
    };

    const handleRemoveServiceItem = (index: number) => {
        const newItems = servicePackageItems.filter((_, i) => i !== index);
        setServicePackageItems(newItems);
        setData("servicePackageItems", newItems);
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
    };

    const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
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

        put(route("service-packages.update", servicePackage.id), {
            preserveScroll: true,
            onSuccess: () => {
                console.log("Service package updated successfully");
            },
            onError: (errors) => {
                console.error("Validation errors:", errors);
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
        });
    };

    const handleDataChange = (
        key: keyof ServicePackageFormData,
        value: any,
    ) => {
        setData(key, value);
        if (errors[key]) {
            clearErrors(key);
        }
    };

    const getLaundryServiceOptions = () => {
        if (laundryServices.length === 0) return [];

        return laundryServices.map((laundryServiceItem) => ({
            value: laundryServiceItem.id.toString(),
            label: laundryServiceItem.name,
            description: formatCurrency(laundryServiceItem.price),
            group: laundryServiceItem.category?.name || "Lainnya",
        }));
    };

    return (
        <>
            <Head title={`Edit Paket - ${servicePackage.name}`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    {/* PageHeader */}
                    <PageHeader
                        title={`Edit Paket - ${servicePackage.name}`}
                        subtitle={
                            <div className="flex items-center gap-2">
                                <span>
                                    Perbarui informasi paket deposit "
                                    {servicePackage.name}"
                                </span>
                                <Badge
                                    variant={
                                        servicePackage.isActive
                                            ? "success"
                                            : "secondary"
                                    }
                                >
                                    {servicePackage.isActive
                                        ? "Aktif"
                                        : "Nonaktif"}
                                </Badge>
                            </div>
                        }
                        icon={Package}
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

                    {/* Unsaved Changes Warning */}
                    {isDirty && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Alert
                                variant="warning"
                                title="Perubahan Belum Disimpan"
                                description="Anda memiliki perubahan yang belum disimpan. Jangan lupa untuk menyimpan perubahan sebelum meninggalkan halaman."
                            />
                        </motion.div>
                    )}

                    {/* No Services Warning */}
                    {laundryServices.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Alert
                                variant="warning"
                                title="Tidak Ada Layanan"
                                description="Tidak ada layanan aktif di outlet ini. Silakan tambahkan layanan terlebih dahulu untuk menambah item paket."
                            />
                        </motion.div>
                    )}

                    {/* Form Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Form onSubmit={handleUpdate} className="space-y-6">
                            {/* Basic Information Card */}
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
                                                Informasi Dasar
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Perbarui detail paket deposit
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Outlet Info (Read-only) */}
                                        <div>
                                            <label
                                                className="block text-sm font-medium mb-2"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Outlet
                                            </label>
                                            <div
                                                className="px-4 py-3 rounded-lg border"
                                                style={{
                                                    backgroundColor:
                                                        "var(--color-surface)",
                                                    borderColor:
                                                        "var(--color-border)",
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Building2
                                                        className="w-5 h-5 flex-shrink-0"
                                                        style={{
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    />
                                                    <div>
                                                        <p
                                                            className="font-medium"
                                                            style={{
                                                                color: "var(--color-text-primary)",
                                                            }}
                                                        >
                                                            {servicePackage
                                                                .outlet?.name ||
                                                                "Outlet tidak ditemukan"}
                                                        </p>
                                                        {servicePackage.outlet
                                                            ?.code && (
                                                            <p
                                                                className="text-sm"
                                                                style={{
                                                                    color: "var(--color-text-secondary)",
                                                                }}
                                                            >
                                                                {
                                                                    servicePackage
                                                                        .outlet
                                                                        .code
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <p
                                                className="mt-1 text-xs"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Outlet tidak dapat diubah
                                                setelah paket dibuat
                                            </p>
                                        </div>

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
                                            placeholder="Contoh: Paket Cuci Hemat"
                                            disabled={processing}
                                            leftIcon={
                                                <Package className="w-5 h-5" />
                                            }
                                            hint="Nama paket yang menarik dan deskriptif"
                                        />

                                        <TextAreaInput
                                            label="Deskripsi"
                                            value={data.description || ""}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "description",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.description}
                                            placeholder="Deskripsi paket deposit..."
                                            rows={3}
                                            disabled={processing}
                                            hint="Jelaskan manfaat dan ketentuan paket"
                                            maxLength={500}
                                            showCharacterCount={true}
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
                                                prefix="Rp "
                                                placeholder="0"
                                                disabled={processing}
                                                allowNegative={false}
                                                thousandSeparator="."
                                                decimalSeparator=","
                                                leftIcon={
                                                    <DollarSign className="w-5 h-5" />
                                                }
                                                hint="Harga jual paket kepada pelanggan"
                                            />

                                            <NumberInput
                                                label="Masa Berlaku (Hari)"
                                                value={data.validityDays || 0}
                                                onValueChange={(value) =>
                                                    handleDataChange(
                                                        "validityDays",
                                                        value || null,
                                                    )
                                                }
                                                error={errors.validityDays}
                                                min={0}
                                                placeholder="0 = Tidak terbatas"
                                                disabled={processing}
                                                allowNegative={false}
                                                allowDecimal={false}
                                                leftIcon={
                                                    <Calendar className="w-5 h-5" />
                                                }
                                                hint="0 untuk tidak terbatas, atau isi jumlah hari"
                                            />
                                        </div>

                                        <CheckboxInput
                                            label="Paket Aktif"
                                            checked={data.isActive!}
                                            onChange={(checked) =>
                                                handleDataChange(
                                                    "isActive",
                                                    checked,
                                                )
                                            }
                                            description="Paket dapat digunakan oleh pelanggan"
                                            disabled={processing}
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* Service Items Card */}
                            <Card className="p-6">
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
                                                <Package
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
                                                    Kelola layanan yang termasuk
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
                                        >
                                            Belum ada item dalam paket.
                                            Tambahkan minimal 1 item untuk
                                            melanjutkan.
                                        </Alert>
                                    ) : (
                                        <div className="space-y-4">
                                            {servicePackageItems.map(
                                                (item, index) => {
                                                    const laundryServiceItem =
                                                        findLaundryServiceById(
                                                            item.laundryServiceId,
                                                        );
                                                    const itemTotal =
                                                        (laundryServiceItem?.price ||
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
                                                                    min={1}
                                                                    step={1}
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    allowNegative={
                                                                        false
                                                                    }
                                                                    allowDecimal={
                                                                        false
                                                                    }
                                                                    required
                                                                />
                                                            </div>

                                                            {laundryServiceItem && (
                                                                <div className="mt-3 pt-3 border-t">
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
                                                                                laundryServiceItem.price,
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

                            {/* Price Summary Card */}
                            {servicePackageItems.length > 0 &&
                                totalRetailValue > 0 && (
                                    <Card className="p-6">
                                        <div className="space-y-6">
                                            <div
                                                className="flex items-center gap-3 pb-4 border-b"
                                                style={{
                                                    borderColor:
                                                        "var(--color-border)",
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
                                                        Detail perhitungan harga
                                                        paket
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
                                                        {formatCurrency(
                                                            data.price,
                                                        )}
                                                    </span>
                                                </div>
                                                {data.price > 0 && (
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
                                )}

                            {/* Info Alert */}
                            <div
                                className="p-4 rounded-lg border"
                                style={{
                                    backgroundColor: "var(--color-info-50)",
                                    borderColor: "var(--color-info-200)",
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <AlertCircle
                                        className="w-5 h-5 mt-0.5 flex-shrink-0"
                                        style={{
                                            color: "var(--color-info-600)",
                                        }}
                                    />
                                    <div>
                                        <p
                                            className="text-sm font-medium mb-1"
                                            style={{
                                                color: "var(--color-info-700)",
                                            }}
                                        >
                                            Informasi Penting
                                        </p>
                                        <ul
                                            className="text-xs space-y-1"
                                            style={{
                                                color: "var(--color-info-600)",
                                            }}
                                        >
                                            <li>
                                                • Perubahan pada paket akan
                                                mempengaruhi pelanggan yang
                                                membeli paket setelah perubahan
                                                disimpan
                                            </li>
                                            <li>
                                                • Outlet tidak dapat diubah
                                                setelah paket dibuat
                                            </li>
                                            <li>
                                                • Harga paket sebaiknya lebih
                                                murah dari total retail untuk
                                                menarik pelanggan
                                            </li>
                                            <li>
                                                • Masa berlaku 0 hari = tidak
                                                terbatas
                                            </li>
                                            <li>
                                                • Minimal 1 item layanan harus
                                                ditambahkan
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Global Error Alert */}
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
                                    {isDirty && (
                                        <span
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-warning-600)",
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
                                            !isDirty ||
                                            !data.name.trim() ||
                                            servicePackageItems.length === 0 ||
                                            data.price <= 0
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

ServicePackageEdit.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Edit Paket Deposit",
        breadcrumbs: [
            { label: "Paket Deposit", href: route("service-packages.index") },
            { label: "Edit" },
        ],
    })(page);

export default ServicePackageEdit;
