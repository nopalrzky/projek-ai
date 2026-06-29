import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Package,
    Clock,
    CheckCircle2,
    XCircle,
    List,
    TrendingUp,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Card, CardContent, CardHeader } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CustomerSubscriptionShowProps } from "./types";

function CustomerSubscriptionShow({
    customer,
    customerSubscription,
}: CustomerSubscriptionShowProps) {
    const getStatusVariant = (status: string) => {
        const variants: Record<string, any> = {
            active: "success",
            expired: "error",
            cancelled: "warning",
        };
        return variants[status] || "secondary";
    };

    const totalQuota = customerSubscription.customerQuotas.reduce(
        (sum, quota) => sum + quota.totalQuota,
        0,
    );

    const remainingQuota = customerSubscription.customerQuotas?.reduce(
        (sum, quota) => sum + quota.remainingQuota,
        0,
    );

    const usedQuota = totalQuota - remainingQuota;
    const usagePercentage =
        totalQuota > 0 ? ((usedQuota / totalQuota) * 100).toFixed(1) : 0;

    return (
        <>
            <Head
                title={`Detail Deposit - ${customerSubscription.servicePackage?.name}`}
            />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Detail Paket Deposit"
                        subtitle={`Informasi detail paket deposit ${customerSubscription.servicePackage?.name} untuk ${customer.name}`}
                        icon={Package}
                        animate={true}
                    />

                    {customerSubscription.status === "expired" && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Alert
                                variant="error"
                                title="Paket Sudah Expired"
                                description={`Paket ini telah berakhir pada ${formatDate(customerSubscription.expiredAt)}. Pelanggan tidak dapat lagi menggunakan kuota dari paket ini.`}
                            />
                        </motion.div>
                    )}

                    {customerSubscription.status === "canceled" && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Alert
                                variant="warning"
                                title="Paket Dibatalkan"
                                description="Paket deposit ini telah dibatalkan dan tidak dapat digunakan."
                            />
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
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
                                                    Detail paket deposit yang
                                                    dibeli
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center pb-3 border-b">
                                                <span
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Kode Subscription
                                                </span>
                                                <span
                                                    className="font-mono font-medium"
                                                    style={{
                                                        color: "var(--color-text-primary)",
                                                    }}
                                                >
                                                    {
                                                        customerSubscription.subscriptionCode
                                                    }
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center pb-3 border-b">
                                                <span
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Nama Paket
                                                </span>
                                                <span
                                                    className="font-semibold"
                                                    style={{
                                                        color: "var(--color-text-primary)",
                                                    }}
                                                >
                                                    {
                                                        customerSubscription
                                                            .servicePackage
                                                            ?.name
                                                    }
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center pb-3 border-b">
                                                <span
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Harga Dibayar
                                                </span>
                                                <span
                                                    className="font-semibold text-lg"
                                                    style={{
                                                        color: "var(--color-primary-600)",
                                                    }}
                                                >
                                                    {formatCurrency(
                                                        customerSubscription.pricePaid,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center pb-3 border-b">
                                                <span
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Tanggal Pembelian
                                                </span>
                                                <span
                                                    className="font-medium"
                                                    style={{
                                                        color: "var(--color-text-primary)",
                                                    }}
                                                >
                                                    {formatDate(
                                                        customerSubscription.purchaseDate,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center pb-3 border-b">
                                                <span
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Masa Berlaku
                                                </span>
                                                <div className="text-right">
                                                    {customerSubscription.isUnlimited ? (
                                                        <Badge variant="success">
                                                            Tidak Terbatas
                                                        </Badge>
                                                    ) : (
                                                        <>
                                                            <p
                                                                className="font-medium mb-1"
                                                                style={{
                                                                    color: "var(--color-text-primary)",
                                                                }}
                                                            >
                                                                {formatDate(
                                                                    customerSubscription.expiredAt,
                                                                )}
                                                            </p>
                                                            {customerSubscription.status ===
                                                                "active" && (
                                                                <p
                                                                    className="text-sm"
                                                                    style={{
                                                                        color: "var(--color-text-tertiary)",
                                                                    }}
                                                                >
                                                                    {
                                                                        customerSubscription.remainingDays
                                                                    }{" "}
                                                                    hari lagi
                                                                </p>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Status
                                                </span>
                                                <Badge
                                                    variant={getStatusVariant(
                                                        customerSubscription.status,
                                                    )}
                                                >
                                                    {
                                                        customerSubscription.statusLabel
                                                    }
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="p-3 rounded-lg"
                                                style={{
                                                    backgroundColor:
                                                        "var(--color-success-100)",
                                                }}
                                            >
                                                <List
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
                                                    Layanan yang termasuk dalam
                                                    paket
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {customerSubscription.servicePackage?.servicePackageItems?.map(
                                                (item, index) => (
                                                    <div
                                                        key={item.id}
                                                        className="p-4 rounded-lg border"
                                                        style={{
                                                            borderColor:
                                                                "var(--color-border)",
                                                            backgroundColor:
                                                                "var(--color-surface)",
                                                        }}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex-1">
                                                                <h4
                                                                    className="font-semibold mb-1"
                                                                    style={{
                                                                        color: "var(--color-text-primary)",
                                                                    }}
                                                                >
                                                                    {
                                                                        item
                                                                            .laundryService
                                                                            ?.name
                                                                    }
                                                                </h4>
                                                                <p
                                                                    className="text-sm"
                                                                    style={{
                                                                        color: "var(--color-text-secondary)",
                                                                    }}
                                                                >
                                                                    {
                                                                        item
                                                                            .laundryService
                                                                            ?.category
                                                                            ?.name
                                                                    }
                                                                </p>
                                                            </div>
                                                            <Badge variant="primary">
                                                                {item.quantity}x
                                                            </Badge>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span
                                                                style={{
                                                                    color: "var(--color-text-tertiary)",
                                                                }}
                                                            >
                                                                Harga Satuan
                                                            </span>
                                                            <span
                                                                className="font-medium"
                                                                style={{
                                                                    color: "var(--color-text-primary)",
                                                                }}
                                                            >
                                                                {formatCurrency(
                                                                    item
                                                                        .laundryService
                                                                        ?.price ||
                                                                        0,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="p-3 rounded-lg"
                                                style={{
                                                    backgroundColor:
                                                        "var(--color-warning-100)",
                                                }}
                                            >
                                                <TrendingUp
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
                                                    Detail Kuota
                                                </h2>
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Penggunaan kuota per layanan
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {customerSubscription.customerQuotas?.map(
                                                (quota) => {
                                                    const percentage =
                                                        quota.totalQuota > 0
                                                            ? (
                                                                  (quota.remainingQuota /
                                                                      quota.totalQuota) *
                                                                  100
                                                              ).toFixed(1)
                                                            : 0;

                                                    return (
                                                        <div
                                                            key={quota.id}
                                                            className="space-y-2"
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <span
                                                                    className="font-medium"
                                                                    style={{
                                                                        color: "var(--color-text-primary)",
                                                                    }}
                                                                >
                                                                    {
                                                                        quota
                                                                            .laundryService
                                                                            ?.name
                                                                    }
                                                                </span>
                                                                <span
                                                                    className="text-sm font-medium"
                                                                    style={{
                                                                        color: "var(--color-text-secondary)",
                                                                    }}
                                                                >
                                                                    {
                                                                        quota.remainingQuota
                                                                    }{" "}
                                                                    /{" "}
                                                                    {
                                                                        quota.totalQuota
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div
                                                                className="h-2 rounded-full overflow-hidden"
                                                                style={{
                                                                    backgroundColor:
                                                                        "var(--color-gray-200)",
                                                                }}
                                                            >
                                                                <div
                                                                    className="h-full transition-all duration-300"
                                                                    style={{
                                                                        width: `${percentage}%`,
                                                                        backgroundColor:
                                                                            Number(
                                                                                percentage,
                                                                            ) >
                                                                            50
                                                                                ? "var(--color-success-500)"
                                                                                : Number(
                                                                                        percentage,
                                                                                    ) >
                                                                                    20
                                                                                  ? "var(--color-warning-500)"
                                                                                  : "var(--color-error-500)",
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <h3
                                            className="font-semibold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            Ringkasan Penggunaan
                                        </h3>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div
                                                className="p-4 rounded-lg"
                                                style={{
                                                    backgroundColor:
                                                        "var(--color-primary-50)",
                                                }}
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <CheckCircle2
                                                        className="w-5 h-5"
                                                        style={{
                                                            color: "var(--color-primary-600)",
                                                        }}
                                                    />
                                                    <span
                                                        className="text-sm font-medium"
                                                        style={{
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        Total Kuota
                                                    </span>
                                                </div>
                                                <p
                                                    className="text-2xl font-bold"
                                                    style={{
                                                        color: "var(--color-primary-600)",
                                                    }}
                                                >
                                                    {totalQuota}
                                                </p>
                                            </div>

                                            <div
                                                className="p-4 rounded-lg"
                                                style={{
                                                    backgroundColor:
                                                        "var(--color-success-50)",
                                                }}
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Clock
                                                        className="w-5 h-5"
                                                        style={{
                                                            color: "var(--color-success-600)",
                                                        }}
                                                    />
                                                    <span
                                                        className="text-sm font-medium"
                                                        style={{
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        Kuota Tersisa
                                                    </span>
                                                </div>
                                                <p
                                                    className="text-2xl font-bold"
                                                    style={{
                                                        color: "var(--color-success-600)",
                                                    }}
                                                >
                                                    {remainingQuota}
                                                </p>
                                            </div>

                                            <div
                                                className="p-4 rounded-lg"
                                                style={{
                                                    backgroundColor:
                                                        "var(--color-warning-50)",
                                                }}
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <XCircle
                                                        className="w-5 h-5"
                                                        style={{
                                                            color: "var(--color-warning-600)",
                                                        }}
                                                    />
                                                    <span
                                                        className="text-sm font-medium"
                                                        style={{
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        Kuota Terpakai
                                                    </span>
                                                </div>
                                                <p
                                                    className="text-2xl font-bold"
                                                    style={{
                                                        color: "var(--color-warning-600)",
                                                    }}
                                                >
                                                    {usedQuota}
                                                </p>
                                                <p
                                                    className="text-sm mt-1"
                                                    style={{
                                                        color: "var(--color-text-tertiary)",
                                                    }}
                                                >
                                                    {usagePercentage}% digunakan
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <h3
                                            className="font-semibold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            Informasi Pelanggan
                                        </h3>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div>
                                                <p
                                                    className="text-sm mb-1"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Nama
                                                </p>
                                                <p
                                                    className="font-medium"
                                                    style={{
                                                        color: "var(--color-text-primary)",
                                                    }}
                                                >
                                                    {customer.name}
                                                </p>
                                            </div>

                                            <div>
                                                <p
                                                    className="text-sm mb-1"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    No. Telepon
                                                </p>
                                                <p
                                                    className="font-medium"
                                                    style={{
                                                        color: "var(--color-text-primary)",
                                                    }}
                                                >
                                                    {customer.phone}
                                                </p>
                                            </div>

                                            {customer.email && (
                                                <div>
                                                    <p
                                                        className="text-sm mb-1"
                                                        style={{
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        Email
                                                    </p>
                                                    <p
                                                        className="font-medium"
                                                        style={{
                                                            color: "var(--color-text-primary)",
                                                        }}
                                                    >
                                                        {customer.email}
                                                    </p>
                                                </div>
                                            )}

                                            <div>
                                                <p
                                                    className="text-sm mb-1"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Outlet
                                                </p>
                                                <p
                                                    className="font-medium"
                                                    style={{
                                                        color: "var(--color-text-primary)",
                                                    }}
                                                >
                                                    {customer.outlet?.name}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

CustomerSubscriptionShow.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Detail Deposit",
        searchable: false,
        breadcrumbs: [
            { label: "Pelanggan", href: route("customers.index") },
            {
                label: page.props.customer.name,
                href: route("customers.show", page.props.customer.id),
            },
            { label: "Deposit", href: "#" },
        ],
    })(page);

export default CustomerSubscriptionShow;
