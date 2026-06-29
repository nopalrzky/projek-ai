import { useEffect, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Download,
    RefreshCw,
    ArrowRight,
    Layers,
    Building2,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Button } from "@/Components/Button";
import { Progress } from "@/Components/Progress";
import { StatsCard } from "@/Components/Card";
import { Card } from "@/Components/Card";
import outletService from "@/Services/outlet.service";
import { CategoryResultPageProps } from "./types";

function CategoryResultPage({ importLog, outlet }: CategoryResultPageProps) {
    const [polling, setPolling] = useState(
        importLog.isPending || importLog.isProcessing
    );

    useEffect(() => {
        if (importLog.isPending || importLog.isProcessing) {
            const interval = setInterval(() => {
                router.reload({ only: ["importLog"] });
            }, 2000);

            return () => clearInterval(interval);
        } else {
            setPolling(false);
        }
    }, [importLog.status]);

    const handleImportAgain = () => {
        outletService.goToImportCategories(outlet.id);
    };

    const handleViewOutlet = () => {
        outletService.goToView(outlet.id);
    };

    const handleDownloadErrors = () => {
        outletService.downloadCategoryImportErrors(outlet.id, importLog.id);
    };

    return (
        <>
            <Head title={`Import Result - ${outlet.name}`} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                                <div
                                    className="p-2 rounded-lg"
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
                                <div
                                    className="p-2 rounded-lg"
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
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    Hasil Import Kategori
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-400">
                                    {outlet.name} ({outlet.code})
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            File: {importLog.fileName}
                        </p>
                    </div>

                    {/* Status Card */}
                    <Card>
                        <div className="p-6">
                            {importLog.isProcessing && (
                                <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400" />
                                    <div className="flex-1">
                                        <div className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                            {importLog.formattedStatus}
                                        </div>
                                        <div className="text-sm text-blue-700 dark:text-blue-300">
                                            {importLog.successCount} /{" "}
                                            {importLog.totalRows} kategori
                                            diproses
                                        </div>
                                    </div>
                                </div>
                            )}

                            {importLog.isCompleted && !importLog.hasErrors && (
                                <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="font-semibold text-green-900 dark:text-green-100 mb-1">
                                            ✓ {importLog.formattedStatus}!
                                        </div>
                                        <div className="text-sm text-green-700 dark:text-green-300">
                                            {importLog.successCount} kategori
                                            berhasil diimport ke{" "}
                                            <strong>{outlet.name}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {importLog.isCompleted && importLog.hasErrors && (
                                <div className="flex items-center gap-4 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <AlertTriangle className="w-10 h-10 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                                            ⚠ {importLog.formattedStatus}
                                        </div>
                                        <div className="text-sm text-yellow-700 dark:text-yellow-300">
                                            {importLog.successCount} kategori
                                            berhasil, {importLog.errorCount}{" "}
                                            baris gagal
                                        </div>
                                    </div>
                                </div>
                            )}

                            {importLog.isFailed && (
                                <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                                    <XCircle className="w-10 h-10 text-red-600 dark:text-red-400 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="font-semibold text-red-900 dark:text-red-100 mb-1">
                                            ✗ {importLog.formattedStatus}
                                        </div>
                                        <div className="text-sm text-red-700 dark:text-red-300">
                                            {importLog.errorMessage ||
                                                "Silakan periksa error di bawah"}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Progress Bar */}
                    <Card>
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Progress Import
                            </h3>
                            <Progress
                                value={importLog.progressPercentage}
                                max={100}
                                showLabel
                                labelPosition="right"
                                size="lg"
                                variant={
                                    importLog.isCompleted &&
                                    !importLog.hasErrors
                                        ? "success"
                                        : importLog.hasErrors
                                        ? "warning"
                                        : "primary"
                                }
                                animated={importLog.isProcessing}
                                indeterminate={
                                    importLog.isProcessing &&
                                    importLog.successCount === 0
                                }
                            />
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                                {importLog.formattedProgress} •{" "}
                                {importLog.successCount} / {importLog.totalRows}{" "}
                                baris diproses
                            </div>
                        </div>
                    </Card>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatsCard
                            label="Total Baris"
                            value={importLog.totalRows}
                            icon={<AlertTriangle />}
                            variant="info"
                            description="Dalam file import"
                            size="md"
                            elevated
                        />
                        <StatsCard
                            label="Berhasil"
                            value={importLog.successCount}
                            icon={<CheckCircle />}
                            variant="success"
                            description="Kategori berhasil diimport"
                            size="md"
                            elevated
                        />
                        <StatsCard
                            label="Gagal"
                            value={importLog.errorCount}
                            icon={<XCircle />}
                            variant={importLog.hasErrors ? "danger" : "default"}
                            description={
                                importLog.hasErrors
                                    ? "Dengan error"
                                    : "Tidak ada error"
                            }
                            size="md"
                            elevated
                        />
                    </div>

                    {/* Time Info */}
                    {importLog.isCompleted && (
                        <Card variant="default">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Dimulai:
                                        </span>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {importLog.startedAt
                                                ? new Date(
                                                      importLog.startedAt
                                                  ).toLocaleString("id-ID")
                                                : "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Selesai:
                                        </span>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {importLog.completedAt
                                                ? new Date(
                                                      importLog.completedAt
                                                  ).toLocaleString("id-ID")
                                                : "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Durasi:
                                        </span>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {importLog.formattedDuration || "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Error List */}
                    {importLog.hasErrors && importLog.errors && (
                        <Card>
                            <div className="p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                                            Error Import
                                        </h3>
                                        <p className="text-sm text-red-700 dark:text-red-300">
                                            {importLog.errorsCount ||
                                                importLog.errorCount}{" "}
                                            error ditemukan
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        leftIcon={
                                            <Download className="w-4 h-4" />
                                        }
                                        onClick={handleDownloadErrors}
                                    >
                                        Download Error
                                    </Button>
                                </div>

                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {importLog.errors.map((error) => (
                                        <div
                                            key={error.id}
                                            className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg"
                                        >
                                            <div className="flex items-start gap-3">
                                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-red-900 dark:text-red-100 mb-2">
                                                        {
                                                            error.formattedRowNumber
                                                        }
                                                    </p>

                                                    {/* Data Preview */}
                                                    {error.data && (
                                                        <div className="mb-3 p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">
                                                            <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-2">
                                                                📄 Data:
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
                                                                    .code && (
                                                                    <p>
                                                                        • Kode:{" "}
                                                                        <code className="px-1.5 py-0.5 bg-red-200 dark:bg-red-800 rounded text-xs">
                                                                            {
                                                                                error
                                                                                    .data
                                                                                    .code
                                                                            }
                                                                        </code>
                                                                    </p>
                                                                )}
                                                                {error.data
                                                                    .description && (
                                                                    <p>
                                                                        •
                                                                        Deskripsi:{" "}
                                                                        {
                                                                            error
                                                                                .data
                                                                                .description
                                                                        }
                                                                    </p>
                                                                )}
                                                                {error.data
                                                                    .order !==
                                                                    undefined && (
                                                                    <p>
                                                                        •
                                                                        Urutan:{" "}
                                                                        {
                                                                            error
                                                                                .data
                                                                                .order
                                                                        }
                                                                    </p>
                                                                )}
                                                                {error.data
                                                                    .is_active !==
                                                                    undefined && (
                                                                    <p>
                                                                        •
                                                                        Status:{" "}
                                                                        {error
                                                                            .data
                                                                            .is_active
                                                                            ? "Aktif"
                                                                            : "Tidak Aktif"}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Error Messages */}
                                                    <div>
                                                        <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                                                            ⚠️ Error:
                                                        </p>
                                                        <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                                                            {error.errors.map(
                                                                (err, i) => (
                                                                    <li key={i}>
                                                                        • {err}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    </div>

                                                    {/* Raw JSON */}
                                                    <details className="mt-3">
                                                        <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                                                            Lihat data lengkap
                                                            (JSON)
                                                        </summary>
                                                        <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900/50 p-2 rounded overflow-x-auto">
                                                            {JSON.stringify(
                                                                error.data,
                                                                null,
                                                                2
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

                    {/* Summary Card */}
                    {importLog.isCompleted && (
                        <Card className="border-blue-200 dark:border-blue-800">
                            <div className="p-4 bg-blue-50 dark:bg-blue-950">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                        <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                            Ringkasan Import
                                        </h4>
                                        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                            <p>
                                                • Total baris diproses:{" "}
                                                <strong>
                                                    {importLog.totalRows}
                                                </strong>
                                            </p>
                                            <p>
                                                • Kategori berhasil diimport:{" "}
                                                <strong className="text-green-600 dark:text-green-400">
                                                    {importLog.successCount}
                                                </strong>
                                            </p>
                                            {importLog.hasErrors && (
                                                <p>
                                                    • Baris dengan error:{" "}
                                                    <strong className="text-red-600 dark:text-red-400">
                                                        {importLog.errorCount}
                                                    </strong>
                                                </p>
                                            )}
                                            <p>
                                                • Outlet tujuan:{" "}
                                                <strong>
                                                    {outlet.name} ({outlet.code}
                                                    )
                                                </strong>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t dark:border-gray-700">
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                leftIcon={<RefreshCw className="w-5 h-5" />}
                                onClick={handleImportAgain}
                            >
                                Import Lagi
                            </Button>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="primary"
                                leftIcon={<ArrowRight className="w-5 h-5" />}
                                onClick={handleViewOutlet}
                            >
                                Lihat Kategori Outlet
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}

CategoryResultPage.layout = (page: any) => {
    const props = page.props as CategoryResultPageProps;
    return withAuthenticatedLayout({
        title: "Hasil Import Kategori",
        breadcrumbs: [
            { label: "Outlets", href: route("outlets.index") },
            {
                label: props.outlet.name,
                href: route("outlets.show", props.outlet.id),
            },
            {
                label: "Import Kategori",
                href: route(
                    "outlets.categories.import.create",
                    props.outlet.id
                ),
            },
            { label: "Hasil" },
        ],
    })(page);
};

export default CategoryResultPage;
