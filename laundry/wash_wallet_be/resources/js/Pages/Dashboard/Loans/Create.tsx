import React, { useEffect, useMemo, useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import {
    Save,
    ArrowLeft,
    Building2,
    User,
    DollarSign,
    FileText,
    Calendar,
    CreditCard,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/Page/PageHeader";
import { Form } from "@/Components/Form";
import {
    Input,
    TextAreaInput,
    SelectInput,
    NumberInput,
} from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { Account, Employee, LoanFormData, Outlet } from "@/types";
import loanService from "@/Services/loan.service";
import { LoanCreateProps } from "./types";
import employeeService from "@/Services/employee.service";
import accountService from "@/Services/account.service";

const LoansCreate = ({ outlets }: LoanCreateProps) => {
    const { data, setData, processing, errors, clearErrors, setError, post } =
        useForm<LoanFormData>({
            outletId: "",
            employeeId: "",
            sourceAccountId: "",
            amount: 0,
            repaymentType: "",
            installmentMode: "auto",
            installmentAmount: null,
            installmentPeriod: null,
            installmentSchedule: [],
            loanDate: new Date().toISOString().split("T")[0],
            dueDate: "",
            note: "",
        });

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [fundingAccounts, setFundingAccounts] = useState<Account[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [loadingFundingAccounts, setLoadingFundingAccounts] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null);

    const repaymentTypes: Record<
        string,
        { label: string; description: string }
    > = {
        full: {
            label: "Lunas",
            description: "Pembayaran dilakukan sekaligus penuh",
        },
        installment: {
            label: "Cicilan",
            description: "Pembayaran dilakukan dengan cicilan bulanan",
        },
    };

    useEffect(() => {
        const outletId = Number(data.outletId);

        if (!outletId) {
            setEmployees([]);
            setFundingAccounts([]);
            setData("employeeId", "");
            setData("sourceAccountId", "");
            return;
        }

        fetchEmployees(outletId);
        fetchFundingAccounts(outletId);
    }, [data.outletId]);

    const fetchEmployees = async (outletId: number) => {
        setLoadingEmployees(true);
        setLoadError(null);

        try {
            const employeesData = await employeeService.getAll(outletId);
            setEmployees(employeesData);
            setData("employeeId", "");
        } catch (error) {
            console.error("Error fetching employees:", error);
            setLoadError("Gagal memuat data karyawan untuk outlet ini");
            setEmployees([]);
        } finally {
            setLoadingEmployees(false);
        }
    };

    const fetchFundingAccounts = async (outletId: number) => {
        setLoadingFundingAccounts(true);
        setLoadError(null);

        try {
            const accounts =
                await accountService.getFundingAccountsByOutlet(outletId);
            setFundingAccounts(accounts);
            setData("sourceAccountId", "");
        } catch (error) {
            console.error("Error fetching funding accounts:", error);
            setLoadError("Gagal memuat data sumber dana untuk outlet ini");
            setFundingAccounts([]);
        } finally {
            setLoadingFundingAccounts(false);
        }
    };

    const outletOptions = useMemo(() => {
        return [
            { value: "", label: "Pilih Outlet" },
            ...outlets.map((outlet) => ({
                value: outlet.id.toString(),
                label: outlet.name,
                description: outlet.code || undefined,
            })),
        ];
    }, [outlets]);

    const employeeOptions = useMemo(() => {
        return [
            {
                value: "",
                label: data.outletId
                    ? loadingEmployees
                        ? "Memuat karyawan..."
                        : employees.length === 0
                          ? "Tidak ada karyawan tersedia"
                          : "Pilih Karyawan"
                    : "Pilih outlet terlebih dahulu",
            },
            ...employees.map((employee) => ({
                value: employee.id.toString(),
                label: employee.name,
                description: employee.username || undefined,
            })),
        ];
    }, [employees, data.outletId, loadingEmployees]);

    const sourceAccountOptions = useMemo(() => {
        return [
            {
                value: "",
                label: data.outletId
                    ? loadingFundingAccounts
                        ? "Memuat sumber dana..."
                        : fundingAccounts.length === 0
                          ? "Tidak ada sumber dana tersedia"
                          : "Pilih Sumber Dana"
                    : "Pilih outlet terlebih dahulu",
            },
            ...fundingAccounts.map((account) => ({
                value: account.id.toString(),
                label: account.name,
                description: account.code || undefined,
            })),
        ];
    }, [fundingAccounts, data.outletId, loadingFundingAccounts]);

    const repaymentTypeOptions = [
        { value: "", label: "Pilih Tipe Pembayaran" },
        ...Object.entries(repaymentTypes).map(([value, { label }]) => ({
            value,
            label,
        })),
    ];

    useEffect(() => {
        if (data.outletId) {
            const outlet = outlets.find((o) => o.id === Number(data.outletId));
            setSelectedOutlet(outlet || null);
        } else {
            setSelectedOutlet(null);
        }
    }, [data.outletId, outlets]);

    const suggestedInstallment = useMemo(() => {
        if (
            !data.amount ||
            !data.installmentPeriod ||
            data.repaymentType !== "installment"
        )
            return 0;

        const amount = Number(data.amount);
        const period = Number(data.installmentPeriod);

        if (period > 0) {
            return Math.ceil(amount / period);
        }

        return 0;
    }, [data.amount, data.installmentPeriod, data.repaymentType]);

    useEffect(() => {
        if (data.repaymentType !== "installment") return;

        if (data.installmentMode === "custom") {
            if (data.installmentAmount !== null) {
                setData("installmentAmount", null);
            }
            return;
        }

        const amount = Number(data.amount);
        const period = Number(data.installmentPeriod);

        if (!amount || !period || period <= 0) {
            if (data.installmentAmount !== null) {
                setData("installmentAmount", null);
            }
            return;
        }

        const calculatedInstallment = Math.ceil(amount / period);

        if (data.installmentAmount !== calculatedInstallment) {
            setData("installmentAmount", calculatedInstallment);
        }
    }, [
        data.repaymentType,
        data.amount,
        data.installmentPeriod,
        data.installmentAmount,
        setData,
    ]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (
            data.repaymentType === "installment" &&
            data.installmentMode === "custom"
        ) {
            if (!isScheduleValid) {
                setError(
                    "installmentSchedule",
                    "Total jadwal cicilan harus sama dengan jumlah kasbon tanpa bunga.",
                );
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
            }
        }

        post(route("loans.store"), {
            preserveScroll: true,
            onError: () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
        });
    };

    const handleDataChange = (key: keyof LoanFormData, value: any) => {
        setData(key, value);

        if (errors[key]) {
            clearErrors(key);
        }
    };

    const handleOutletChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value;
        const outletId = value ? parseInt(value, 10) : "";
        handleDataChange("outletId", outletId);
    };

    const handleEmployeeChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value;
        const employeeId = value ? parseInt(value, 10) : "";
        handleDataChange("employeeId", employeeId);
    };

    const handleSourceAccountChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value;
        const accountId = value ? parseInt(value, 10) : "";
        handleDataChange("sourceAccountId", accountId);
    };

    const handleRepaymentTypeChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value as "full" | "installment" | "";
        handleDataChange("repaymentType", value);

        if (value === "full") {
            handleDataChange("installmentAmount", null);
            handleDataChange("installmentPeriod", null);
            handleDataChange("installmentMode", "auto");
            handleDataChange("installmentSchedule", []);
        }
    };

    const handleInstallmentModeChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value as "auto" | "custom";
        handleDataChange("installmentMode", value);
    };

    const handleScheduleAmountChange = (index: number, value: number) => {
        const newSchedule = [...data.installmentSchedule];
        newSchedule[index] = { ...newSchedule[index], amount: value };
        handleDataChange("installmentSchedule", newSchedule);
    };

    // Auto-generate schedule when parameters change
    useEffect(() => {
        if (data.repaymentType !== "installment") return;

        const amount = Number(data.amount);
        const period = Number(data.installmentPeriod);
        const startDate = data.loanDate ? new Date(data.loanDate) : new Date();

        if (!period || period <= 0) {
            handleDataChange("installmentSchedule", []);
            return;
        }

        if (data.installmentMode === "auto") {
            if (!amount) {
                handleDataChange("installmentSchedule", []);
                return;
            }

            const installmentAmount = Math.floor(amount / period);
            const remainder = amount - installmentAmount * (period - 1);

            const newSchedule = Array.from({ length: period }, (_, i) => {
                const date = new Date(startDate);
                date.setMonth(date.getMonth() + i + 1);
                return {
                    month: date.getMonth() + 1,
                    year: date.getFullYear(),
                    amount: i === period - 1 ? remainder : installmentAmount,
                };
            });

            handleDataChange("installmentSchedule", newSchedule);
            handleDataChange("installmentAmount", installmentAmount);
        } else if (data.installmentMode === "custom") {
            const defaultInstallmentAmount =
                amount > 0 ? Math.floor(amount / period) : 0;
            const defaultRemainder =
                amount > 0
                    ? amount - defaultInstallmentAmount * (period - 1)
                    : 0;

            const newSchedule = Array.from({ length: period }, (_, i) => {
                const date = new Date(startDate);
                date.setMonth(date.getMonth() + i + 1);
                return {
                    month: date.getMonth() + 1,
                    year: date.getFullYear(),
                    amount:
                        data.installmentSchedule[i]?.amount ??
                        (i === period - 1
                            ? defaultRemainder
                            : defaultInstallmentAmount),
                };
            });

            const shouldUpdateSchedule =
                data.installmentSchedule.length !== period ||
                data.installmentSchedule.some((existing, index) => {
                    const next = newSchedule[index];

                    if (!next) return true;

                    return (
                        existing.month !== next.month ||
                        existing.year !== next.year ||
                        existing.amount !== next.amount
                    );
                });

            if (shouldUpdateSchedule) {
                handleDataChange("installmentSchedule", newSchedule);
            }

            if (data.installmentAmount !== null) {
                handleDataChange("installmentAmount", null);
            }
        }
    }, [
        data.amount,
        data.installmentPeriod,
        data.installmentMode,
        data.loanDate,
        data.repaymentType,
    ]);

    const totalScheduledAmount = useMemo(() => {
        return data.installmentSchedule.reduce(
            (sum, item) => sum + (item.amount || 0),
            0,
        );
    }, [data.installmentSchedule]);

    const isScheduleValid = useMemo(() => {
        if (data.repaymentType !== "installment") return true;
        if (data.installmentMode === "auto") return true;
        const period = Number(data.installmentPeriod);

        if (!period || period <= 0) return false;
        if (data.installmentSchedule.length !== period) return false;

        return Math.abs(totalScheduledAmount - Number(data.amount)) < 0.01;
    }, [
        data.repaymentType,
        data.installmentMode,
        data.installmentPeriod,
        data.installmentSchedule.length,
        totalScheduledAmount,
        data.amount,
    ]);

    return (
        <>
            <Head title="Buat Kasbon Baru" />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Buat Kasbon Baru"
                        subtitle="Tambahkan kasbon baru untuk karyawan"
                        icon={CreditCard}
                        actions={
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => loanService.goToIndex()}
                                disabled={processing}
                                leftIcon={<ArrowLeft className="w-4 h-4" />}
                            >
                                Kembali
                            </Button>
                        }
                    />

                    {loadError && (
                        <Alert
                            variant="error"
                            title="Kesalahan"
                            description={loadError}
                        />
                    )}

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
                                            Pilih Outlet
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Tentukan outlet tempat kasbon
                                            diberikan
                                        </p>
                                    </div>
                                </div>

                                <SelectInput
                                    label="Outlet"
                                    placeholder="Pilih outlet..."
                                    value={data.outletId?.toString() || ""}
                                    onChange={handleOutletChange}
                                    error={errors.outletId}
                                    required
                                    disabled={
                                        processing || outlets.length === 0
                                    }
                                    options={outletOptions}
                                    leftIcon={<Building2 className="w-5 h-5" />}
                                    hint={
                                        outlets.length === 0
                                            ? "Belum ada outlet tersedia"
                                            : "Pilih outlet terlebih dahulu untuk memuat data karyawan dan sumber dana"
                                    }
                                    searchable={true}
                                    clearable={true}
                                />

                                {selectedOutlet && (
                                    <div
                                        className="p-4 rounded-lg"
                                        style={{
                                            backgroundColor:
                                                "var(--color-success-50)",
                                            borderColor:
                                                "var(--color-success-200)",
                                            border: "1px solid",
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="text-sm font-medium"
                                                style={{
                                                    color: "var(--color-success-600)",
                                                }}
                                            >
                                                ✓ Outlet dipilih:{" "}
                                                {selectedOutlet.name}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {(loadingEmployees ||
                                    loadingFundingAccounts) && (
                                    <div
                                        className="p-4 rounded-lg"
                                        style={{
                                            backgroundColor:
                                                "var(--color-info-50)",
                                            borderColor:
                                                "var(--color-info-200)",
                                            border: "1px solid",
                                        }}
                                    >
                                        <span
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-info-600)",
                                            }}
                                        >
                                            Memuat data karyawan dan sumber
                                            dana...
                                        </span>
                                    </div>
                                )}
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
                                            Pilih Karyawan
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Tentukan karyawan penerima kasbon
                                        </p>
                                    </div>
                                </div>

                                <SelectInput
                                    label="Karyawan"
                                    placeholder="Pilih karyawan..."
                                    value={data.employeeId?.toString() || ""}
                                    onChange={handleEmployeeChange}
                                    error={errors.employeeId}
                                    required
                                    disabled={
                                        processing ||
                                        !data.outletId ||
                                        employees.length === 0 ||
                                        loadingEmployees
                                    }
                                    options={employeeOptions}
                                    leftIcon={<User className="w-5 h-5" />}
                                    hint={
                                        !data.outletId
                                            ? "Pilih outlet terlebih dahulu"
                                            : "Pilih karyawan yang akan menerima kasbon"
                                    }
                                    searchable={true}
                                    clearable={true}
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
                                        <DollarSign
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
                                            Informasi Kasbon
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Atur detail jumlah dan pembayaran
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SelectInput
                                        label="Sumber Dana"
                                        placeholder="Pilih sumber dana..."
                                        value={
                                            data.sourceAccountId?.toString() ||
                                            ""
                                        }
                                        onChange={handleSourceAccountChange}
                                        error={errors.sourceAccountId}
                                        required
                                        disabled={
                                            processing ||
                                            !data.outletId ||
                                            loadingFundingAccounts
                                        }
                                        options={sourceAccountOptions}
                                        leftIcon={
                                            <CreditCard className="w-5 h-5" />
                                        }
                                        hint={
                                            !data.outletId
                                                ? "Pilih outlet terlebih dahulu"
                                                : "Pilih akun sumber dana kasbon"
                                        }
                                    />

                                    <NumberInput
                                        label="Jumlah Kasbon"
                                        placeholder="Masukkan jumlah kasbon"
                                        value={data.amount}
                                        onValueChange={(value) =>
                                            handleDataChange(
                                                "amount",
                                                value || 0,
                                            )
                                        }
                                        error={errors.amount}
                                        required
                                        disabled={processing}
                                        leftIcon={
                                            <DollarSign className="w-5 h-5" />
                                        }
                                        hint="Jumlah kasbon yang diberikan"
                                        prefix="Rp "
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        min={0}
                                        step={1000}
                                        precision={0}
                                        allowNegative={false}
                                        allowDecimal={false}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Tanggal Kasbon"
                                        type="date"
                                        value={data.loanDate}
                                        onChange={(e) =>
                                            handleDataChange(
                                                "loanDate",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.loanDate}
                                        required
                                        disabled={processing}
                                        leftIcon={
                                            <Calendar className="w-5 h-5" />
                                        }
                                        hint="Tanggal pemberian kasbon"
                                    />

                                    <SelectInput
                                        label="Tipe Pembayaran"
                                        placeholder="Pilih tipe pembayaran..."
                                        value={data.repaymentType}
                                        onChange={handleRepaymentTypeChange}
                                        error={errors.repaymentType}
                                        required
                                        disabled={processing}
                                        options={repaymentTypeOptions}
                                        leftIcon={
                                            <DollarSign className="w-5 h-5" />
                                        }
                                        hint="Pilih tipe pembayaran kasbon"
                                    />
                                </div>

                                <Input
                                    label="Tanggal Jatuh Tempo"
                                    type="date"
                                    value={data.dueDate}
                                    onChange={(e) =>
                                        handleDataChange(
                                            "dueDate",
                                            e.target.value,
                                        )
                                    }
                                    error={errors.dueDate}
                                    required
                                    disabled={processing}
                                    leftIcon={<Calendar className="w-5 h-5" />}
                                    hint="Tanggal jatuh tempo pembayaran kasbon"
                                />

                                {data.repaymentType === "installment" && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="Periode Cicilan (Bulan)"
                                                type="number"
                                                placeholder="Masukkan jumlah bulan"
                                                value={
                                                    data.installmentPeriod || ""
                                                }
                                                onChange={(e) =>
                                                    handleDataChange(
                                                        "installmentPeriod",
                                                        e.target.value
                                                            ? parseInt(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : null,
                                                    )
                                                }
                                                error={errors.installmentPeriod}
                                                required
                                                disabled={processing}
                                                leftIcon={
                                                    <Calendar className="w-5 h-5" />
                                                }
                                                hint="Jumlah bulan untuk cicilan"
                                                min={1}
                                            />

                                            <SelectInput
                                                label="Mode Cicilan"
                                                placeholder="Pilih mode cicilan..."
                                                value={data.installmentMode}
                                                onChange={
                                                    handleInstallmentModeChange
                                                }
                                                error={errors.installmentMode}
                                                required
                                                disabled={processing}
                                                options={[
                                                    {
                                                        value: "auto",
                                                        label: "Otomatis (Bagi Rata)",
                                                    },
                                                    {
                                                        value: "custom",
                                                        label: "Kustom per Bulan",
                                                    },
                                                ]}
                                                leftIcon={
                                                    <CreditCard className="w-5 h-5" />
                                                }
                                                hint="Pilih cara penghitungan cicilan per bulan"
                                            />
                                        </div>

                                        {data.installmentMode === "custom" &&
                                            data.installmentPeriod &&
                                            data.installmentSchedule.length >
                                                0 && (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h3
                                                            className="text-sm font-medium"
                                                            style={{
                                                                color: "var(--color-text-primary)",
                                                            }}
                                                        >
                                                            Jadwal Cicilan
                                                            Kustom
                                                        </h3>
                                                        <div
                                                            className={`text-sm font-semibold ${!isScheduleValid ? "text-red-500" : "text-green-500"}`}
                                                        >
                                                            Total: Rp{" "}
                                                            {totalScheduledAmount.toLocaleString(
                                                                "id-ID",
                                                            )}{" "}
                                                            / Rp{" "}
                                                            {Number(
                                                                data.amount,
                                                            ).toLocaleString(
                                                                "id-ID",
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div
                                                        className="overflow-x-auto rounded-lg border"
                                                        style={{
                                                            borderColor:
                                                                "var(--color-border)",
                                                        }}
                                                    >
                                                        <table className="w-full text-sm text-left">
                                                            <thead
                                                                className="bg-gray-50"
                                                                style={{
                                                                    backgroundColor:
                                                                        "var(--color-background-soft)",
                                                                }}
                                                            >
                                                                <tr>
                                                                    <th className="px-4 py-2 border-b">
                                                                        Bulan Ke
                                                                    </th>
                                                                    <th className="px-4 py-2 border-b">
                                                                        Bulan /
                                                                        Tahun
                                                                    </th>
                                                                    <th className="px-4 py-2 border-b">
                                                                        Jumlah
                                                                        Cicilan
                                                                        (Rp)
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {data.installmentSchedule.map(
                                                                    (
                                                                        item,
                                                                        index,
                                                                    ) => (
                                                                        <tr
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="border-b"
                                                                            style={{
                                                                                borderColor:
                                                                                    "var(--color-border)",
                                                                            }}
                                                                        >
                                                                            <td className="px-4 py-2">
                                                                                {index +
                                                                                    1}
                                                                            </td>
                                                                            <td className="px-4 py-2">
                                                                                {new Date(
                                                                                    0,
                                                                                    item.month -
                                                                                        1,
                                                                                ).toLocaleString(
                                                                                    "id-ID",
                                                                                    {
                                                                                        month: "long",
                                                                                    },
                                                                                )}{" "}
                                                                                {
                                                                                    item.year
                                                                                }
                                                                            </td>
                                                                            <td className="px-4 py-2">
                                                                                <NumberInput
                                                                                    value={
                                                                                        item.amount
                                                                                    }
                                                                                    onValueChange={(
                                                                                        value,
                                                                                    ) =>
                                                                                        handleScheduleAmountChange(
                                                                                            index,
                                                                                            value ||
                                                                                                0,
                                                                                        )
                                                                                    }
                                                                                    placeholder="0"
                                                                                    min={
                                                                                        0
                                                                                    }
                                                                                    thousandSeparator="."
                                                                                    decimalSeparator=","
                                                                                    prefix="Rp "
                                                                                    disabled={
                                                                                        processing
                                                                                    }
                                                                                    size="sm"
                                                                                    error={
                                                                                        errors[
                                                                                            `installmentSchedule.${index}.amount`
                                                                                        ]
                                                                                    }
                                                                                />
                                                                            </td>
                                                                        </tr>
                                                                    ),
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    {!isScheduleValid && (
                                                        <p className="text-xs text-red-500">
                                                            Total jadwal cicilan
                                                            harus sama dengan
                                                            jumlah kasbon.
                                                        </p>
                                                    )}
                                                    {errors.installmentSchedule && (
                                                        <p className="text-xs text-red-500">
                                                            {
                                                                errors.installmentSchedule
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                        {data.installmentMode === "auto" && (
                                            <Input
                                                label="Jumlah Cicilan per Bulan"
                                                type="number"
                                                placeholder="Otomatis dihitung dari jumlah kasbon / periode"
                                                value={
                                                    data.installmentAmount || ""
                                                }
                                                error={errors.installmentAmount}
                                                required
                                                disabled={true}
                                                leftIcon={
                                                    <DollarSign className="w-5 h-5" />
                                                }
                                                hint={`Otomatis: Rp ${suggestedInstallment.toLocaleString("id-ID")} per bulan berdasarkan jumlah kasbon dan periode cicilan.`}
                                                min={1}
                                            />
                                        )}
                                    </div>
                                )}
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
                                        <FileText
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
                                            Catatan
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Tambahkan catatan untuk kasbon ini
                                        </p>
                                    </div>
                                </div>

                                <TextAreaInput
                                    label="Catatan"
                                    placeholder="Masukkan catatan untuk kasbon ini..."
                                    value={data.note}
                                    onChange={(e) =>
                                        handleDataChange("note", e.target.value)
                                    }
                                    error={errors.note}
                                    disabled={processing}
                                    hint="Catatan tambahan tentang kasbon ini (opsional)"
                                    rows={4}
                                    maxLength={1000}
                                    showCharacterCount={true}
                                    autoResize={true}
                                    minRows={4}
                                    maxRows={8}
                                    leftIcon={<FileText className="w-5 h-5" />}
                                />
                            </div>

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
                                    onClick={() => loanService.goToIndex()}
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
                                        !data.employeeId ||
                                        !data.sourceAccountId ||
                                        !data.amount ||
                                        !data.repaymentType ||
                                        !data.dueDate ||
                                        (data.repaymentType === "installment" &&
                                            (!data.installmentPeriod ||
                                                !data.installmentMode ||
                                                !isScheduleValid)) ||
                                        loadingEmployees ||
                                        loadingFundingAccounts
                                    }
                                    loading={processing}
                                    size="lg"
                                    leftIcon={<Save className="w-4 h-4" />}
                                >
                                    {processing
                                        ? "Menyimpan..."
                                        : "Buat Kasbon"}
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </div>
            </div>
        </>
    );
};

LoansCreate.layout = withAuthenticatedLayout({
    title: "Buat Kasbon Baru",
    searchable: false,
    breadcrumbs: [
        { label: "Kasbon", href: route("loans.index") },
        { label: "Buat Baru" },
    ],
});

export default LoansCreate;
