import React from "react";
import { Head, useForm } from "@inertiajs/react";
import { Save, ArrowLeft, Cog, FileText, Zap } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/Page/PageHeader";
import { Form } from "@/Components/Form";
import { Input, TextAreaInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { ProcessFormData } from "@/types";
import processService from "@/Services/process.service";
import { ProcessCreateProps } from "./types";

const ProcessCreate = ({ flash }: ProcessCreateProps) => {
    const { data, setData, post, processing, errors, clearErrors } =
        useForm<ProcessFormData>({
            name: "",
            description: "",
        });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route("processes.store"), {
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
            <Head title="Tambah Proses" />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Tambah Proses Baru"
                        subtitle="Buat proses baru untuk mengelola alur kerja layanan laundry"
                        icon={Zap}
                        actions={
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => processService.goToIndex()}
                                disabled={processing}
                                leftIcon={<ArrowLeft className="w-4 h-4" />}
                            >
                                Kembali
                            </Button>
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
                                            Detail dasar proses layanan
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
                                    disabled={processing || !data.name.trim()}
                                    loading={processing}
                                    size="lg"
                                    leftIcon={<Save className="w-4 h-4" />}
                                >
                                    {processing
                                        ? "Menyimpan..."
                                        : "Buat Proses"}
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </div>
            </div>
        </>
    );
};

ProcessCreate.layout = withAuthenticatedLayout({
    title: "Tambah Proses",
    searchable: false,
    breadcrumbs: [
        { label: "Proses", href: route("processes.index") },
        { label: "Tambah Proses" },
    ],
});

export default ProcessCreate;
