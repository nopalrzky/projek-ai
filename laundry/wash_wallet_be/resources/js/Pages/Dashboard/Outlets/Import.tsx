import { useState, useCallback } from "react";
import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Download,
    Upload,
    FileSpreadsheet,
    AlertCircle,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { FileInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import outletService from "@/Services/outlet.service";
import { OutletImportPageProps } from "./types";

function OutletImportPage({ type, config, flash }: OutletImportPageProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleDownloadTemplate = useCallback(() => {
        outletService.downloadTemplate();
    }, []);

    const handleFileSelect = useCallback((files: File[]) => {
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
        }
    }, []);

    const handleUpload = useCallback(async () => {
        if (!selectedFile) return;

        setUploading(true);

        try {
            await outletService.uploadImportFile(
                {
                    file: selectedFile,
                    type: "outlet",
                },
                {
                    onSuccess: () => {
                        console.log(
                            "Upload successful, redirecting to preview...",
                        );
                    },
                    onError: (errors) => {
                        console.error("Upload error:", errors);
                    },
                    onFinish: () => {
                        setUploading(false);
                    },
                },
            );
        } catch (error) {
            console.error("Upload failed:", error);
            setUploading(false);
        }
    }, [selectedFile]);

    const handleCancel = useCallback(() => {
        outletService.goToIndex();
    }, []);

    return (
        <>
            <Head title="Import Outlets" />
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
                            Import Outlets
                        </h1>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                            Import multiple outlets at once using Excel template
                        </p>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <Alert
                            variant="success"
                            title="Success"
                            description={flash.success}
                        />
                    )}

                    {flash?.error && (
                        <Alert
                            variant="error"
                            title="Error"
                            description={flash.error}
                        />
                    )}

                    {/* Step 1: Download Template */}
                    <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                    1
                                </span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                    Download Template
                                </h3>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                                    Download template Excel, fill it with your
                                    outlet data, then save the file.
                                </p>

                                <div className="bg-white dark:bg-blue-900/50 rounded-lg p-4 mb-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            Template Contents:
                                        </span>
                                    </div>
                                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 dark:text-blue-400">
                                                •
                                            </span>
                                            <span>
                                                <strong>
                                                    Instructions Sheet:
                                                </strong>{" "}
                                                Complete filling guide
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 dark:text-blue-400">
                                                •
                                            </span>
                                            <span>
                                                <strong>Data Sheet:</strong>{" "}
                                                Columns to fill
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 dark:text-blue-400">
                                                •
                                            </span>
                                            <span>
                                                <strong>
                                                    Dropdown Validation:
                                                </strong>{" "}
                                                Pre-defined options
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 dark:text-blue-400">
                                                •
                                            </span>
                                            <span>
                                                <strong>Example Data:</strong>{" "}
                                                First row with sample
                                            </span>
                                        </li>
                                    </ul>
                                </div>

                                <Button
                                    variant="primary"
                                    onClick={handleDownloadTemplate}
                                    leftIcon={<Download className="w-5 h-5" />}
                                >
                                    Download Template Excel
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Step 2: Upload File */}
                    <Card className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                <span className="text-xl font-bold text-gray-600 dark:text-gray-400">
                                    2
                                </span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Upload Filled Template
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    After filling the template, upload your
                                    Excel file here for validation.
                                </p>

                                <FileInput
                                    label=""
                                    onFileSelect={handleFileSelect}
                                    files={selectedFile ? [selectedFile] : []}
                                    accept=".xlsx,.csv,.xls"
                                    maxFileSize={10 * 1024 * 1024}
                                    allowedFileTypes={[".xlsx", ".csv", ".xls"]}
                                    dragAndDrop={true}
                                    preview={false}
                                    showFileList={true}
                                />

                                {selectedFile && (
                                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                                <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-green-900 dark:text-green-100">
                                                    File Selected
                                                </p>
                                                <p className="text-sm text-green-700 dark:text-green-300">
                                                    {selectedFile.name} (
                                                    {(
                                                        selectedFile.size /
                                                        1024 /
                                                        1024
                                                    ).toFixed(2)}{" "}
                                                    MB)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Important Notes */}
                    <Card className="p-6 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                                    Important Notes
                                </h4>
                                <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                                    <li>
                                        • Fill all required fields (marked with
                                        *)
                                    </li>
                                    <li>• Use provided dropdown format</li>
                                    <li>• Don't change column headers</li>
                                    <li>• Maximum file size: 10MB</li>
                                    <li>
                                        • Data will be validated before import
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t dark:border-gray-700">
                        <Button variant="secondary" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                            loading={uploading}
                            leftIcon={<Upload className="w-5 h-5" />}
                        >
                            {uploading ? "Uploading..." : "Continue to Preview"}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </>
    );
}

OutletImportPage.layout = withAuthenticatedLayout({
    title: "Import Outlets",
    breadcrumbs: [
        { label: "Outlets", href: route("outlets.index") },
        { label: "Import", href: route("outlets.import.index") },
    ],
});

export default OutletImportPage;
