import React from "react";
import { Head, useForm } from "@inertiajs/react";
import {
    Save,
    ArrowLeft,
    Wallet,
    Building2,
    DollarSign,
    TrendingDown,
    Calendar,
    FileText,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/Page/PageHeader";
import { Form } from "@/Components/Form";
import {
    TextAreaInput,
    SelectInput,
    NumberInput,
    DateInput,
} from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import priveService from "@/Services/prive.service";
import { PriveCreateProps } from "./types";
import { PriveFormData } from "@/types";

const PriveCreate = ({
    outlets,
    sourceAccounts,
    equityAccounts,
    flash,
}: PriveCreateProps) => {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        clearErrors,
        wasSuccessful,
    } = useForm<PriveFormData>({
        outletId: "",
        sourceAccountId: "",
        equityAccountId: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(route("prives.store"), {
            preserveScroll: true,
            forceFormData: true,
            onError: (formErrors) => {
                console.error("Create prive error:", formErrors);
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
        });
    };

    const handleDataChange = (key: keyof PriveFormData, value: any) => {
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

    const handleSourceAccountChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value;
        const accountId = value ? parseInt(value, 10) : "";
        handleDataChange("sourceAccountId", accountId);
    };

    const handleEquityAccountChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value;
        const accountId = value ? parseInt(value, 10) : "";
        handleDataChange("equityAccountId", accountId);
    };

    const outletOptions = [
        { value: "", label: "Pilih Outlet" },
        ...outlets.map((outlet) => ({
            value: outlet.id.toString(),
            label: outlet.name,
            description: outlet.code || undefined,
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

    const equityAccountOptions = [
        { value: "", label: "Pilih Akun Modal/Prive" },
        ...equityAccounts.map((account) => ({
            value: account.id.toString(),
            label: account.name,
            description: account.code || undefined,
        })),
    ];

    const selectedOutlet = outlets.find(
        (outlet) => outlet.id === data.outletId,
    );

    const selectedSourceAccount = sourceAccounts.find(
        (account) => account.id === data.sourceAccountId,
    );

    const selectedEquityAccount = equityAccounts.find(
        (account) => account.id === data.equityAccountId,
    );

    const formatAmount = (value: number | string) => {
        if (!value) return "";
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(numValue);
    };

    return (
        <>
            <Head title="Catat Prive" />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Catat Prive Baru"
                        subtitle="Catat penarikan modal owner dari outlet"
                        icon={Wallet}
                        actions={
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => priveService.goToIndex()}
                                disabled={processing}
                                leftIcon={<ArrowLeft className="w-4 h-4" />}
                            >
                                Kembali
                            </Button>
                        }
                    />

                    {(wasSuccessful || flash?.success) && (
                        <Alert
                            variant="success"
                            title="Berhasil"
                            description={
                                flash?.success ||
                                "Prive telah berhasil dicatat."
                            }
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
                            description="Silakan periksa kembali semua field yang bertanda merah."
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
                                            Lokasi Outlet
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Pilih outlet untuk penarikan prive
                                            ini
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
                                            : "Pilih outlet tempat penarikan modal dilakukan"
                                    }
                                    searchable={true}
                                    clearable={true}
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
                                                "var(--color-warning-100)",
                                        }}
                                    >
                                        <Wallet
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
                                            Informasi Akuntansi
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Klasifikasi akun modal dan sumber
                                            dana
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SelectInput
                                        label="Akun Modal/Prive"
                                        placeholder="Pilih akun modal..."
                                        value={
                                            data.equityAccountId?.toString() ||
                                            ""
                                        }
                                        onChange={handleEquityAccountChange}
                                        error={errors.equityAccountId}
                                        required
                                        disabled={
                                            processing ||
                                            equityAccounts.length === 0
                                        }
                                        options={equityAccountOptions}
                                        leftIcon={
                                            <TrendingDown className="w-5 h-5" />
                                        }
                                        hint={
                                            equityAccounts.length === 0
                                                ? "Belum ada akun modal tersedia"
                                                : "Akun modal yang akan didebit (dikurangi)"
                                        }
                                        searchable={true}
                                        clearable={true}
                                        multiple={false}
                                        noOptionsText="Tidak ada akun modal tersedia"
                                    />

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
                                            sourceAccounts.length === 0
                                        }
                                        options={sourceAccountOptions}
                                        leftIcon={
                                            <Wallet className="w-5 h-5" />
                                        }
                                        hint={
                                            sourceAccounts.length === 0
                                                ? "Belum ada akun sumber dana tersedia"
                                                : "Sumber penarikan dana (misal: Kas, Bank)"
                                        }
                                        searchable={true}
                                        clearable={true}
                                        multiple={false}
                                        noOptionsText="Tidak ada akun sumber dana tersedia"
                                    />
                                </div>

                                {(selectedEquityAccount ||
                                    selectedSourceAccount) && (
                                    <div
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border"
                                        style={{
                                            backgroundColor:
                                                "var(--color-surface-secondary)",
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        {selectedEquityAccount && (
                                            <div className="space-y-1">
                                                <p
                                                    className="text-xs font-medium"
                                                    style={{
                                                        color: "var(--color-text-tertiary)",
                                                    }}
                                                >
                                                    Akun Modal Dipilih
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <TrendingDown
                                                        className="w-4 h-4"
                                                        style={{
                                                            color: "var(--color-primary-500)",
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
                                                                selectedEquityAccount.name
                                                            }
                                                        </p>
                                                        {selectedEquityAccount.code && (
                                                            <p
                                                                className="text-xs"
                                                                style={{
                                                                    color: "var(--color-text-tertiary)",
                                                                }}
                                                            >
                                                                {
                                                                    selectedEquityAccount.code
                                                                }
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
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedEquityAccount &&
                                    selectedSourceAccount &&
                                    data.amount &&
                                    parseFloat(data.amount.toString()) > 0 && (
                                        <div
                                            className="p-4 rounded-lg border"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-info-50)",
                                                borderColor:
                                                    "var(--color-info-200)",
                                            }}
                                        >
                                            <p
                                                className="text-xs font-medium mb-3"
                                                style={{
                                                    color: "var(--color-info-700)",
                                                }}
                                            >
                                                Preview Jurnal Otomatis:
                                            </p>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-semibold text-info-700">
                                                            [D]
                                                        </span>
                                                        <span className="text-info-600">
                                                            {
                                                                selectedEquityAccount.name
                                                            }
                                                        </span>
                                                    </div>
                                                    <span className="font-semibold text-info-700">
                                                        {formatAmount(
                                                            data.amount,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-semibold text-info-700">
                                                            [K]
                                                        </span>
                                                        <span className="text-info-600">
                                                            {
                                                                selectedSourceAccount.name
                                                            }
                                                        </span>
                                                    </div>
                                                    <span className="font-semibold text-info-700">
                                                        {formatAmount(
                                                            data.amount,
                                                        )}
                                                    </span>
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
                                            Detail Transaksi
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Jumlah, tanggal, dan keterangan
                                            penarikan
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <NumberInput
                                        label="Jumlah Penarikan"
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
                                        hint="Masukkan nominal penarikan modal"
                                        prefix="Rp"
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        min={1}
                                        max={999999999.99}
                                        allowDecimal={true}
                                        placeholder="0"
                                    />

                                    <DateInput
                                        label="Tanggal Penarikan"
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
                                        hint="Tanggal terjadinya penarikan modal"
                                    />
                                </div>

                                {data.amount &&
                                    parseFloat(data.amount.toString()) > 0 && (
                                        <div
                                            className="p-4 rounded-lg border"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-primary-50)",
                                                borderColor:
                                                    "var(--color-primary-200)",
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p
                                                        className="text-xs font-medium"
                                                        style={{
                                                            color: "var(--color-primary-700)",
                                                        }}
                                                    >
                                                        Total Penarikan Prive
                                                    </p>
                                                    <p
                                                        className="text-2xl font-bold mt-1"
                                                        style={{
                                                            color: "var(--color-primary-600)",
                                                        }}
                                                    >
                                                        {formatAmount(
                                                            data.amount,
                                                        )}
                                                    </p>
                                                </div>
                                                <Wallet
                                                    className="w-12 h-12 opacity-20"
                                                    style={{
                                                        color: "var(--color-primary-600)",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                <TextAreaInput
                                    label="Deskripsi / Keterangan"
                                    placeholder="Masukkan keterangan penarikan (opsional)..."
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
                                    hint="Keterangan tambahan mengenai penarikan modal ini"
                                    rows={4}
                                    maxLength={1000}
                                    showCharacterCount={true}
                                />
                            </div>

                            <div
                                className="p-4 rounded-lg border"
                                style={{
                                    backgroundColor: "var(--color-warning-50)",
                                    borderColor: "var(--color-warning-200)",
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                        style={{
                                            backgroundColor:
                                                "var(--color-warning-100)",
                                        }}
                                    >
                                        <span
                                            className="text-xs font-bold"
                                            style={{
                                                color: "var(--color-warning-600)",
                                            }}
                                        >
                                            i
                                        </span>
                                    </div>
                                    <div>
                                        <h4
                                            className="text-sm font-medium mb-1"
                                            style={{
                                                color: "var(--color-warning-700)",
                                            }}
                                        >
                                            Informasi Pencatatan Prive
                                        </h4>
                                        <ul
                                            className="text-xs space-y-1"
                                            style={{
                                                color: "var(--color-warning-600)",
                                            }}
                                        >
                                            <li>
                                                • Prive adalah penarikan modal
                                                owner dari usaha
                                            </li>
                                            <li>
                                                • Jurnal otomatis: Debit Akun
                                                Modal, Kredit Sumber Dana
                                            </li>
                                            <li>
                                                • Saldo akan dicek otomatis
                                                sebelum penyimpanan
                                            </li>
                                            <li>
                                                • Jika saldo tidak mencukupi,
                                                transaksi akan ditolak
                                            </li>
                                            <li>
                                                • Pastikan akun modal dan sumber
                                                dana sudah benar
                                            </li>
                                            <li>
                                                • Tanggal penarikan tidak boleh
                                                melebihi hari ini
                                            </li>
                                            <li>
                                                • Prive akan mengurangi ekuitas
                                                dan aset perusahaan
                                            </li>
                                        </ul>
                                    </div>
                                </div>
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
                                    onClick={() => priveService.goToIndex()}
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
                                        !data.sourceAccountId ||
                                        !data.equityAccountId ||
                                        !data.amount ||
                                        parseFloat(data.amount.toString()) <=
                                            0 ||
                                        !data.date
                                    }
                                    loading={processing}
                                    size="lg"
                                    leftIcon={<Save className="w-4 h-4" />}
                                >
                                    {processing
                                        ? "Menyimpan..."
                                        : "Catat Prive"}
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </div>
            </div>
        </>
    );
};

PriveCreate.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Catat Prive",
        breadcrumbs: [
            { label: "Prive", href: route("prives.index") },
            { label: "Catat Prive" },
        ],
    })(page);

export default PriveCreate;
