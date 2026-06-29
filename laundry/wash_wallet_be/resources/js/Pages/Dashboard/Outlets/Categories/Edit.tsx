import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Layers, CheckSquare, Edit } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import { Input, TextAreaInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { OutletCategoryEditProps } from "./types";
import { OutletCategoryFormData } from "@/types";
import PageHeader from "@/Components/Page/PageHeader";
import outletService from "@/Services/outlet.service";

const OutletCategoryEdit = ({ outlet, category }: OutletCategoryEditProps) => {
    const { data, setData, put, processing, errors, clearErrors, isDirty } =
        useForm<OutletCategoryFormData>({
            name: category.name || "",
            description: category.description || "",
            isActive: category.isActive ?? true,
        });

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        put(route("outlets.categories.update", [outlet.id, category.id]), {
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

    const handleDataChange = (
        key: keyof OutletCategoryFormData,
        value: any,
    ) => {
        setData(key as string, value);

        if (errors[key]) {
            clearErrors(key as string);
        }

        if (!hasUnsavedChanges) {
            setHasUnsavedChanges(true);
        }
    };

    return (
        <>
            <Head title={`Edit Kategori: ${category.name} - ${outlet.name}`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title={`Edit Kategori - ${outlet.name}`}
                        subtitle={`Edit kategori "${category.name}" di outlet ${outlet.name} (${outlet.code})`}
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
                                            <Layers
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
                                                Informasi Kategori
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Edit detail kategori produk
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <Input
                                            label="Nama Kategori"
                                            placeholder="Contoh: Karpet, Sepatu, Pakaian"
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
                                                <Layers className="w-5 h-5" />
                                            }
                                            hint="Nama kategori untuk mengelompokkan produk"
                                            autoFocus
                                        />

                                        <TextAreaInput
                                            label="Deskripsi Kategori"
                                            placeholder="Jelaskan jenis produk yang termasuk dalam kategori ini..."
                                            value={data.description}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "description",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.description}
                                            disabled={processing}
                                            hint="Deskripsi detail tentang kategori ini (opsional)"
                                            rows={4}
                                            maxLength={1000}
                                            showCharacterCount={true}
                                            autoResize={true}
                                            minRows={4}
                                            maxRows={8}
                                        />
                                    </div>
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
                                                    "var(--color-primary-100)",
                                            }}
                                        >
                                            <CheckSquare
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
                                                Status Kategori
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Ubah status kategori
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                id="isActive"
                                                checked={data.isActive!}
                                                onChange={(e) =>
                                                    handleDataChange(
                                                        "isActive",
                                                        e.target.checked,
                                                    )
                                                }
                                                disabled={processing}
                                                className="w-5 h-5 rounded border-2 transition-all duration-200"
                                                style={{
                                                    borderColor:
                                                        "var(--color-border)",
                                                    backgroundColor:
                                                        data.isActive
                                                            ? "var(--color-primary-500)"
                                                            : "var(--color-surface)",
                                                    accentColor:
                                                        "var(--color-primary-500)",
                                                }}
                                            />
                                            <label
                                                htmlFor="isActive"
                                                className="text-sm font-medium cursor-pointer"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Kategori Aktif
                                            </label>
                                            <span
                                                className="text-xs"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                (Kategori aktif dapat digunakan
                                                untuk produk baru)
                                            </span>
                                        </div>

                                        {!data.isActive && (
                                            <Alert
                                                variant="warning"
                                                description="Menonaktifkan kategori ini akan mempengaruhi produk yang menggunakan kategori ini."
                                                className="text-sm"
                                            />
                                        )}
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
                                                !data.name.trim() ||
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

OutletCategoryEdit.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Edit Kategori",
        breadcrumbs: [
            { label: "Outlets", href: route("outlets.index") },
            {
                label: page.props.outlet.name,
                href: route("outlets.show", page.props.outlet.id),
            },
            { label: "Edit Kategori" },
        ],
    })(page);

export default OutletCategoryEdit;
