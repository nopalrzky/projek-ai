import React, { useState, useMemo } from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Save,
    ArrowLeft,
    Star,
    Calendar,
    DollarSign,
    User,
    Building,
    Tag,
    Award,
    Clock,
    Info,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import { DateInput, NumberInput, SelectInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { customerService } from "@/Services/customer.service";
import { CustomerMembershipContractFormData, MembershipPlan } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { CustomerMembershipContractCreateProps } from "./types";
import PageHeader from "@/Components/Page/PageHeader";

const CustomerMembershipContractCreate = ({
    customer,
    membershipPlans,
}: CustomerMembershipContractCreateProps) => {
    const { data, setData, processing, errors, clearErrors, post, reset } =
        useForm<CustomerMembershipContractFormData>({
            membershipPlanId: "",
            startDate: new Date().toISOString().split("T")[0],
            totalPaid: "",
        });

    const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(
        null,
    );

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route("customers.membership-contracts.store", customer.id), {
            onSuccess: () => {
                reset();
                setSelectedPlan(null);
            },
            onError: () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                console.error("Failed to create membership contract");
            },
        });
    };
    const handleDataChange = (
        key: keyof CustomerMembershipContractFormData,
        value: any,
    ) => {
        setData(key, value);

        if (errors[key]) {
            clearErrors(key);
        }

        if (key === "membershipPlanId" && value) {
            const plan = membershipPlans.find(
                (p) => p.id.toString() === value.toString(),
            );
            setSelectedPlan(plan || null);

            if (plan && !data.totalPaid) {
                setData("totalPaid", plan.price.toString());
            }
        }
    };

    const calculateExpiryDate = useMemo(() => {
        if (!selectedPlan || !data.startDate) return null;

        const startDate = new Date(data.startDate);
        const expiryDate = new Date(startDate);
        expiryDate.setDate(expiryDate.getDate() + selectedPlan.durationDays);

        return expiryDate.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    }, [selectedPlan, data.startDate]);

    const planOptions = useMemo(
        () => [
            { value: "", label: "Pilih Paket Membership" },
            ...membershipPlans
                .filter((plan) => plan.isActive)
                .map((plan) => ({
                    value: plan.id.toString(),
                    label: `${plan.name} - ${formatCurrency(plan.price)}`,
                    description: plan.description || undefined,
                })),
        ],
        [membershipPlans],
    );

    return (
        <>
            <Head title="Beli Membership" />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Beli Membership"
                        subtitle={`Beli paket membership untuk pelanggan ${customer.name}`}
                        icon={Star}
                        animate={true}
                        actions={
                            <Button
                                href={route("customers.show", customer.id)}
                                variant="secondary"
                                leftIcon={<ArrowLeft className="w-4 h-4" />}
                            >
                                Kembali ke Daftar Membership
                            </Button>
                        }
                    />
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

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
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
                                            <Star
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
                                                Pilih Paket Membership
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

                                    {membershipPlans.length === 0 ? (
                                        <Alert
                                            variant="warning"
                                            title="Tidak Ada Paket Tersedia"
                                            description="Belum ada paket membership yang tersedia untuk outlet ini."
                                        />
                                    ) : (
                                        <>
                                            <SelectInput
                                                label="Paket Membership"
                                                placeholder="Pilih paket membership..."
                                                value={data.membershipPlanId}
                                                onChange={(e) =>
                                                    handleDataChange(
                                                        "membershipPlanId",
                                                        e.target.value,
                                                    )
                                                }
                                                options={planOptions}
                                                error={errors.membershipPlanId}
                                                disabled={
                                                    processing ||
                                                    membershipPlans.length === 0
                                                }
                                                required
                                                leftIcon={
                                                    <Tag className="w-5 h-5" />
                                                }
                                                hint="Pilih paket membership yang diinginkan"
                                            />

                                            {selectedPlan && (
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
                                                                    selectedPlan.name
                                                                }
                                                            </h3>
                                                            {selectedPlan.description && (
                                                                <p
                                                                    className="text-sm mb-4"
                                                                    style={{
                                                                        color: "var(--color-primary-600)",
                                                                    }}
                                                                >
                                                                    {
                                                                        selectedPlan.description
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                        <Badge
                                                            variant="primary"
                                                            size="lg"
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                <Award className="w-4 h-4" />
                                                                {
                                                                    selectedPlan.discountPercentage
                                                                }
                                                                % OFF
                                                            </div>
                                                        </Badge>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                                                    Harga
                                                                </span>
                                                            </div>
                                                            <p
                                                                className="text-lg font-bold"
                                                                style={{
                                                                    color: "var(--color-text-primary)",
                                                                }}
                                                            >
                                                                {formatCurrency(
                                                                    selectedPlan.price,
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
                                                                <Clock
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
                                                                    Durasi
                                                                </span>
                                                            </div>
                                                            <p
                                                                className="text-lg font-bold"
                                                                style={{
                                                                    color: "var(--color-text-primary)",
                                                                }}
                                                            >
                                                                {
                                                                    selectedPlan.durationDays
                                                                }{" "}
                                                                Hari
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
                                                                <Award
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
                                                                    Diskon
                                                                </span>
                                                            </div>
                                                            <p
                                                                className="text-lg font-bold"
                                                                style={{
                                                                    color: "var(--color-text-primary)",
                                                                }}
                                                            >
                                                                {
                                                                    selectedPlan.discountPercentage
                                                                }
                                                                %
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {selectedPlan && (
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
                                                <Calendar
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
                                                    Detail Kontrak
                                                </h2>
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Informasi pembayaran dan
                                                    periode kontrak
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <DateInput
                                                label="Tanggal Mulai"
                                                value={data.startDate}
                                                onChange={(e) =>
                                                    handleDataChange(
                                                        "startDate",
                                                        e.target.value,
                                                    )
                                                }
                                                error={errors.startDate}
                                                disabled={processing}
                                                min={
                                                    new Date()
                                                        .toISOString()
                                                        .split("T")[0]
                                                }
                                                leftIcon={
                                                    <Calendar className="w-5 h-5" />
                                                }
                                                hint="Tanggal mulai membership berlaku"
                                                required
                                            />

                                            <NumberInput
                                                label="Total Pembayaran"
                                                value={
                                                    data.totalPaid
                                                        ? parseFloat(
                                                              data.totalPaid,
                                                          )
                                                        : 0
                                                }
                                                onValueChange={(value) =>
                                                    handleDataChange(
                                                        "totalPaid",
                                                        value
                                                            ? value.toString()
                                                            : "",
                                                    )
                                                }
                                                error={errors.totalPaid}
                                                disabled={processing}
                                                min={0}
                                                prefix="Rp "
                                                thousandSeparator="."
                                                decimalSeparator=","
                                                leftIcon={
                                                    <DollarSign className="w-5 h-5" />
                                                }
                                                hint={`Harga paket: ${formatCurrency(
                                                    selectedPlan.price,
                                                )}`}
                                            />
                                        </div>

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
                                                            Ringkasan Kontrak
                                                        </h4>
                                                        <div
                                                            className="space-y-1 text-sm"
                                                            style={{
                                                                color: "var(--color-text-secondary)",
                                                            }}
                                                        >
                                                            <p>
                                                                Membership akan
                                                                berlaku dari{" "}
                                                                <strong>
                                                                    {new Date(
                                                                        data.startDate,
                                                                    ).toLocaleDateString(
                                                                        "id-ID",
                                                                        {
                                                                            day: "2-digit",
                                                                            month: "long",
                                                                            year: "numeric",
                                                                        },
                                                                    )}
                                                                </strong>{" "}
                                                                hingga{" "}
                                                                <strong>
                                                                    {
                                                                        calculateExpiryDate
                                                                    }
                                                                </strong>
                                                            </p>
                                                            <p>
                                                                Durasi:{" "}
                                                                <strong>
                                                                    {
                                                                        selectedPlan.durationDays
                                                                    }{" "}
                                                                    hari
                                                                </strong>
                                                            </p>
                                                            <p>
                                                                Diskon setiap
                                                                transaksi:{" "}
                                                                <strong
                                                                    style={{
                                                                        color: "var(--color-success-600)",
                                                                    }}
                                                                >
                                                                    {
                                                                        selectedPlan.discountPercentage
                                                                    }
                                                                    %
                                                                </strong>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {Object.keys(errors).length > 0 && (
                                    <Alert
                                        variant="error"
                                        title="Terdapat kesalahan pada form"
                                        description="Silakan periksa kembali semua field yang bertanda merah."
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
                                            !data.membershipPlanId ||
                                            !data.startDate ||
                                            membershipPlans.length === 0
                                        }
                                        loading={processing}
                                        size="lg"
                                        leftIcon={<Save className="w-4 h-4" />}
                                    >
                                        {processing
                                            ? "Memproses..."
                                            : "Beli Membership"}
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

CustomerMembershipContractCreate.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Beli Membership",
        breadcrumbs: [
            { label: "Pelanggan", href: route("customers.index") },
            {
                label: page.props.customer.name,
                href: route("customers.show", page.props.customer.id),
            },
            { label: "Beli Membership" },
        ],
    })(page);

export default CustomerMembershipContractCreate;
