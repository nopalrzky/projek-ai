import React from "react";
import { Head, useForm } from "@inertiajs/react";
import {
    Save,
    ArrowLeft,
    DollarSign,
    FileText,
    CalendarClock,
    Users,
    Edit,
    Banknote,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/Page/PageHeader";
import { Form } from "@/Components/Form";
import { Input, TextAreaInput, SelectInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { SalaryFormData } from "@/types";
import salaryService from "@/Services/salary.service";
import { SalaryEditProps } from "./types";

const SalariesEdit = ({ salary }: SalaryEditProps) => {
    const { data, setData, processing, errors, clearErrors, put, isDirty } =
        useForm<SalaryFormData>({
            name: salary.name || "",
            description: salary.description || "",
            type: salary.type || "",
        });

    const salaryTypes: Record<string, string> = {
        daily: "Harian",
        monthly: "Bulanan",
        hourly: "Per Jam",
        once: "Sekali",
        overtime: "Lembur",
        allowance: "Tunjangan",
    };

    const typeOptions = [
        { value: "", label: "Pilih Tipe Gaji" },
        ...Object.entries(salaryTypes).map(([value, label]) => ({
            value,
            label,
        })),
    ];

    const getTypeBadgeVariant = (type: string) => {
        const variants: Record<string, any> = {
            daily: "info",
            monthly: "primary",
            hourly: "warning",
            once: "secondary",
            overtime: "danger",
            allowance: "success",
        };
        return variants[type] || "secondary";
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        put(route("salaries.update", salary.id), {
            preserveScroll: true,
            onError: () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
        });
    };

    const handleDataChange = (key: keyof SalaryFormData, value: any) => {
        setData(key, value);

        if (errors[key]) {
            clearErrors(key);
        }
    };

    const hasEmployees = salary.employeeSalariesCount > 0;

    return (
        <>
            <Head title={`Edit Komponen Gaji - ${salary.name}`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Edit Komponen Gaji"
                        subtitle={`Perbarui informasi komponen gaji "${salary.name}"`}
                        icon={Edit}
                        actions={
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="text-xs">
                                    {data.type
                                        ? salaryTypes[data.type]
                                        : "Tipe Belum Dipilih"}
                                </Badge>
                                <div
                                    className="text-xs px-2 py-1 rounded"
                                    style={{
                                        backgroundColor: "var(--color-surface)",
                                        color: "var(--color-text-tertiary)",
                                        border: "1px solid var(--color-border)",
                                    }}
                                >
                                    ID: {salary.id}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => salaryService.goToIndex()}
                                    disabled={processing}
                                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                                >
                                    Kembali
                                </Button>
                            </div>
                        }
                    />

                    {hasEmployees && (
                        <Alert
                            variant="warning"
                            title="Komponen Gaji Sedang Digunakan"
                            description={`Komponen gaji ini sedang digunakan oleh ${salary.employeeSalariesCount} karyawan. Perubahan yang Anda lakukan akan mempengaruhi perhitungan gaji mereka.`}
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
                                        <DollarSign
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
                                            Informasi Komponen Gaji
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Atur nama dan tipe untuk komponen
                                            gaji
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Nama Komponen Gaji"
                                        placeholder="Contoh: Gaji Pokok, Tunjangan Transport, Bonus"
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
                                            <DollarSign className="w-5 h-5" />
                                        }
                                        hint="Nama komponen gaji yang akan ditampilkan"
                                    />

                                    <div>
                                        <SelectInput
                                            label="Tipe Gaji"
                                            value={data.type}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "type",
                                                    e.target.value as any,
                                                )
                                            }
                                            options={typeOptions}
                                            error={errors.type}
                                            required
                                            disabled={processing}
                                            hint="Periode perhitungan gaji"
                                        />

                                        {data.type && (
                                            <div className="flex items-center gap-2 pt-2">
                                                <span
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Tipe yang dipilih:
                                                </span>
                                                <Badge
                                                    variant={getTypeBadgeVariant(
                                                        data.type,
                                                    )}
                                                    size="sm"
                                                >
                                                    <div className="flex items-center gap-1">
                                                        <CalendarClock className="w-3 h-3" />
                                                        {salaryTypes[data.type]}
                                                    </div>
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
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
                                            Deskripsi Komponen Gaji
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Berikan deskripsi tambahan untuk
                                            komponen gaji ini (opsional)
                                        </p>
                                    </div>
                                </div>

                                <TextAreaInput
                                    label="Deskripsi"
                                    placeholder="Jelaskan jenis dan penggunaan komponen gaji ini..."
                                    value={data.description}
                                    onChange={(e) =>
                                        handleDataChange(
                                            "description",
                                            e.target.value,
                                        )
                                    }
                                    error={errors.description}
                                    disabled={processing}
                                    hint="Deskripsi detail tentang komponen gaji ini (opsional)"
                                    rows={4}
                                    maxLength={1000}
                                    showCharacterCount={true}
                                    autoResize={true}
                                    minRows={4}
                                    maxRows={8}
                                    leftIcon={<FileText className="w-5 h-5" />}
                                />
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
                                    onClick={() => salaryService.goToIndex()}
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
                                        !data.type ||
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

SalariesEdit.layout = withAuthenticatedLayout({
    title: "Edit Komponen Gaji",
    searchable: false,
    breadcrumbs: [
        { label: "Komponen Gaji", href: route("salaries.index") },
        { label: "Edit" },
    ],
});

export default SalariesEdit;
