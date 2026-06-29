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
} from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import { Alert } from "@/Components/Alert";
import {
    LaundryService,
    ServicePackageFormData,
    ServicePackageItemFormData,
} from "@/types";
import { ServicePackageCreateProps } from "./types";
import { formatCurrency } from "@/lib/utils";
import laundryService from "@/Services/laundry_service.service";

const ServicePackageCreate = ({ outlets }: ServicePackageCreateProps) => {
    const { data, setData, post, processing, errors, clearErrors, reset } =
        useForm<ServicePackageFormData>({
            name: "",
            description: "",
            price: 0,
            validityDays: null,
            outletId: null,
            servicePackageItems: [],
        });

    const [servicePackageItems, setServicePackageItems] = useState<
        ServicePackageItemFormData[]
    >([]);
    const [totalRetailValue, setTotalRetailValue] = useState(0);
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [availableLaundryServices, setAvailableLaundryServices] = useState<
        LaundryService[]
    >([]);
    const [loadingLaundryServices, setLoadingLaundryServices] = useState(false);
    const [laundryServicesError, setLaundryServicesError] = useState<
        string | null
    >(null);

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
        return availableLaundryServices.find((v) => v.id === laundryServiceId);
    };

    const handleOutletChange = async (value: string) => {
        const outletId = value ? parseInt(value) : null;
        setData("outletId", outletId);

        setServicePackageItems([]);
        setData("servicePackageItems", []);
        setAvailableLaundryServices([]);
        setLaundryServicesError(null);

        if (outletId) {
            await fetchLaundryServices(outletId);
        }
    };

    const fetchLaundryServices = async (outletId: number) => {
        setLoadingLaundryServices(true);
        setLaundryServicesError(null);

        try {
            const laundryServices =
                await laundryService.getLaundryServicesByOutletId(outletId);

            setAvailableLaundryServices(laundryServices);

            if (laundryServices.length === 0) {
                setLaundryServicesError(
                    "Tidak ada layanan aktif di outlet ini. Silakan tambahkan layanan terlebih dahulu.",
                );
            }
        } catch (error: any) {
            console.error("Error fetching laundry services:", error);
            setLaundryServicesError(
                error.message ||
                    "Gagal memuat daftar layanan. Silakan coba lagi.",
            );
            setAvailableLaundryServices([]);
        } finally {
            setLoadingLaundryServices(false);
        }
    };

    const handleAddLaundryServiceItem = () => {
        if (!data.outletId) {
            alert("Pilih outlet terlebih dahulu");
            return;
        }

        if (availableLaundryServices.length === 0) {
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

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!data.outletId) {
            alert("Outlet harus dipilih");
            return;
        }

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

        post(route("service-packages.store"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setServicePackageItems([]);
                setAvailableLaundryServices([]);
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

    const outletSelectOptions = [
        { value: "", label: "Pilih Outlet" },
        ...outlets.map((outlet) => ({
            value: outlet.id.toString(),
            label: outlet.name,
            description: outlet.code || undefined,
        })),
    ];

    const getLaundryServiceOptions = () => {
        if (loadingLaundryServices) return [];
        if (availableLaundryServices.length === 0) return [];

        return availableLaundryServices.map((laundryService) => ({
            value: laundryService.id.toString(),
            label: laundryService.name,
            description: formatCurrency(laundryService.price),
            group: laundryService.category?.name || "Lainnya",
        }));
    };

    return (
        <>
            <Head title="Buat Paket Deposit" />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Buat Paket Deposit Baru"
                        subtitle="Tambahkan paket deposit untuk meningkatkan penjualan dan loyalitas pelanggan"
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

                    {laundryServicesError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Alert
                                variant="warning"
                                title="Peringatan Layanan"
                                description={laundryServicesError}
                            />
                        </motion.div>
                    )}

                    {loadingLaundryServices && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Alert
                                variant="info"
                                title="Memuat Layanan"
                                description="Sedang memuat daftar layanan untuk outlet yang dipilih..."
                            />
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Form onSubmit={handleSubmit} className="space-y-6">
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
                                                Tentukan outlet dan detail paket
                                                deposit
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <SelectInput
                                            label="Pilih Outlet"
                                            value={
                                                data.outletId?.toString() || ""
                                            }
                                            onChange={(e) =>
                                                handleOutletChange(
                                                    e.target.value,
                                                )
                                            }
                                            options={outletSelectOptions}
                                            error={errors.outletId}
                                            required
                                            disabled={processing}
                                            searchable={true}
                                            leftIcon={
                                                <Building2 className="w-5 h-5" />
                                            }
                                            hint="Pilih outlet untuk paket deposit ini"
                                        />

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
                                            disabled={
                                                !data.outletId || processing
                                            }
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
                                            disabled={
                                                !data.outletId || processing
                                            }
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
                                                disabled={
                                                    !data.outletId || processing
                                                }
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
                                                disabled={
                                                    !data.outletId || processing
                                                }
                                                allowNegative={false}
                                                allowDecimal={false}
                                                leftIcon={
                                                    <Calendar className="w-5 h-5" />
                                                }
                                                hint="0 untuk tidak terbatas, atau isi jumlah hari"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>

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
                                                    Tambahkan layanan yang
                                                    termasuk dalam paket
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
                                                !data.outletId ||
                                                loadingLaundryServices ||
                                                availableLaundryServices.length ===
                                                    0 ||
                                                processing
                                            }
                                            leftIcon={
                                                <Plus className="w-4 h-4" />
                                            }
                                        >
                                            Tambah Item
                                        </Button>
                                    </div>

                                    {!data.outletId ? (
                                        <Alert
                                            variant="info"
                                            title="Pilih Outlet Terlebih Dahulu"
                                        >
                                            Pilih outlet terlebih dahulu untuk
                                            menambahkan item paket
                                        </Alert>
                                    ) : servicePackageItems.length === 0 ? (
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
                                                                        loadingLaundryServices ||
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

                                                            {laundryService && (
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

                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={
                                        processing ||
                                        !data.outletId ||
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
                                        : "Simpan Paket"}
                                </Button>
                            </div>
                        </Form>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

ServicePackageCreate.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Buat Paket Deposit",
        breadcrumbs: [
            { label: "Paket Deposit", href: route("service-packages.index") },
            { label: "Buat Paket Deposit" },
        ],
    })(page);

export default ServicePackageCreate;
