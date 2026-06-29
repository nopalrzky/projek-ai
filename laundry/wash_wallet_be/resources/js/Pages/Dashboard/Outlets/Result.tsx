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
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Button } from "@/Components/Button";
import { Progress } from "@/Components/Progress";
import { StatsCard } from "@/Components/Card";
import { Card } from "@/Components/Card";
import outletService from "@/Services/outlet.service";
import { OutletResultPageProps } from "./types";

function OutletResultPage({ importLog, outlet }: OutletResultPageProps) {
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
        outletService.goToImport(outlet?.id);
    };

    const handleViewOutlets = () => {
        if (outlet?.id) {
            outletService.goToView(outlet.id);
        } else {
            outletService.goToIndex();
        }
    };

    const handleDownloadErrors = () => {
        outletService.downloadImportErrors(importLog.id, outlet?.id);
    };

    return (
        <>
            <Head title="Import Result" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Import Result
                        </h1>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                            {outlet
                                ? `Importing to ${outlet.name}`
                                : "Import progress and result"}
                        </p>
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
                                            {importLog.totalRows} rows processed
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
                                            {importLog.successCount} outlets
                                            imported successfully
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
                                            {importLog.successCount} outlets
                                            imported, {importLog.errorCount}{" "}
                                            rows failed
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
                                                "Please check the errors below"}
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
                                Progress
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
                                rows processed
                            </div>
                        </div>
                    </Card>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatsCard
                            label="Total Rows"
                            value={importLog.totalRows}
                            icon={<AlertTriangle />}
                            variant="info"
                            description="In import file"
                            size="md"
                            elevated
                        />
                        <StatsCard
                            label="Success"
                            value={importLog.successCount}
                            icon={<CheckCircle />}
                            variant="success"
                            description="Imported successfully"
                            size="md"
                            elevated
                        />
                        <StatsCard
                            label="Failed"
                            value={importLog.errorCount}
                            icon={<XCircle />}
                            variant={importLog.hasErrors ? "danger" : "default"}
                            description={
                                importLog.hasErrors
                                    ? "With errors"
                                    : "No errors"
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
                                            Started:
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
                                            Completed:
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
                                            Duration:
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
                                            Import Errors
                                        </h3>
                                        <p className="text-sm text-red-700 dark:text-red-300">
                                            {importLog.errorsCount ||
                                                importLog.errorCount}{" "}
                                            error(s) found
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
                                        Download
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
                                                    <p className="font-semibold text-red-900 dark:text-red-100 mb-1">
                                                        {
                                                            error.formattedRowNumber
                                                        }
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
                                                    <details className="mt-2">
                                                        <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                                                            Show data
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

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t dark:border-gray-700">
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                leftIcon={<RefreshCw className="w-5 h-5" />}
                                onClick={handleImportAgain}
                            >
                                Import Again
                            </Button>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="primary"
                                leftIcon={<ArrowRight className="w-5 h-5" />}
                                onClick={handleViewOutlets}
                            >
                                View Outlets
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}

OutletResultPage.layout = withAuthenticatedLayout({
    title: "Import Result",
    breadcrumbs: [
        { label: "Outlets", href: route("outlets.index") },
        { label: "Import", href: route("outlets.import.index") },
        { label: "Result" },
    ],
});

export default OutletResultPage;
