import React, { useState, useCallback, useEffect } from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Save,
    ArrowLeft,
    Building2,
    Users,
    CreditCard,
    Calendar,
    FileText,
    Loader2,
    DollarSign,
    Award,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import { Input, SelectInput, NumberInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import PageHeader from "@/Components/Page/PageHeader";
import { customerService } from "@/Services/customer.service";
import { membershipPlanService } from "@/Services/membership_plan.service";
import { formatCurrency } from "@/lib/utils";
import { useLatestAsync } from "@/Hooks/useLatestAsync";
import {
    MembershipContractFormData,
    Outlet,
    Customer,
    MembershipPlan,
} from "@/types";
import { MembershipContractCreateProps } from "./types";

const MembershipContractCreate = ({
    outlets,
}: MembershipContractCreateProps) => {
    const { data, setData, processing, errors, clearErrors, reset, post } =
        useForm<MembershipContractFormData>({
            customerId: 0,
            outletId: 0,
            membershipPlanId: 0,
            startAt: "",
            totalPaid: 0,
        });

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>(
        [],
    );
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [loadingMembershipPlans, setLoadingMembershipPlans] = useState(false);
    const [customersError, setCustomersError] = useState<string | null>(null);
    const [membershipPlansError, setMembershipPlansError] = useState<
        string | null
    >(null);
    const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null);

    const { runLatest: runLatestCustomers } = useLatestAsync();
    const { runLatest: runLatestMembershipPlans } = useLatestAsync();

    const loadCustomersByOutlet = useCallback(async (outletId: number) => {
        if (!outletId) {
            setCustomers([]);
            return;
        }

        setLoadingCustomers(true);
        setCustomersError(null);

        runLatestCustomers(
            outletId,
            async () => await customerService.getAll(outletId),
            {
                onSuccess: (fetchedCustomers) => setCustomers(fetchedCustomers),
                onError: (error: any) => {
                    console.error("Error loading customers:", error);
                    setCustomersError(error.message || "Gagal memuat pelanggan");
                    setCustomers([]);
                },
                onFinally: () => setLoadingCustomers(false)
            }
        );
    }, [runLatestCustomers]);

    const loadMembershipPlansByOutlet = useCallback(
        async (outletId: number) => {
            if (!outletId) {
                setMembershipPlans([]);
                return;
            }

            setLoadingMembershipPlans(true);
            setMembershipPlansError(null);

            runLatestMembershipPlans(
                outletId,
                async () => await membershipPlanService.getMembershipPlansByOutletId(outletId),
                {
                    onSuccess: (fetchedPlans) => {
                        setMembershipPlans(fetchedPlans);
                        setData("membershipPlanId", 0);
                    },
                    onError: (error: any) => {
                        console.error("Error loading membership plans:", error);
                        setMembershipPlansError(
                            error.message || "Gagal memuat paket membership",
                        );
                        setMembershipPlans([]);
                    },
                    onFinally: () => setLoadingMembershipPlans(false)
                }
            );
        },
        [setData, runLatestMembershipPlans],
    );

    useEffect(() => {
        if (selectedOutlet?.id) {
            setCustomers([]);
            setMembershipPlans([]);
            setCustomersError(null);
            setMembershipPlansError(null);
            setData((prev) => ({
                ...prev,
                customerId: 0,
                membershipPlanId: 0,
            }));
            loadCustomersByOutlet(selectedOutlet.id);
            loadMembershipPlansByOutlet(selectedOutlet.id);
        } else {
            setCustomers([]);
            setMembershipPlans([]);
            setData((prev) => ({
                ...prev,
                customerId: 0,
                membershipPlanId: 0,
            }));
        }
    }, [selectedOutlet, loadCustomersByOutlet, loadMembershipPlansByOutlet]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route("membership-contracts.store"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
            onError: (errors) => {
                console.error("Form submission errors:", errors);
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
        });
    };

    const handleDataChange = (
        key: keyof MembershipContractFormData,
        value: any,
    ) => {
        setData(key, value);

        if (errors[key]) {
            clearErrors(key);
        }
    };

    const handleOutletChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value;
        const outlet = outlets.find((o) => o.id.toString() === value) || null;
        setSelectedOutlet(outlet);
        handleDataChange("outletId", outlet?.id || 0);
    };

    const handleCustomerChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value;
        const customerId = value ? parseInt(value, 10) : 0;
        handleDataChange("customerId", customerId);
    };

    const handleMembershipPlanChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value;
        const planId = value ? parseInt(value, 10) : 0;
        handleDataChange("membershipPlanId", planId);

        const selectedPlan = membershipPlans.find((p) => p.id === planId);
        if (selectedPlan) {
            handleDataChange("totalPaid", selectedPlan.price);
        }
    };

    const outletOptions = [
        { value: "", label: "Pilih Outlet" },
        ...outlets.map((outlet) => ({
            value: outlet.id.toString(),
            label: outlet.name,
            description: outlet.code || undefined,
        })),
    ];

    const customerOptions = [
        { value: "", label: "Pilih Pelanggan" },
        ...customers.map((customer) => ({
            value: customer.id.toString(),
            label: customer.name,
            description: customer.email || customer.phone || undefined,
        })),
    ];

    const membershipPlanOptions = [
        { value: "", label: "Pilih Paket Membership" },
        ...membershipPlans.map((plan) => ({
            value: plan.id.toString(),
            label: plan.name,
            description: `${formatCurrency(plan.price)} - ${plan.durationDays} hari`,
        })),
    ];

    const selectedPlan = membershipPlans.find(
        (p) => p.id === data.membershipPlanId,
    );
    const formatNumberInput = (value: number): string => {
        if (!value) return "";
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const parseNumberInput = (value: string): number => {
        const cleaned = value.replace(/\D/g, "");
        return cleaned ? parseInt(cleaned, 10) : 0;
    };

    return (
        <>
            <Head title="Tambah Kontrak Membership" />

            <div
                className="p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Tambah Kontrak Membership Baru"
                        subtitle="Buat kontrak membership baru untuk pelanggan"
                        icon={Award}
                        actions={
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    (window.location.href = route(
                                        "membership-contracts.index",
                                    ))
                                }
                                disabled={processing}
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
                                                Outlet & Pelanggan
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Pilih outlet terlebih dahulu
                                                untuk memuat data pelanggan
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SelectInput
                                            label="Outlet"
                                            placeholder="Pilih outlet..."
                                            value={
                                                selectedOutlet?.id.toString() ||
                                                ""
                                            }
                                            onChange={handleOutletChange}
                                            error={errors.outletId}
                                            required
                                            disabled={
                                                processing ||
                                                outlets.length === 0
                                            }
                                            options={outletOptions}
                                            leftIcon={
                                                <Building2 className="w-5 h-5" />
                                            }
                                            hint={
                                                outlets.length === 0
                                                    ? "Belum ada outlet tersedia"
                                                    : "Pilih outlet untuk kontrak membership"
                                            }
                                            searchable={true}
                                            clearable={true}
                                        />

                                        <div className="space-y-2">
                                            <SelectInput
                                                label="Pelanggan"
                                                placeholder={
                                                    !selectedOutlet
                                                        ? "Pilih outlet terlebih dahulu"
                                                        : loadingCustomers
                                                          ? "Memuat pelanggan..."
                                                          : customers.length ===
                                                              0
                                                            ? "Tidak ada pelanggan tersedia"
                                                            : "Pilih pelanggan..."
                                                }
                                                value={data.customerId.toString()}
                                                onChange={handleCustomerChange}
                                                error={
                                                    errors.customerId ||
                                                    customersError ||
                                                    undefined
                                                }
                                                required
                                                disabled={
                                                    processing ||
                                                    !selectedOutlet ||
                                                    loadingCustomers ||
                                                    customers.length === 0
                                                }
                                                options={customerOptions}
                                                leftIcon={
                                                    <Users className="w-5 h-5" />
                                                }
                                                hint={
                                                    !selectedOutlet
                                                        ? "Pilih outlet terlebih dahulu"
                                                        : loadingCustomers
                                                          ? "Sedang memuat pelanggan..."
                                                          : customers.length ===
                                                              0
                                                            ? "Belum ada pelanggan di outlet ini"
                                                            : "Pilih pelanggan untuk kontrak"
                                                }
                                                searchable={true}
                                                clearable={true}
                                                loading={loadingCustomers}
                                            />

                                            {loadingCustomers && (
                                                <div className="flex items-center gap-2 text-sm text-blue-600">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Memuat pelanggan dari
                                                    outlet...
                                                </div>
                                            )}

                                            {customersError && (
                                                <div className="text-sm text-red-600">
                                                    {customersError}
                                                </div>
                                            )}
                                        </div>
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
                                                    "var(--color-warning-100)",
                                            }}
                                        >
                                            <Award
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
                                                Paket Membership
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Pilih paket membership yang akan
                                                digunakan
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <SelectInput
                                            label="Paket Membership"
                                            placeholder={
                                                !selectedOutlet
                                                    ? "Pilih outlet terlebih dahulu"
                                                    : loadingMembershipPlans
                                                      ? "Memuat paket membership..."
                                                      : membershipPlans.length ===
                                                          0
                                                        ? "Tidak ada paket tersedia"
                                                        : "Pilih paket membership..."
                                            }
                                            value={data.membershipPlanId.toString()}
                                            onChange={
                                                handleMembershipPlanChange
                                            }
                                            error={
                                                errors.membershipPlanId ||
                                                membershipPlansError ||
                                                undefined
                                            }
                                            required
                                            disabled={
                                                processing ||
                                                !selectedOutlet ||
                                                loadingMembershipPlans ||
                                                membershipPlans.length === 0
                                            }
                                            options={membershipPlanOptions}
                                            leftIcon={
                                                <CreditCard className="w-5 h-5" />
                                            }
                                            hint={
                                                !selectedOutlet
                                                    ? "Pilih outlet terlebih dahulu"
                                                    : loadingMembershipPlans
                                                      ? "Sedang memuat paket membership..."
                                                      : membershipPlans.length ===
                                                          0
                                                        ? "Belum ada paket membership di outlet ini"
                                                        : "Pilih paket membership untuk kontrak"
                                            }
                                            searchable={true}
                                            clearable={true}
                                            loading={loadingMembershipPlans}
                                        />

                                        {loadingMembershipPlans && (
                                            <div className="flex items-center gap-2 text-sm text-blue-600">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Memuat paket membership dari
                                                outlet...
                                            </div>
                                        )}

                                        {membershipPlansError && (
                                            <div className="text-sm text-red-600">
                                                {membershipPlansError}
                                            </div>
                                        )}

                                        {selectedPlan && (
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
                                                    <Award
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
                                                        Detail Paket:
                                                    </span>
                                                </div>
                                                <div className="space-y-1 text-sm">
                                                    <p
                                                        style={{
                                                            color: "var(--color-text-primary)",
                                                        }}
                                                    >
                                                        <strong>Harga:</strong>{" "}
                                                        {formatCurrency(
                                                            selectedPlan.price,
                                                        )}
                                                    </p>
                                                    <p
                                                        style={{
                                                            color: "var(--color-text-primary)",
                                                        }}
                                                    >
                                                        <strong>Durasi:</strong>{" "}
                                                        {
                                                            selectedPlan.durationDays
                                                        }{" "}
                                                        hari
                                                    </p>
                                                    {selectedPlan.description && (
                                                        <p
                                                            style={{
                                                                color: "var(--color-text-secondary)",
                                                            }}
                                                        >
                                                            {
                                                                selectedPlan.description
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
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
                                                    "var(--color-success-100)",
                                            }}
                                        >
                                            <FileText
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
                                                Informasi pembayaran dan jadwal
                                                kontrak
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Tanggal Mulai"
                                            type="date"
                                            value={data.startAt || ""}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "startAt",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.startAt}
                                            disabled={processing}
                                            leftIcon={
                                                <Calendar className="w-5 h-5" />
                                            }
                                            hint="Tanggal mulai kontrak membership (opsional)"
                                        />

                                        <Input
                                            label="Total Pembayaran"
                                            type="text"
                                            placeholder="0"
                                            value={formatNumberInput(
                                                data.totalPaid,
                                            )}
                                            onChange={(e) => {
                                                const numValue =
                                                    parseNumberInput(
                                                        e.target.value,
                                                    );
                                                handleDataChange(
                                                    "totalPaid",
                                                    numValue,
                                                );
                                            }}
                                            error={errors.totalPaid}
                                            disabled={processing}
                                            leftIcon={
                                                <DollarSign className="w-5 h-5" />
                                            }
                                            hint="Total yang dibayarkan (opsional)"
                                        />
                                    </div>
                                </div>

                                {Object.keys(errors).length > 0 && (
                                    <Alert
                                        variant="error"
                                        title="Terdapat kesalahan pada form"
                                        description="Silakan periksa kembali semua field yang bertanda merah."
                                        className="mt-6"
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
                                            (window.location.href = route(
                                                "membership-contracts.index",
                                            ))
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
                                            !selectedOutlet ||
                                            !data.customerId ||
                                            !data.membershipPlanId ||
                                            loadingCustomers ||
                                            loadingMembershipPlans
                                        }
                                        loading={processing}
                                        size="lg"
                                        leftIcon={<Save className="w-4 h-4" />}
                                    >
                                        {processing
                                            ? "Menyimpan..."
                                            : "Buat Kontrak"}
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

MembershipContractCreate.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Tambah Kontrak Membership",
        breadcrumbs: [
            {
                label: "Membership Contracts",
                href: route("membership-contracts.index"),
            },
            { label: "Tambah Kontrak" },
        ],
    })(page);

export default MembershipContractCreate;
