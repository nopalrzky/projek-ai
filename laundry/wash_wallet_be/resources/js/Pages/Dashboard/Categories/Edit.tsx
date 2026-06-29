import React from "react";
import { Head, useForm } from "@inertiajs/react";
import {
    Save,
    ArrowLeft,
    Layers,
    FileText,
    CheckSquare,
    Building2,
    Edit,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/Page/PageHeader";
import { Form } from "@/Components/Form";
import { Input, TextAreaInput, SelectInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { CategoryEditProps } from "./types";
import { categoryService } from "@/Services/category.service";
import { CategoryFormData } from "@/types";
const CategoryEdit = ({ category, outlets }: CategoryEditProps) => {
    const { data, setData, processing, put, errors, clearErrors, reset } =
        useForm<CategoryFormData>({
            name: category.name || "",
            description: category.description || "",
            outletId: category.outletId || 0,
            isActive: category.isActive ?? true,
        });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        put(route("categories.update", category.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
            onError: () => {
                console.log("Gagal memperbarui kategori");
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
        icon: <Building2 className="w-4 h-4" />,
        description: outlet.code ? `Kode: ${outlet.code}` : undefined,
    }));

    const selectedOutlet = outlets.find(
        (outlet) => outlet.id === data.outletId,
    );

    return (
        <>
            <Head title={`Edit Kategori - ${category.name}`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Edit Kategori"
                        subtitle={`Perbarui informasi kategori "${category.name}"`}
                        icon={Edit}
                        actions={
                            <div className="flex items-center gap-3">
                                <Badge
                                    variant={
                                        category.isActive
                                            ? "success"
                                            : "secondary"
                                    }
                                    className="text-xs"
                                >
                                    {category.isActive ? "Aktif" : "Nonaktif"}
                                </Badge>
                                <div
                                    className="text-xs px-2 py-1 rounded"
                                    style={{
                                        backgroundColor: "var(--color-surface)",
                                        color: "var(--color-text-tertiary)",
                                        border: "1px solid var(--color-border)",
                                    }}
                                >
                                    ID: {category.id}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        categoryService.goToView(category.id)
                                    }
                                    disabled={processing}
                                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                                >
                                    Kembali
                                </Button>
                            </div>
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
                                            Outlet
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Pilih outlet untuk kategori ini
                                        </p>
                                    </div>
                                </div>

                                <SelectInput
                                    label="Outlet"
                                    value={data.outletId?.toString() || ""}
                                    onChange={(e) =>
                                        handleDataChange(
                                            "outletId",
                                            parseInt(e.target.value),
                                        )
                                    }
                                    error={errors.outletId}
                                    required
                                    disabled={processing}
                                    leftIcon={<Building2 className="w-5 h-5" />}
                                    hint="Pilih outlet tempat kategori ini akan digunakan"
                                    options={outletOptions}
                                    placeholder="Pilih outlet..."
                                    searchable={true}
                                    clearable={false}
                                />

                                {selectedOutlet && (
                                    <div
                                        className="p-4 rounded-lg border"
                                        style={{
                                            backgroundColor:
                                                "var(--color-surface)",
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                style={{
                                                    backgroundColor:
                                                        "var(--color-primary-100)",
                                                }}
                                            >
                                                <Building2
                                                    className="w-5 h-5"
                                                    style={{
                                                        color: "var(--color-primary-600)",
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <h4
                                                    className="font-medium"
                                                    style={{
                                                        color: "var(--color-text-primary)",
                                                    }}
                                                >
                                                    {selectedOutlet.name}
                                                </h4>
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Kode: {selectedOutlet.code}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                                            Perbarui detail kategori produk
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
                                            Status Kategori
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Ubah status aktif kategori
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
                                            className="text-sm font-medium cursor-pointer"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            Kategori Aktif
                                        </label>
                                        <Badge
                                            variant={
                                                data.isActive
                                                    ? "success"
                                                    : "secondary"
                                            }
                                            className="text-xs"
                                        >
                                            {data.isActive
                                                ? "Aktif"
                                                : "Nonaktif"}
                                        </Badge>
                                    </div>

                                    <div
                                        className="text-xs pl-8"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        {data.isActive
                                            ? "Kategori aktif dapat digunakan untuk produk baru"
                                            : "Kategori nonaktif tidak akan muncul dalam pilihan produk baru"}
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
                                    onClick={() =>
                                        categoryService.goToView(category.id)
                                    }
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

CategoryEdit.layout = withAuthenticatedLayout({
    title: "Edit Kategori",
    searchable: false,
    breadcrumbs: [
        { label: "Kategori", href: route("categories.index") },
        { label: "Edit" },
    ],
});

export default CategoryEdit;
