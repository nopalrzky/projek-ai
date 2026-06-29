import React, { useState, useCallback, useMemo } from "react";
import { Head, useForm } from "@inertiajs/react";
import {
    Save,
    ArrowLeft,
    BookOpen,
    Building2,
    Calendar,
    FileText,
    Plus,
    Trash2,
    AlertTriangle,
    Info,
    DollarSign,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import {
    Input,
    TextAreaInput,
    SelectInput,
    DateInput,
} from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import PageHeader from "@/Components/Page/PageHeader";
import { JournalEntryCreateProps } from "./types";
import { formatCurrency } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { JournalDetailFormInput, JournalEntryFormData } from "@/types";
import journalEntryService from "@/Services/journal_entry.service";

const JournalEntryCreate = ({
    outlets,
    accounts,
    flash,
}: JournalEntryCreateProps) => {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        clearErrors,
        reset,
        transform,
    } = useForm<JournalEntryFormData>({
        outletId: 0,
        date: new Date().toISOString().split("T")[0],
        description: "",
        referenceType: "",
        referenceId: undefined as number | undefined,
        journalDetails: [] as Array<{
            accountId: number;
            debit: number;
            credit: number;
            memo: string;
        }>,
    });

    const [detailInputs, setDetailInputs] = useState<JournalDetailFormInput[]>([
        {
            id: uuidv4(),
            accountId: 0,
            debit: "",
            credit: "",
            memo: "",
        },
        {
            id: uuidv4(),
            accountId: 0,
            debit: "",
            credit: "",
            memo: "",
        },
    ]);

    const [dateWarning, setDateWarning] = useState<string>("");
    const [submitError, setSubmitError] = useState<string>("");

    const selectedOutlet = useMemo(() => {
        return outlets.find((outlet) => outlet.id === data.outletId);
    }, [outlets, data.outletId]);

    const totals = useMemo(() => {
        const totalDebit = detailInputs.reduce((sum, detail) => {
            const debit = parseFloat(detail.debit) || 0;
            return sum + debit;
        }, 0);

        const totalCredit = detailInputs.reduce((sum, detail) => {
            const credit = parseFloat(detail.credit) || 0;
            return sum + credit;
        }, 0);

        const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
        const difference = totalDebit - totalCredit;

        return {
            totalDebit,
            totalCredit,
            isBalanced,
            difference,
        };
    }, [detailInputs]);

    const handleAddDetail = useCallback(() => {
        setDetailInputs((prev) => [
            ...prev,
            {
                id: uuidv4(),
                accountId: 0,
                debit: "",
                credit: "",
                memo: "",
            },
        ]);
    }, []);

    const handleRemoveDetail = useCallback((id: string) => {
        setDetailInputs((prev) => {
            if (prev.length <= 2) {
                return prev;
            }
            return prev.filter((detail) => detail.id !== id);
        });
    }, []);

    const handleDetailChange = useCallback(
        (
            id: string,
            field: keyof JournalDetailFormInput,
            value: string | number,
        ) => {
            setDetailInputs((prev) =>
                prev.map((detail) => {
                    if (detail.id !== id) return detail;

                    const updated = { ...detail, [field]: value };

                    // If debit is entered, clear credit and vice versa
                    if (field === "debit" && value) {
                        updated.credit = "";
                    } else if (field === "credit" && value) {
                        updated.debit = "";
                    }

                    return updated;
                }),
            );

            if (errors.journalDetails) {
                clearErrors("journalDetails");
            }
        },
        [errors.journalDetails, clearErrors],
    );

    // Convert detail inputs to form data format
    const prepareDetailsForSubmit = useCallback(() => {
        return detailInputs
            .filter(
                (detail) =>
                    detail.accountId > 0 &&
                    (parseFloat(detail.debit) > 0 ||
                        parseFloat(detail.credit) > 0),
            )
            .map((detail) => ({
                accountId: detail.accountId,
                debit: parseFloat(detail.debit) || 0,
                credit: parseFloat(detail.credit) || 0,
                memo: detail.memo.trim(),
            }));
    }, [detailInputs]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitError("");

        if (!data.outletId) {
            setSubmitError("Silakan pilih outlet terlebih dahulu.");
            return;
        }

        const details = prepareDetailsForSubmit();

        if (details.length < 2) {
            setSubmitError(
                "Minimal harus ada 2 baris jurnal (debit dan kredit).",
            );
            return;
        }

        const hasDuplicateAccount =
            new Set(details.map((detail) => detail.accountId)).size !==
            details.length;

        if (hasDuplicateAccount) {
            setSubmitError(
                "Akun yang sama tidak boleh dipilih dua kali dalam satu jurnal.",
            );
            return;
        }

        if (!totals.isBalanced) {
            setSubmitError(
                `Jurnal tidak seimbang. Debit: ${formatCurrency(
                    totals.totalDebit,
                )}, Kredit: ${formatCurrency(
                    totals.totalCredit,
                )}, Selisih: ${formatCurrency(Math.abs(totals.difference))}.`,
            );
            return;
        }

        if (dateWarning) {
            const confirmSubmit = confirm(
                `${dateWarning}\n\nApakah Anda yakin ingin melanjutkan?`,
            );
            if (!confirmSubmit) return;
        }

        transform((current) => ({
            ...current,
            journalDetails: details,
        }));

        post(route("journal-entries.store"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setSubmitError("");
                setDetailInputs([
                    {
                        id: uuidv4(),
                        accountId: 0,
                        debit: "",
                        credit: "",
                        memo: "",
                    },
                    {
                        id: uuidv4(),
                        accountId: 0,
                        debit: "",
                        credit: "",
                        memo: "",
                    },
                ]);
                setDateWarning("");
            },
            onError: () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
        });
    };

    const outletOptions = useMemo(
        () => [
            { value: "", label: "Pilih Outlet..." },
            ...outlets.map((outlet) => ({
                value: outlet.id.toString(),
                label: outlet.name,
                description: outlet.code,
                icon: (
                    <Building2
                        className="w-4 h-4"
                        style={{ color: "var(--color-primary-500)" }}
                    />
                ),
            })),
        ],
        [outlets],
    );

    const accountOptions = useMemo(
        () => [
            { value: "", label: "Pilih Akun..." },
            ...accounts.map((account) => ({
                value: account.id.toString(),
                label: `${account.code} - ${account.name}`,
                description: account.type,
            })),
        ],
        [accounts],
    );

    const isFormValid = useMemo(() => {
        const hasOutlet = !!data.outletId;
        const hasMinDetails = prepareDetailsForSubmit().length >= 2;
        const hasDate = !!data.date;
        const hasBalanced = totals.isBalanced;

        return hasOutlet && hasMinDetails && hasDate && hasBalanced;
    }, [data.outletId, data.date, prepareDetailsForSubmit, totals.isBalanced]);

    return (
        <>
            <Head title="Tambah Jurnal Entry Baru" />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Tambah Jurnal Entry Baru"
                        subtitle="Buat transaksi jurnal manual"
                        icon={BookOpen}
                        animate={true}
                        actions={
                            <Button
                                onClick={() => journalEntryService.goToIndex()}
                                variant="outline"
                                leftIcon={<ArrowLeft className="w-4 h-4" />}
                            >
                                Kembali
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

                    <Card className="p-8">
                        <Form onSubmit={handleSubmit} className="space-y-8">
                            {/* Outlet Selection */}
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
                                            Outlet
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Pilih outlet tempat jurnal ini
                                            dibuat
                                        </p>
                                    </div>
                                </div>

                                <SelectInput
                                    label="Outlet"
                                    placeholder="Pilih outlet..."
                                    value={data.outletId.toString()}
                                    onChange={(e) =>
                                        setData(
                                            "outletId",
                                            parseInt(e.target.value) || 0,
                                        )
                                    }
                                    options={outletOptions}
                                    error={errors.outletId}
                                    disabled={processing}
                                    required
                                    searchable={true}
                                    leftIcon={<Building2 className="w-5 h-5" />}
                                    hint="Pilih outlet untuk membuat jurnal entry"
                                    renderOption={(option) => (
                                        <div className="flex items-center space-x-3">
                                            {option.icon}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium">
                                                    {option.label}
                                                </div>
                                                {option.description && (
                                                    <div
                                                        className="text-xs"
                                                        style={{
                                                            color: "var(--color-text-tertiary)",
                                                        }}
                                                    >
                                                        {option.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                />

                                {/* Selected Outlet Info */}
                                {selectedOutlet && (
                                    <div
                                        className="p-4 rounded-lg border"
                                        style={{
                                            backgroundColor:
                                                "var(--color-primary-50)",
                                            borderColor:
                                                "var(--color-primary-200)",
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Building2
                                                className="w-5 h-5"
                                                style={{
                                                    color: "var(--color-primary-600)",
                                                }}
                                            />
                                            <div>
                                                <p
                                                    className="font-medium"
                                                    style={{
                                                        color: "var(--color-primary-800)",
                                                    }}
                                                >
                                                    {selectedOutlet.name}
                                                </p>
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-primary-600)",
                                                    }}
                                                >
                                                    {selectedOutlet.code}
                                                    {selectedOutlet.street &&
                                                        ` • ${selectedOutlet.street}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Basic Information */}
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
                                        <BookOpen
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
                                            Informasi Jurnal
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Detail dan deskripsi transaksi
                                            jurnal
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <DateInput
                                            label="Tanggal Transaksi"
                                            value={data.date}
                                            onChange={(e) =>
                                                setData("date", e.target.value)
                                            }
                                            error={errors.date}
                                            required
                                            disabled={
                                                processing || !data.outletId
                                            }
                                            max={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                            leftIcon={
                                                <Calendar className="w-5 h-5" />
                                            }
                                            hint="Tanggal transaksi jurnal"
                                        />
                                        {dateWarning && (
                                            <Alert
                                                variant="warning"
                                                description={dateWarning}
                                                className="mt-2"
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <TextAreaInput
                                        label="Deskripsi"
                                        placeholder="Jelaskan transaksi jurnal ini..."
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                "description",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.description}
                                        disabled={processing}
                                        hint="Deskripsi detail tentang transaksi ini (opsional)"
                                        rows={3}
                                        maxLength={1000}
                                        showCharacterCount={true}
                                        autoResize={true}
                                        minRows={3}
                                        maxRows={6}
                                    />
                                </div>
                            </div>

                            {data.outletId > 0 && (
                                <div className="space-y-6">
                                    <div
                                        className="flex items-center justify-between pb-4 border-b"
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
                                                    Detail Jurnal
                                                </h2>
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Baris-baris akun debit dan
                                                    kredit
                                                </p>
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddDetail}
                                            disabled={processing}
                                            leftIcon={
                                                <Plus className="w-4 h-4" />
                                            }
                                        >
                                            Tambah Baris
                                        </Button>
                                    </div>

                                    {/* Detail Rows */}
                                    <div className="space-y-4">
                                        {detailInputs.map((detail, index) => (
                                            <div
                                                key={detail.id}
                                                className="p-4 rounded-lg border space-y-4"
                                                style={{
                                                    backgroundColor:
                                                        "var(--color-surface)",
                                                    borderColor:
                                                        "var(--color-border)",
                                                }}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <span
                                                        className="text-sm font-medium"
                                                        style={{
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        Baris #{index + 1}
                                                    </span>
                                                    {detailInputs.length >
                                                        2 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleRemoveDetail(
                                                                    detail.id,
                                                                )
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                                    <div className="md:col-span-5">
                                                        <SelectInput
                                                            label="Akun"
                                                            placeholder="Pilih akun..."
                                                            value={detail.accountId.toString()}
                                                            onChange={(e) =>
                                                                handleDetailChange(
                                                                    detail.id,
                                                                    "accountId",
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                    ) || 0,
                                                                )
                                                            }
                                                            options={
                                                                accountOptions
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                            required
                                                            searchable={true}
                                                            size="sm"
                                                        />
                                                    </div>

                                                    {/* Debit */}
                                                    <div className="md:col-span-3">
                                                        <Input
                                                            label="Debit"
                                                            type="number"
                                                            placeholder="0.00"
                                                            value={detail.debit}
                                                            onChange={(e) =>
                                                                handleDetailChange(
                                                                    detail.id,
                                                                    "debit",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            disabled={
                                                                processing ||
                                                                !!detail.credit
                                                            }
                                                            min="0"
                                                            step="0.01"
                                                            size="sm"
                                                            leftIcon={
                                                                <DollarSign className="w-4 h-4" />
                                                            }
                                                        />
                                                    </div>

                                                    {/* Credit */}
                                                    <div className="md:col-span-3">
                                                        <Input
                                                            label="Kredit"
                                                            type="number"
                                                            placeholder="0.00"
                                                            value={
                                                                detail.credit
                                                            }
                                                            onChange={(e) =>
                                                                handleDetailChange(
                                                                    detail.id,
                                                                    "credit",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            disabled={
                                                                processing ||
                                                                !!detail.debit
                                                            }
                                                            min="0"
                                                            step="0.01"
                                                            size="sm"
                                                            leftIcon={
                                                                <DollarSign className="w-4 h-4" />
                                                            }
                                                        />
                                                    </div>

                                                    {/* Memo */}
                                                    <div className="md:col-span-12">
                                                        <Input
                                                            label="Catatan"
                                                            placeholder="Catatan untuk baris ini (opsional)"
                                                            value={detail.memo}
                                                            onChange={(e) =>
                                                                handleDetailChange(
                                                                    detail.id,
                                                                    "memo",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                            maxLength={500}
                                                            size="sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Totals Summary */}
                                    <div
                                        className="p-4 rounded-lg border"
                                        style={{
                                            backgroundColor: totals.isBalanced
                                                ? "var(--color-success-50)"
                                                : "var(--color-warning-50)",
                                            borderColor: totals.isBalanced
                                                ? "var(--color-success-200)"
                                                : "var(--color-warning-200)",
                                        }}
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <p
                                                    className="text-xs font-medium mb-1"
                                                    style={{
                                                        color: "var(--color-text-tertiary)",
                                                    }}
                                                >
                                                    Total Debit
                                                </p>
                                                <p
                                                    className="text-lg font-bold"
                                                    style={{
                                                        color: "var(--color-text-primary)",
                                                    }}
                                                >
                                                    {formatCurrency(
                                                        totals.totalDebit,
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p
                                                    className="text-xs font-medium mb-1"
                                                    style={{
                                                        color: "var(--color-text-tertiary)",
                                                    }}
                                                >
                                                    Total Kredit
                                                </p>
                                                <p
                                                    className="text-lg font-bold"
                                                    style={{
                                                        color: "var(--color-text-primary)",
                                                    }}
                                                >
                                                    {formatCurrency(
                                                        totals.totalCredit,
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p
                                                    className="text-xs font-medium mb-1"
                                                    style={{
                                                        color: "var(--color-text-tertiary)",
                                                    }}
                                                >
                                                    Status
                                                </p>
                                                <Badge
                                                    variant={
                                                        totals.isBalanced
                                                            ? "success"
                                                            : "warning"
                                                    }
                                                    size="lg"
                                                    className="font-bold"
                                                >
                                                    {totals.isBalanced
                                                        ? "✓ Seimbang"
                                                        : `⚠ Selisih: ${formatCurrency(
                                                              Math.abs(
                                                                  totals.difference,
                                                              ),
                                                          )}`}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info Box */}
                                    <div
                                        className="p-4 rounded-lg border"
                                        style={{
                                            backgroundColor:
                                                "var(--color-info-50)",
                                            borderColor:
                                                "var(--color-info-200)",
                                        }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Info
                                                className="w-5 h-5 flex-shrink-0 mt-0.5"
                                                style={{
                                                    color: "var(--color-info-600)",
                                                }}
                                            />
                                            <div>
                                                <h4
                                                    className="text-sm font-medium mb-1"
                                                    style={{
                                                        color: "var(--color-info-700)",
                                                    }}
                                                >
                                                    Tips Membuat Jurnal Entry
                                                </h4>
                                                <ul
                                                    className="text-xs space-y-1"
                                                    style={{
                                                        color: "var(--color-info-600)",
                                                    }}
                                                >
                                                    <li>
                                                        • Minimal harus ada 2
                                                        baris (debit dan kredit)
                                                    </li>
                                                    <li>
                                                        • Total debit harus sama
                                                        dengan total kredit
                                                    </li>
                                                    <li>
                                                        • Setiap baris hanya
                                                        boleh memiliki debit
                                                        ATAU kredit
                                                    </li>
                                                    <li>
                                                        • Pilih akun yang sesuai
                                                        dengan jenis transaksi
                                                    </li>
                                                    <li>
                                                        • Tambahkan catatan
                                                        untuk memudahkan
                                                        tracking
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Balance Warning */}
                                    {!totals.isBalanced &&
                                        totals.totalDebit > 0 &&
                                        totals.totalCredit > 0 && (
                                            <Alert
                                                variant="warning"
                                                title="Jurnal Tidak Seimbang"
                                                description={`Total Debit (${formatCurrency(
                                                    totals.totalDebit,
                                                )}) tidak sama dengan Total Kredit (${formatCurrency(
                                                    totals.totalCredit,
                                                )}). Selisih: ${formatCurrency(
                                                    Math.abs(totals.difference),
                                                )}`}
                                                icon={
                                                    <AlertTriangle className="w-5 h-5" />
                                                }
                                            />
                                        )}
                                </div>
                            )}

                            {/* No Outlet Selected Info */}
                            {!data.outletId && (
                                <Alert
                                    variant="info"
                                    title="Pilih Outlet Terlebih Dahulu"
                                    description="Silakan pilih outlet untuk melanjutkan pembuatan jurnal entry."
                                    icon={<Info className="w-5 h-5" />}
                                />
                            )}

                            {/* Validation Errors */}
                            {submitError && (
                                <Alert
                                    variant="error"
                                    title="Validasi Jurnal"
                                    description={submitError}
                                    className="mt-6"
                                />
                            )}

                            {Object.keys(errors).length > 0 && (
                                <Alert
                                    variant="error"
                                    title="Terdapat kesalahan pada form"
                                    description="Silakan periksa kembali semua field yang bertanda merah."
                                    className="mt-6"
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
                                        journalEntryService.goToIndex()
                                    }
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
                                    {processing
                                        ? "Menyimpan..."
                                        : "Simpan Jurnal"}
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </div>
            </div>
        </>
    );
};

JournalEntryCreate.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Tambah Jurnal Entry",
        breadcrumbs: [
            { label: "Jurnal Entry", href: route("journal-entries.index") },
            { label: "Tambah Entry" },
        ],
    })(page);

export default JournalEntryCreate;
