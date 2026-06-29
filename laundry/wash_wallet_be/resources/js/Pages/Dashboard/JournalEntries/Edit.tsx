import React, { useCallback, useMemo, useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import {
    AlertTriangle,
    ArrowLeft,
    BookOpen,
    Calendar,
    Info,
    Plus,
    Save,
    Trash2,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import { Form } from "@/Components/Form";
import {
    DateInput,
    Input,
    SelectInput,
    TextAreaInput,
} from "@/Components/Input";
import PageHeader from "@/Components/Page/PageHeader";
import { formatCurrency } from "@/lib/utils";
import { JournalDetailFormInput, JournalEntryFormData } from "@/types";
import { JournalEntryEditProps } from "./types";
import journalEntryService from "@/Services/journal_entry.service";

const JournalEntryEdit = ({
    journalEntry,
    accounts,
    flash,
}: JournalEntryEditProps) => {
    const { data, setData, put, processing, errors, clearErrors, transform } =
        useForm<JournalEntryFormData>({
            outletId: journalEntry.outletId,
            date: journalEntry.date,
            description: journalEntry.description || "",
            referenceType: journalEntry.referenceType,
            referenceId: journalEntry.referenceId,
            journalDetails: journalEntry.journalDetails.map((detail) => ({
                accountId: detail.accountId,
                debit: Number(detail.debit) || 0,
                credit: Number(detail.credit) || 0,
                memo: detail.memo || "",
            })),
        });

    const [detailInputs, setDetailInputs] = useState<JournalDetailFormInput[]>(
        journalEntry.journalDetails.map((detail) => ({
            id: uuidv4(),
            accountId: detail.accountId,
            debit: detail.debit ? String(detail.debit) : "",
            credit: detail.credit ? String(detail.credit) : "",
            memo: detail.memo || "",
        })),
    );
    const [submitError, setSubmitError] = useState("");

    const isReadOnly =
        !journalEntry.isManual || journalEntry.canBeEdited === false;

    const accountOptions = useMemo(
        () =>
            accounts.map((account) => ({
                value: account.id.toString(),
                label: `${account.code} - ${account.name}`,
                description: account.typeLabel,
            })),
        [accounts],
    );

    const totals = useMemo(() => {
        const totalDebit = detailInputs.reduce((sum, detail) => {
            return sum + (Number.parseFloat(detail.debit) || 0);
        }, 0);

        const totalCredit = detailInputs.reduce((sum, detail) => {
            return sum + (Number.parseFloat(detail.credit) || 0);
        }, 0);

        return {
            totalDebit,
            totalCredit,
            difference: totalDebit - totalCredit,
            isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
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
                    if (detail.id !== id) {
                        return detail;
                    }

                    if (field === "debit") {
                        return {
                            ...detail,
                            debit: String(value),
                            credit: value ? "" : detail.credit,
                        };
                    }

                    if (field === "credit") {
                        return {
                            ...detail,
                            credit: String(value),
                            debit: value ? "" : detail.debit,
                        };
                    }

                    return {
                        ...detail,
                        [field]: value,
                    };
                }),
            );
        },
        [],
    );

    const prepareDetailsForSubmit = useCallback(() => {
        return detailInputs
            .filter(
                (detail) =>
                    detail.accountId > 0 &&
                    ((Number.parseFloat(detail.debit) || 0) > 0 ||
                        (Number.parseFloat(detail.credit) || 0) > 0),
            )
            .map((detail) => ({
                accountId: detail.accountId,
                debit: Number.parseFloat(detail.debit) || 0,
                credit: Number.parseFloat(detail.credit) || 0,
                memo: detail.memo.trim(),
            }));
    }, [detailInputs]);

    const handleSubmit = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setSubmitError("");

            if (isReadOnly) {
                setSubmitError(
                    "Jurnal ini tidak dapat diperbarui karena bukan jurnal manual atau periodenya sudah tertutup.",
                );
                return;
            }

            const preparedDetails = prepareDetailsForSubmit();

            if (preparedDetails.length < 2) {
                setSubmitError(
                    "Minimal harus ada 2 baris detail jurnal yang valid.",
                );
                return;
            }

            if (!totals.isBalanced) {
                setSubmitError(
                    "Total debit dan kredit harus seimbang sebelum disimpan.",
                );
                return;
            }

            clearErrors();
            transform((currentData) => ({
                ...currentData,
                journalDetails: preparedDetails,
            }));

            put(route("journal-entries.update", journalEntry.id), {
                preserveScroll: true,
                onError: () => {
                    setSubmitError(
                        "Perubahan belum berhasil disimpan. Silakan cek input yang bertanda error.",
                    );
                },
            });
        },
        [
            clearErrors,
            isReadOnly,
            journalEntry.id,
            prepareDetailsForSubmit,
            put,
            totals.isBalanced,
            transform,
        ],
    );

    return (
        <>
            <Head title={`Edit Jurnal ${journalEntry.transactionNumber}`} />

            <div className="p-6">
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Edit Jurnal Manual"
                        subtitle={`Perbarui ${journalEntry.transactionNumber}`}
                        icon={BookOpen}
                        animate={true}
                        actions={
                            <Button
                                onClick={() =>
                                    journalEntryService.goToView(
                                        journalEntry.id,
                                    )
                                }
                                variant="outline"
                                leftIcon={<ArrowLeft className="w-4 h-4" />}
                            >
                                Kembali ke Detail
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

                    {isReadOnly && (
                        <Alert
                            variant="warning"
                            title="Jurnal Tidak Bisa Diedit"
                            description="Hanya jurnal manual pada periode akuntansi yang masih terbuka yang dapat diubah."
                        />
                    )}

                    {submitError && (
                        <Alert
                            variant="error"
                            title="Perubahan Belum Disimpan"
                            description={submitError}
                        />
                    )}

                    {Object.keys(errors).length > 0 && (
                        <Alert
                            variant="error"
                            title="Ada field yang perlu diperbaiki"
                            description="Silakan cek kembali tanggal, deskripsi, dan detail debit/kredit."
                        />
                    )}

                    <Card className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div
                                className="rounded-xl border p-4"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Outlet
                                </p>
                                <p
                                    className="mt-1 text-lg font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {journalEntry.outlet?.name || "-"}
                                </p>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {journalEntry.outlet?.code || "-"}
                                </p>
                            </div>

                            <div
                                className="rounded-xl border p-4"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Total Debit
                                </p>
                                <p
                                    className="mt-1 text-lg font-semibold"
                                    style={{
                                        color: "var(--color-success-600)",
                                    }}
                                >
                                    {formatCurrency(totals.totalDebit)}
                                </p>
                            </div>

                            <div
                                className="rounded-xl border p-4"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Total Kredit
                                        </p>
                                        <p
                                            className="mt-1 text-lg font-semibold"
                                            style={{
                                                color: "var(--color-error-600)",
                                            }}
                                        >
                                            {formatCurrency(totals.totalCredit)}
                                        </p>
                                    </div>

                                    <Badge
                                        variant={
                                            totals.isBalanced
                                                ? "success"
                                                : "warning"
                                        }
                                        size="sm"
                                    >
                                        {totals.isBalanced
                                            ? "Seimbang"
                                            : "Belum Seimbang"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <Form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DateInput
                                    label="Tanggal Transaksi"
                                    value={data.date}
                                    onChange={(event) => {
                                        setData("date", event.target.value);
                                        clearErrors("date");
                                    }}
                                    max={new Date().toISOString().split("T")[0]}
                                    error={errors.date}
                                    disabled={processing || isReadOnly}
                                    required
                                />

                                <div
                                    className="rounded-xl border p-4 flex items-start gap-3"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center"
                                        style={{
                                            backgroundColor:
                                                "var(--color-info-50)",
                                        }}
                                    >
                                        <Calendar
                                            className="w-5 h-5"
                                            style={{
                                                color: "var(--color-info-600)",
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <p
                                            className="text-sm font-medium"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            Nomor Transaksi
                                        </p>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {journalEntry.transactionNumber}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <TextAreaInput
                                label="Deskripsi"
                                placeholder="Jelaskan transaksi jurnal ini..."
                                value={data.description}
                                onChange={(event) => {
                                    setData("description", event.target.value);
                                    clearErrors("description");
                                }}
                                error={errors.description}
                                disabled={processing || isReadOnly}
                                rows={4}
                            />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h2
                                            className="text-lg font-semibold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            Detail Debit & Kredit
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Satu baris akun diisi debit atau
                                            kredit, bukan keduanya.
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddDetail}
                                        leftIcon={<Plus className="w-4 h-4" />}
                                        disabled={processing || isReadOnly}
                                    >
                                        Tambah Baris
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {detailInputs.map((detail, index) => (
                                        <div
                                            key={detail.id}
                                            className="rounded-xl border p-4 space-y-4"
                                            style={{
                                                borderColor:
                                                    "var(--color-border)",
                                            }}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <Badge
                                                        variant="secondary"
                                                        size="sm"
                                                    >
                                                        Baris {index + 1}
                                                    </Badge>
                                                    <span
                                                        className="text-sm"
                                                        style={{
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        Pilih akun dan isi nilai
                                                        transaksi.
                                                    </span>
                                                </div>

                                                {detailInputs.length > 2 && (
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
                                                            processing ||
                                                            isReadOnly
                                                        }
                                                        leftIcon={
                                                            <Trash2 className="w-4 h-4" />
                                                        }
                                                    />
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                                <div className="md:col-span-5">
                                                    <SelectInput
                                                        label="Akun"
                                                        placeholder="Pilih akun..."
                                                        value={
                                                            detail.accountId
                                                                ? detail.accountId.toString()
                                                                : ""
                                                        }
                                                        onChange={(event) =>
                                                            handleDetailChange(
                                                                detail.id,
                                                                "accountId",
                                                                event.target
                                                                    .value
                                                                    ? Number(
                                                                          event
                                                                              .target
                                                                              .value,
                                                                      )
                                                                    : 0,
                                                            )
                                                        }
                                                        options={accountOptions}
                                                        searchable
                                                        disabled={
                                                            processing ||
                                                            isReadOnly
                                                        }
                                                    />
                                                </div>

                                                <div className="md:col-span-3">
                                                    <Input
                                                        label="Debit"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="0"
                                                        value={detail.debit}
                                                        onChange={(event) =>
                                                            handleDetailChange(
                                                                detail.id,
                                                                "debit",
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        disabled={
                                                            processing ||
                                                            isReadOnly
                                                        }
                                                    />
                                                </div>

                                                <div className="md:col-span-3">
                                                    <Input
                                                        label="Kredit"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="0"
                                                        value={detail.credit}
                                                        onChange={(event) =>
                                                            handleDetailChange(
                                                                detail.id,
                                                                "credit",
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        disabled={
                                                            processing ||
                                                            isReadOnly
                                                        }
                                                    />
                                                </div>

                                                <div className="md:col-span-12">
                                                    <Input
                                                        label="Catatan"
                                                        placeholder="Catatan baris jurnal (opsional)"
                                                        value={detail.memo}
                                                        onChange={(event) =>
                                                            handleDetailChange(
                                                                detail.id,
                                                                "memo",
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        disabled={
                                                            processing ||
                                                            isReadOnly
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {!totals.isBalanced && (
                                    <Alert
                                        variant="warning"
                                        title="Jurnal Masih Belum Seimbang"
                                        description={`Selisih saat ini ${formatCurrency(
                                            Math.abs(totals.difference),
                                        )}. Sesuaikan debit atau kredit sampai nilainya sama.`}
                                        icon={
                                            <AlertTriangle className="w-5 h-5" />
                                        }
                                    />
                                )}

                                <Alert
                                    variant="info"
                                    title="Catatan"
                                    description="Perubahan akan mengganti seluruh detail jurnal yang lama dengan susunan yang baru."
                                    icon={<Info className="w-5 h-5" />}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        journalEntryService.goToView(
                                            journalEntry.id,
                                        )
                                    }
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
                                        isReadOnly ||
                                        !totals.isBalanced
                                    }
                                    leftIcon={<Save className="w-4 h-4" />}
                                >
                                    {processing
                                        ? "Menyimpan..."
                                        : "Simpan Perubahan"}
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </div>
            </div>
        </>
    );
};

JournalEntryEdit.layout = withAuthenticatedLayout({
    title: "Edit Jurnal",
    searchable: false,
    breadcrumbs: [
        { label: "Jurnal Umum", href: route("journal-entries.index") },
        { label: "Edit" },
    ],
});

export default JournalEntryEdit;
