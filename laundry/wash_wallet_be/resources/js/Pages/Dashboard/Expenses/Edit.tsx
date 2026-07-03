import React, { useState, useEffect, useCallback } from "react";
import { Head, useForm } from "@inertiajs/react";
import {
    Save,
    ArrowLeft,
    Receipt,
    Building2,
    DollarSign,
    Wallet,
    Calendar,
    FileText,
    Paperclip,
    AlertCircle,
    X,
    Eye,
    Download,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import {
    TextAreaInput,
    SelectInput,
    NumberInput,
    FileInput,
    DateInput,
} from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import expenseService from "@/Services/expense.service";
import accountService from "@/Services/account.service";
import { Account, ExpenseEditFormData } from "@/types";
import { ExpenseEditProps } from "./types";
import { useLatestAsync } from "@/Hooks/useLatestAsync";

const ExpenseEdit = ({
    expense,
    outlets,
    expenseAccounts: initialExpenseAccounts,
    sourceAccounts: initialSourceAccounts,
    flash,
}: ExpenseEditProps) => {
    const { data, setData, post, processing, errors, clearErrors } =
        useForm<ExpenseEditFormData>({
            outletId: expense.outletId,
            expenseAccountId: expense.expenseAccountId,
            sourceAccountId: expense.sourceAccountId,
            amount: expense.amount,
            date: expense.date,
            description: expense.description || "",
            attachment: null,
            removeAttachment: false,
            _method: "PUT",
        });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [existingAttachment, setExistingAttachment] = useState<string | null>(
        expense.attachment || null,
    );
    const [removeExistingAttachment, setRemoveExistingAttachment] =
        useState<boolean>(false);

    const [expenseAccounts, setExpenseAccounts] = useState<Account[]>(
        initialExpenseAccounts,
    );
    const [sourceAccounts, setSourceAccounts] = useState<Account[]>(
        initialSourceAccounts,
    );
    const [loadingExpenseAccounts, setLoadingExpenseAccounts] = useState(false);
    const [loadingSourceAccounts, setLoadingSourceAccounts] = useState(false);
    const [expenseAccountsError, setExpenseAccountsError] = useState<
        string | null
    >(null);
    const [sourceAccountsError, setSourceAccountsError] = useState<
        string | null
    >(null);

    const { runLatest: runLatestExpenseAccounts } = useLatestAsync();
    const { runLatest: runLatestSourceAccounts } = useLatestAsync();

    const loadAccountsByOutlet = useCallback(async (outletId: number) => {
        if (!outletId) {
            setExpenseAccounts([]);
            setSourceAccounts([]);
            return;
        }

        setLoadingExpenseAccounts(true);
        setExpenseAccountsError(null);

        runLatestExpenseAccounts(
            outletId,
            async () => await accountService.getExpenseAccountsByOutlet(outletId),
            {
                onSuccess: (fetchedExpenseAccounts) => {
                    setExpenseAccounts(fetchedExpenseAccounts);
                },
                onError: (error: any) => {
                    console.error("Error loading expense accounts:", error);
                    setExpenseAccountsError(error.message || "Gagal memuat akun beban");
                    setExpenseAccounts([]);
                },
                onFinally: () => {
                    setLoadingExpenseAccounts(false);
                }
            }
        );

        setLoadingSourceAccounts(true);
        setSourceAccountsError(null);

        runLatestSourceAccounts(
            outletId,
            async () => await accountService.getFundingAccountsByOutlet(outletId),
            {
                onSuccess: (fetchedSourceAccounts) => {
                    setSourceAccounts(fetchedSourceAccounts);
                },
                onError: (error: any) => {
                    console.error("Error loading source accounts:", error);
                    setSourceAccountsError(
                        error.message || "Gagal memuat akun sumber dana",
                    );
                    setSourceAccounts([]);
                },
                onFinally: () => {
                    setLoadingSourceAccounts(false);
                }
            }
        );
    }, [runLatestExpenseAccounts, runLatestSourceAccounts]);

    useEffect(() => {
        if (data.outletId && data.outletId !== expense.outletId) {
            loadAccountsByOutlet(data.outletId);
            setData((prev) => ({
                ...prev,
                expenseAccountId: "",
                sourceAccountId: "",
            }));
        }
    }, [data.outletId, expense.outletId, loadAccountsByOutlet, setData]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(route("expenses.update", expense.id), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setSelectedFile(null);
                setPreviewUrl(null);
            },
            onError: () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                console.error("Validation errors:", errors);
            },
        });
    };

    const handleDataChange = (key: keyof ExpenseEditFormData, value: any) => {
        setData(key, value);

        if (errors[key]) {
            clearErrors(key);
        }
    };

    const handleOutletChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value;
        const outletId = value ? parseInt(value, 10) : undefined;
        handleDataChange("outletId", outletId);
    };

    const handleExpenseAccountChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value;
        const accountId = value ? parseInt(value, 10) : "";
        handleDataChange("expenseAccountId", accountId);
    };

    const handleSourceAccountChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value;
        const accountId = value ? parseInt(value, 10) : "";
        handleDataChange("sourceAccountId", accountId);
    };

    const handleAttachmentSelect = (files: File[]) => {
        if (files && files.length > 0) {
            const file = files[0];
            setSelectedFile(file);
            setData("attachment", file);

            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setPreviewUrl(null);
            }

            if (existingAttachment) {
                setRemoveExistingAttachment(true);
                setData("removeAttachment", true);
            }
        } else {
            setSelectedFile(null);
            setPreviewUrl(null);
            setData("attachment", null);
        }
    };

    const handleRemoveExistingAttachment = () => {
        setExistingAttachment(null);
        setRemoveExistingAttachment(true);
        setData("removeAttachment", true);
    };

    const handleViewAttachment = () => {
        if (existingAttachment) {
            window.open(`/storage/${existingAttachment}`, "_blank");
        }
    };

    const handleDownloadAttachment = () => {
        if (existingAttachment) {
            const link = document.createElement("a");
            link.href = `/storage/${existingAttachment}`;
            link.download = existingAttachment.split("/").pop() || "attachment";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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

    const expenseAccountOptions = [
        { value: "", label: "Pilih Akun Beban" },
        ...expenseAccounts.map((account) => ({
            value: account.id.toString(),
            label: account.name,
            description: account.code || undefined,
        })),
    ];

    const sourceAccountOptions = [
        { value: "", label: "Pilih Sumber Dana" },
        ...sourceAccounts.map((account) => ({
            value: account.id.toString(),
            label: account.name,
            description: account.code || undefined,
        })),
    ];

    const selectedOutlet = outlets.find(
        (outlet) => outlet.id === data.outletId,
    );

    const selectedExpenseAccount = expenseAccounts.find(
        (account) => account.id === data.expenseAccountId,
    );

    const selectedSourceAccount = sourceAccounts.find(
        (account) => account.id === data.sourceAccountId,
    );

    const isLoadingAccounts = loadingExpenseAccounts || loadingSourceAccounts;

    return (
        <>
            <Head title={`Edit Pengeluaran #${expense.id}`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Edit Pengeluaran"
                        subtitle="Perbarui informasi pengeluaran dan beban operasional"
                        icon={<Receipt className="w-6 h-6" />}
                        actions={
                            <Button
                                variant="outline"
                                size="md"
                                onClick={expenseService.goToIndex}
                                disabled={processing}
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
                            title="Kesalahan"
                            description={flash.error}
                        />
                    )}

                    {Object.keys(errors).length > 0 && (
                        <Alert
                            variant="error"
                            title="Terdapat kesalahan pada form"
                            description="Silakan periksa kembali field yang bertanda merah."
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
                                            Lokasi Pengeluaran
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Pilih outlet untuk pengeluaran ini
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
                                    hint="Pilih outlet tempat terjadinya pengeluaran"
                                    searchable={true}
                                    clearable={false}
                                    multiple={false}
                                    noOptionsText="Tidak ada outlet tersedia"
                                />

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
                                            <Building2 className="w-5 h-5 text-primary-600" />
                                            <div>
                                                <p className="font-medium text-primary-800">
                                                    {selectedOutlet.name}
                                                </p>
                                                <p className="text-sm text-primary-600">
                                                    {selectedOutlet.code} •{" "}
                                                    {selectedOutlet.cityName ||
                                                        "Lokasi tidak diketahui"}
                                                </p>
                                            </div>
                                        </div>
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
                                                "var(--color-error-100)",
                                        }}
                                    >
                                        <DollarSign
                                            className="w-6 h-6"
                                            style={{
                                                color: "var(--color-error-600)",
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
                                            Informasi Akuntansi
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Klasifikasi akun beban dan sumber
                                            dana
                                        </p>
                                    </div>
                                </div>

                                {!data.outletId && (
                                    <div
                                        className="p-4 rounded-lg border-2 border-dashed text-center"
                                        style={{
                                            borderColor: "var(--color-border)",
                                            backgroundColor:
                                                "var(--color-surface-secondary)",
                                        }}
                                    >
                                        <AlertCircle
                                            className="w-8 h-8 mx-auto mb-2"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        />
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Pilih outlet terlebih dahulu untuk
                                            memuat akun beban dan sumber dana
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SelectInput
                                        label="Akun Beban"
                                        placeholder={
                                            !data.outletId
                                                ? "Pilih outlet terlebih dahulu"
                                                : loadingExpenseAccounts
                                                  ? "Memuat akun beban..."
                                                  : expenseAccounts.length === 0
                                                    ? "Tidak ada akun beban tersedia"
                                                    : "Pilih akun beban..."
                                        }
                                        value={
                                            data.expenseAccountId?.toString() ||
                                            ""
                                        }
                                        onChange={handleExpenseAccountChange}
                                        error={
                                            errors.expenseAccountId ||
                                            expenseAccountsError ||
                                            undefined
                                        }
                                        required
                                        disabled={
                                            processing ||
                                            !data.outletId ||
                                            loadingExpenseAccounts ||
                                            expenseAccounts.length === 0
                                        }
                                        options={expenseAccountOptions}
                                        leftIcon={
                                            <DollarSign className="w-5 h-5" />
                                        }
                                        hint={
                                            !data.outletId
                                                ? "Pilih outlet terlebih dahulu"
                                                : loadingExpenseAccounts
                                                  ? "Sedang memuat akun beban..."
                                                  : expenseAccounts.length === 0
                                                    ? "Belum ada akun beban tersedia"
                                                    : "Kategori jenis pengeluaran"
                                        }
                                        searchable={true}
                                        clearable={false}
                                        multiple={false}
                                        loading={loadingExpenseAccounts}
                                        noOptionsText="Tidak ada akun beban tersedia"
                                    />

                                    <SelectInput
                                        label="Sumber Dana"
                                        placeholder={
                                            !data.outletId
                                                ? "Pilih outlet terlebih dahulu"
                                                : loadingSourceAccounts
                                                  ? "Memuat sumber dana..."
                                                  : sourceAccounts.length === 0
                                                    ? "Tidak ada sumber dana tersedia"
                                                    : "Pilih sumber dana..."
                                        }
                                        value={
                                            data.sourceAccountId?.toString() ||
                                            ""
                                        }
                                        onChange={handleSourceAccountChange}
                                        error={
                                            errors.sourceAccountId ||
                                            sourceAccountsError ||
                                            undefined
                                        }
                                        required
                                        disabled={
                                            processing ||
                                            !data.outletId ||
                                            loadingSourceAccounts ||
                                            sourceAccounts.length === 0
                                        }
                                        options={sourceAccountOptions}
                                        leftIcon={
                                            <Wallet className="w-5 h-5" />
                                        }
                                        hint={
                                            !data.outletId
                                                ? "Pilih outlet terlebih dahulu"
                                                : loadingSourceAccounts
                                                  ? "Sedang memuat sumber dana..."
                                                  : sourceAccounts.length === 0
                                                    ? "Belum ada sumber dana tersedia"
                                                    : "Kas/Bank/E-Wallet"
                                        }
                                        searchable={true}
                                        clearable={false}
                                        multiple={false}
                                        loading={loadingSourceAccounts}
                                        noOptionsText="Tidak ada sumber dana tersedia"
                                    />
                                </div>

                                {(selectedExpenseAccount ||
                                    selectedSourceAccount) && (
                                    <div
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border"
                                        style={{
                                            backgroundColor:
                                                "var(--color-surface-secondary)",
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        {selectedExpenseAccount && (
                                            <div className="space-y-1">
                                                <p
                                                    className="text-xs font-medium"
                                                    style={{
                                                        color: "var(--color-text-tertiary)",
                                                    }}
                                                >
                                                    Akun Beban Dipilih
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <DollarSign
                                                        className="w-4 h-4"
                                                        style={{
                                                            color: "var(--color-error-500)",
                                                        }}
                                                    />
                                                    <div>
                                                        <p
                                                            className="text-sm font-medium"
                                                            style={{
                                                                color: "var(--color-text-primary)",
                                                            }}
                                                        >
                                                            {
                                                                selectedExpenseAccount.name
                                                            }
                                                        </p>
                                                        {selectedExpenseAccount.code && (
                                                            <p
                                                                className="text-xs"
                                                                style={{
                                                                    color: "var(--color-text-tertiary)",
                                                                }}
                                                            >
                                                                {
                                                                    selectedExpenseAccount.code
                                                                }{" "}
                                                                •{" "}
                                                                {selectedExpenseAccount.outletId
                                                                    ? "Outlet"
                                                                    : "Umum"}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedSourceAccount && (
                                            <div className="space-y-1">
                                                <p
                                                    className="text-xs font-medium"
                                                    style={{
                                                        color: "var(--color-text-tertiary)",
                                                    }}
                                                >
                                                    Sumber Dana Dipilih
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <Wallet
                                                        className="w-4 h-4"
                                                        style={{
                                                            color: "var(--color-success-500)",
                                                        }}
                                                    />
                                                    <div>
                                                        <p
                                                            className="text-sm font-medium"
                                                            style={{
                                                                color: "var(--color-text-primary)",
                                                            }}
                                                        >
                                                            {
                                                                selectedSourceAccount.name
                                                            }
                                                        </p>
                                                        {selectedSourceAccount.code && (
                                                            <p
                                                                className="text-xs"
                                                                style={{
                                                                    color: "var(--color-text-tertiary)",
                                                                }}
                                                            >
                                                                {
                                                                    selectedSourceAccount.code
                                                                }{" "}
                                                                •{" "}
                                                                {selectedSourceAccount.outletId
                                                                    ? "Outlet"
                                                                    : "Umum"}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
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
                                                "var(--color-warning-100)",
                                        }}
                                    >
                                        <Receipt
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
                                            Detail Transaksi
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Jumlah, tanggal, dan keterangan
                                            pengeluaran
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <NumberInput
                                        label="Jumlah Pengeluaran"
                                        value={
                                            data.amount
                                                ? parseFloat(
                                                      data.amount.toString(),
                                                  )
                                                : undefined
                                        }
                                        onValueChange={(value) =>
                                            handleDataChange(
                                                "amount",
                                                value || "",
                                            )
                                        }
                                        error={errors.amount}
                                        required
                                        disabled={processing}
                                        leftIcon={
                                            <DollarSign className="w-5 h-5" />
                                        }
                                        hint="Masukkan nominal pengeluaran"
                                        prefix="Rp"
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        min={1}
                                        max={999999999.99}
                                        allowDecimal={true}
                                        placeholder="0"
                                    />

                                    <DateInput
                                        label="Tanggal Pengeluaran"
                                        value={data.date}
                                        onChange={(e) =>
                                            handleDataChange(
                                                "date",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.date}
                                        required
                                        disabled={processing}
                                        max={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        leftIcon={
                                            <Calendar className="w-5 h-5" />
                                        }
                                        hint="Tanggal terjadinya pengeluaran"
                                    />
                                </div>

                                <TextAreaInput
                                    label="Deskripsi / Keterangan"
                                    placeholder="Masukkan keterangan pengeluaran (opsional)..."
                                    value={data.description}
                                    onChange={(e) =>
                                        handleDataChange(
                                            "description",
                                            e.target.value,
                                        )
                                    }
                                    error={errors.description}
                                    disabled={processing}
                                    leftIcon={<FileText className="w-5 h-5" />}
                                    hint="Keterangan tambahan mengenai pengeluaran ini"
                                    rows={4}
                                    maxLength={500}
                                    showCharacterCount={true}
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
                                        <Paperclip
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
                                            Lampiran
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Upload atau ganti bukti pengeluaran
                                        </p>
                                    </div>
                                </div>

                                {existingAttachment &&
                                    !removeExistingAttachment && (
                                        <div
                                            className="p-4 rounded-lg border"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-info-50)",
                                                borderColor:
                                                    "var(--color-info-200)",
                                            }}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <Paperclip
                                                        className="w-5 h-5 flex-shrink-0"
                                                        style={{
                                                            color: "var(--color-info-600)",
                                                        }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p
                                                            className="text-sm font-medium truncate"
                                                            style={{
                                                                color: "var(--color-info-700)",
                                                            }}
                                                        >
                                                            Lampiran Saat Ini
                                                        </p>
                                                        <p
                                                            className="text-xs truncate"
                                                            style={{
                                                                color: "var(--color-info-600)",
                                                            }}
                                                        >
                                                            {existingAttachment
                                                                .split("/")
                                                                .pop()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={
                                                            handleViewAttachment
                                                        }
                                                        leftIcon={
                                                            <Eye className="w-4 h-4" />
                                                        }
                                                    >
                                                        Lihat
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={
                                                            handleDownloadAttachment
                                                        }
                                                        leftIcon={
                                                            <Download className="w-4 h-4" />
                                                        }
                                                    >
                                                        Unduh
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="warning"
                                                        size="sm"
                                                        onClick={
                                                            handleRemoveExistingAttachment
                                                        }
                                                        leftIcon={
                                                            <X className="w-4 h-4" />
                                                        }
                                                    >
                                                        Hapus
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                {(!existingAttachment ||
                                    removeExistingAttachment) && (
                                    <>
                                        <FileInput
                                            label="File Lampiran Baru"
                                            placeholder="Upload foto nota, kuitansi, atau bukti pengeluaran"
                                            accept="image/*"
                                            maxFileSize={2 * 1024 * 1024}
                                            allowedFileTypes={[
                                                "image/jpeg",
                                                "image/jpg",
                                                "image/png",
                                                "image/webp",
                                                "image/gif",
                                            ]}
                                            onFileSelect={
                                                handleAttachmentSelect
                                            }
                                            files={
                                                selectedFile
                                                    ? [selectedFile]
                                                    : []
                                            }
                                            error={errors.attachment}
                                            disabled={processing}
                                            hint="Format: JPG, PNG, WEBP, GIF (max. 2MB)"
                                            preview={true}
                                            dragAndDrop={true}
                                            size="md"
                                            browseText="Pilih File"
                                            dropzoneText="Drop file di sini atau klik untuk upload"
                                            maxFiles={1}
                                            multiple={false}
                                        />

                                        {selectedFile && (
                                            <div
                                                className="p-4 rounded-lg border"
                                                style={{
                                                    backgroundColor:
                                                        "var(--color-success-50)",
                                                    borderColor:
                                                        "var(--color-success-200)",
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Paperclip
                                                        className="w-5 h-5"
                                                        style={{
                                                            color: "var(--color-success-600)",
                                                        }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p
                                                            className="text-sm font-medium truncate"
                                                            style={{
                                                                color: "var(--color-success-700)",
                                                            }}
                                                        >
                                                            {selectedFile.name}
                                                        </p>
                                                        <p
                                                            className="text-xs"
                                                            style={{
                                                                color: "var(--color-success-600)",
                                                            }}
                                                        >
                                                            {(
                                                                selectedFile.size /
                                                                1024
                                                            ).toFixed(2)}{" "}
                                                            KB
                                                        </p>
                                                    </div>
                                                    <Badge variant="success">
                                                        Siap diupload
                                                    </Badge>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div
                                className="flex items-center justify-between pt-6 border-t"
                                style={{
                                    borderColor: "var(--color-border)",
                                }}
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => expenseService.goToIndex()}
                                    disabled={processing}
                                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                                >
                                    Kembali
                                </Button>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={
                                        processing ||
                                        !data.outletId ||
                                        !data.expenseAccountId ||
                                        !data.sourceAccountId ||
                                        !data.amount ||
                                        parseFloat(data.amount.toString()) <=
                                            0 ||
                                        !data.date ||
                                        isLoadingAccounts
                                    }
                                    loading={processing}
                                    size="lg"
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

ExpenseEdit.layout = (page: any) =>
    withAuthenticatedLayout({
        title: `Edit Pengeluaran #${page.props.expense.id}`,
        breadcrumbs: [
            { label: "Pengeluaran", href: route("expenses.index") },
            { label: "Edit" },
        ],
    })(page);

export default ExpenseEdit;
