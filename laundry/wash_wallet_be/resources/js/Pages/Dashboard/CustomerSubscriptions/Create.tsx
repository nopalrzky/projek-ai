import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { Input, SelectInput } from "@/Components/Input";
import { Alert } from "@/Components/Alert";
import { Form } from "@/Components/Form";
import PageHeader from "@/Components/Page/PageHeader";
import {
    Save,
    ArrowLeft,
    User,
    Package,
    DollarSign,
    Calendar,
    CreditCard,
    Plus,
    Building,
} from "lucide-react";
import { customerSubscriptionService } from "@/Services/customer-subscription.service";
import {
    CustomerSubscriptionFormData,
    Customer,
    ServicePackage,
} from "@/types";
import { CustomerSubscriptionCreateProps } from "./types";
import { useState, useEffect, useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { customerService } from "@/Services/customer.service";
import { servicePackageService } from "@/Services/service_package.service";
import { useLatestAsync } from "@/Hooks/useLatestAsync";

const CustomerSubscriptionCreate = ({
    outlets,
    errors,
    flash,
}: CustomerSubscriptionCreateProps) => {
    const [formData, setFormData] = useState<CustomerSubscriptionFormData>({
        customerId: 0,
        servicePackageId: 0,
        pricePaid: 0,
        purchaseDate: new Date().toISOString().split("T")[0],
    });
    const [selectedOutletId, setSelectedOutletId] = useState<string>("");
    const [processing, setProcessing] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [availableCustomers, setAvailableCustomers] = useState<Customer[]>(
        [],
    );
    const [availableServicePackages, setAvailableServicePackages] = useState<
        ServicePackage[]
    >([]);
    const [isLoadingLookups, setIsLoadingLookups] = useState(false);
    const [lookupError, setLookupError] = useState<string | null>(null);

    const { runLatest: runLatestLookups } = useLatestAsync();

    const outletOptions = useMemo(
        () => [
            { value: "", label: "Pilih Outlet" },
            ...outlets.map((outlet) => ({
                value: outlet.id.toString(),
                label: `${outlet.name}${outlet.code ? ` - ${outlet.code}` : ""}`,
            })),
        ],
        [outlets],
    );

    const customerOptions = useMemo(
        () => [
            { value: "", label: "Pilih Customer" },
            ...availableCustomers.map((customer) => ({
                value: customer.id.toString(),
                label: `${customer.name} - ${customer.phone || "No Phone"}`,
            })),
        ],
        [availableCustomers],
    );

    const servicePackageOptions = useMemo(
        () => [
            { value: "", label: "Pilih Paket Layanan" },
            ...availableServicePackages.map((pkg) => ({
                value: pkg.id.toString(),
                label: `${pkg.name} - ${formatCurrency(pkg.price)}`,
            })),
        ],
        [availableServicePackages],
    );

    useEffect(() => {
        if (formData.servicePackageId) {
            const pkg = availableServicePackages.find(
                (p) => p.id === Number(formData.servicePackageId),
            );
            setSelectedPackage(pkg);
            if (pkg) {
                setFormData((prev) => ({
                    ...prev,
                    pricePaid: pkg.price,
                }));
            }
        } else {
            setSelectedPackage(null);
        }
    }, [formData.servicePackageId, availableServicePackages]);

    useEffect(() => {
        if (!selectedOutletId) {
            setAvailableCustomers([]);
            setAvailableServicePackages([]);
            setSelectedPackage(null);
            setFormData((prev) => ({
                ...prev,
                customerId: 0,
                servicePackageId: 0,
                pricePaid: 0,
            }));
            return;
        }

        const outletId = Number(selectedOutletId);
        setIsLoadingLookups(true);
        setLookupError(null);
        setAvailableCustomers([]);
        setAvailableServicePackages([]);
        setSelectedPackage(null);
        setFormData((prev) => ({
            ...prev,
            customerId: 0,
            servicePackageId: 0,
            pricePaid: 0,
        }));

        runLatestLookups(
            outletId,
            async () => await Promise.all([
                customerService.getAll(outletId),
                servicePackageService.getAll(outletId),
            ]),
            {
                onSuccess: ([customersResponse, servicePackagesResponse]) => {
                    setAvailableCustomers(customersResponse || []);
                    setAvailableServicePackages(servicePackagesResponse || []);
                },
                onError: (error) => {
                    console.error("Failed to load outlet lookup data:", error);
                    setLookupError(
                        "Gagal memuat customer dan paket layanan untuk outlet ini.",
                    );
                },
                onFinally: () => {
                    setIsLoadingLookups(false);
                }
            }
        );
    }, [selectedOutletId, runLatestLookups]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedOutletId) {
            return;
        }

        setProcessing(true);

        const submitData = {
            customerId: Number(formData.customerId),
            servicePackageId: Number(formData.servicePackageId),
            pricePaid: Number(formData.pricePaid),
            purchaseDate: formData.purchaseDate,
        };

        router.post(route("customer-subscriptions.store"), submitData, {
            preserveScroll: true,
            onError: () => {
                setProcessing(false);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const handleDataChange = (
        key: keyof CustomerSubscriptionFormData,
        value: any,
    ) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleOutletChange = (value: string) => {
        setSelectedOutletId(value);
    };

    const handleCancel = () => {
        customerSubscriptionService.goToIndex();
    };

    return (
        <>
            <Head title="Tambah Subscription" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Tambah Deposit Pelanggan Baru"
                        subtitle="Buat deposit paket layanan untuk customer"
                        icon={Plus}
                        variant="default"
                        actions={
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                leftIcon={<ArrowLeft className="w-4 h-4" />}
                            >
                                Kembali
                            </Button>
                        }
                    />

                    {flash?.error && (
                        <Alert
                            variant="error"
                            title="Error"
                            description={flash.error}
                        />
                    )}
                    {lookupError && (
                        <Alert
                            variant="error"
                            title="Gagal Memuat Data"
                            description={lookupError}
                        />
                    )}
                    <div className="lg:col-span-2">
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
                                                    "var(--color-warning-100)",
                                            }}
                                        >
                                            <Package
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
                                                Pilih Outlet
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Tentukan outlet terlebih dahulu
                                                untuk memuat customer dan paket
                                                layanan yang relevan
                                            </p>
                                        </div>
                                    </div>

                                    <SelectInput
                                        label="Outlet"
                                        required
                                        value={selectedOutletId}
                                        onChange={(e) =>
                                            handleOutletChange(e.target.value)
                                        }
                                        options={outletOptions}
                                        error={errors?.outletId}
                                        disabled={processing}
                                        leftIcon={
                                            <Building className="w-5 h-5" />
                                        }
                                        hint="Pilih outlet terlebih dahulu"
                                        placeholder="Pilih outlet..."
                                        searchable
                                    />
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
                                            <User
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
                                                Informasi Customer
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Pilih customer untuk
                                                subscription
                                            </p>
                                        </div>
                                    </div>

                                    <SelectInput
                                        label="Customer"
                                        required
                                        value={formData.customerId.toString()}
                                        onChange={(e) =>
                                            handleDataChange(
                                                "customerId",
                                                e.target.value,
                                            )
                                        }
                                        options={customerOptions}
                                        error={errors?.customerId}
                                        disabled={
                                            processing ||
                                            !selectedOutletId ||
                                            isLoadingLookups
                                        }
                                        loading={isLoadingLookups}
                                        leftIcon={<User className="w-5 h-5" />}
                                        hint={
                                            selectedOutletId
                                                ? "Pilih customer yang akan berlangganan"
                                                : "Pilih outlet terlebih dahulu"
                                        }
                                        placeholder={
                                            selectedOutletId
                                                ? "Pilih customer..."
                                                : "Pilih outlet dulu"
                                        }
                                        searchable
                                    />
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
                                                Paket Layanan
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Pilih paket yang akan dibeli
                                            </p>
                                        </div>
                                    </div>

                                    <SelectInput
                                        label="Paket Layanan"
                                        required
                                        value={formData.servicePackageId.toString()}
                                        onChange={(e) =>
                                            handleDataChange(
                                                "servicePackageId",
                                                e.target.value,
                                            )
                                        }
                                        options={servicePackageOptions}
                                        error={errors?.servicePackageId}
                                        disabled={
                                            processing ||
                                            !selectedOutletId ||
                                            isLoadingLookups
                                        }
                                        loading={isLoadingLookups}
                                        leftIcon={
                                            <Package className="w-5 h-5" />
                                        }
                                        hint={
                                            selectedOutletId
                                                ? "Pilih paket layanan yang tersedia"
                                                : "Pilih outlet terlebih dahulu"
                                        }
                                        placeholder={
                                            selectedOutletId
                                                ? "Pilih paket layanan..."
                                                : "Pilih outlet dulu"
                                        }
                                        searchable
                                    />
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
                                                    "var(--color-info-100)",
                                            }}
                                        >
                                            <CreditCard
                                                className="w-6 h-6"
                                                style={{
                                                    color: "var(--color-info-600)",
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
                                                Informasi Pembayaran
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Detail transaksi pembelian
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Harga Dibayar"
                                            type="number"
                                            required
                                            value={formData.pricePaid}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "pricePaid",
                                                    Number(e.target.value),
                                                )
                                            }
                                            error={errors?.pricePaid}
                                            placeholder="0"
                                            disabled={processing}
                                            leftIcon={
                                                <DollarSign className="w-5 h-5" />
                                            }
                                            hint="Harga yang dibayarkan customer"
                                            min={0}
                                            step={1000}
                                        />

                                        <Input
                                            label="Tanggal Pembelian"
                                            type="date"
                                            required
                                            value={formData.purchaseDate}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "purchaseDate",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors?.purchaseDate}
                                            disabled={processing}
                                            leftIcon={
                                                <Calendar className="w-5 h-5" />
                                            }
                                            hint="Tanggal customer membeli paket"
                                            max={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                        />
                                    </div>
                                </div>

                                {errors && Object.keys(errors).length > 0 && (
                                    <Alert
                                        variant="error"
                                        title="Terdapat kesalahan pada form"
                                        description="Silakan periksa kembali semua field yang bertanda merah."
                                    />
                                )}

                                <div
                                    className="flex items-center justify-end gap-3 pt-6 border-t"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCancel}
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
                                            !selectedOutletId ||
                                            !formData.customerId ||
                                            !formData.servicePackageId ||
                                            !formData.pricePaid
                                        }
                                        loading={processing}
                                        size="lg"
                                        leftIcon={<Save className="w-4 h-4" />}
                                    >
                                        {processing
                                            ? "Menyimpan..."
                                            : "Simpan Subscription"}
                                    </Button>
                                </div>
                            </Form>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

CustomerSubscriptionCreate.layout = withAuthenticatedLayout({
    title: "Tambah Deposit Pelanggan",
    breadcrumbs: [
        {
            label: "Deposit Pelanggan",
            href: route("customer-subscriptions.index"),
        },
        { label: "Tambah Deposit" },
    ],
});

export default CustomerSubscriptionCreate;
