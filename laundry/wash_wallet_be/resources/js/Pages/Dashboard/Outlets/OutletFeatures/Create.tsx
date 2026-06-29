import React from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Zap, Info, CreditCard, Coins } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import { SelectInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import PageHeader from "@/Components/Page/PageHeader";
import { Badge } from "@/Components/Badge";
import { OutletFeaturesCreateProps } from "./types";

const OutletFeatureCreate = ({
    outlet,
    features,
    ownerCoins,
}: OutletFeaturesCreateProps) => {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        featureId: "",
        coinType: "outlet",
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(route("outlets.features.store", outlet.id), {
            preserveScroll: true,
            onError: (errors) => {
                console.error("Validation errors:", errors);
            },
        });
    };

    const handleFeatureChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value;
        setData("featureId", value);

        if (errors.featureId) {
            clearErrors("featureId");
        }
    };

    const handleCoinTypeChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        setData("coinType", event.target.value);
    };

    const featureOptions = [
        { value: "", label: "Pilih Fitur yang akan diaktifkan" },
        ...features.map((f) => ({
            value: f.id.toString(),
            label: `${f.name} (${f.coinPrice} Coin)`,
        })),
    ];

    const coinTypeOptions = [
        {
            value: "outlet",
            label: `Koin Outlet (Saldo: ${outlet.coinBalance} Coin)`,
        },
        { value: "owner", label: `Koin Owner (Saldo: ${ownerCoins} Coin)` },
    ];

    const selectedFeature = features.find(
        (f) => f.id.toString() === data.featureId,
    );

    const currentBalance =
        data.coinType === "owner" ? ownerCoins : outlet.coinBalance;
    const isBalanceEnough = selectedFeature
        ? currentBalance >= selectedFeature.coinPrice
        : true;

    return (
        <>
            <Head title={`Tambah Fitur - ${outlet.name}`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Aktifkan Fitur Baru"
                        subtitle={`Pilih fitur tambahan untuk outlet ${outlet.name}`}
                        icon={Zap}
                        variant="default"
                        actions={
                            <Button
                                onClick={() => window.history.back()}
                                variant="outline"
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
                                            <CreditCard
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
                                                Pilih Layanan & Pembayaran
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Gunakan koin untuk mengaktifkan
                                                fitur
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SelectInput
                                            label="Pilih Fitur"
                                            value={data.featureId}
                                            onChange={handleFeatureChange}
                                            options={featureOptions}
                                            error={errors.featureId}
                                            disabled={processing}
                                            leftIcon={
                                                <Zap className="w-5 h-5" />
                                            }
                                            hint="Pilih fitur dari katalog yang tersedia"
                                            required
                                        />

                                        <SelectInput
                                            label="Metode Pembayaran"
                                            value={data.coinType}
                                            onChange={handleCoinTypeChange}
                                            options={coinTypeOptions}
                                            error={errors.coinType}
                                            disabled={processing}
                                            leftIcon={
                                                <Coins className="w-5 h-5" />
                                            }
                                            hint="Pilih saldo koin yang akan digunakan"
                                            required
                                        />
                                    </div>

                                    {selectedFeature && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: "auto",
                                            }}
                                            className={`rounded-lg p-6 mt-4 border ${isBalanceEnough ? "bg-primary-50 border-primary-100" : "bg-red-50 border-red-100"}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className={`p-2 rounded-full shadow-sm ${isBalanceEnough ? "bg-white text-primary-600" : "bg-white text-red-600"}`}
                                                >
                                                    <Info className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-2 flex-grow">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <h4
                                                                className={`font-bold text-lg ${isBalanceEnough ? "text-primary-900" : "text-red-900"}`}
                                                            >
                                                                {
                                                                    selectedFeature.name
                                                                }
                                                            </h4>
                                                            <Badge
                                                                variant={
                                                                    isBalanceEnough
                                                                        ? "success"
                                                                        : "danger"
                                                                }
                                                            >
                                                                {
                                                                    selectedFeature.coinPrice
                                                                }{" "}
                                                                Coin
                                                            </Badge>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-xs font-medium text-muted-foreground block uppercase">
                                                                Saldo Saat Ini
                                                            </span>
                                                            <span
                                                                className={`font-bold ${isBalanceEnough ? "text-green-600" : "text-red-600"}`}
                                                            >
                                                                {currentBalance}{" "}
                                                                Coin
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p
                                                        className={`${isBalanceEnough ? "text-primary-700" : "text-red-700"} text-sm leading-relaxed`}
                                                    >
                                                        {
                                                            selectedFeature.description
                                                        }
                                                    </p>
                                                    {!isBalanceEnough && (
                                                        <p className="text-red-600 text-xs font-bold mt-2 italic">
                                                            * Saldo koin tidak
                                                            mencukupi untuk
                                                            mengaktifkan fitur
                                                            ini.
                                                        </p>
                                                    )}
                                                    <div className="pt-2 text-xs font-medium flex items-center gap-2">
                                                        <span
                                                            className={`px-2 py-1 bg-white rounded border ${isBalanceEnough ? "text-primary-600 border-primary-200" : "text-red-600 border-red-200"}`}
                                                        >
                                                            Durasi:{" "}
                                                            {selectedFeature.durationDays &&
                                                            selectedFeature.durationDays >
                                                                0
                                                                ? `${selectedFeature.durationDays} Hari`
                                                                : "Selamanya"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
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
                                        onClick={() => window.history.back()}
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
                                            !data.featureId ||
                                            !isBalanceEnough
                                        }
                                        loading={processing}
                                        size="lg"
                                        leftIcon={<Save className="w-4 h-4" />}
                                    >
                                        {processing
                                            ? "Memproses..."
                                            : "Aktifkan Fitur"}
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

OutletFeatureCreate.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Tambah Fitur",
        breadcrumbs: [
            { label: "Outlets", href: route("outlets.index") },
            {
                label: page.props.outlet.name,
                href: route("outlets.show", page.props.outlet.id),
            },
            { label: "Tambah Fitur" },
        ],
    })(page);

export default OutletFeatureCreate;
