import React from "react";
import { Head, useForm } from "@inertiajs/react";
import {
    Save,
    ArrowLeft,
    Cog,
    FileText,
    CheckSquare,
    Edit,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/Page/PageHeader";
import { Form } from "@/Components/Form";
import { Input, TextAreaInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { ProcessFormData } from "@/types";
import processService from "@/Services/process.service";
import { ProcessEditProps } from "./types";

const ProcessEdit = ({ process, flash }: ProcessEditProps) => {
    const { data, setData, processing, errors, clearErrors, put, isDirty } =
        useForm<ProcessFormData>({
            name: process.name || "",
            description: process.description || "",
            isActive: process.isActive ?? true,
        });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        put(route("processes.update", process.id), {
            preserveScroll: true,
            onError: () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
        });
    };

    const handleDataChange = (key: keyof ProcessFormData, value: any) => {
        setData(key, value);

        if (errors[key]) {
            clearErrors(key);
        }
    };

    return (
        <>
            <Head title={`Edit Proses - ${process.name}`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Edit Proses"
                        subtitle={`Perbarui informasi proses "${process.name}"`}
                        icon={Edit}
                        actions={
                            <div className="flex items-center gap-3">
                                <Badge
                                    variant={
                                        process.isActive
                                            ? "success"
                                            : "secondary"
                                    }
                                    className="text-xs"
                                >
                                    {process.isActive ? "Aktif" : "Nonaktif"}
                                </Badge>
                                <div
                                    className="text-xs px-2 py-1 rounded"
                                    style={{
                                        backgroundColor: "var(--color-surface)",
                                        color: "var(--color-text-tertiary)",
                                        border: "1px solid var(--color-border)",
                                    }}
                                >
                                    ID: {process.id}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => processService.goToIndex()}
                                    disabled={processing}
                                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                                >
                                    Kembali
                                </Button>
                            </div>
                        }
                    />

                    {flash?.error && (
                        <Alert
                            variant="error"
                            title="Error"
                            description={flash.error}
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
                                        <Cog
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
                                            Informasi Proses
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Perbarui detail proses layanan
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <Input
                                        label="Nama Proses"
                                        placeholder="Contoh: Pencucian, Pengeringan, Setrika"
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
                                        leftIcon={<Cog className="w-5 h-5" />}
                                        hint="Nama proses dalam alur kerja layanan laundry"
                                        autoFocus
                                    />

                                    <TextAreaInput
                                        label="Deskripsi Proses"
                                        placeholder="Jelaskan detail proses ini dan langkah-langkah yang dilakukan..."
                                        value={data.description}
                                        onChange={(e) =>
                                            handleDataChange(
                                                "description",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.description}
                                        disabled={processing}
                                        hint="Deskripsi detail tentang proses ini (opsional)"
                                        rows={4}
                                        maxLength={1000}
                                        showCharacterCount={true}
                                        autoResize={true}
                                        minRows={4}
                                        maxRows={8}
                                        leftIcon={
                                            <FileText className="w-5 h-5" />
                                        }
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
                                                "var(--color-success-100)",
                                        }}
                                    >
                                        <CheckSquare
                                            className="w-6 h-6"
                                            style={{
                                                color: "var(--color-success-600)",
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
                                            Status Proses
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Tentukan status aktif proses ini
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
                                                backgroundColor: data.isActive
                                                    ? "var(--color-primary-500)"
                                                    : "var(--color-surface)",
                                                accentColor:
                                                    "var(--color-primary-500)",
                                            }}
                                        />
                                        <label
                                            htmlFor="isActive"
                                            className="font-medium cursor-pointer"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            Aktifkan proses ini
                                        </label>
                                    </div>

                                    <div
                                        className="text-xs pl-8"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Proses yang aktif dapat digunakan untuk
                                        layanan laundry
                                    </div>
                                </div>
                            </div>

                            {Object.keys(errors).length > 0 && (
                                <Alert
                                    variant="error"
                                    title="Terdapat kesalahan pada form"
                                    description="Silakan periksa kembali semua field yang bertanda merah."
                                />
                            )}

                            <div
                                className="flex items-center justify-between pt-6 border-t"
                                style={{
                                    borderColor: "var(--color-border)",
                                }}
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => processService.goToIndex()}
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
                                        !data.name.trim() ||
                                        !isDirty
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

ProcessEdit.layout = withAuthenticatedLayout({
    title: "Edit Proses",
    searchable: false,
    breadcrumbs: [
        { label: "Proses", href: route("processes.index") },
        { label: "Edit" },
    ],
});

export default ProcessEdit;
