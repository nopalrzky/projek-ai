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
import { OutletServicePackageCreateProps } from "./types";
import { formatCurrency } from "@/lib/utils";
import outletService from "@/Services/outlet.service";
const OutletServicePackageCreate = ({
    outlet,
    laundryServices,
}: OutletServicePackageCreateProps) => {
    const { data, setData, post, processing, errors, clearErrors, reset } =
        useForm<OutletServicePackageFormData>({
            name: "",
            description: "",
            price: 0,
            validityDays: null,
            isActive: true,
            servicePackageItems: [],
        });

    const [servicePackageItems, setServicePackageItems] = useState<
        ServicePackageItemFormData[]
    >([]);
    const [totalRetailValue, setTotalRetailValue] = useState(0);
    const [discountPercentage, setDiscountPercentage] = useState(0);

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

        post(route("outlets.service-packages.store", outlet.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setServicePackageItems([]);
            },
            onError: (errors) => {
                console.error("Validation errors:", errors);
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
        });
    };

    const handleDataChange = (
        key: keyof OutletServicePackageFormData,
        value: any,
    ) => {
        setData(key, value);
        if (errors[key]) {
            clearErrors(key);
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

    return (
        <>
            <Head title={`Tambah Paket Layanan - ${outlet.name}`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title={`Tambah Paket Layanan - ${outlet.name}`}
                        subtitle={`Buat paket layanan berlangganan baru untuk outlet ${outlet.name} (${outlet.code})`}
                        icon={Package}
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
                                description="Outlet ini belum memiliki layanan aktif. Tambahkan layanan terlebih dahulu sebelum membuat paket."
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
                                                Detail dasar paket layanan
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

                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={processing || !isFormValid}
                                    loading={processing}
                                    size="lg"
                                    leftIcon={<Save className="w-4 h-4" />}
                                >
                                    {processing ? "Menyimpan..." : "Buat Paket"}
                                </Button>
                            </div>
                        </Form>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

OutletServicePackageCreate.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Tambah Paket Layanan",
        breadcrumbs: [
            { label: "Outlets", href: route("outlets.index") },
            {
                label: page.props.outlet?.name || "Detail",
                href: route("outlets.show", page.props.outlet?.id),
            },
            { label: "Tambah Paket" },
        ],
    })(page);

export default OutletServicePackageCreate;
