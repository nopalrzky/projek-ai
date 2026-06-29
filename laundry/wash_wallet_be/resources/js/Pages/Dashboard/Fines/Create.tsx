import React from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Save,
    ArrowLeft,
    AlertCircle,
    Building2,
    FileText,
    DollarSign,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
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
import PageHeader from "@/Components/Page/PageHeader";
import { FineFormData } from "@/types";
import { FineCreateProps } from "./types";
import { formatCurrency } from "@/lib/utils";

const FinesCreate = ({ outlets }: FineCreateProps) => {
    const { data, setData, post, processing, errors, reset } =
        useForm<FineFormData>({
            outletId: 0,
            name: "",
            amount: 0,
            description: "",
        });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route("fines.store"), {
            onSuccess: () => reset(),
            onError: (errors) => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                console.error("Form submission errors:", errors);
            },
        });
    };

    const outletOptions = [
        { value: "", label: "Pilih Outlet..." },
        ...outlets.map((outlet) => ({
            value: outlet.id.toString(),
            label: `${outlet.name} (${outlet.code})`,
        })),
    ];

    return (
        <>
            <Head title="Tambah Jenis Denda Baru" />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Tambah Jenis Denda Baru"
                        subtitle="Buat jenis denda baru untuk diterapkan pada karyawan di outlet tertentu"
                        icon={AlertCircle}
                        animate={true}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
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
                                                Pilih Outlet
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Tentukan outlet untuk jenis
                                                denda ini
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <SelectInput
                                            label="Outlet"
                                            value={
                                                data.outletId === 0
                                                    ? ""
                                                    : data.outletId?.toString()
                                            }
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setData(
                                                    "outletId",
                                                    value === ""
                                                        ? 0
                                                        : parseInt(value),
                                                );
                                            }}
                                            options={outletOptions}
                                            error={errors.outletId}
                                            required
                                            disabled={processing}
                                            hint="Pilih outlet tempat jenis denda ini akan dibuat"
                                        />
                                    </div>
                                </div>

                                {/* Fine Information */}
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
                                            <AlertCircle
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
                                                Informasi Denda
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Detail dan spesifikasi jenis
                                                denda
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <Input
                                                label="Nama Jenis Denda"
                                                placeholder="Contoh: Terlambat, Tidak Hadir, Pelanggaran Aturan"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        "name",
                                                        e.target.value,
                                                    )
                                                }
                                                error={errors.name}
                                                required
                                                disabled={processing}
                                                leftIcon={
                                                    <FileText className="w-5 h-5" />
                                                }
                                                hint="Nama jenis denda yang akan diterapkan"
                                                maxLength={100}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <NumberInput
                                                label="Jumlah Denda"
                                                placeholder="0"
                                                value={data.amount}
                                                onValueChange={(value) =>
                                                    setData(
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
                                                prefix="Rp "
                                                min={0}
                                                max={999999999}
                                                step={1000}
                                                precision={0}
                                                thousandSeparator="."
                                                decimalSeparator=","
                                                allowNegative={false}
                                                allowDecimal={false}
                                                hint={
                                                    data.amount > 0
                                                        ? formatCurrency(
                                                              data.amount,
                                                          )
                                                        : "Nominal denda dalam rupiah"
                                                }
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <TextAreaInput
                                                label="Deskripsi"
                                                placeholder="Deskripsi detail tentang jenis denda ini, kapan diterapkan, dan ketentuan lainnya..."
                                                value={data.description}
                                                onChange={(e) =>
                                                    setData(
                                                        "description",
                                                        e.target.value,
                                                    )
                                                }
                                                error={errors.description}
                                                disabled={processing}
                                                hint="Deskripsi detail tentang jenis denda ini (opsional)"
                                                rows={4}
                                                maxLength={500}
                                                showCharacterCount={true}
                                                autoResize={true}
                                                minRows={4}
                                                maxRows={8}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Validation Errors */}
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
                                            (window.location.href =
                                                route("fines.index"))
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
                                            !data.name.trim() ||
                                            !data.outletId ||
                                            data.amount <= 0
                                        }
                                        loading={processing}
                                        size="lg"
                                        leftIcon={<Save className="w-4 h-4" />}
                                    >
                                        {processing
                                            ? "Menyimpan..."
                                            : "Buat Jenis Denda"}
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

FinesCreate.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Tambah Jenis Denda",
        breadcrumbs: [
            { label: "Jenis Denda", href: route("fines.index") },
            { label: "Tambah Jenis Denda" },
        ],
    })(page);

export default FinesCreate;
