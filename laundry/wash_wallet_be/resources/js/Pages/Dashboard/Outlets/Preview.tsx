import { useState } from "react";
import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Button } from "@/Components/Button";
import { LoadingSpinner } from "@/Components/Progress";
import { StatsCard } from "@/Components/Card";
import { Card } from "@/Components/Card";
import outletService from "@/Services/outlet.service";

interface PreviewError {
    row: number;
    data: Record<string, any>;
    errors: string[];
}

interface OutletPreviewPageProps {
    preview: Record<string, any>[];
    errors: PreviewError[];
    total_rows: number;
    has_more: boolean;
    file_name: string;
}

function OutletPreviewPage({
    preview = [],
    errors = [],
    total_rows = 0,
    has_more = false,
    file_name = "",
}: OutletPreviewPageProps) {
    const hasErrors = errors.length > 0;
    const validCount = preview.length;
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);

    const handleConfirm = async () => {
        setConfirming(true);
        try {
            await outletService.confirm({
                onSuccess: () => {
                    console.log("Import confirmed, redirecting to result...");
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
        outletService.goToImport();
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
            <Head title="Preview Import Data" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Preview Import Data
                        </h1>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                            Review data before importing
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            File: {file_name}
                        </p>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatsCard
                            label="Total Rows"
                            value={total_rows}
                            icon={<AlertTriangle />}
                            variant="info"
                            description="Rows in file"
                            size="md"
                            elevated
                        />
                        <StatsCard
                            label="Valid Rows"
                            value={validCount}
                            icon={<CheckCircle />}
                            variant="success"
                            description="Ready to import"
                            size="md"
                            elevated
                        />
                        <StatsCard
                            label="Errors"
                            value={errors.length}
                            icon={<XCircle />}
                            variant={hasErrors ? "danger" : "default"}
                            description={
                                hasErrors ? "Need attention" : "No errors"
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
                                            Valid Data Preview
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Showing first 10 rows
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
                                                {Object.keys(
                                                    preview[0] || {},
                                                ).map((key) => (
                                                    <th
                                                        key={key}
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                                    >
                                                        {key.replace(/_/g, " ")}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                            {preview.map((row, idx) => (
                                                <tr
                                                    key={idx}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    {Object.values(row).map(
                                                        (value: any, i) => (
                                                            <td
                                                                key={i}
                                                                className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap"
                                                            >
                                                                {typeof value ===
                                                                "boolean"
                                                                    ? value
                                                                        ? "Yes"
                                                                        : "No"
                                                                    : String(
                                                                          value ??
                                                                              "-",
                                                                      )}
                                                            </td>
                                                        ),
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {has_more && (
                                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                        ... and {total_rows - 10} more rows
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
                                        Validation Errors
                                    </h3>
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        {errors.length} row(s) have validation
                                        errors
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
                                                        Row {error.row}
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
                                                    <details className="mt-2">
                                                        <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                                                            Show data
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
                        <Card variant="outlined">
                            <div className="p-4 flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                                        Cannot Proceed with Errors
                                    </h4>
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        Please fix all errors in your Excel file
                                        and re-upload to continue.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        preview.length > 0 && (
                            <Card variant="elevated">
                                <div className="p-4 flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                                            All Data Valid!
                                        </h4>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            {validCount} rows are ready to be
                                            imported. Click "Confirm Import" to
                                            proceed.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        )
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t dark:border-gray-700">
                        <Button
                            variant="secondary"
                            onClick={handleBack}
                            disabled={confirming}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleConfirm}
                            disabled={hasErrors || confirming}
                            loading={confirming}
                            leftIcon={<CheckCircle className="w-5 h-5" />}
                        >
                            {hasErrors ? "Fix Errors First" : "Confirm Import"}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </>
    );
}

OutletPreviewPage.layout = withAuthenticatedLayout({
    title: "Preview Import",
    breadcrumbs: [
        { label: "Outlets", href: route("outlets.index") },
        { label: "Import", href: route("outlets.import.index") },
        { label: "Preview" },
    ],
});

export default OutletPreviewPage;
