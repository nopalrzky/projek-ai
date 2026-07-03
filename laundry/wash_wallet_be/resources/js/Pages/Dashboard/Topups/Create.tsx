import React, { useState, useCallback, useMemo } from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Wallet, ArrowLeft } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { topupService } from "@/Services/topup.service";
import { TopupCreateProps } from "./types";
import { TopupFormData } from "@/types/topup";
import TopupDestinationSection from "./Partials/TopupDestinationSection";
import TopupAmountSection from "./Partials/TopupAmountSection";
import TopupPaymentSection from "./Partials/TopupPaymentSection";
import TopupSummaryCard from "./Partials/TopupSummaryCard";

const TopupCreate = ({ outlets, flash }: TopupCreateProps) => {
    const [topupMode, setTopupMode] = useState<"master" | "outlet">("master");
    const [formError, setFormError] = useState<string | null>(null);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    const { data, setData, post, processing, errors, clearErrors } =
        useForm<TopupFormData>({
            outletId: null,
            amountMoney: 10000,
            paymentMethod: "bank_transfer",
            bankCode: "bca",
            cstoreType: undefined,
            cardlessCreditType: undefined,
        });

    const selectedOutlet = useMemo(() => {
        if (!data.outletId || topupMode === "master") return null;
        return outlets.find((o) => o.id === Number(data.outletId)) || null;
    }, [data.outletId, outlets, topupMode]);

    const handleFormChange = useCallback(
        (key: keyof TopupFormData, value: any) => {
            setData(key, value);
            setFormError(null);
            if (errors[key]) clearErrors(key);
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
            if (mode === "master" && errors.outletId) clearErrors("outletId");
        },
        [setData, clearErrors, errors.outletId],
    );

    const handleAccordionToggle = useCallback((id: string) => {
        setOpenAccordion((prev) => (prev === id ? null : id));
    }, []);

    const handleSelectBank = useCallback(
        (method: string, bankCode: string) => {
            setData((prev) => ({
                ...prev,
                paymentMethod: method as any,
                bankCode,
            }));
            setFormError(null);
            if (errors.paymentMethod) clearErrors("paymentMethod");
            if (errors.bankCode) clearErrors("bankCode");
        },
        [setData, clearErrors, errors],
    );

    const handleSelectGopay = useCallback(() => {
        setData((prev) => ({
            ...prev,
            paymentMethod: "gopay",
            bankCode: undefined,
        }));
        setFormError(null);
        if (errors.paymentMethod) clearErrors("paymentMethod");
        if (errors.bankCode) clearErrors("bankCode");
    }, [setData, clearErrors, errors]);

    const handleSelectCstore = useCallback(
        (storeId: string) => {
            setData((prev) => ({
                ...prev,
                paymentMethod: "cstore",
                bankCode: undefined,
                cstoreType: storeId as any,
            }));
            setFormError(null);
            if (errors.paymentMethod) clearErrors("paymentMethod");
            if (errors.cstoreType) clearErrors("cstoreType");
        },
        [setData, clearErrors, errors],
    );

    const handleSelectCardless = useCallback(
        (providerId: string) => {
            setData((prev) => ({
                ...prev,
                paymentMethod: providerId as any,
                bankCode: undefined,
                cstoreType: undefined,
                cardlessCreditType: providerId as any,
            }));
            setFormError(null);
            if (errors.paymentMethod) clearErrors("paymentMethod");
            if (errors.cardlessCreditType) clearErrors("cardlessCreditType");
        },
        [setData, clearErrors, errors],
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
                onError: () => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                },
            });
        },
        [data, topupMode, post],
    );

    return (
        <>
            <Head title="Tambah Topup" />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className="mx-auto space-y-6">
                    <PageHeader
                        icon={Wallet}
                        title="Tambah Topup"
                        subtitle="Isi saldo master atau saldo outlet"
                        actions={
                            <Button
                                variant="outline"
                                onClick={() => topupService.goToIndex()}
                                leftIcon={<ArrowLeft className="w-4 h-4" />}
                            >
                                Kembali
                            </Button>
                        }
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
                        <div className="lg:col-span-8 space-y-6">
                            <TopupDestinationSection
                                topupMode={topupMode}
                                onModeChange={handleModeChange}
                                outlets={outlets}
                                outletId={data.outletId}
                                onOutletChange={(id) =>
                                    handleFormChange("outletId", id)
                                }
                                selectedOutlet={selectedOutlet}
                                outletError={errors.outletId}
                                processing={processing}
                            />

                            <TopupAmountSection
                                amountMoney={data.amountMoney}
                                onAmountChange={(amount) =>
                                    handleFormChange("amountMoney", amount)
                                }
                                amountError={errors.amountMoney}
                                processing={processing}
                            />

                            <TopupPaymentSection
                                data={data}
                                openAccordion={openAccordion}
                                onAccordionToggle={handleAccordionToggle}
                                onSelectBank={handleSelectBank}
                                onSelectGopay={handleSelectGopay}
                                onSelectCstore={handleSelectCstore}
                                onSelectCardless={handleSelectCardless}
                                processing={processing}
                            />
                        </div>

                        <div className="lg:col-span-4 h-fit sticky top-6">
                            <TopupSummaryCard
                                data={data}
                                topupMode={topupMode}
                                selectedOutlet={selectedOutlet}
                                processing={processing}
                                onSubmit={handleSubmit}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

TopupCreate.layout = withAuthenticatedLayout({
    title: "Tambah Topup",
    breadcrumbs: [
        { label: "Dashboard", href: route("dashboard") },
        { label: "Topup", href: route("topups.index") },
        { label: "Tambah Topup" },
    ],
});

export default TopupCreate;
