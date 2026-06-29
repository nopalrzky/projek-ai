import React, { useCallback } from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Save,
    ArrowLeft,
    Package,
    Hash,
    FileText,
    Shuffle,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import { Input, TextAreaInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { UnitsEditProps } from "./types";
import { UnitFormData } from "@/types";

const UnitsEdit = ({ unit }: UnitsEditProps) => {
    const { data, setData, put, processing, errors, reset, isDirty } =
        useForm<UnitFormData>({
            name: unit.name || "",
            symbol: unit.symbol || "",
            description: unit.description || "",
            isActive: unit.isActive || false,
        });

    // Generate symbol from name
    const generateSymbol = useCallback(() => {
        if (!data.name) return;

        const symbol = data.name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .slice(0, 5)
            .toUpperCase();

        setData("symbol", symbol);
    }, [data.name, setData]);

    // Handle name change and optionally auto-generate symbol
    const handleNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const name = e.target.value;
            setData("name", name);
        },
        [setData],
    );

    // Handle form submission
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        put(route("units.update", unit.id), {
            errorBag: "updateUnit",
            preserveState: false,
            preserveScroll: true,
        });
    };

    // Reset form to original values
    const handleReset = useCallback(() => {
        reset();
    }, [reset]);

    return (
        <>
            <Head title={`Edit Unit - ${unit.name}`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div>
                                <h1
                                    className="text-2xl font-bold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Edit Unit - {unit.name}
                                </h1>
                                <p
                                    className="mt-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Perbarui informasi satuan unit untuk layanan
                                    laundry
                                </p>
                            </div>
                        </div>

                        {/* Unsaved changes warning */}
                        {isDirty && (
                            <Alert
                                variant="info"
                                title="Ada perubahan yang belum disimpan"
                                description="Jangan lupa untuk menyimpan perubahan Anda."
                            />
                        )}
                    </motion.div>

                    {/* Form Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Card className="p-8">
                            <Form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Information Section */}
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
                                            <Package
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
                                                Informasi Dasar Unit
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Perbarui nama dan symbol untuk
                                                unit satuan
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Nama Unit"
                                            placeholder="Contoh: Kilogram, Pieces, Meter"
                                            value={data.name}
                                            onChange={handleNameChange}
                                            error={errors.name}
                                            required
                                            disabled={processing}
                                            leftIcon={
                                                <Package className="w-5 h-5" />
                                            }
                                            hint="Nama lengkap unit satuan"
                                        />

                                        <Input
                                            label="Symbol/Singkatan"
                                            placeholder="Contoh: kg, pcs, m"
                                            value={data.symbol}
                                            onChange={(e) =>
                                                setData(
                                                    "symbol",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.symbol}
                                            required
                                            disabled={processing}
                                            leftIcon={
                                                <Hash className="w-5 h-5" />
                                            }
                                            rightIcon={
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="xs"
                                                    onClick={generateSymbol}
                                                    disabled={
                                                        processing || !data.name
                                                    }
                                                    className="text-xs"
                                                    leftIcon={
                                                        <Shuffle className="w-3 h-3" />
                                                    }
                                                >
                                                    Generate
                                                </Button>
                                            }
                                            hint="Symbol pendek untuk unit (maks 10 karakter)"
                                            maxLength={10}
                                        />
                                    </div>
                                </div>

                                {/* Description Section */}
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
                                            <FileText
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
                                                Deskripsi Unit
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Perbarui deskripsi tambahan
                                                untuk unit ini (opsional)
                                            </p>
                                        </div>
                                    </div>

                                    <TextAreaInput
                                        label="Deskripsi"
                                        placeholder="Contoh: Unit satuan untuk menghitung berat pakaian dalam kilogram"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                "description",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.description}
                                        disabled={processing}
                                        hint="Deskripsi tambahan tentang penggunaan unit ini"
                                        rows={4}
                                        showCharacterCount={true}
                                        maxLength={500}
                                        autoResize={true}
                                        minRows={4}
                                        maxRows={8}
                                    />
                                </div>

                                {/* Global Error Alert */}
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
                                    <div className="flex items-center gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                window.history.back()
                                            }
                                            disabled={processing}
                                            leftIcon={
                                                <ArrowLeft className="w-4 h-4" />
                                            }
                                        >
                                            Kembali
                                        </Button>

                                        {isDirty && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleReset}
                                                disabled={processing}
                                            >
                                                Reset
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled={
                                                processing ||
                                                !data.name ||
                                                !data.symbol ||
                                                !isDirty
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

UnitsEdit.layout = withAuthenticatedLayout({
    title: "Edit Unit",
    breadcrumbs: [
        { label: "Units", href: route("units.index") },
        { label: "Edit" },
    ],
});

export default UnitsEdit;
