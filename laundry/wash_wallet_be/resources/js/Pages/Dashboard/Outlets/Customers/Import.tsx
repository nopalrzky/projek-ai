import { useState, useCallback } from "react";
import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Download,
    Upload,
    FileSpreadsheet,
    AlertCircle,
    Building2,
    Users,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { FileInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import outletService from "@/Services/outlet.service";
import { CustomerImportPageProps } from "./types";

function CustomerImportPage({
    outlet,
    type,
    config,
    flash,
}: CustomerImportPageProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleDownloadTemplate = useCallback(() => {
        outletService.downloadCustomerTemplate(outlet.id);
    }, [outlet.id]);

    const handleFileSelect = useCallback((files: File[]) => {
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
        }
    }, []);

    const handleUpload = useCallback(async () => {
        if (!selectedFile) return;

        setUploading(true);

        try {
            await outletService.uploadCustomerImportFile(
                outlet.id,
                { file: selectedFile, type: "customer" },
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
    }, [selectedFile, outlet.id]);

    const handleCancel = useCallback(() => {
        outletService.goToView(outlet.id);
    }, [outlet.id]);

    return (
        <>
            <Head title={`Import Customer - ${outlet.name}`} />
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
                                            "var(--color-success-100)",
                                    }}
                                >
                                    <Users
                                        className="w-6 h-6"
                                        style={{
                                            color: "var(--color-success-600)",
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    Import Customer
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-400">
                                    {outlet.name} ({outlet.code})
                                </p>
                            </div>
                        </div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Import multiple customers at once using Excel
                            template
                        </p>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <Alert
                            variant="success"
                            title="Berhasil"
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
                                    Download template Excel, isi dengan data
                                    customer Anda, kemudian simpan file
                                    tersebut.
                                </p>

                                <div className="bg-white dark:bg-blue-900/50 rounded-lg p-4 mb-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            Isi Template:
                                        </span>
                                    </div>
                                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 dark:text-blue-400">
                                                •
                                            </span>
                                            <span>
                                                <strong>Nama Customer*:</strong>{" "}
                                                Nama lengkap customer
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 dark:text-blue-400">
                                                •
                                            </span>
                                            <span>
                                                <strong>Email:</strong> Alamat
                                                email customer (opsional)
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 dark:text-blue-400">
                                                •
                                            </span>
                                            <span>
                                                <strong>Telepon*:</strong> Nomor
                                                telepon customer
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 dark:text-blue-400">
                                                •
                                            </span>
                                            <span>
                                                <strong>Alamat:</strong> Alamat
                                                lengkap customer
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 dark:text-blue-400">
                                                •
                                            </span>
                                            <span>
                                                <strong>Jenis Kelamin:</strong>{" "}
                                                Laki-laki / Perempuan
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 dark:text-blue-400">
                                                •
                                            </span>
                                            <span>
                                                <strong>Status:</strong> Aktif /
                                                Tidak Aktif
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
                                    Upload Template yang Sudah Diisi
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Setelah mengisi template, upload file Excel
                                    Anda di sini untuk validasi.
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
                                                    File Terpilih
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
                                    Catatan Penting
                                </h4>
                                <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                                    <li>
                                        • Isi semua kolom yang wajib (ditandai
                                        dengan *)
                                    </li>
                                    <li>
                                        • Customer akan ditambahkan ke outlet:{" "}
                                        <strong>{outlet.name}</strong>
                                    </li>
                                    <li>
                                        • Nomor telepon harus unik per outlet
                                    </li>
                                    <li>
                                        • Jika nomor telepon sudah ada di outlet
                                        yang sama, data akan diupdate
                                    </li>
                                    <li>
                                        • Email harus dalam format yang valid
                                    </li>
                                    <li>
                                        • Gunakan format dropdown untuk Jenis
                                        Kelamin dan Status
                                    </li>
                                    <li>
                                        • Jangan ubah header kolom di template
                                    </li>
                                    <li>• Maksimal ukuran file: 10MB</li>
                                    <li>
                                        • Data akan divalidasi sebelum import
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Card>

                    {/* Example Data */}
                    <Card className="p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                            Contoh Data:
                        </h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                                            Nama Customer
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                                            Email
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                                            Telepon
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                                            Alamat
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                                            Jenis Kelamin
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    <tr>
                                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                            John Doe
                                        </td>
                                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                            john.doe@example.com
                                        </td>
                                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                            081234567890
                                        </td>
                                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                            Jl. Sudirman No. 123
                                        </td>
                                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                            Laki-laki
                                        </td>
                                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                            Aktif
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                            Jane Smith
                                        </td>
                                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                            jane.smith@example.com
                                        </td>
                                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                            081298765432
                                        </td>
                                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                            Jl. Thamrin No. 456
                                        </td>
                                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                            Perempuan
                                        </td>
                                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                            Aktif
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t dark:border-gray-700">
                        <Button
                            variant="secondary"
                            onClick={handleCancel}
                            leftIcon={<ArrowLeft className="w-5 h-5" />}
                        >
                            Kembali
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                            loading={uploading}
                            leftIcon={<Upload className="w-5 h-5" />}
                        >
                            {uploading
                                ? "Uploading..."
                                : "Lanjutkan ke Preview"}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </>
    );
}

CustomerImportPage.layout = (page: any) => {
    const props = page.props as CustomerImportPageProps;
    return withAuthenticatedLayout({
        title: "Import Customer",
        breadcrumbs: [
            { label: "Outlets", href: route("outlets.index") },
            {
                label: props.outlet.name,
                href: route("outlets.show", props.outlet.id),
            },
            { label: "Import Customer" },
        ],
    })(page);
};

export default CustomerImportPage;
