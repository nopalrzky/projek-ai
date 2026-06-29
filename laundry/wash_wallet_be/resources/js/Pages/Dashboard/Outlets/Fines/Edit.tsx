import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Save, ArrowLeft, DollarSign, FileText, Edit } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import { Input, TextAreaInput, NumberInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import { FineEditProps } from "./types";
import { OutletFineFormData } from "@/types";
import PageHeader from "@/Components/Page/PageHeader";
import outletService from "@/Services/outlet.service";

const OutletFineEdit = ({ outlet, fine }: FineEditProps) => {
    const { data, setData, put, processing, errors, clearErrors, isDirty } =
        useForm<OutletFineFormData>({
            name: fine.name || "",
            amount: fine.amount || 0,
            description: fine.description || "",
        });

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        put(route("outlets.fines.update", [outlet.id, fine.id]), {
            preserveScroll: true,
            onError: (errors) => {
                console.error("Validation errors:", errors);
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
            onSuccess: () => {
                setHasUnsavedChanges(false);
            },
        });
    };

    const handleDataChange = (key: keyof OutletFineFormData, value: any) => {
        setData(key as string, value);

        if (errors[key]) {
            clearErrors(key as string);
        }

        if (!hasUnsavedChanges) {
            setHasUnsavedChanges(true);
        }
    };

    const isFormValid = data.name.trim() !== "" && data.amount > 0;

    return (
        <>
            <Head title={`Edit Denda: ${fine.name} - ${outlet.name}`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title={`Edit Denda - ${outlet.name}`}
                        subtitle={`Edit denda "${fine.name}" di outlet ${outlet.name} (${outlet.code})`}
                        icon={Edit}
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
                                                Edit detail jenis dan nominal
                                                denda
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

                                    <div className="flex items-center gap-3">
                                        {isDirty && hasUnsavedChanges && (
                                            <span
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                Ada perubahan yang belum
                                                disimpan
                                            </span>
                                        )}

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled={
                                                processing ||
                                                !isFormValid ||
                                                (!isDirty && !hasUnsavedChanges)
                                            }
                                            loading={processing}
                                            size="lg"
                                            leftIcon={
                                                <Save className="w-4 h-4" />
                                            }
                                        >
                                            {processing
                                                ? "Menyimpan..."
                                                : "Simpan Perubahan"}
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

OutletFineEdit.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Edit Denda",
        breadcrumbs: [
            { label: "Outlets", href: route("outlets.index") },
            {
                label: page.props.outlet?.name || "Detail",
                href: route("outlets.show", page.props.outlet?.id),
            },
            { label: "Edit Denda" },
        ],
    })(page);

export default OutletFineEdit;
