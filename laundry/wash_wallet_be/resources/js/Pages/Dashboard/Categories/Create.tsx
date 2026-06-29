import React from "react";
import { Head, useForm } from "@inertiajs/react";
import {
    Save,
    ArrowLeft,
    Layers,
    FileText,
    Building2,
    FolderPlus,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/Page/PageHeader";
import { Form } from "@/Components/Form";
import { Input, TextAreaInput, SelectInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { CategoryCreateProps } from "./types";
import { categoryService } from "@/Services/category.service";
import { CategoryFormData } from "@/types";

const CategoryCreate = ({ outlets }: CategoryCreateProps) => {
    const { data, setData, post, processing, errors, clearErrors, reset } =
        useForm<CategoryFormData>({
            name: "",
            description: "",
            outletId: 0,
        });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route("categories.store"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
            onError: (errors) => {
                console.error("Validation errors:", errors);
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
        });
    };

    const handleDataChange = (key: keyof CategoryFormData, value: any) => {
        setData(key, value);

        if (errors[key]) {
            clearErrors(key);
        }
    };

    const outletOptions = outlets.map((outlet) => ({
        value: outlet.id.toString(),
        label: `${outlet.name} (${outlet.code})`,
    }));

    return (
        <>
            <Head title="Tambah Kategori" />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Tambah Kategori Baru"
                        subtitle="Buat kategori baru untuk mengelompokkan produk laundry"
                        icon={FolderPlus}
                        actions={
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => categoryService.goToIndex()}
                                disabled={processing}
                                leftIcon={<ArrowLeft className="w-4 h-4" />}
                            >
                                Kembali
                            </Button>
                        }
                    />

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
                                            Pilih Outlet
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Tentukan outlet untuk kategori ini
                                        </p>
                                    </div>
                                </div>

                                <SelectInput
                                    label="Outlet"
                                    value={data.outletId}
                                    onChange={(e) =>
                                        handleDataChange(
                                            "outletId",
                                            e.target.value,
                                        )
                                    }
                                    error={errors.outletId}
                                    required
                                    disabled={processing}
                                    leftIcon={<Building2 className="w-5 h-5" />}
                                    hint="Pilih outlet tempat kategori ini akan digunakan"
                                    options={outletOptions}
                                    placeholder="Pilih outlet..."
                                />
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
                                        <Layers
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
                                            Informasi Kategori
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Detail dasar kategori produk
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
                                    onClick={() => categoryService.goToIndex()}
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
                                        !data.outletId
                                    }
                                    loading={processing}
                                    size="lg"
                                    leftIcon={<Save className="w-4 h-4" />}
                                >
                                    {processing
                                        ? "Menyimpan..."
                                        : "Buat Kategori"}
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </div>
            </div>
        </>
    );
};

CategoryCreate.layout = withAuthenticatedLayout({
    title: "Tambah Kategori",
    searchable: false,
    breadcrumbs: [
        { label: "Categories", href: route("categories.index") },
        { label: "Tambah Kategori" },
    ],
});

export default CategoryCreate;
