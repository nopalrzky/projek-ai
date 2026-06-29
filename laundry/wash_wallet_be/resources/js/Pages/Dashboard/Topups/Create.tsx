import React, { useState, useCallback, useMemo } from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wallet,
    Building2,
    ArrowLeft,
    Save,
    Check,
    CreditCard,
    ChevronUp,
    ChevronDown,
    Smartphone,
    QrCode,
    Store,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { SelectInput, Input } from "@/Components/Input";
import PageHeader from "@/Components/Page/PageHeader";
import { topupService } from "@/Services/topup.service";
import { TopupCreateProps } from "./types";
import { TopupFormData } from "@/types/topup";
import { formatCurrency } from "@/lib/utils";

const QUICK_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];

const BANK_CHANNELS = [
    {
        id: "bca",
        method: "bank_transfer",
        name: "BCA",
        color: "var(--color-primary-600)",
    },
    {
        id: "bni",
        method: "bank_transfer",
        name: "BNI",
        color: "var(--color-warning-500)",
    },
    {
        id: "bri",
        method: "bank_transfer",
        name: "BRI",
        color: "var(--color-info-600)",
    },
    {
        id: "cimb",
        method: "bank_transfer",
        name: "CIMB Niaga",
        color: "var(--color-error-600)",
    },
    {
        id: "mandiri",
        method: "echannel",
        name: "Mandiri",
        color: "var(--color-warning-600)",
    },
    {
        id: "permata",
        method: "permata",
        name: "Permata",
        color: "var(--color-success-600)",
    },
];

const TopupCreate = ({ outlets, flash }: TopupCreateProps) => {
    const [topupMode, setTopupMode] = useState<"master" | "outlet">("master");

    const { data, setData, post, processing, errors, clearErrors, reset } =
        useForm<TopupFormData>({
            outletId: null,
            amountMoney: 10000,
            paymentMethod: "bank_transfer",
            bankCode: "bca",
            cstoreType: undefined,
            cardlessCreditType: undefined,
        });

    const [formError, setFormError] = useState<string | null>(null);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    const selectedOutlet = useMemo(() => {
        if (!data.outletId || topupMode === "master") return null;
        return outlets.find((o) => o.id === Number(data.outletId)) || null;
    }, [data.outletId, outlets, topupMode]);

    const handleFormChange = useCallback(
        (key: keyof TopupFormData, value: any) => {
            setData(key, value);
            setFormError(null);

            if (errors[key]) {
                clearErrors(key);
            }
        },
        [setData, clearErrors, errors],
    );

    const handleModeChange = useCallback(
        (mode: "master" | "outlet") => {
            setTopupMode(mode);
            setData((prev) => ({
                ...prev,
                outletId: mode === "master" ? null : prev.outletId,
            }));
            setFormError(null);

            if (mode === "master" && errors.outletId) {
                clearErrors("outletId");
            }
        },
        [setData, clearErrors, errors.outletId],
    );

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            if (!data.amountMoney || data.amountMoney <= 0) {
                setFormError("Pilih paket coin terlebih dahulu");
                return;
            }

            if (topupMode === "outlet" && !data.outletId) {
                setFormError("Outlet harus dipilih untuk topup outlet");
                return;
            }

            if (!data.paymentMethod) {
                setFormError("Pilih metode pembayaran");
                return;
            }

            setFormError(null);

            post(route("topups.store"), {
                preserveScroll: true,
                onSuccess: () => {
                    // Redirect is handled by backend
                },
                onError: (errors) => {
                    console.error("Validation errors:", errors);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                },
            });
        },
        [data, topupMode, post, reset],
    );

    const pageHeaderActions = (
        <Button
            variant="outline"
            onClick={() => topupService.goToIndex()}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
            Kembali
        </Button>
    );

    return (
        <>
            <Head title="Tambah Topup" />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    {/* Page Header */}
                    <PageHeader
                        icon={Wallet}
                        title="Tambah Topup"
                        subtitle="Isi saldo master atau saldo outlet"
                        actions={pageHeaderActions}
                    >
                        {flash?.error && (
                            <Alert
                                variant="error"
                                title="Error"
                                description={flash.error}
                                className="mt-4"
                            />
                        )}

                        {formError && (
                            <Alert
                                variant="error"
                                title="Error"
                                description={formError}
                                className="mt-4"
                                onClose={() => setFormError(null)}
                            />
                        )}
                    </PageHeader>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                    >
                        {/* Left Column: Configuration */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Step 1: Mode & Outlet */}
                            <Card className="p-6">
                                <SectionTitle
                                    number={1}
                                    title="Tujuan Topup"
                                    subtitle="Pilih ke mana saldo akan dikreditkan"
                                    color="var(--color-primary-600)"
                                    bgColor="var(--color-primary-100)"
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                    <ModeButton
                                        active={topupMode === "master"}
                                        onClick={() =>
                                            handleModeChange("master")
                                        }
                                        icon={Wallet}
                                        title="Topup Master"
                                        description="Isi saldo pribadi"
                                        color="success"
                                        disabled={processing}
                                    />
                                    <ModeButton
                                        active={topupMode === "outlet"}
                                        onClick={() =>
                                            handleModeChange("outlet")
                                        }
                                        icon={Building2}
                                        title="Topup Outlet"
                                        description="Isi saldo outlet"
                                        color="info"
                                        disabled={processing}
                                    />
                                </div>

                                <AnimatePresence>
                                    {topupMode === "outlet" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: "auto",
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-6 pt-6 border-t"
                                            style={{
                                                borderColor:
                                                    "var(--color-border)",
                                            }}
                                        >
                                            <SelectInput
                                                label="Pilih Outlet"
                                                placeholder="Cari outlet..."
                                                value={
                                                    data.outletId?.toString() ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    handleFormChange(
                                                        "outletId",
                                                        e.target.value
                                                            ? parseInt(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : null,
                                                    )
                                                }
                                                options={[
                                                    {
                                                        value: "",
                                                        label: "Pilih Outlet",
                                                    },
                                                    ...outlets.map((o) => ({
                                                        value: o.id.toString(),
                                                        label: `${o.name} (${o.code})`,
                                                    })),
                                                ]}
                                                error={errors.outletId}
                                                required
                                                disabled={processing}
                                                leftIcon={
                                                    <Building2 className="w-5 h-5" />
                                                }
                                                hint={
                                                    selectedOutlet
                                                        ? `Saldo saat ini: ${formatCurrency(selectedOutlet.coinBalance || 0)}`
                                                        : "Pilih outlet yang akan di-topup"
                                                }
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>

                            {/* Step 2: Amount Input */}
                            <Card className="p-6">
                                <SectionTitle
                                    number={2}
                                    title="Masukkan Nominal Topup"
                                    subtitle="Pilih atau masukkan nominal uang"
                                    color="var(--color-success-600)"
                                    bgColor="var(--color-success-100)"
                                />

                                <div className="mt-6 space-y-4">
                                    <Input
                                        type="number"
                                        label="Nominal (Min. Rp 10.000)"
                                        placeholder="Min. 10000"
                                        value={data.amountMoney.toString()}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>,
                                        ) =>
                                            handleFormChange(
                                                "amountMoney",
                                                Math.max(
                                                    0,
                                                    parseInt(e.target.value) ||
                                                        0,
                                                ),
                                            )
                                        }
                                        error={errors.amountMoney}
                                        min={10000}
                                        max={10000000}
                                        step={1000}
                                        disabled={processing}
                                        hint={`1 Coin = Rp 1. Anda akan mendapatkan ${formatCurrency(data.amountMoney || 0)} Coin.`}
                                        leftIcon={
                                            <span className="text-gray-500 font-medium pl-3 text-sm">
                                                Rp
                                            </span>
                                        }
                                    />

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {QUICK_AMOUNTS.map((amount) => (
                                            <button
                                                key={amount}
                                                type="button"
                                                onClick={() =>
                                                    handleFormChange(
                                                        "amountMoney",
                                                        amount,
                                                    )
                                                }
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                                                    data.amountMoney === amount
                                                        ? "bg-primary-500 text-white border-primary-500"
                                                        : "bg-surface border-border text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800"
                                                }`}
                                            >
                                                {formatCurrency(amount)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </Card>

                            {/* Step 3: Payment Method */}
                            <Card className="p-6">
                                <SectionTitle
                                    number={3}
                                    title="Metode Pembayaran"
                                    subtitle="Pilih metode transfer Virtual Account"
                                    color="var(--color-warning-600)"
                                    bgColor="var(--color-warning-100)"
                                />

                                <div className="mt-6 space-y-4">
                                    <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenAccordion(
                                                    openAccordion === "bank"
                                                        ? null
                                                        : "bank",
                                                )
                                            }
                                            className="w-full flex items-center justify-between p-4 bg-surface hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-warning-50 text-warning-600">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <span className="font-semibold text-text-primary text-sm">
                                                    Virtual Account (Bank
                                                    Transfer)
                                                </span>
                                            </div>
                                            {openAccordion === "bank" ? (
                                                <ChevronUp className="w-5 h-5 text-text-tertiary" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-text-tertiary" />
                                            )}
                                        </button>

                                        <AnimatePresence>
                                            {openAccordion === "bank" && (
                                                <motion.div
                                                    initial={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        height: "auto",
                                                        opacity: 1,
                                                    }}
                                                    exit={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    className="p-4 bg-background border-t border-border grid grid-cols-2 lg:grid-cols-3 gap-3"
                                                >
                                                    {BANK_CHANNELS.map(
                                                        (bank) => (
                                                            <button
                                                                key={bank.id}
                                                                type="button"
                                                                disabled={
                                                                    processing
                                                                }
                                                                onClick={() => {
                                                                    setData(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            paymentMethod:
                                                                                bank.method as any,
                                                                            bankCode:
                                                                                bank.id,
                                                                        }),
                                                                    );
                                                                    if (
                                                                        errors.paymentMethod ||
                                                                        errors.bankCode
                                                                    ) {
                                                                        clearErrors(
                                                                            "paymentMethod",
                                                                        );
                                                                        clearErrors(
                                                                            "bankCode",
                                                                        );
                                                                    }
                                                                }}
                                                                className={`p-3 rounded-lg border transition-all flex flex-col items-center justify-center gap-3 group relative ${
                                                                    data.bankCode ===
                                                                    bank.id
                                                                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10"
                                                                        : "border-border bg-surface hover:border-primary-300"
                                                                }`}
                                                            >
                                                                {data.bankCode ===
                                                                    bank.id && (
                                                                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                                                                        <Check className="w-2.5 h-2.5 text-white" />
                                                                    </div>
                                                                )}
                                                                <div className="w-14 h-9 rounded bg-white shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                                                                    <img
                                                                        src={`/assets/images/banks/${bank.id}.webp`}
                                                                        alt={
                                                                            bank.name
                                                                        }
                                                                        className="w-full h-full object-contain"
                                                                    />
                                                                </div>
                                                                <span
                                                                    className={`text-[11px] font-semibold text-center leading-tight ${data.bankCode === bank.id ? "text-primary-700 dark:text-primary-400" : "text-text-secondary"}`}
                                                                >
                                                                    {bank.name}{" "}
                                                                    Virtual
                                                                    Account
                                                                </span>
                                                            </button>
                                                        ),
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenAccordion(
                                                    openAccordion === "ewallet"
                                                        ? null
                                                        : "ewallet",
                                                )
                                            }
                                            className="w-full flex items-center justify-between p-4 bg-surface hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-info-50 text-info-600">
                                                    <QrCode className="w-5 h-5" />
                                                </div>
                                                <span className="font-semibold text-text-primary text-sm">
                                                    E-Wallet / QRIS
                                                </span>
                                            </div>
                                            {openAccordion === "ewallet" ? (
                                                <ChevronUp className="w-5 h-5 text-text-tertiary" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-text-tertiary" />
                                            )}
                                        </button>

                                        <AnimatePresence>
                                            {openAccordion === "ewallet" && (
                                                <motion.div
                                                    initial={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        height: "auto",
                                                        opacity: 1,
                                                    }}
                                                    exit={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    className="p-4 bg-background border-t border-border grid grid-cols-1 md:grid-cols-2 gap-3"
                                                >
                                                    <button
                                                        type="button"
                                                        disabled={processing}
                                                        onClick={() => {
                                                            setData((prev) => ({
                                                                ...prev,
                                                                paymentMethod:
                                                                    "gopay",
                                                                bankCode:
                                                                    undefined,
                                                            }));
                                                            if (
                                                                errors.paymentMethod ||
                                                                errors.bankCode
                                                            ) {
                                                                clearErrors(
                                                                    "paymentMethod",
                                                                );
                                                                clearErrors(
                                                                    "bankCode",
                                                                );
                                                            }
                                                        }}
                                                        className={`p-4 rounded-lg border transition-all flex flex-col justify-center gap-3 group relative text-left ${
                                                            data.paymentMethod ===
                                                            "gopay"
                                                                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10"
                                                                : "border-border bg-surface hover:border-primary-300"
                                                        }`}
                                                    >
                                                        {data.paymentMethod ===
                                                            "gopay" && (
                                                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                                                                <Check className="w-3 h-3 text-white" />
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-full shadow border-2 border-white bg-white flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
                                                                <img
                                                                    src="/assets/images/ewallet/gopay.webp"
                                                                    alt="GoPay"
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            </div>
                                                            <div>
                                                                <div
                                                                    className={`font-bold text-sm leading-tight mb-0.5 ${data.paymentMethod === "gopay" ? "text-primary-700 dark:text-primary-400" : "text-text-primary"}`}
                                                                >
                                                                    GoPay / QRIS
                                                                </div>
                                                                <div className="text-[11px] leading-snug font-medium text-text-secondary">
                                                                    Bayar lewat
                                                                    fitur scan
                                                                    aplikasi
                                                                    QRIS (GoPay,
                                                                    OVO, Dana,
                                                                    dll) atau
                                                                    langsung
                                                                    di-app GoPay
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Over the Counter / C-Store Accordion */}
                                    <div className="border border-border rounded-xl overflow-hidden shadow-sm mt-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenAccordion(
                                                    openAccordion === "cstore"
                                                        ? null
                                                        : "cstore",
                                                )
                                            }
                                            className="w-full flex items-center justify-between p-4 bg-surface hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-error-50 text-error-600">
                                                    <Store className="w-5 h-5" />
                                                </div>
                                                <span className="font-semibold text-text-primary text-sm">
                                                    Over the Counter
                                                    (Minimarket)
                                                </span>
                                            </div>
                                            {openAccordion === "cstore" ? (
                                                <ChevronUp className="w-5 h-5 text-text-tertiary" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-text-tertiary" />
                                            )}
                                        </button>

                                        <AnimatePresence>
                                            {openAccordion === "cstore" && (
                                                <motion.div
                                                    initial={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        height: "auto",
                                                        opacity: 1,
                                                    }}
                                                    exit={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    className="p-4 bg-background border-t border-border grid grid-cols-1 md:grid-cols-2 gap-3"
                                                >
                                                    {[
                                                        {
                                                            id: "alfamart",
                                                            name: "Alfamart",
                                                            desc: "40,000+ outlet terdekat",
                                                        },
                                                        {
                                                            id: "indomaret",
                                                            name: "Indomaret",
                                                            desc: "18,000+ outlet terdekat",
                                                        },
                                                    ].map((store) => (
                                                        <button
                                                            key={store.id}
                                                            type="button"
                                                            disabled={
                                                                processing
                                                            }
                                                            onClick={() => {
                                                                setData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        paymentMethod:
                                                                            "cstore",
                                                                        bankCode:
                                                                            undefined,
                                                                        cstoreType:
                                                                            store.id as any,
                                                                    }),
                                                                );
                                                                if (
                                                                    errors.paymentMethod ||
                                                                    errors.cstoreType
                                                                ) {
                                                                    clearErrors(
                                                                        "paymentMethod",
                                                                    );
                                                                    clearErrors(
                                                                        "cstoreType",
                                                                    );
                                                                }
                                                            }}
                                                            className={`p-4 rounded-lg border transition-all flex flex-col justify-center gap-3 group relative text-left ${
                                                                data.paymentMethod ===
                                                                    "cstore" &&
                                                                data.cstoreType ===
                                                                    store.id
                                                                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10"
                                                                    : "border-border bg-surface hover:border-primary-300"
                                                            }`}
                                                        >
                                                            {data.paymentMethod ===
                                                                "cstore" &&
                                                                data.cstoreType ===
                                                                    store.id && (
                                                                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                                                                        <Check className="w-3 h-3 text-white" />
                                                                    </div>
                                                                )}
                                                            <div className="flex items-center gap-4">
                                                                <div
                                                                    className={`w-12 h-12 rounded-full shadow border-2 border-white bg-white flex items-center justify-center flex-shrink-0 overflow-hidden p-1`}
                                                                >
                                                                    <img
                                                                        src={`/assets/images/cstore/${store.id}.webp`}
                                                                        alt={
                                                                            store.name
                                                                        }
                                                                        className="w-full h-full object-contain"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <div
                                                                        className={`font-bold text-sm leading-tight mb-0.5 ${data.paymentMethod === "cstore" && data.cstoreType === store.id ? "text-primary-700 dark:text-primary-400" : "text-text-primary"}`}
                                                                    >
                                                                        {
                                                                            store.name
                                                                        }
                                                                    </div>
                                                                    <div className="text-[11px] leading-snug font-medium text-text-secondary">
                                                                        {
                                                                            store.desc
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Cardless Credit Accordion */}
                                    <div className="border border-border rounded-xl overflow-hidden shadow-sm mt-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenAccordion(
                                                    openAccordion === "cardless"
                                                        ? null
                                                        : "cardless",
                                                )
                                            }
                                            className="w-full flex items-center justify-between p-4 bg-surface hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
                                                    <CreditCard className="w-5 h-5" />
                                                </div>
                                                <span className="font-semibold text-text-primary text-sm">
                                                    Cicilan Tanpa Kartu Kredit
                                                </span>
                                            </div>
                                            {openAccordion === "cardless" ? (
                                                <ChevronUp className="w-5 h-5 text-text-tertiary" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-text-tertiary" />
                                            )}
                                        </button>

                                        <AnimatePresence>
                                            {openAccordion === "cardless" && (
                                                <motion.div
                                                    initial={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        height: "auto",
                                                        opacity: 1,
                                                    }}
                                                    exit={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    className="p-4 bg-background border-t border-border grid grid-cols-1 md:grid-cols-2 gap-3"
                                                >
                                                    {[
                                                        {
                                                            id: "akulaku",
                                                            name: "Akulaku",
                                                            desc: "Cicilan 0% dengan tenor 1, 3, 6, atau 12 bulan",
                                                        },
                                                        {
                                                            id: "kredivo",
                                                            name: "Kredivo",
                                                            desc: "Bayar sekarang atau cicilan 0% hingga 12 bulan",
                                                        },
                                                    ].map((provider) => (
                                                        <button
                                                            key={provider.id}
                                                            type="button"
                                                            disabled={
                                                                processing
                                                            }
                                                            onClick={() => {
                                                                setData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        paymentMethod:
                                                                            provider.id as any,
                                                                        bankCode:
                                                                            undefined,
                                                                        cstoreType:
                                                                            undefined,
                                                                        cardlessCreditType:
                                                                            provider.id as any,
                                                                    }),
                                                                );
                                                                if (
                                                                    errors.paymentMethod ||
                                                                    errors.cardlessCreditType
                                                                ) {
                                                                    clearErrors(
                                                                        "paymentMethod",
                                                                    );
                                                                    clearErrors(
                                                                        "cardlessCreditType",
                                                                    );
                                                                }
                                                            }}
                                                            className={`p-4 rounded-lg border transition-all flex flex-col justify-center gap-3 group relative text-left ${
                                                                data.paymentMethod ===
                                                                provider.id
                                                                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10"
                                                                    : "border-border bg-surface hover:border-primary-300"
                                                            }`}
                                                        >
                                                            {data.paymentMethod ===
                                                                provider.id && (
                                                                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                                                                    <Check className="w-3 h-3 text-white" />
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-4">
                                                                <div
                                                                    className={`w-12 h-12 rounded-full shadow border-2 border-white bg-white flex items-center justify-center flex-shrink-0 overflow-hidden p-1`}
                                                                >
                                                                    <img
                                                                        src={`/assets/images/cardless/${provider.id}.webp`}
                                                                        alt={
                                                                            provider.name
                                                                        }
                                                                        className="w-full h-full object-contain"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <div
                                                                        className={`font-bold text-sm leading-tight mb-0.5 ${data.paymentMethod === provider.id ? "text-primary-700 dark:text-primary-400" : "text-text-primary"}`}
                                                                    >
                                                                        {
                                                                            provider.name
                                                                        }
                                                                    </div>
                                                                    <div className="text-[11px] leading-snug font-medium text-text-secondary">
                                                                        {
                                                                            provider.desc
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Right Column: Summary */}
                        <div className="lg:col-span-4 h-fit sticky top-6">
                            <Card className="p-6 space-y-6">
                                <h3
                                    className="text-lg font-bold flex items-center gap-2"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    <CreditCard className="w-5 h-5" />
                                    Ringkasan Topup
                                </h3>

                                <div className="space-y-4">
                                    <SummaryItem
                                        label="Tujuan"
                                        value={
                                            topupMode === "master"
                                                ? "Master Wallet"
                                                : selectedOutlet?.name ||
                                                  "Pilih Outlet..."
                                        }
                                    />
                                    <SummaryItem
                                        label="Jumlah Coin"
                                        value={`${formatCurrency(data.amountMoney || 0)} Coin`}
                                    />
                                    <SummaryItem
                                        label="Metode"
                                        value={
                                            data.paymentMethod === "gopay"
                                                ? "GoPay / QRIS"
                                                : data.paymentMethod ===
                                                    "cstore"
                                                  ? data.cstoreType ===
                                                    "alfamart"
                                                      ? "Alfamart"
                                                      : "Indomaret"
                                                  : data.paymentMethod ===
                                                      "akulaku"
                                                    ? "Akulaku Cicilan"
                                                    : data.paymentMethod ===
                                                        "kredivo"
                                                      ? "Kredivo Paylater"
                                                      : BANK_CHANNELS.find(
                                                            (b) =>
                                                                b.id ===
                                                                data.bankCode,
                                                        )?.name || "-"
                                        }
                                    />

                                    <div
                                        className="pt-4 border-t"
                                        style={{
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        <div className="flex justify-between items-end">
                                            <span
                                                className="text-sm font-medium"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Total Bayar
                                            </span>
                                            <span
                                                className="text-2xl font-bold"
                                                style={{
                                                    color: "var(--color-primary-600)",
                                                }}
                                            >
                                                {formatCurrency(
                                                    data.amountMoney,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSubmit}
                                    variant="primary"
                                    size="lg"
                                    className="w-full"
                                    loading={processing}
                                    disabled={
                                        processing ||
                                        !data.amountMoney ||
                                        (topupMode === "outlet" &&
                                            !data.outletId) ||
                                        !data.paymentMethod
                                    }
                                    leftIcon={<Save className="w-5 h-5" />}
                                >
                                    {processing
                                        ? "Memproses..."
                                        : "Bayar Sekarang"}
                                </Button>

                                <p
                                    className="text-xs text-center"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Dengan melanjutkan, Anda menyetujui syarat &
                                    ketentuan layanan kami.
                                </p>
                            </Card>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

// --- Sub-components to keep code clean ---

const SectionTitle = ({ number, title, subtitle, color, bgColor }: any) => (
    <div className="flex items-center gap-3 mb-2">
        <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0"
            style={{ backgroundColor: bgColor, color: color }}
        >
            {number}
        </div>
        <div>
            <h2
                className="text-lg font-semibold"
                style={{ color: "var(--color-text-primary)" }}
            >
                {title}
            </h2>
            <p
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
            >
                {subtitle}
            </p>
        </div>
    </div>
);

const ModeButton = ({
    active,
    onClick,
    icon: Icon,
    title,
    description,
    color,
    disabled,
}: any) => {
    const colorMap = {
        success: {
            border: "var(--color-success-500)",
            bg: "var(--color-success-50)",
            icon: "var(--color-success-600)",
            text: "var(--color-success-700)",
        },
        info: {
            border: "var(--color-info-500)",
            bg: "var(--color-info-50)",
            icon: "var(--color-info-600)",
            text: "var(--color-info-700)",
        },
    };

    const c = colorMap[color as keyof typeof colorMap];

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="flex-1 p-4 rounded-xl border-2 transition-all flex items-center gap-4 hover:shadow-md"
            style={{
                borderColor: active ? c.border : "var(--color-border)",
                backgroundColor: active ? c.bg : "transparent",
            }}
        >
            <div
                className={`p-3 rounded-lg shadow-sm`}
                style={{
                    backgroundColor: active
                        ? "var(--color-surface)"
                        : "var(--color-background)",
                }}
            >
                <Icon
                    className="w-8 h-8"
                    style={{
                        color: active ? c.icon : "var(--color-text-tertiary)",
                    }}
                />
            </div>
            <div className="text-left">
                <div
                    className="font-bold"
                    style={{
                        color: active ? c.text : "var(--color-text-primary)",
                    }}
                >
                    {title}
                </div>
                <div
                    className="text-xs"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    {description}
                </div>
            </div>
            {active && (
                <Check className="ml-auto w-5 h-5" style={{ color: c.icon }} />
            )}
        </button>
    );
};

const SummaryItem = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-center py-2">
        <span
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
        >
            {label}
        </span>
        <span
            className="text-sm font-semibold text-right"
            style={{ color: "var(--color-text-primary)" }}
        >
            {value}
        </span>
    </div>
);

TopupCreate.layout = withAuthenticatedLayout({
    title: "Tambah Topup",
    breadcrumbs: [
        { label: "Dashboard", href: route("dashboard") },
        { label: "Topup", href: route("topups.index") },
        { label: "Tambah Topup" },
    ],
});

export default TopupCreate;
