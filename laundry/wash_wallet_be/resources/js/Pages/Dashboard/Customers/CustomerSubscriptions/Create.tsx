import React, { useState, useMemo } from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Save,
    ArrowLeft,
    Package,
    Calendar,
    DollarSign,
    User,
    Building,
    Tag,
    Clock,
    Info,
    Zap,
    ShoppingBag,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import { DateInput, NumberInput, SelectInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { customerService } from "@/Services/customer.service";
import { CustomerCustomerSubscriptionFormData, ServicePackage } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { CustomerSubscriptionCreateProps } from "./types";

const CustomerSubscriptionCreate = ({
    customer,
    servicePackages,
}: CustomerSubscriptionCreateProps) => {
    const {
        data,
        setData,
        processing,
        post,
        reset,
        errors,
        clearErrors,
        wasSuccessful,
    } = useForm<CustomerCustomerSubscriptionFormData>({
        servicePackageId: "",
        pricePaid: "",
        purchaseDate: new Date().toISOString().split("T")[0],
    });

    const [selectedPackage, setSelectedPackage] =
        useState<ServicePackage | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route("customers.customer-subscriptions.store", customer.id), {
            onSuccess: () => {
                reset();
                setSelectedPackage(null);
            },
            onError: () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                console.error("Form submission errors:", errors);
            },
        });
    };

    const handleDataChange = (
        key: keyof CustomerCustomerSubscriptionFormData,
        value: any,
    ) => {
        setData(key, value);

        if (errors[key]) {
            clearErrors(key);
        }

        if (key === "servicePackageId" && value) {
            const pkg = servicePackages.find(
                (p) => p.id.toString() === value.toString(),
            );
            setSelectedPackage(pkg || null);

            if (pkg && !data.pricePaid) {
                setData("pricePaid", pkg.price.toString());
            }
        }
    };

    const calculateExpiryDate = useMemo(() => {
        if (!selectedPackage || !data.purchaseDate) return null;

        if (!selectedPackage.validityDays) {
            return "Tidak terbatas";
        }

        const purchaseDate = new Date(data.purchaseDate);
        const expiryDate = new Date(purchaseDate);
        expiryDate.setDate(expiryDate.getDate() + selectedPackage.validityDays);

        return expiryDate.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    }, [selectedPackage, data.purchaseDate]);

    const packageOptions = useMemo(
        () => [
            { value: "", label: "Pilih Paket Layanan" },
            ...servicePackages
                .filter((pkg) => pkg.isActive)
                .map((pkg) => ({
                    value: pkg.id.toString(),
                    label: `${pkg.name} - ${formatCurrency(pkg.price)}`,
                    description: pkg.description || undefined,
                })),
        ],
        [servicePackages],
    );

    return (
        <>
            <Head title="Beli Paket Deposit" />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1">
                                <h1
                                    className="text-2xl font-bold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Beli Paket Deposit
                                </h1>
                                <p
                                    className="mt-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Pilih paket deposit untuk {customer.name}
                                </p>
                            </div>
                        </div>

                        {wasSuccessful && (
                            <Alert
                                variant="success"
                                title="Berhasil"
                                description="Paket deposit berhasil dibeli."
                                className="mb-6"
                            />
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="mb-6"
                    >
                        <Card className="p-6">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                                    style={{
                                        backgroundColor:
                                            "var(--color-primary-100)",
                                        color: "var(--color-primary-600)",
                                    }}
                                >
                                    {customer.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3
                                            className="text-xl font-bold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {customer.name}
                                        </h3>
                                        <Badge
                                            variant={
                                                customer.isActive
                                                    ? "success"
                                                    : "secondary"
                                            }
                                        >
                                            {customer.isActive
                                                ? "Aktif"
                                                : "Tidak Aktif"}
                                        </Badge>
                                    </div>
                                    <div
                                        className="flex flex-wrap items-center gap-4 text-sm"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        {customer.email && (
                                            <span className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                {customer.email}
                                            </span>
                                        )}
                                        {customer.phone && (
                                            <span className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                {customer.phone}
                                            </span>
                                        )}
                                        {customer.outlet && (
                                            <span className="flex items-center gap-1">
                                                <Building className="w-4 h-4" />
                                                {customer.outlet.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Form Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <Card className="p-8">
                            <Form onSubmit={handleSubmit} className="space-y-8">
                                {/* Package Selection */}
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
                                                Pilih Paket Deposit
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Pilih paket yang sesuai dengan
                                                kebutuhan
                                            </p>
                                        </div>
                                    </div>

                                    {servicePackages.length === 0 ? (
                                        <Alert
                                            variant="warning"
                                            title="Tidak Ada Paket Tersedia"
                                            description="Belum ada paket deposit yang tersedia untuk outlet ini."
                                        />
                                    ) : (
                                        <>
                                            <SelectInput
                                                label="Paket Deposit"
                                                placeholder="Pilih paket deposit..."
                                                value={data.servicePackageId}
                                                onChange={(e) =>
                                                    handleDataChange(
                                                        "servicePackageId",
                                                        e.target.value,
                                                    )
                                                }
                                                options={packageOptions}
                                                error={errors.servicePackageId}
                                                disabled={
                                                    processing ||
                                                    servicePackages.length === 0
                                                }
                                                required
                                                leftIcon={
                                                    <Tag className="w-5 h-5" />
                                                }
                                                hint="Pilih paket deposit yang diinginkan"
                                            />

                                            {/* Selected Package Info */}
                                            {selectedPackage && (
                                                <div
                                                    className="p-6 rounded-lg border-2"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--color-primary-50)",
                                                        borderColor:
                                                            "var(--color-primary-200)",
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex-1">
                                                            <h3
                                                                className="text-lg font-bold mb-2"
                                                                style={{
                                                                    color: "var(--color-primary-700)",
                                                                }}
                                                            >
                                                                {
                                                                    selectedPackage.name
                                                                }
                                                            </h3>
                                                            {selectedPackage.description && (
                                                                <p
                                                                    className="text-sm mb-4"
                                                                    style={{
                                                                        color: "var(--color-primary-600)",
                                                                    }}
                                                                >
                                                                    {
                                                                        selectedPackage.description
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                                        <div
                                                            className="p-4 rounded-lg"
                                                            style={{
                                                                backgroundColor:
                                                                    "var(--color-surface)",
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <DollarSign
                                                                    className="w-4 h-4"
                                                                    style={{
                                                                        color: "var(--color-success-600)",
                                                                    }}
                                                                />
                                                                <span
                                                                    className="text-xs font-medium"
                                                                    style={{
                                                                        color: "var(--color-text-secondary)",
                                                                    }}
                                                                >
                                                                    Harga Paket
                                                                </span>
                                                            </div>
                                                            <p
                                                                className="text-lg font-bold"
                                                                style={{
                                                                    color: "var(--color-text-primary)",
                                                                }}
                                                            >
                                                                {formatCurrency(
                                                                    selectedPackage.price,
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div
                                                            className="p-4 rounded-lg"
                                                            style={{
                                                                backgroundColor:
                                                                    "var(--color-surface)",
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Package
                                                                    className="w-4 h-4"
                                                                    style={{
                                                                        color: "var(--color-info-600)",
                                                                    }}
                                                                />
                                                                <span
                                                                    className="text-xs font-medium"
                                                                    style={{
                                                                        color: "var(--color-text-secondary)",
                                                                    }}
                                                                >
                                                                    Isi Paket
                                                                </span>
                                                            </div>
                                                            <p
                                                                className="text-lg font-bold"
                                                                style={{
                                                                    color: "var(--color-text-primary)",
                                                                }}
                                                            >
                                                                {selectedPackage.servicePackageItemsCount ||
                                                                    selectedPackage
                                                                        .servicePackageItems
                                                                        ?.length ||
                                                                    0}{" "}
                                                                Item
                                                            </p>
                                                        </div>

                                                        <div
                                                            className="p-4 rounded-lg"
                                                            style={{
                                                                backgroundColor:
                                                                    "var(--color-surface)",
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Clock
                                                                    className="w-4 h-4"
                                                                    style={{
                                                                        color: "var(--color-warning-600)",
                                                                    }}
                                                                />
                                                                <span
                                                                    className="text-xs font-medium"
                                                                    style={{
                                                                        color: "var(--color-text-secondary)",
                                                                    }}
                                                                >
                                                                    Masa Berlaku
                                                                </span>
                                                            </div>
                                                            <p
                                                                className="text-lg font-bold"
                                                                style={{
                                                                    color: "var(--color-text-primary)",
                                                                }}
                                                            >
                                                                {selectedPackage.validityDays
                                                                    ? `${selectedPackage.validityDays} Hari`
                                                                    : "Tidak Terbatas"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Package Items */}
                                                    {selectedPackage.servicePackageItems &&
                                                        selectedPackage
                                                            .servicePackageItems
                                                            .length > 0 && (
                                                            <div
                                                                className="p-4 rounded-lg"
                                                                style={{
                                                                    backgroundColor:
                                                                        "var(--color-surface)",
                                                                }}
                                                            >
                                                                <h4
                                                                    className="text-sm font-semibold mb-3 flex items-center gap-2"
                                                                    style={{
                                                                        color: "var(--color-text-primary)",
                                                                    }}
                                                                >
                                                                    <Zap
                                                                        className="w-4 h-4"
                                                                        style={{
                                                                            color: "var(--color-primary-600)",
                                                                        }}
                                                                    />
                                                                    Isi Paket
                                                                    Deposit:
                                                                </h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    {selectedPackage.servicePackageItems.map(
                                                                        (
                                                                            item,
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    item.id
                                                                                }
                                                                                className="flex items-center justify-between p-3 rounded-lg border"
                                                                                style={{
                                                                                    borderColor:
                                                                                        "var(--color-border)",
                                                                                }}
                                                                            >
                                                                                <div className="flex items-center gap-2">
                                                                                    <Zap
                                                                                        className="w-4 h-4"
                                                                                        style={{
                                                                                            color: "var(--color-primary-500)",
                                                                                        }}
                                                                                    />
                                                                                    <span
                                                                                        className="text-sm font-medium"
                                                                                        style={{
                                                                                            color: "var(--color-text-primary)",
                                                                                        }}
                                                                                    >
                                                                                        {item
                                                                                            .laundryService
                                                                                            .name ||
                                                                                            "Item"}
                                                                                    </span>
                                                                                </div>
                                                                                <Badge
                                                                                    variant="primary"
                                                                                    size="sm"
                                                                                >
                                                                                    {
                                                                                        item.quantity
                                                                                    }

                                                                                    x
                                                                                </Badge>
                                                                            </div>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Purchase Details */}
                                {selectedPackage && (
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
                                                        "var(--color-success-100)",
                                                }}
                                            >
                                                <ShoppingBag
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
                                                    Detail Pembelian
                                                </h2>
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Informasi pembayaran dan
                                                    tanggal pembelian
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <NumberInput
                                                label="Harga Dibayar"
                                                value={
                                                    data.pricePaid
                                                        ? parseFloat(
                                                              data.pricePaid,
                                                          )
                                                        : 0
                                                }
                                                onValueChange={(value) =>
                                                    handleDataChange(
                                                        "pricePaid",
                                                        value
                                                            ? value.toString()
                                                            : "",
                                                    )
                                                }
                                                error={errors.pricePaid}
                                                disabled={processing}
                                                min={0}
                                                prefix="Rp "
                                                thousandSeparator="."
                                                decimalSeparator=","
                                                leftIcon={
                                                    <DollarSign className="w-5 h-5" />
                                                }
                                                hint={`Harga paket: ${formatCurrency(
                                                    selectedPackage.price,
                                                )}`}
                                                required
                                            />

                                            <DateInput
                                                label="Tanggal Pembelian"
                                                value={data.purchaseDate}
                                                onChange={(e) =>
                                                    handleDataChange(
                                                        "purchaseDate",
                                                        e.target.value,
                                                    )
                                                }
                                                error={errors.purchaseDate}
                                                disabled={processing}
                                                max={
                                                    new Date()
                                                        .toISOString()
                                                        .split("T")[0]
                                                }
                                                leftIcon={
                                                    <Calendar className="w-5 h-5" />
                                                }
                                                hint="Tanggal pembelian paket deposit"
                                                required
                                            />
                                        </div>

                                        {/* Purchase Summary */}
                                        {calculateExpiryDate && (
                                            <div
                                                className="p-4 rounded-lg"
                                                style={{
                                                    backgroundColor:
                                                        "var(--color-surface-secondary)",
                                                }}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Info
                                                        className="w-5 h-5 mt-0.5"
                                                        style={{
                                                            color: "var(--color-info-600)",
                                                        }}
                                                    />
                                                    <div className="flex-1">
                                                        <h4
                                                            className="font-medium mb-2"
                                                            style={{
                                                                color: "var(--color-text-primary)",
                                                            }}
                                                        >
                                                            Ringkasan Pembelian
                                                        </h4>
                                                        <div
                                                            className="space-y-1 text-sm"
                                                            style={{
                                                                color: "var(--color-text-secondary)",
                                                            }}
                                                        >
                                                            <p>
                                                                Paket deposit
                                                                akan aktif dari{" "}
                                                                <strong>
                                                                    {new Date(
                                                                        data.purchaseDate,
                                                                    ).toLocaleDateString(
                                                                        "id-ID",
                                                                        {
                                                                            day: "2-digit",
                                                                            month: "long",
                                                                            year: "numeric",
                                                                        },
                                                                    )}
                                                                </strong>
                                                                {selectedPackage.validityDays && (
                                                                    <>
                                                                        {" "}
                                                                        hingga{" "}
                                                                        <strong>
                                                                            {
                                                                                calculateExpiryDate
                                                                            }
                                                                        </strong>
                                                                    </>
                                                                )}
                                                            </p>
                                                            <p>
                                                                Total kuota:{" "}
                                                                <strong>
                                                                    {selectedPackage.servicePackageItemsCount ||
                                                                        selectedPackage
                                                                            .servicePackageItems
                                                                            ?.length ||
                                                                        0}{" "}
                                                                    layanan
                                                                </strong>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

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
                                        onClick={() =>
                                            customerService.goToView(
                                                customer.id,
                                            )
                                        }
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
                                            processing ||
                                            !data.servicePackageId ||
                                            !data.pricePaid ||
                                            !data.purchaseDate ||
                                            servicePackages.length === 0
                                        }
                                        loading={processing}
                                        size="lg"
                                        leftIcon={<Save className="w-4 h-4" />}
                                    >
                                        {processing
                                            ? "Memproses..."
                                            : "Beli Paket Deposit"}
                                    </Button>
                                </div>
                            </Form>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

CustomerSubscriptionCreate.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Beli Paket Deposit",
        breadcrumbs: [
            { label: "Pelanggan", href: route("customers.index") },
            {
                label: page.props.customer.name,
                href: route("customers.show", page.props.customer.id),
            },
            { label: "Beli Paket Deposit" },
        ],
    })(page);

export default CustomerSubscriptionCreate;
