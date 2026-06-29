import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import {
    ArrowLeft,
    Building2,
    CreditCard,
    FileText,
    Info,
    RefreshCw,
    Save,
    Users,
    Wallet,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import {
    FileInput,
    DateInput,
    SelectInput,
    TextAreaInput,
} from "@/Components/Input";
import PageHeader from "@/Components/Page/PageHeader";
import Modal from "@/Components/Modal/Modal";
import { formatCurrency } from "@/lib/utils";
import payrollService from "@/Services/payroll.service";
import { PayrollCreateProps } from "./types";
import {
    PayrollFormData,
    PayrollItemFormData,
    PayrollPreviewResponse,
} from "@/types";

const monthOptions = Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1),
    label: new Date(2024, index, 1).toLocaleString("id-ID", {
        month: "long",
    }),
}));

const yearOptions = Array.from({ length: 6 }, (_, index) => {
    const year = new Date().getFullYear() - 2 + index;
    return {
        value: String(year),
        label: String(year),
    };
});

const PayrollCreate = ({
    outlets,
    bankAccounts,
    flash,
}: PayrollCreateProps) => {
    const [mode, setMode] = useState<"single" | "bulk">("bulk");
    const [employeeId, setEmployeeId] = useState<number | "">("");
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [previewData, setPreviewData] =
        useState<PayrollPreviewResponse | null>(null);
    const [previewError, setPreviewError] = useState("");
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedPreviewItem, setSelectedPreviewItem] =
        useState<PayrollItemFormData | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const { data, setData, post, processing, errors, clearErrors } =
        useForm<PayrollFormData>({
            outletId: "",
            bankAccountId: "",
            paymentMethod: "",
            paymentDate: new Date().toISOString().split("T")[0],
            month: "",
            year: "",
            note: "",
            attachment: null,
            items: [],
        });

    const selectedOutlet = useMemo(
        () =>
            outlets.find((outlet) => outlet.id === Number(data.outletId)) ||
            null,
        [data.outletId, outlets],
    );

    const availableEmployees = useMemo(
        () =>
            (selectedOutlet?.employees || []).filter(
                (employee) => employee.isActive,
            ),
        [selectedOutlet],
    );

    const outletOptions = useMemo(
        () => [
            { value: "", label: "Pilih outlet..." },
            ...outlets.map((outlet) => ({
                value: String(outlet.id),
                label: outlet.name,
                description: outlet.code,
            })),
        ],
        [outlets],
    );

    const employeeOptions = useMemo(
        () => [
            { value: "", label: "Semua karyawan aktif" },
            ...availableEmployees.map((employee) => ({
                value: String(employee.id),
                label: employee.name,
                description: employee.username,
            })),
        ],
        [availableEmployees],
    );

    const bankAccountOptions = useMemo(
        () => [
            { value: "", label: "Pilih sumber dana..." },
            ...bankAccounts.map((account) => ({
                value: String(account.id),
                label: `${account.code} - ${account.name}`,
                description: account.typeLabel,
            })),
        ],
        [bankAccounts],
    );

    useEffect(() => {
        setPreviewData(null);
        setPreviewError("");
        setData("items", []);
    }, [data.outletId, employeeId, mode, month, setData, year]);

    const handleModeChange = useCallback((nextMode: "single" | "bulk") => {
        setMode(nextMode);
        if (nextMode === "bulk") {
            setEmployeeId("");
        }
    }, []);

    const handleAttachmentSelect = useCallback(
        (files: File[]) => {
            const nextFile = files[0] || null;
            setSelectedFile(nextFile);
            setData("attachment", nextFile);
        },
        [setData],
    );

    const mapPreviewItemToPayload = useCallback(
        (
            item: PayrollPreviewResponse["items"][number],
        ): PayrollItemFormData => ({
            employeeId: item.employeeId,
            employeeName: item.employeeName,
            employeeCode: item.employeeCode,
            baseSalary: item.baseSalary,
            totalAllowance: item.totalAllowance,
            totalCommission: item.totalCommission,
            totalOvertimeAllowance: item.totalOvertimeAllowance,
            grossSalary: item.grossSalary,
            totalFine: item.totalFine,
            totalLoanDeduction: item.totalLoanDeduction,
            totalDeduction: item.totalDeduction,
            netSalary: item.netSalary,
            loanId: item.loanId,
            loanDeductionAmount: item.loanDeductionAmount,
            remainingLoanBalance: item.remainingLoanBalance,
            commissionLogIds: item.commissionLogIds || [],
            commissionDetails: item.commissionDetails || [],
            fineLogIds: item.fineLogIds || [],
            fineDetails: item.fineDetails || [],
            salaryBreakdown: item.salaryBreakdown || [],
            allowanceBreakdown: item.allowanceBreakdown || [],
            isAlreadyPaid: item.isAlreadyPaid,
            existingPayrollId: item.existingPayrollId,
            existingPayrollStatus: item.existingPayrollStatus,
        }),
        [],
    );

    const handlePreview = useCallback(async () => {
        setPreviewError("");

        if (!data.outletId) {
            setPreviewError("Pilih outlet terlebih dahulu.");
            return;
        }

        if (mode === "single" && !employeeId) {
            setPreviewError("Pilih karyawan jika mode payroll per karyawan.");
            return;
        }

        clearErrors();
        setIsPreviewing(true);

        try {
            const response = await payrollService.getPreview({
                outletId: Number(data.outletId),
                employeeId:
                    mode === "single" && employeeId
                        ? Number(employeeId)
                        : undefined,
                month,
                year,
            });

            setPreviewData(response);
            setData(
                "items",
                response.items.map((item) => mapPreviewItemToPayload(item)),
            );
        } catch (error) {
            setPreviewData(null);
            setData("items", []);
            setPreviewError(
                error instanceof Error
                    ? error.message
                    : "Preview payroll gagal dimuat.",
            );
        } finally {
            setIsPreviewing(false);
        }
    }, [
        clearErrors,
        data.outletId,
        employeeId,
        mapPreviewItemToPayload,
        mode,
        month,
        setData,
        year,
    ]);

    const handleSubmit = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setPreviewError("");

            if (!previewData || data.items.length === 0) {
                setPreviewError(
                    "Lakukan preview payroll terlebih dahulu sebelum menyimpan.",
                );
                return;
            }

            setData((prevData) => ({
                ...prevData,
                month,
                year,
            }));

            post(route("payrolls.store"), {
                forceFormData: true,
                preserveScroll: true,
                onError: () => {
                    setPreviewError(
                        "Payroll belum berhasil disimpan. Silakan cek kembali input yang diperlukan.",
                    );
                },
            });
        },
        [data.items.length, post, previewData],
    );
    const openDetailModal = useCallback((item: PayrollItemFormData) => {
        setSelectedPreviewItem(item);
        setIsDetailModalOpen(true);
    }, []);

    return (
        <>
            <Head title="Proses Penggajian" />

            <div className="p-6">
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Proses Penggajian"
                        subtitle="Preview dulu, lalu simpan payroll agar komponen gaji dan potongan tetap terkontrol."
                        icon={Wallet}
                        animate={true}
                        actions={
                            <Button
                                onClick={() => payrollService.goToIndex()}
                                variant="outline"
                                leftIcon={<ArrowLeft className="w-4 h-4" />}
                            >
                                Kembali ke Daftar
                            </Button>
                        }
                    />

                    {flash?.success && (
                        <Alert
                            variant="success"
                            title="Berhasil"
                            description={flash.success}
                        />
                    )}

                    {flash?.error && (
                        <Alert
                            variant="error"
                            title="Error"
                            description={flash.error}
                        />
                    )}

                    {previewError && (
                        <Alert
                            variant="error"
                            title="Preview Payroll"
                            description={previewError}
                        />
                    )}

                    {Object.keys(errors).length > 0 && (
                        <Alert
                            variant="error"
                            title="Form Payroll Perlu Diperiksa"
                            description="Beberapa field masih belum valid. Silakan cek outlet, sumber dana, metode pembayaran, dan item payroll."
                        />
                    )}

                    <Card className="p-6">
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <Badge
                                variant={
                                    mode === "bulk" ? "success" : "secondary"
                                }
                                size="sm"
                            >
                                {mode === "bulk"
                                    ? "Mode Massal"
                                    : "Mode Per Karyawan"}
                            </Badge>
                            <Button
                                type="button"
                                variant={
                                    mode === "bulk" ? "primary" : "outline"
                                }
                                size="sm"
                                onClick={() => handleModeChange("bulk")}
                            >
                                Semua Karyawan
                            </Button>
                            <Button
                                type="button"
                                variant={
                                    mode === "single" ? "primary" : "outline"
                                }
                                size="sm"
                                onClick={() => handleModeChange("single")}
                            >
                                Per Karyawan
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Card className="p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <Building2 className="w-5 h-5 text-primary-600" />
                                    <h2 className="text-lg font-semibold">
                                        Filter Payroll
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <SelectInput
                                        label="Outlet"
                                        value={
                                            data.outletId
                                                ? String(data.outletId)
                                                : ""
                                        }
                                        onChange={(event) =>
                                            setData(
                                                "outletId",
                                                event.target.value
                                                    ? Number(event.target.value)
                                                    : "",
                                            )
                                        }
                                        options={outletOptions}
                                        searchable
                                        required
                                        error={errors.outletId}
                                        disabled={processing}
                                    />

                                    {mode === "single" && (
                                        <SelectInput
                                            label="Karyawan"
                                            value={
                                                employeeId
                                                    ? String(employeeId)
                                                    : ""
                                            }
                                            onChange={(event) =>
                                                setEmployeeId(
                                                    event.target.value
                                                        ? Number(
                                                              event.target
                                                                  .value,
                                                          )
                                                        : "",
                                                )
                                            }
                                            options={employeeOptions}
                                            searchable
                                            required
                                            disabled={
                                                processing || !data.outletId
                                            }
                                        />
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <SelectInput
                                            label="Bulan"
                                            value={String(month)}
                                            onChange={(event) =>
                                                setMonth(
                                                    Number(event.target.value),
                                                )
                                            }
                                            options={monthOptions}
                                            disabled={processing}
                                        />

                                        <SelectInput
                                            label="Tahun"
                                            value={String(year)}
                                            onChange={(event) =>
                                                setYear(
                                                    Number(event.target.value),
                                                )
                                            }
                                            options={yearOptions}
                                            disabled={processing}
                                        />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <CreditCard className="w-5 h-5 text-success-600" />
                                    <h2 className="text-lg font-semibold">
                                        Pembayaran
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <SelectInput
                                        label="Sumber Dana"
                                        value={
                                            data.bankAccountId
                                                ? String(data.bankAccountId)
                                                : ""
                                        }
                                        onChange={(event) =>
                                            setData(
                                                "bankAccountId",
                                                event.target.value
                                                    ? Number(event.target.value)
                                                    : "",
                                            )
                                        }
                                        options={bankAccountOptions}
                                        searchable
                                        required
                                        error={errors.bankAccountId}
                                        disabled={processing}
                                    />

                                    <SelectInput
                                        label="Metode Pembayaran"
                                        value={data.paymentMethod}
                                        onChange={(event) =>
                                            setData(
                                                "paymentMethod",
                                                event.target.value as
                                                    | "transfer"
                                                    | "cash"
                                                    | "check"
                                                    | "",
                                            )
                                        }
                                        options={[
                                            {
                                                value: "",
                                                label: "Pilih metode...",
                                            },
                                            {
                                                value: "transfer",
                                                label: "Transfer Bank",
                                            },
                                            {
                                                value: "cash",
                                                label: "Tunai",
                                            },
                                        ]}
                                        required
                                        error={errors.paymentMethod}
                                        disabled={processing}
                                    />

                                    <DateInput
                                        label="Tanggal Pembayaran"
                                        value={data.paymentDate}
                                        onChange={(event) =>
                                            setData(
                                                "paymentDate",
                                                event.target.value,
                                            )
                                        }
                                        max={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        required
                                        error={errors.paymentDate}
                                        disabled={processing}
                                    />
                                </div>
                            </Card>
                            <Card className="p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <FileText className="w-5 h-5 text-warning-600" />
                                    <h2 className="text-lg font-semibold">
                                        Catatan & Lampiran
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <TextAreaInput
                                        label="Catatan"
                                        value={data.note || ""}
                                        onChange={(event) =>
                                            setData("note", event.target.value)
                                        }
                                        rows={4}
                                        placeholder="Catatan payroll, memo transfer, atau informasi tambahan..."
                                        error={errors.note}
                                        disabled={processing}
                                    />

                                    <FileInput
                                        label="Bukti Pembayaran"
                                        placeholder="Upload bukti transfer atau dokumen pendukung"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        allowedFileTypes={[
                                            "image/jpeg",
                                            "image/jpg",
                                            "image/png",
                                            "application/pdf",
                                        ]}
                                        maxFileSize={5 * 1024 * 1024}
                                        onFileSelect={handleAttachmentSelect}
                                        files={
                                            selectedFile ? [selectedFile] : []
                                        }
                                        error={errors.attachment}
                                        disabled={processing}
                                        preview={true}
                                        dragAndDrop={true}
                                        hint="Format: JPG, JPEG, PNG, PDF. Maksimal 5MB."
                                    />
                                </div>
                            </Card>

                            <Card className="p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <Users className="w-5 h-5 text-secondary-600" />
                                    <h2 className="text-lg font-semibold">
                                        Ringkasan Cepat
                                    </h2>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-secondary">
                                            Outlet aktif
                                        </span>
                                        <span className="font-medium">
                                            {selectedOutlet?.name || "-"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-secondary">
                                            Mode proses
                                        </span>
                                        <span className="font-medium">
                                            {mode === "bulk"
                                                ? "Semua karyawan aktif"
                                                : "Per karyawan"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-secondary">
                                            Periode
                                        </span>
                                        <span className="font-medium">
                                            {new Date(
                                                year,
                                                month - 1,
                                                1,
                                            ).toLocaleString("id-ID", {
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-secondary">
                                            Item siap simpan
                                        </span>
                                        <span className="font-medium">
                                            {data.items.length} karyawan
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 mt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handlePreview}
                                        disabled={isPreviewing || processing}
                                        leftIcon={
                                            <RefreshCw className="w-4 h-4" />
                                        }
                                    >
                                        {isPreviewing
                                            ? "Memuat Preview..."
                                            : "Preview Payroll"}
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={
                                            processing ||
                                            isPreviewing ||
                                            data.items.length === 0
                                        }
                                        leftIcon={<Save className="w-4 h-4" />}
                                    >
                                        {processing
                                            ? "Menyimpan..."
                                            : "Simpan Payroll"}
                                    </Button>
                                </div>
                            </Card>

                            {previewData ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <Card className="p-5">
                                            <p className="text-sm text-secondary">
                                                Karyawan
                                            </p>
                                            <p className="mt-1 text-2xl font-semibold">
                                                {
                                                    previewData.summary
                                                        .employee_count
                                                }
                                            </p>
                                        </Card>
                                        <Card className="p-5">
                                            <p className="text-sm text-secondary">
                                                Gaji Kotor
                                            </p>
                                            <p className="mt-1 text-xl font-semibold text-primary-600">
                                                {formatCurrency(
                                                    previewData.summary
                                                        .total_gross_salary,
                                                )}
                                            </p>
                                        </Card>
                                        <Card className="p-5">
                                            <p className="text-sm text-secondary">
                                                Total Potongan
                                            </p>
                                            <p className="mt-1 text-xl font-semibold text-error-600">
                                                {formatCurrency(
                                                    previewData.summary
                                                        .total_deduction,
                                                )}
                                            </p>
                                        </Card>
                                        <Card className="p-5">
                                            <p className="text-sm text-secondary">
                                                Gaji Bersih
                                            </p>
                                            <p className="mt-1 text-xl font-semibold text-success-600">
                                                {formatCurrency(
                                                    previewData.summary
                                                        .total_net_salary,
                                                )}
                                            </p>
                                        </Card>
                                    </div>

                                    <Card className="p-0 overflow-hidden">
                                        <div className="px-5 py-4 border-b border-color bg-[var(--color-surface-muted)]">
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <h2 className="text-lg font-semibold">
                                                        Hasil Preview Payroll
                                                    </h2>
                                                    <p className="text-sm text-secondary">
                                                        {
                                                            previewData.outlet
                                                                .name
                                                        }{" "}
                                                        •{" "}
                                                        {new Date(
                                                            year,
                                                            month - 1,
                                                            1,
                                                        ).toLocaleString(
                                                            "id-ID",
                                                            {
                                                                month: "long",
                                                                year: "numeric",
                                                            },
                                                        )}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={
                                                        previewData.type ===
                                                        "bulk"
                                                            ? "success"
                                                            : "primary"
                                                    }
                                                    size="sm"
                                                >
                                                    {previewData.type === "bulk"
                                                        ? "Massal"
                                                        : "Per Karyawan"}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm">
                                                <thead className="bg-[var(--color-surface-muted)]">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left font-semibold">
                                                            Karyawan
                                                        </th>
                                                        <th className="px-4 py-3 text-left font-semibold">
                                                            Komponen
                                                        </th>
                                                        <th className="px-4 py-3 text-right font-semibold">
                                                            Gaji Kotor
                                                        </th>
                                                        <th className="px-4 py-3 text-right font-semibold">
                                                            Potongan
                                                        </th>
                                                        <th className="px-4 py-3 text-right font-semibold">
                                                            Gaji Bersih
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {previewData.items.map(
                                                        (item) => (
                                                            <tr
                                                                key={
                                                                    item.employeeId
                                                                }
                                                                className="border-t hover:bg-[var(--color-surface-muted)] cursor-pointer transition-colors"
                                                                onClick={() =>
                                                                    openDetailModal(
                                                                        mapPreviewItemToPayload(
                                                                            item,
                                                                        ),
                                                                    )
                                                                }
                                                            >
                                                                <td className="px-4 py-3 align-top">
                                                                    <div className="font-medium flex items-center gap-2">
                                                                        {
                                                                            item.employeeName
                                                                        }
                                                                        {item.isAlreadyPaid && (
                                                                            <Badge
                                                                                variant={
                                                                                    item.existingPayrollStatus ===
                                                                                    "paid"
                                                                                        ? "success"
                                                                                        : "warning"
                                                                                }
                                                                                size="sm"
                                                                                className="text-[10px] uppercase font-black tracking-tighter"
                                                                            >
                                                                                {item.existingPayrollStatus ===
                                                                                "paid"
                                                                                    ? "Lunas"
                                                                                    : "Draft"}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-secondary">
                                                                        {
                                                                            item.employeeCode
                                                                        }
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 align-top text-secondary">
                                                                    {new Date(
                                                                        year,
                                                                        month -
                                                                            1,
                                                                        1,
                                                                    ).toLocaleString(
                                                                        "id-ID",
                                                                        {
                                                                            month: "long",
                                                                        },
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 align-top text-right">
                                                                    <div className="font-medium text-primary-600">
                                                                        {formatCurrency(
                                                                            item.grossSalary,
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-secondary">
                                                                        Pokok{" "}
                                                                        {formatCurrency(
                                                                            item.baseSalary,
                                                                        )}{" "}
                                                                        + Tunj{" "}
                                                                        {formatCurrency(
                                                                            item.totalAllowance,
                                                                        )}
                                                                        {item.totalCommission >
                                                                            0 && (
                                                                            <>
                                                                                {" "}
                                                                                +
                                                                                Kom{" "}
                                                                                {formatCurrency(
                                                                                    item.totalCommission,
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 align-top text-right">
                                                                    <div className="font-medium text-error-600">
                                                                        {formatCurrency(
                                                                            item.totalDeduction,
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-secondary">
                                                                        Denda{" "}
                                                                        {formatCurrency(
                                                                            item.totalFine,
                                                                        )}{" "}
                                                                        + Kasbon{" "}
                                                                        {formatCurrency(
                                                                            item.totalLoanDeduction,
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 align-top text-right font-semibold text-success-600">
                                                                    {formatCurrency(
                                                                        item.netSalary,
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="p-4 bg-[var(--color-surface-muted)] border-t text-xs text-secondary flex items-center gap-2">
                                            <Info className="w-4 h-4" />
                                            <span>
                                                Klik baris karyawan untuk
                                                melihat rincian gaji dan
                                                potongan secara detail.
                                            </span>
                                        </div>
                                    </Card>
                                </>
                            ) : (
                                <Alert
                                    variant="info"
                                    title="Belum Ada Preview"
                                    description="Pilih outlet dan periode dulu, lalu klik Preview Payroll untuk melihat hasil perhitungan sebelum disimpan."
                                />
                            )}
                        </form>
                    </Card>
                </div>
            </div>

            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title={`Rincian Payroll: ${selectedPreviewItem?.employeeName}`}
                size="xl"
            >
                {selectedPreviewItem && (
                    <div className="space-y-6 p-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="p-4 bg-[var(--color-surface-muted)] border-color">
                                <h3 className="text-sm font-semibold text-secondary mb-3 uppercase tracking-wider">
                                    Informasi Karyawan
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-secondary">
                                            Nama
                                        </span>
                                        <span className="font-medium">
                                            {selectedPreviewItem.employeeName}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-secondary">
                                            NIK/ID
                                        </span>
                                        <span className="font-medium">
                                            {selectedPreviewItem.employeeCode}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-secondary">
                                            Periode
                                        </span>
                                        <span className="font-medium">
                                            {new Date(
                                                year,
                                                month - 1,
                                                1,
                                            ).toLocaleString("id-ID", {
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4 bg-success-50/30 border-success-50">
                                <h3 className="text-sm font-semibold text-success-600 mb-3 uppercase tracking-wider">
                                    Ringkasan Gaji
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-primary-600">
                                        <span>Gaji Kotor</span>
                                        <span className="font-bold">
                                            {formatCurrency(
                                                selectedPreviewItem.grossSalary,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-error-600">
                                        <span>Total Potongan</span>
                                        <span className="font-bold">
                                            -
                                            {formatCurrency(
                                                selectedPreviewItem.totalDeduction,
                                            )}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-success-50 flex justify-between text-lg text-success-600">
                                        <span className="font-bold">
                                            Gaji Bersih
                                        </span>
                                        <span className="font-black">
                                            {formatCurrency(
                                                selectedPreviewItem.netSalary,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-md font-bold text-primary mb-3 flex items-center gap-2">
                                    <div className="w-2 h-6 bg-primary-500 rounded-full" />
                                    Pendapatan (Earnings)
                                </h3>
                                <div className="border border-color rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-[var(--color-surface-muted)] text-secondary">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-semibold">
                                                    Komponen
                                                </th>
                                                <th className="px-4 py-2 text-left font-semibold">
                                                    Deskripsi
                                                </th>
                                                <th className="px-4 py-2 text-right font-semibold">
                                                    Jumlah
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--color-border)]">
                                            {selectedPreviewItem.salaryBreakdown?.map(
                                                (s) => (
                                                    <tr key={s.id}>
                                                        <td className="px-4 py-3 font-medium">
                                                            {s.name}
                                                        </td>
                                                        <td className="px-4 py-3 text-secondary">
                                                            {s.description ||
                                                                "Gaji Bulanan"}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium">
                                                            {formatCurrency(
                                                                s.calculatedAmount,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                            {selectedPreviewItem.allowanceBreakdown?.map(
                                                (a) => (
                                                    <tr key={a.id}>
                                                        <td className="px-4 py-3 font-medium">
                                                            {a.name}
                                                        </td>
                                                        <td className="px-4 py-3 text-secondary">
                                                            Tunjangan Harian (
                                                            {a.workDays} hari)
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium">
                                                            {formatCurrency(
                                                                a.calculatedAmount,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                            {selectedPreviewItem.commissionDetails?.map(
                                                (c) => (
                                                    <tr key={c.id}>
                                                        <td className="px-4 py-3 font-medium">
                                                            Komisi —{" "}
                                                            {c.description}
                                                        </td>
                                                        <td className="px-4 py-3 text-secondary">
                                                            {c.date}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium">
                                                            {formatCurrency(
                                                                c.amount,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                            {(!selectedPreviewItem.commissionDetails ||
                                                selectedPreviewItem
                                                    .commissionDetails
                                                    .length === 0) &&
                                                selectedPreviewItem.totalCommission >
                                                    0 && (
                                                    <tr>
                                                        <td className="px-4 py-3 font-medium">
                                                            Komisi
                                                        </td>
                                                        <td className="px-4 py-3 text-secondary">
                                                            Komisi
                                                            Penjualan/Layanan
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium">
                                                            {formatCurrency(
                                                                selectedPreviewItem.totalCommission,
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                        </tbody>
                                        <tfoot className="bg-primary-50/50">
                                            <tr className="font-bold text-primary-700">
                                                <td
                                                    colSpan={2}
                                                    className="px-4 py-3 text-right"
                                                >
                                                    Total Pendapatan
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {formatCurrency(
                                                        selectedPreviewItem.grossSalary,
                                                    )}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-md font-bold text-primary mb-3 flex items-center gap-2">
                                    <div className="w-2 h-6 bg-error-500 rounded-full" />
                                    Potongan (Deductions)
                                </h3>
                                <div className="border border-color rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-[var(--color-surface-muted)] text-secondary">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-semibold">
                                                    Komponen
                                                </th>
                                                <th className="px-4 py-2 text-left font-semibold">
                                                    Deskripsi
                                                </th>
                                                <th className="px-4 py-2 text-right font-semibold">
                                                    Jumlah
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--color-border)]">
                                            {selectedPreviewItem.fineDetails?.map(
                                                (f) => (
                                                    <tr key={f.id}>
                                                        <td className="px-4 py-3 font-medium text-error-600">
                                                            {f.fineName}
                                                        </td>
                                                        <td className="px-4 py-3 text-secondary">
                                                            {f.description ||
                                                                "Denda Pelanggaran"}{" "}
                                                            ({f.date})
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium text-error-600">
                                                            -
                                                            {formatCurrency(
                                                                f.amount,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                            {selectedPreviewItem.totalLoanDeduction >
                                                0 && (
                                                <tr>
                                                    <td className="px-4 py-3 font-medium text-error-600">
                                                        Potongan Kasbon
                                                    </td>
                                                    <td className="px-4 py-3 text-secondary">
                                                        Cicilan Pinjaman (Sisa:{" "}
                                                        {formatCurrency(
                                                            selectedPreviewItem.remainingLoanBalance -
                                                                selectedPreviewItem.loanDeductionAmount,
                                                        )}
                                                        )
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium text-error-600">
                                                        -
                                                        {formatCurrency(
                                                            selectedPreviewItem.totalLoanDeduction,
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                            {selectedPreviewItem.totalDeduction ===
                                                0 && (
                                                <tr>
                                                    <td
                                                        colSpan={3}
                                                        className="px-4 py-8 text-center text-tertiary italic"
                                                    >
                                                        Tidak ada potongan untuk
                                                        periode ini.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        {selectedPreviewItem.totalDeduction >
                                            0 && (
                                            <tfoot className="bg-error-50/50">
                                                <tr className="font-bold text-error-600">
                                                    <td
                                                        colSpan={2}
                                                        className="px-4 py-3 text-right"
                                                    >
                                                        Total Potongan
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        -
                                                        {formatCurrency(
                                                            selectedPreviewItem.totalDeduction,
                                                        )}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

PayrollCreate.layout = withAuthenticatedLayout({
    title: "Proses Penggajian",
    searchable: false,
    breadcrumbs: [
        { label: "Penggajian", href: route("payrolls.index") },
        { label: "Proses" },
    ],
});

export default PayrollCreate;
