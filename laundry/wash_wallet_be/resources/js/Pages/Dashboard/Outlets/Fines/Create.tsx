import React from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Save, ArrowLeft, DollarSign, FileText } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import { Input, TextAreaInput, NumberInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import { FineCreateProps } from "./types";
import { OutletFineFormData } from "@/types";
import PageHeader from "@/Components/Page/PageHeader";
import outletService from "@/Services/outlet.service";

const OutletFineCreate = ({ outlet }: FineCreateProps) => {
    const { data, setData, post, processing, errors, clearErrors } =
        useForm<OutletFineFormData>({
            name: "",
            amount: 0,
            description: "",
        });
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(route("outlets.fines.store", outlet.id), {
            preserveScroll: true,
            onError: (errors) => {
                console.error("Validation errors:", errors);
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
        });
    };
    const handleDataChange = (key: keyof OutletFineFormData, value: any) => {
        setData(key as string, value);

        if (errors[key]) {
            clearErrors(key as string);
        }
    };

    const isFormValid = data.name.trim() !== "" && data.amount > 0;

    return (
        <>
            <Head title={`Tambah Denda - ${outlet.name}`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title={`Tambah Denda - ${outlet.name}`}
                        subtitle={`Buat jenis denda baru untuk outlet ${outlet.name} (${outlet.code})`}
                        icon={DollarSign}
                        variant="default"
                        actions={
                            <Button
                                onClick={() =>
                                    outletService.goToView(outlet.id)
                                }
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
                                                Informasi Denda
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Detail jenis dan nominal denda
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <Input
                                            label="Nama Denda"
                                            placeholder="Contoh: Keterlambatan, Absen, Pelanggaran SOP"
                                            value={data.name}
                                            onChange={(e) =>
                                                handleDataChange(
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
                                            hint="Nama jenis denda yang jelas dan spesifik"
                                            autoFocus
                                            maxLength={255}
                                        />

                                        <NumberInput
                                            label="Jumlah Denda"
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
                                            hint="Nominal denda dalam Rupiah"
                                            min={0}
                                            max={999999999.99}
                                            allowDecimal={true}
                                            prefix="Rp"
                                            thousandSeparator=","
                                            placeholder="0"
                                        />

                                        <TextAreaInput
                                            label="Deskripsi Denda"
                                            placeholder="Jelaskan detail denda, kapan diterapkan, dan ketentuan lainnya..."
                                            value={data.description}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "description",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.description}
                                            disabled={processing}
                                            hint="Keterangan tambahan mengenai jenis denda ini (opsional)"
                                            rows={4}
                                            maxLength={1000}
                                            showCharacterCount={true}
                                            autoResize={true}
                                            minRows={4}
                                            maxRows={8}
                                        />
                                    </div>
                                </div>

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
                                        disabled={processing || !isFormValid}
                                        loading={processing}
                                        size="lg"
                                        leftIcon={<Save className="w-4 h-4" />}
                                    >
                                        {processing
                                            ? "Menyimpan..."
                                            : "Buat Denda"}
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

OutletFineCreate.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Tambah Denda",
        breadcrumbs: [
            { label: "Outlets", href: route("outlets.index") },
            {
                label: page.props.outlet?.name || "Detail",
                href: route("outlets.show", page.props.outlet?.id),
            },
            { label: "Tambah Denda" },
        ],
    })(page);

export default OutletFineCreate;
