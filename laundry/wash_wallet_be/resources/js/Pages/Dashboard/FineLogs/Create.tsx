import { useCallback, useEffect, useMemo, useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import axios from "axios";
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    Calendar,
    DollarSign,
    FileText,
    Paperclip,
    Receipt,
    Save,
    Users,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Alert } from "@/Components/Alert";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import { Card } from "@/Components/Card";
import { Form } from "@/Components/Form";
import {
    DateInput,
    FileInput,
    NumberInput,
    SelectInput,
    TextAreaInput,
} from "@/Components/Input";
import PageHeader from "@/Components/Page/PageHeader";
import { Employee, Fine, FineLogFormData } from "@/types";
import { formatCurrency } from "@/lib/utils";
import fineLogService from "@/Services/fine_log.service";
import { FineLogCreateProps } from "./types";

const FineLogCreate = ({ outlets, flash }: FineLogCreateProps) => {
    const { data, setData, post, processing, errors, clearErrors, reset } =
        useForm<FineLogFormData>({
            employeeId: "",
            fineId: "",
            outletId: "",
            amount: "",
            date: new Date().toISOString().split("T")[0],
            reason: "",
            attachment: null,
        });

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [fines, setFines] = useState<Fine[]>([]);

    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [loadingFines, setLoadingFines] = useState(false);
    const [employeesError, setEmployeesError] = useState<string | null>(null);
    const [finesError, setFinesError] = useState<string | null>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const loadOptionsByOutlet = useCallback(async (outletId: number) => {
        if (!outletId) {
            setEmployees([]);
            setFines([]);
            return;
        }

        setData((prev) => ({
            ...prev,
            employeeId: "",
            fineId: "",
        }));

        try {
            setLoadingEmployees(true);
            setEmployeesError(null);

            const employeeResponse = await axios.get(
                route("api.employees.index", { outletId }),
            );
            setEmployees(employeeResponse.data?.data ?? []);
        } catch (error: any) {
            console.error("Error loading employees:", error);
            setEmployeesError(
                error.response?.data?.message ||
                    error.message ||
                    "Gagal memuat data karyawan",
            );
            setEmployees([]);
        } finally {
            setLoadingEmployees(false);
        }

        try {
            setLoadingFines(true);
            setFinesError(null);

            const fineResponse = await axios.get(
                route("api.fines.by-outlet", { outletId }),
            );
            setFines(fineResponse.data?.data ?? []);
        } catch (error: any) {
            console.error("Error loading fines:", error);
            setFinesError(
                error.response?.data?.message ||
                    error.message ||
                    "Gagal memuat jenis denda",
            );
            setFines([]);
        } finally {
            setLoadingFines(false);
        }
    }, []);

    useEffect(() => {
        if (data.outletId) {
            loadOptionsByOutlet(data.outletId);
        } else {
            setEmployees([]);
            setFines([]);
            setData((prev) => ({
                ...prev,
                employeeId: "",
                fineId: "",
            }));
        }
    }, [data.outletId, loadOptionsByOutlet]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(route("fine-logs.store"), {
            onSuccess: () => {
                reset();
                setSelectedFile(null);
                setEmployees([]);
                setFines([]);
            },
            onError: () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
        });
    };

    const handleDataChange = (key: keyof FineLogFormData, value: any) => {
        setData(key, value);
        if (errors[key]) {
            clearErrors(key);
        }
    };

    const handleOutletChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value;
        const outletId = value ? parseInt(value, 10) : "";
        handleDataChange("outletId", outletId);
    };

    const handleEmployeeChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value;
        const employeeId = value ? parseInt(value, 10) : "";
        handleDataChange("employeeId", employeeId);
    };

    const handleFineChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        const fineId = value ? parseInt(value, 10) : "";
        handleDataChange("fineId", fineId);

        if (fineId && !data.amount) {
            const selectedFineValue = fines.find((fine) => fine.id === fineId);
            if (selectedFineValue?.amount) {
                handleDataChange("amount", selectedFineValue.amount);
            }
        }
    };

    const handleAttachmentSelect = (files: File[]) => {
        if (files.length > 0) {
            const file = files[0];
            setSelectedFile(file);
            handleDataChange("attachment", file);
            return;
        }

        setSelectedFile(null);
        handleDataChange("attachment", null);
    };

    const outletOptions = useMemo(
        () => [
            { value: "", label: "Pilih Outlet" },
            ...outlets.map((outlet) => ({
                value: outlet.id.toString(),
                label: outlet.name,
                description: outlet.code || undefined,
            })),
        ],
        [outlets],
    );

    const employeeOptions = useMemo(
        () => [
            { value: "", label: "Pilih Karyawan" },
            ...employees.map((employee) => ({
                value: employee.id.toString(),
                label: employee.name,
                description: employee.username,
            })),
        ],
        [employees],
    );

    const fineOptions = useMemo(
        () => [
            { value: "", label: "Pilih Jenis Denda" },
            ...fines.map((fine) => ({
                value: fine.id.toString(),
                label: fine.name,
                description: formatCurrency(fine.amount),
            })),
        ],
        [fines],
    );

    const selectedOutlet = outlets.find(
        (outlet) => outlet.id === data.outletId,
    );
    const selectedEmployee = employees.find(
        (employee) => employee.id === data.employeeId,
    );
    const selectedFine = fines.find((fine) => fine.id === data.fineId);

    const isLoadingOptions = loadingEmployees || loadingFines;

    return (
        <>
            <Head title="Catat Denda Karyawan" />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Catat Denda Karyawan"
                        subtitle="Masukkan detail denda karyawan untuk integrasi payroll dan akuntansi"
                        icon={Receipt}
                        actions={
                            <Button
                                variant="outline"
                                size="md"
                                onClick={fineLogService.goToIndex}
                                disabled={processing}
                                leftIcon={<ArrowLeft className="w-4 h-4" />}
                            >
                                Kembali
                            </Button>
                        }
                    />

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

                    {(employeesError || finesError) && (
                        <Alert
                            variant="error"
                            title="Gagal Memuat Data Referensi"
                            description={employeesError || finesError || ""}
                        />
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
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
                                                Tentukan outlet tempat
                                                pelanggaran terjadi
                                            </p>
                                        </div>
                                    </div>

                                    <SelectInput
                                        label="Outlet"
                                        placeholder="Pilih outlet..."
                                        value={data.outletId?.toString() || ""}
                                        onChange={handleOutletChange}
                                        error={errors.outletId}
                                        required
                                        disabled={
                                            processing || outlets.length === 0
                                        }
                                        options={outletOptions}
                                        leftIcon={
                                            <Building2 className="w-5 h-5" />
                                        }
                                        hint={
                                            outlets.length === 0
                                                ? "Belum ada outlet tersedia"
                                                : "Pilih outlet untuk memuat karyawan dan jenis denda"
                                        }
                                        searchable={true}
                                        clearable={true}
                                        multiple={false}
                                        noOptionsText="Tidak ada outlet tersedia"
                                    />

                                    {selectedOutlet && (
                                        <div
                                            className="p-4 rounded-lg border"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-primary-50)",
                                                borderColor:
                                                    "var(--color-primary-200)",
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Building2 className="w-5 h-5 text-primary-600" />
                                                <div>
                                                    <p className="font-medium text-primary-800">
                                                        {selectedOutlet.name}
                                                    </p>
                                                    {selectedOutlet.code && (
                                                        <p className="text-sm text-primary-600">
                                                            Kode:{" "}
                                                            {
                                                                selectedOutlet.code
                                                            }
                                                        </p>
                                                    )}
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
                                                    "var(--color-error-100)",
                                            }}
                                        >
                                            <AlertCircle
                                                className="w-6 h-6"
                                                style={{
                                                    color: "var(--color-error-600)",
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
                                                Data Denda
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Pilih karyawan dan jenis denda
                                            </p>
                                        </div>
                                    </div>

                                    {!data.outletId && (
                                        <div
                                            className="p-4 rounded-lg border-2 border-dashed text-center"
                                            style={{
                                                borderColor:
                                                    "var(--color-border)",
                                                backgroundColor:
                                                    "var(--color-surface-secondary)",
                                            }}
                                        >
                                            <AlertCircle
                                                className="w-8 h-8 mx-auto mb-2"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            />
                                            <p
                                                className="text-sm font-medium"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Pilih outlet terlebih dahulu
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SelectInput
                                            label="Karyawan"
                                            placeholder={
                                                !data.outletId
                                                    ? "Pilih outlet terlebih dahulu"
                                                    : loadingEmployees
                                                      ? "Memuat karyawan..."
                                                      : employees.length === 0
                                                        ? "Tidak ada karyawan tersedia"
                                                        : "Pilih karyawan..."
                                            }
                                            value={
                                                data.employeeId?.toString() ||
                                                ""
                                            }
                                            onChange={handleEmployeeChange}
                                            error={
                                                errors.employeeId ||
                                                employeesError ||
                                                undefined
                                            }
                                            required
                                            disabled={
                                                processing ||
                                                !data.outletId ||
                                                loadingEmployees ||
                                                employees.length === 0
                                            }
                                            options={employeeOptions}
                                            leftIcon={
                                                <Users className="w-5 h-5" />
                                            }
                                            hint={
                                                !data.outletId
                                                    ? "Pilih outlet terlebih dahulu"
                                                    : loadingEmployees
                                                      ? "Sedang memuat karyawan..."
                                                      : employees.length === 0
                                                        ? "Belum ada karyawan tersedia"
                                                        : "Pilih karyawan yang terkena denda"
                                            }
                                            searchable={true}
                                            clearable={true}
                                            multiple={false}
                                            loading={loadingEmployees}
                                            noOptionsText="Tidak ada karyawan tersedia"
                                        />

                                        <SelectInput
                                            label="Jenis Denda"
                                            placeholder={
                                                !data.outletId
                                                    ? "Pilih outlet terlebih dahulu"
                                                    : loadingFines
                                                      ? "Memuat jenis denda..."
                                                      : fines.length === 0
                                                        ? "Tidak ada jenis denda tersedia"
                                                        : "Pilih jenis denda..."
                                            }
                                            value={
                                                data.fineId?.toString() || ""
                                            }
                                            onChange={handleFineChange}
                                            error={
                                                errors.fineId ||
                                                finesError ||
                                                undefined
                                            }
                                            required
                                            disabled={
                                                processing ||
                                                !data.outletId ||
                                                loadingFines ||
                                                fines.length === 0
                                            }
                                            options={fineOptions}
                                            leftIcon={
                                                <AlertCircle className="w-5 h-5" />
                                            }
                                            hint={
                                                !data.outletId
                                                    ? "Pilih outlet terlebih dahulu"
                                                    : loadingFines
                                                      ? "Sedang memuat jenis denda..."
                                                      : fines.length === 0
                                                        ? "Belum ada jenis denda tersedia"
                                                        : "Nominal default akan terisi otomatis"
                                            }
                                            searchable={true}
                                            clearable={true}
                                            multiple={false}
                                            loading={loadingFines}
                                            noOptionsText="Tidak ada jenis denda tersedia"
                                        />
                                    </div>

                                    {(selectedEmployee || selectedFine) && (
                                        <div
                                            className="p-4 rounded-lg border"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-info-50)",
                                                borderColor:
                                                    "var(--color-info-200)",
                                            }}
                                        >
                                            {selectedEmployee && (
                                                <p className="text-sm text-info-700">
                                                    Karyawan:{" "}
                                                    {selectedEmployee.name}
                                                </p>
                                            )}
                                            {selectedFine && (
                                                <p className="text-sm text-info-700 mt-1">
                                                    Jenis denda:{" "}
                                                    {selectedFine.name} (
                                                    {formatCurrency(
                                                        selectedFine.amount,
                                                    )}
                                                    )
                                                </p>
                                            )}
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
                                                    "var(--color-error-100)",
                                            }}
                                        >
                                            <DollarSign
                                                className="w-6 h-6"
                                                style={{
                                                    color: "var(--color-error-600)",
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
                                                Detail Denda
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Atur nominal, tanggal, dan
                                                keterangan denda
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <NumberInput
                                            label="Jumlah Denda"
                                            value={
                                                data.amount
                                                    ? parseFloat(
                                                          data.amount.toString(),
                                                      )
                                                    : undefined
                                            }
                                            onValueChange={(value) =>
                                                handleDataChange(
                                                    "amount",
                                                    value || "",
                                                )
                                            }
                                            error={errors.amount}
                                            required
                                            disabled={processing}
                                            leftIcon={
                                                <DollarSign className="w-5 h-5" />
                                            }
                                            hint="Masukkan nominal denda"
                                            prefix="Rp"
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            min={1}
                                            max={999999999.99}
                                            allowDecimal={true}
                                            placeholder="0"
                                        />

                                        <DateInput
                                            label="Tanggal Kejadian"
                                            value={data.date}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "date",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.date}
                                            required
                                            disabled={processing}
                                            max={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                            leftIcon={
                                                <Calendar className="w-5 h-5" />
                                            }
                                            hint="Tanggal pelanggaran terjadi"
                                        />
                                    </div>

                                    <TextAreaInput
                                        label="Alasan Pemberian Denda"
                                        placeholder="Jelaskan alasan atau kronologi pelanggaran (opsional)..."
                                        value={data.reason || ""}
                                        onChange={(e) =>
                                            handleDataChange(
                                                "reason",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.reason}
                                        disabled={processing}
                                        leftIcon={
                                            <FileText className="w-5 h-5" />
                                        }
                                        hint="Keterangan tambahan terkait denda"
                                        rows={4}
                                        maxLength={1000}
                                        showCharacterCount={true}
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
                                                    "var(--color-info-100)",
                                            }}
                                        >
                                            <Paperclip
                                                className="w-6 h-6"
                                                style={{
                                                    color: "var(--color-info-600)",
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
                                                Lampiran
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Upload bukti pelanggaran
                                                (opsional)
                                            </p>
                                        </div>
                                    </div>

                                    <FileInput
                                        label="File Lampiran"
                                        placeholder="Upload foto bukti atau dokumen pendukung"
                                        accept="image/*,.pdf"
                                        maxFileSize={5 * 1024 * 1024}
                                        allowedFileTypes={[
                                            "image/jpeg",
                                            "image/jpg",
                                            "image/png",
                                            "image/webp",
                                            "image/gif",
                                            "application/pdf",
                                        ]}
                                        onFileSelect={handleAttachmentSelect}
                                        files={
                                            selectedFile ? [selectedFile] : []
                                        }
                                        error={errors.attachment}
                                        disabled={processing}
                                        hint="Format: JPG, PNG, WEBP, GIF, PDF (max. 5MB)"
                                        preview={true}
                                        dragAndDrop={true}
                                        size="md"
                                        browseText="Pilih File"
                                        dropzoneText="Drop file di sini atau klik untuk upload"
                                        maxFiles={1}
                                        multiple={false}
                                    />

                                    {selectedFile && (
                                        <div
                                            className="p-4 rounded-lg border"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-success-50)",
                                                borderColor:
                                                    "var(--color-success-200)",
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Paperclip
                                                    className="w-5 h-5"
                                                    style={{
                                                        color: "var(--color-success-600)",
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className="text-sm font-medium truncate"
                                                        style={{
                                                            color: "var(--color-success-700)",
                                                        }}
                                                    >
                                                        {selectedFile.name}
                                                    </p>
                                                    <p
                                                        className="text-xs"
                                                        style={{
                                                            color: "var(--color-success-600)",
                                                        }}
                                                    >
                                                        {(
                                                            selectedFile.size /
                                                            1024
                                                        ).toFixed(2)}{" "}
                                                        KB
                                                    </p>
                                                </div>
                                                <Badge variant="success">
                                                    Siap diupload
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div
                                    className="flex items-center justify-between pt-6 border-t"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={fineLogService.goToIndex}
                                        disabled={processing}
                                        leftIcon={
                                            <ArrowLeft className="w-4 h-4" />
                                        }
                                    >
                                        Kembali
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={
                                            processing ||
                                            !data.outletId ||
                                            !data.employeeId ||
                                            !data.fineId ||
                                            !data.amount ||
                                            parseFloat(
                                                data.amount.toString(),
                                            ) <= 0 ||
                                            !data.date ||
                                            isLoadingOptions
                                        }
                                        loading={processing}
                                        size="lg"
                                        leftIcon={<Save className="w-4 h-4" />}
                                    >
                                        {processing
                                            ? "Menyimpan..."
                                            : "Catat Denda"}
                                    </Button>
                                </div>
                            </Form>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

FineLogCreate.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Catat Denda Karyawan",
        breadcrumbs: [
            { label: "Denda Karyawan", href: route("fine-logs.index") },
            { label: "Catat Denda" },
        ],
    })(page);

export default FineLogCreate;
