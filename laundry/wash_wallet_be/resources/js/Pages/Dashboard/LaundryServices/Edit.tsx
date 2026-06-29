import React, { useState, useEffect } from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Save,
    ArrowLeft,
    Building2,
    Package,
    Ruler,
    FileText,
    CheckSquare,
    DollarSign,
    Clock,
    Boxes,
    Square,
    Zap,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import {
    Input,
    TextAreaInput,
    SelectInput,
    NumberInput,
} from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import PageHeader from "@/Components/Page/PageHeader";
import { LaundryServiceEditProps } from "./types";
import { LaundryServiceFormData, Process } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { laundryServiceService } from "@/Services/laundry_service.service";

function LaundryServiceEdit({
    laundryService,
    categories,
    units,
    processes,
    flash,
}: LaundryServiceEditProps) {
    const initialProcessIds = laundryService.laundryServiceProcesses
        ? laundryService.laundryServiceProcesses.map((lsp) => lsp.process.id)
        : [];

    const {
        data,
        setData,
        put,
        processing,
        errors,
        clearErrors,
        wasSuccessful,
    } = useForm<LaundryServiceFormData>({
        categoryId: laundryService.categoryId,
        unitId: laundryService.unitId,
        name: laundryService.name,
        description: laundryService.description || "",
        price: laundryService.price || 0,
        durationHours: laundryService.durationHours || 24,
        minQuantity: laundryService.minQuantity || 1,
        isActive: laundryService.isActive,
        laundryServiceProcesses: initialProcessIds.map((id) => ({
            processId: id,
        })),
    });

    const [selectedProcessIds, setSelectedProcessIds] =
        useState<number[]>(initialProcessIds);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const processesChanged =
            JSON.stringify(selectedProcessIds.sort()) !==
            JSON.stringify(initialProcessIds.sort());

        const hasDataChanged =
            data.categoryId !== laundryService.categoryId ||
            data.unitId !== laundryService.unitId ||
            data.name !== laundryService.name ||
            data.description !== (laundryService.description || "") ||
            data.price !== (laundryService.price || 0) ||
            data.durationHours !== (laundryService.durationHours || 24) ||
            data.minQuantity !== (laundryService.minQuantity || 1) ||
            data.isActive !== laundryService.isActive ||
            processesChanged;

        setHasChanges(hasDataChanged);
    }, [data, laundryService, selectedProcessIds, initialProcessIds]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        put(route("laundry-services.update", laundryService.id), {
            onSuccess: () => {
                console.log("LaundryService updated successfully");
            },
            onError: (errors) => {
                console.error("LaundryService update errors:", errors);
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
        });
    };

    const handleDataChange = (
        key: keyof LaundryServiceFormData,
        value: any,
    ) => {
        setData(key, value);

        if (errors[key]) {
            clearErrors(key);
        }
    };

    const handleCategoryChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value;
        const categoryId = value ? parseInt(value, 10) : 0;
        handleDataChange("categoryId", categoryId);
    };

    const handleUnitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        const unitId = value ? parseInt(value, 10) : 0;
        handleDataChange("unitId", unitId);
    };

    const handleProcessToggle = (processId: number) => {
        let newSelectedIds: number[];

        if (selectedProcessIds.includes(processId)) {
            newSelectedIds = selectedProcessIds.filter(
                (id) => id !== processId,
            );
        } else {
            newSelectedIds = [...selectedProcessIds, processId];
        }

        setSelectedProcessIds(newSelectedIds);

        const processesData = newSelectedIds.map((id) => ({
            processId: id,
        }));

        handleDataChange("laundryServiceProcesses", processesData);
    };

    const handleSelectAllProcesses = () => {
        const activeProcessIds = processes
            .filter((p) => p.isActive)
            .map((p) => p.id);

        setSelectedProcessIds(activeProcessIds);

        const processesData = activeProcessIds.map((id) => ({
            processId: id,
        }));

        handleDataChange("laundryServiceProcesses", processesData);
    };

    const handleDeselectAllProcesses = () => {
        setSelectedProcessIds([]);
        handleDataChange("laundryServiceProcesses", []);
    };

    const categoryOptions = [
        { value: "", label: "Pilih Kategori" },
        ...categories.map((category) => ({
            value: category.id.toString(),
            label: category.name,
            description: category.description || undefined,
        })),
    ];

    const unitOptions = [
        { value: "", label: "Pilih Unit" },
        ...units.map((unit) => ({
            value: unit.id.toString(),
            label: `${unit.name} (${unit.symbol})`,
            description: unit.description || undefined,
        })),
    ];

    const selectedUnit = units.find((u) => u.id === data.unitId);
    const activeProcesses = processes.filter((p) => p.isActive);
    const allSelected =
        activeProcesses.length > 0 &&
        selectedProcessIds.length === activeProcesses.length;

    return (
        <>
            <Head title={`Edit Layanan - ${laundryService.name}`} />

            <div
                className="p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Edit Layanan Laundry"
                        subtitle={`Perbarui informasi layanan "${laundryService.name}"`}
                        icon={FileText}
                        actions={
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    laundryServiceService.goToIndex()
                                }
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
                            title="Terjadi Kesalahan"
                            description={flash.error}
                        />
                    )}

                    {wasSuccessful && (
                        <Alert
                            variant="success"
                            title="Berhasil"
                            description="Layanan laundry telah berhasil diperbarui."
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
                                                Outlet & Kategori
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Outlet tidak dapat diubah, pilih
                                                kategori lain jika diperlukan
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label
                                                className="text-sm font-medium"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Outlet
                                            </label>
                                            <div
                                                className="px-4 py-3 rounded-lg border bg-gray-50 dark:bg-gray-800 flex items-center gap-3"
                                                style={{
                                                    borderColor:
                                                        "var(--color-border)",
                                                }}
                                            >
                                                <Building2 className="w-5 h-5 text-gray-400" />
                                                <div className="flex-1">
                                                    <p
                                                        className="font-medium"
                                                        style={{
                                                            color: "var(--color-text-primary)",
                                                        }}
                                                    >
                                                        {
                                                            laundryService
                                                                .category
                                                                ?.outlet?.name
                                                        }
                                                    </p>
                                                    {laundryService.category
                                                        ?.outlet?.code && (
                                                        <p className="text-xs text-gray-500">
                                                            {
                                                                laundryService
                                                                    .category
                                                                    .outlet.code
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    Tidak dapat diubah
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Outlet tidak dapat diubah
                                                setelah layanan dibuat
                                            </p>
                                        </div>

                                        <SelectInput
                                            label="Kategori"
                                            placeholder="Pilih kategori..."
                                            value={data.categoryId.toString()}
                                            onChange={handleCategoryChange}
                                            error={errors.categoryId}
                                            required
                                            disabled={
                                                processing ||
                                                categories.length === 0
                                            }
                                            options={categoryOptions}
                                            leftIcon={
                                                <Package className="w-5 h-5" />
                                            }
                                            hint={
                                                categories.length === 0
                                                    ? "Tidak ada kategori tersedia di outlet ini"
                                                    : "Pilih kategori untuk layanan laundry"
                                            }
                                            searchable={true}
                                            clearable={false}
                                            multiple={false}
                                            noOptionsText="Tidak ada kategori tersedia"
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
                                                    "var(--color-info-100)",
                                            }}
                                        >
                                            <FileText
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
                                                Informasi Layanan
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Perbarui detail dan informasi
                                                layanan laundry
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Nama Layanan"
                                            placeholder="Contoh: Cuci + Setrika"
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
                                                <FileText className="w-5 h-5" />
                                            }
                                            hint="Nama layanan yang akan ditampilkan"
                                            autoFocus
                                        />

                                        <SelectInput
                                            label="Unit"
                                            placeholder="Pilih unit..."
                                            value={data.unitId.toString()}
                                            onChange={handleUnitChange}
                                            error={errors.unitId}
                                            required
                                            disabled={
                                                processing || units.length === 0
                                            }
                                            options={unitOptions}
                                            leftIcon={
                                                <Ruler className="w-5 h-5" />
                                            }
                                            hint="Unit perhitungan untuk layanan ini"
                                            searchable={true}
                                            clearable={false}
                                            multiple={false}
                                            noOptionsText="Tidak ada unit tersedia"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <TextAreaInput
                                            label="Deskripsi"
                                            placeholder="Deskripsi layanan laundry..."
                                            value={data.description || ""}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "description",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.description}
                                            disabled={processing}
                                            rows={3}
                                            maxLength={500}
                                            showCharacterCount={true}
                                            hint="Deskripsi singkat tentang layanan ini"
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
                                            <DollarSign
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
                                                Harga & Detail Layanan
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Perbarui harga, durasi, dan
                                                minimal pemesanan
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <NumberInput
                                            label="Harga"
                                            placeholder="0"
                                            value={data.price}
                                            onValueChange={(value) =>
                                                handleDataChange(
                                                    "price",
                                                    value || 0,
                                                )
                                            }
                                            error={errors.price}
                                            required
                                            disabled={processing}
                                            leftIcon={
                                                <DollarSign className="w-5 h-5" />
                                            }
                                            prefix="Rp "
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            min={0}
                                            step={1000}
                                            precision={0}
                                            allowNegative={false}
                                            allowDecimal={false}
                                            hint={`Harga per ${
                                                selectedUnit?.symbol || "unit"
                                            }`}
                                            helperText={
                                                data.price > 0
                                                    ? `Preview: ${formatCurrency(
                                                          data.price,
                                                      )}`
                                                    : undefined
                                            }
                                        />

                                        <NumberInput
                                            label="Durasi Pengerjaan"
                                            placeholder="24"
                                            value={data.durationHours}
                                            onValueChange={(value) =>
                                                handleDataChange(
                                                    "durationHours",
                                                    value || 24,
                                                )
                                            }
                                            error={errors.durationHours}
                                            required
                                            disabled={processing}
                                            leftIcon={
                                                <Clock className="w-5 h-5" />
                                            }
                                            suffix=" jam"
                                            min={1}
                                            max={720}
                                            step={1}
                                            allowNegative={false}
                                            allowDecimal={false}
                                            hint="Estimasi waktu pengerjaan"
                                            helperText={
                                                data.durationHours > 0
                                                    ? `≈ ${Math.floor(
                                                          data.durationHours /
                                                              24,
                                                      )} hari ${
                                                          data.durationHours %
                                                          24
                                                      } jam`
                                                    : undefined
                                            }
                                        />

                                        <NumberInput
                                            label="Minimal Quantity"
                                            placeholder="1"
                                            value={data.minQuantity}
                                            onValueChange={(value) =>
                                                handleDataChange(
                                                    "minQuantity",
                                                    value || 1,
                                                )
                                            }
                                            error={errors.minQuantity}
                                            required
                                            disabled={processing}
                                            leftIcon={
                                                <Boxes className="w-5 h-5" />
                                            }
                                            suffix={` ${
                                                selectedUnit?.symbol || "unit"
                                            }`}
                                            min={1}
                                            step={1}
                                            allowNegative={false}
                                            allowDecimal={false}
                                            hint="Jumlah minimum pemesanan"
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
                                                    "var(--color-warning-100)",
                                            }}
                                        >
                                            <CheckSquare
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
                                                Status Layanan
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Atur status aktif/nonaktif
                                                layanan
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
                                                    backgroundColor:
                                                        data.isActive
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
                                                Layanan Aktif
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
                                            {data.isActive !==
                                                laundryService.isActive && (
                                                <Badge
                                                    variant="warning"
                                                    className="text-xs"
                                                >
                                                    Berubah
                                                </Badge>
                                            )}
                                        </div>

                                        <div
                                            className="text-xs pl-8"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            {data.isActive
                                                ? "Layanan aktif dapat digunakan untuk transaksi"
                                                : "Layanan nonaktif tidak akan muncul di daftar layanan"}
                                        </div>
                                    </div>
                                </div>

                                {/* Proses Layanan */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 pb-4 border-b w-full">
                                            <div
                                                className="p-3 rounded-lg"
                                                style={{
                                                    backgroundColor:
                                                        "var(--color-info-100)",
                                                }}
                                            >
                                                <Zap
                                                    className="w-6 h-6"
                                                    style={{
                                                        color: "var(--color-info-600)",
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h2
                                                    className="text-xl font-semibold"
                                                    style={{
                                                        color: "var(--color-text-primary)",
                                                    }}
                                                >
                                                    Proses Layanan
                                                </h2>
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Pilih proses pengerjaan
                                                    layanan (opsional)
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                {allSelected ? (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={
                                                            handleDeselectAllProcesses
                                                        }
                                                        disabled={
                                                            processing ||
                                                            activeProcesses.length ===
                                                                0
                                                        }
                                                        leftIcon={
                                                            <Square className="w-4 h-4" />
                                                        }
                                                    >
                                                        Batal Semua
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={
                                                            handleSelectAllProcesses
                                                        }
                                                        disabled={
                                                            processing ||
                                                            activeProcesses.length ===
                                                                0
                                                        }
                                                        leftIcon={
                                                            <CheckSquare className="w-4 h-4" />
                                                        }
                                                    >
                                                        Pilih Semua
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {activeProcesses.length === 0 ? (
                                        <Alert
                                            variant="warning"
                                            title="Tidak ada proses tersedia"
                                            description="Silakan buat proses terlebih dahulu sebelum menambahkan ke layanan."
                                        />
                                    ) : (
                                        <div className="space-y-4">
                                            <div
                                                className="space-y-3"
                                                style={{
                                                    maxHeight: "500px",
                                                    overflowY: "auto",
                                                    paddingRight: "8px",
                                                }}
                                            >
                                                {activeProcesses.map(
                                                    (process, index) => {
                                                        const isSelected =
                                                            selectedProcessIds.includes(
                                                                process.id,
                                                            );

                                                        return (
                                                            <motion.div
                                                                key={process.id}
                                                                initial={{
                                                                    opacity: 0,
                                                                    x: -20,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    x: 0,
                                                                }}
                                                                transition={{
                                                                    delay:
                                                                        index *
                                                                        0.02,
                                                                }}
                                                            >
                                                                <label
                                                                    className={`
                                                                        flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer
                                                                        transition-all duration-200
                                                                        ${
                                                                            isSelected
                                                                                ? "border-blue-500 bg-blue-50 shadow-sm"
                                                                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                                        }
                                                                        ${
                                                                            processing
                                                                                ? "opacity-50 cursor-not-allowed"
                                                                                : ""
                                                                        }
                                                                    `}
                                                                    style={{
                                                                        borderColor:
                                                                            isSelected
                                                                                ? "var(--color-primary-500)"
                                                                                : "var(--color-border)",
                                                                        backgroundColor:
                                                                            isSelected
                                                                                ? "var(--color-primary-50)"
                                                                                : "var(--color-background)",
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={
                                                                            isSelected
                                                                        }
                                                                        onChange={() =>
                                                                            handleProcessToggle(
                                                                                process.id,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            processing
                                                                        }
                                                                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                                    />

                                                                    <div className="flex-1 min-w-0">
                                                                        <h4
                                                                            className="text-base font-semibold"
                                                                            style={{
                                                                                color: "var(--color-text-primary)",
                                                                            }}
                                                                        >
                                                                            {
                                                                                process.name
                                                                            }
                                                                        </h4>
                                                                        {process.description && (
                                                                            <p
                                                                                className="text-sm mt-1"
                                                                                style={{
                                                                                    color: "var(--color-text-secondary)",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    process.description
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </label>
                                                            </motion.div>
                                                        );
                                                    },
                                                )}
                                            </div>

                                            {selectedProcessIds.length > 0 && (
                                                <div
                                                    className="flex items-center gap-2 p-4 rounded-lg"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--color-info-50)",
                                                        borderLeft:
                                                            "4px solid var(--color-info-500)",
                                                    }}
                                                >
                                                    <CheckSquare
                                                        className="w-5 h-5 flex-shrink-0"
                                                        style={{
                                                            color: "var(--color-info-600)",
                                                        }}
                                                    />
                                                    <div>
                                                        <span
                                                            className="text-sm font-medium"
                                                            style={{
                                                                color: "var(--color-info-700)",
                                                            }}
                                                        >
                                                            {
                                                                selectedProcessIds.length
                                                            }{" "}
                                                            proses dipilih dari{" "}
                                                            {
                                                                activeProcesses.length
                                                            }{" "}
                                                            tersedia
                                                        </span>
                                                        <p
                                                            className="text-xs mt-1"
                                                            style={{
                                                                color: "var(--color-info-600)",
                                                            }}
                                                        >
                                                            Proses yang dipilih:{" "}
                                                            {selectedProcessIds
                                                                .map((id) => {
                                                                    const proc =
                                                                        activeProcesses.find(
                                                                            (
                                                                                p,
                                                                            ) =>
                                                                                p.id ===
                                                                                id,
                                                                        );
                                                                    return proc
                                                                        ? proc.name
                                                                        : "";
                                                                })
                                                                .filter(Boolean)
                                                                .join(", ")}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {errors.laundryServiceProcesses && (
                                                <Alert
                                                    variant="error"
                                                    description={
                                                        errors.laundryServiceProcesses as string
                                                    }
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Validation Errors */}
                                {Object.keys(errors).length > 0 && (
                                    <Alert
                                        variant="error"
                                        title="Terdapat kesalahan pada form"
                                        description="Silakan periksa kembali semua field yang bertanda merah."
                                    />
                                )}

                                {/* Form Actions */}
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
                                            laundryServiceService.goToIndex()
                                        }
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
                                            !data.categoryId ||
                                            !data.unitId ||
                                            !data.name.trim() ||
                                            data.price <= 0 ||
                                            data.durationHours <= 0 ||
                                            data.minQuantity <= 0 ||
                                            !hasChanges
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
                    </motion.div>
                </div>
            </div>
        </>
    );
}

LaundryServiceEdit.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Edit Layanan Laundry",
        breadcrumbs: [
            {
                label: "Laundry Services",
                href: route("laundry-services.index"),
            },
            {
                label: page.props.laundryService.name,
                href: route(
                    "laundry-services.show",
                    page.props.laundryService.id,
                ),
            },
            { label: "Edit" },
        ],
    })(page);

export default LaundryServiceEdit;
