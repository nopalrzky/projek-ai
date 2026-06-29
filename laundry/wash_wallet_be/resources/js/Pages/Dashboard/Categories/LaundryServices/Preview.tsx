import { useState } from "react";
import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Layers } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Button } from "@/Components/Button";
import { LoadingSpinner } from "@/Components/Progress";
import { StatsCard } from "@/Components/Card";
import { Card } from "@/Components/Card";
import { categoryService } from "@/Services/category.service";
import { LaundryServicePreviewPageProps } from "./type";

function LaundryServicePreviewPage({
    category,
    type,
    preview = [],
    errors = [],
    total_rows = 0,
    has_more = false,
    file_name = "",
}: LaundryServicePreviewPageProps) {
    const hasErrors = errors.length > 0;
    const validCount = preview.length;
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);

    const handleConfirm = async () => {
        setConfirming(true);
        try {
            await categoryService.confirmLaundryServiceImport(category.id, {
                onSuccess: () => {
                    console.log(
                        "Laundry service import confirmed, redirecting to result...",
                    );
                },
                onError: (errors) => {
                    console.error("Confirm error:", errors);
                },
                onFinish: () => {
                    setConfirming(false);
                },
            });
        } catch (error) {
            console.error("Confirm failed:", error);
            setConfirming(false);
        }
    };

    const handleBack = () => {
        categoryService.goToImportLaundryServices(category.id);
    };

    if (loading) {
        return (
            <>
                <Head title="Processing Preview" />
                <div className="flex items-center justify-center min-h-screen">
                    <LoadingSpinner
                        size="xl"
                        label="Processing preview... Please wait"
                        type="spinner"
                        center
                    />
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`Preview Import Layanan - ${category.name}`} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div
                                className="p-2 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-success-100)",
                                }}
                            >
                                <Layers
                                    className="w-6 h-6"
                                    style={{
                                        color: "var(--color-success-600)",
                                    }}
                                />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    Preview Import Layanan
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-400">
                                    Kategori: {category.name}
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            File: {file_name}
                        </p>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatsCard
                            label="Total Baris"
                            value={total_rows}
                            icon={<AlertTriangle />}
                            variant="info"
                            description="Baris dalam file"
                            size="md"
                            elevated
                        />
                        <StatsCard
                            label="Data Valid"
                            value={validCount}
                            icon={<CheckCircle />}
                            variant="success"
                            description="Siap diimport"
                            size="md"
                            elevated
                        />
                        <StatsCard
                            label="Error"
                            value={errors.length}
                            icon={<XCircle />}
                            variant={hasErrors ? "danger" : "default"}
                            description={
                                hasErrors
                                    ? "Perlu diperbaiki"
                                    : "Tidak ada error"
                            }
                            size="md"
                            elevated
                        />
                    </div>

                    {/* Valid Data Preview */}
                    {preview.length > 0 && (
                        <Card>
                            <div className="p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            Preview Data Valid
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Menampilkan 10 baris pertama
                                        </p>
                                    </div>
                                    <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                                        ✓ {validCount} Valid
                                    </div>
                                </div>

                                <div className="overflow-x-auto border dark:border-gray-700 rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Nama Layanan
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Deskripsi
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    ID Unit
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                            {preview.map((row, idx) => (
                                                <tr
                                                    key={idx}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                        {row.name || "-"}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                        {row.description || "-"}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-center">
                                                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                                                            {row.unit_id ?? "-"}
                                                        </code>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {row.is_active ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                ✓ Aktif
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                                                ✗ Tidak Aktif
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {has_more && (
                                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                        ... dan {total_rows - 10} baris lainnya
                                    </p>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Errors List */}
                    {hasErrors && (
                        <Card>
                            <div className="p-6">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                                        Error Validasi
                                    </h3>
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        {errors.length} baris memiliki error
                                        validasi
                                    </p>
                                </div>

                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {errors.map((error, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg"
                                        >
                                            <div className="flex items-start gap-3">
                                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-red-900 dark:text-red-100 mb-1">
                                                        Baris {error.row}
                                                    </p>
                                                    <div className="mb-2">
                                                        <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                                                            Data:
                                                        </p>
                                                        <div className="text-sm text-red-800 dark:text-red-200 space-y-1">
                                                            {error.data
                                                                .name && (
                                                                <p>
                                                                    • Nama:{" "}
                                                                    <strong>
                                                                        {
                                                                            error
                                                                                .data
                                                                                .name
                                                                        }
                                                                    </strong>
                                                                </p>
                                                            )}
                                                            {error.data
                                                                .description && (
                                                                <p>
                                                                    • Deskripsi:{" "}
                                                                    {
                                                                        error
                                                                            .data
                                                                            .description
                                                                    }
                                                                </p>
                                                            )}
                                                            {error.data
                                                                .unit_id !==
                                                                undefined && (
                                                                <p>
                                                                    • ID Unit:{" "}
                                                                    <code>
                                                                        {
                                                                            error
                                                                                .data
                                                                                .unit_id
                                                                        }
                                                                    </code>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                                                            Error:
                                                        </p>
                                                        <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                                                            {error.errors.map(
                                                                (err, i) => (
                                                                    <li key={i}>
                                                                        • {err}
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </div>
                                                    <details className="mt-3">
                                                        <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                                                            Lihat data lengkap
                                                            (JSON)
                                                        </summary>
                                                        <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900/50 p-2 rounded overflow-x-auto">
                                                            {JSON.stringify(
                                                                error.data,
                                                                null,
                                                                2,
                                                            )}
                                                        </pre>
                                                    </details>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Warning/Success Message */}
                    {hasErrors ? (
                        <Card className="border-red-200 dark:border-red-800">
                            <div className="p-4 bg-red-50 dark:bg-red-950 flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                                        Tidak Dapat Melanjutkan dengan Error
                                    </h4>
                                    <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                                        Silakan perbaiki semua error di file
                                        Excel Anda dan upload ulang untuk
                                        melanjutkan.
                                    </p>
                                    <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">
                                        <p className="text-xs text-red-800 dark:text-red-200 font-medium mb-2">
                                            💡 Tips untuk memperbaiki:
                                        </p>
                                        <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                                            <li>
                                                • Pastikan kolom wajib diisi
                                                (bertanda *)
                                            </li>
                                            <li>
                                                • ID Unit harus valid dan ada di
                                                master data
                                            </li>
                                            <li>
                                                • Gunakan dropdown untuk kolom
                                                Status
                                            </li>
                                            <li>
                                                • Pastikan nama layanan + unit
                                                unik di kategori ini
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        preview.length > 0 && (
                            <Card className="border-green-200 dark:border-green-800">
                                <div className="p-4 bg-green-50 dark:bg-green-950 flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                                            Semua Data Valid!
                                        </h4>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            {validCount} layanan siap diimport
                                            ke kategori{" "}
                                            <strong>{category.name}</strong>.
                                            Klik "Konfirmasi Import" untuk
                                            melanjutkan.
                                        </p>
                                        <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                            <p className="text-xs text-green-800 dark:text-green-200">
                                                ℹ️ <strong>Catatan:</strong>{" "}
                                                Jika nama layanan + unit sudah
                                                ada, data akan diupdate. Import
                                                akan diproses di background.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-3 pt-6 border-t dark:border-gray-700">
                        <Button
                            variant="secondary"
                            onClick={handleBack}
                            disabled={confirming}
                        >
                            Kembali
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleConfirm}
                            disabled={hasErrors || confirming}
                            loading={confirming}
                            leftIcon={<CheckCircle className="w-5 h-5" />}
                        >
                            {hasErrors
                                ? "Perbaiki Error Terlebih Dahulu"
                                : "Konfirmasi Import"}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </>
    );
}

LaundryServicePreviewPage.layout = (page: any) => {
    const props = page.props as LaundryServicePreviewPageProps;
    return withAuthenticatedLayout({
        title: "Preview Import Layanan",
        breadcrumbs: [
            { label: "Categories", href: route("categories.index") },
            {
                label: props.category.name,
                href: route("categories.show", props.category.id),
            },
            {
                label: "Import Layanan",
                href: route(
                    "categories.laundry-services.import.create",
                    props.category.id,
                ),
            },
            { label: "Preview" },
        ],
    })(page);
};

export default LaundryServicePreviewPage;
