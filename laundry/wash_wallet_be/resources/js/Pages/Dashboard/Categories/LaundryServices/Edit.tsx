import React, { useState, useCallback, useEffect } from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Save,
    ArrowLeft,
    FolderOpen,
    FileText,
    Package,
    Ruler,
    Building2,
    DollarSign,
    Clock,
    Boxes,
    ListOrdered,
    CheckSquare,
    Square,
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
import { categoryService } from "@/Services/category.service";
import { CategoryLaundryServiceEditProps } from "./type";
import { formatCurrency } from "@/lib/utils";
import { CategoryLaundryServiceFormData } from "@/types";
import PageHeader from "@/Components/Page/PageHeader";

function CategoryLaundryServiceEdit({
    category,
    laundryService,
    units,
    processes,
}: CategoryLaundryServiceEditProps) {
    const {
        data,
        setData,
        put,
        processing,
        errors,
        clearErrors,
        wasSuccessful,
    } = useForm<CategoryLaundryServiceFormData>({
        unitId: laundryService.unitId,
        name: laundryService.name,
        description: laundryService.description || "",
        price: laundryService.price,
        durationHours: laundryService.durationHours,
        minQuantity: laundryService.minQuantity,
        laundryServiceProcesses: [],
    });

    const [selectedProcessIds, setSelectedProcessIds] = useState<number[]>([]);

    useEffect(() => {
        if (laundryService.laundryServiceProcesses) {
            const processIds = laundryService.laundryServiceProcesses
                .sort((a, b) => a.sequence - b.sequence)
                .map((lsp) => lsp.processId);
            setSelectedProcessIds(processIds);

            const processesData = processIds.map((id) => ({
                processId: id,
            }));
            setData("laundryServiceProcesses", processesData);
        }
    }, [laundryService.laundryServiceProcesses]);

    const handleSubmit = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            put(
                route("categories.laundry-services.update", {
                    category: category.id,
                    laundryService: laundryService.id,
                }),
                {
                    onSuccess: () => {},
                    onError: (errors) => {
                        console.error("Form submission errors:", errors);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    },
                },
            );
        },
        [put, category.id, laundryService.id],
    );

    const handleDataChange = (
        key: keyof CategoryLaundryServiceFormData,
        value: any,
    ) => {
        setData(key, value);

        if (errors[key]) {
            clearErrors(key);
        }
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

    const handleBack = useCallback(() => {
        categoryService.goToView(category.id);
    }, [category.id]);

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
            <Head
                title={`Edit Layanan - ${laundryService.name} - ${category.name}`}
            />
            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Edit Layanan Laundry"
                        subtitle={`Kategori: ${category.name}`}
                        icon={<Package className="w-6 h-6" />}
                        actions={
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    categoryService.goToView(category.id)
                                }
                                disabled={processing}
                                leftIcon={<ArrowLeft className="w-4 h-4" />}
                            >
                                Kembali
                            </Button>
                        }
                    />

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
                                            className="flex items-center justify-center w-12 h-12 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-primary-bg)",
                                            }}
                                        >
                                            <FolderOpen
                                                className="w-6 h-6"
                                                style={{
                                                    color: "var(--color-primary)",
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3
                                                className="text-lg font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Informasi Kategori
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    {category.name}
                                                </p>
                                                {category.outlet && (
                                                    <>
                                                        <span
                                                            className="text-sm"
                                                            style={{
                                                                color: "var(--color-text-tertiary)",
                                                            }}
                                                        >
                                                            •
                                                        </span>
                                                        <div className="flex items-center gap-1.5">
                                                            <Building2
                                                                className="w-3.5 h-3.5"
                                                                style={{
                                                                    color: "var(--color-text-tertiary)",
                                                                }}
                                                            />
                                                            <span
                                                                className="text-sm"
                                                                style={{
                                                                    color: "var(--color-text-tertiary)",
                                                                }}
                                                            >
                                                                {
                                                                    category
                                                                        .outlet
                                                                        .name
                                                                }
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div
                                            className="flex items-center gap-3 pb-2"
                                            style={{
                                                borderBottom:
                                                    "1px solid var(--color-border)",
                                            }}
                                        >
                                            <div
                                                className="flex items-center justify-center w-10 h-10 rounded-lg"
                                                style={{
                                                    backgroundColor:
                                                        "var(--color-primary-bg)",
                                                }}
                                            >
                                                <FileText
                                                    className="w-5 h-5"
                                                    style={{
                                                        color: "var(--color-primary)",
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <h4
                                                    className="text-base font-semibold"
                                                    style={{
                                                        color: "var(--color-text-primary)",
                                                    }}
                                                >
                                                    Informasi Layanan
                                                </h4>
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Atur detail layanan laundry
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <Input
                                                label="Nama Layanan"
                                                type="text"
                                                placeholder="Contoh: Cuci Setrika Premium"
                                                value={data.name}
                                                onChange={(e) =>
                                                    handleDataChange(
                                                        "name",
                                                        e.target.value,
                                                    )
                                                }
                                                error={errors.name}
                                                disabled={processing}
                                                required
                                                maxLength={255}
                                                hint="Nama yang jelas dan deskriptif"
                                                leftIcon={
                                                    <Package className="w-4 h-4" />
                                                }
                                            />

                                            <SelectInput
                                                label="Unit"
                                                options={unitOptions}
                                                value={data.unitId.toString()}
                                                onChange={handleUnitChange}
                                                error={errors.unitId}
                                                disabled={processing}
                                                required
                                                hint={
                                                    selectedUnit
                                                        ? `Satuan: ${selectedUnit.symbol}`
                                                        : "Pilih unit pengukuran"
                                                }
                                                leftIcon={
                                                    <Ruler className="w-4 h-4" />
                                                }
                                            />
                                        </div>

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
                                        className="flex items-center gap-3 pb-2"
                                        style={{
                                            borderBottom:
                                                "1px solid var(--color-border)",
                                        }}
                                    >
                                        <div
                                            className="flex items-center justify-center w-10 h-10 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-success-bg)",
                                            }}
                                        >
                                            <DollarSign
                                                className="w-5 h-5"
                                                style={{
                                                    color: "var(--color-success)",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h4
                                                className="text-base font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Harga & Detail
                                            </h4>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Tentukan harga, durasi, dan
                                                kuantitas minimum
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <NumberInput
                                            label="Harga per Unit"
                                            value={data.price}
                                            onChange={(value) =>
                                                handleDataChange("price", value)
                                            }
                                            error={errors.price}
                                            disabled={processing}
                                            required
                                            min={0}
                                            step={100}
                                            prefix="Rp"
                                            hint={
                                                data.price > 0
                                                    ? formatCurrency(data.price)
                                                    : "Harga layanan"
                                            }
                                            leftIcon={
                                                <DollarSign className="w-4 h-4" />
                                            }
                                        />

                                        <NumberInput
                                            label="Durasi (Jam)"
                                            value={data.durationHours}
                                            onChange={(value) =>
                                                handleDataChange(
                                                    "durationHours",
                                                    value,
                                                )
                                            }
                                            error={errors.durationHours}
                                            disabled={processing}
                                            required
                                            min={1}
                                            step={1}
                                            suffix="jam"
                                            hint={
                                                data.durationHours > 0
                                                    ? `${data.durationHours} jam kerja`
                                                    : "Estimasi waktu"
                                            }
                                            leftIcon={
                                                <Clock className="w-4 h-4" />
                                            }
                                        />

                                        <NumberInput
                                            label="Kuantitas Minimum"
                                            value={data.minQuantity}
                                            onChange={(value) =>
                                                handleDataChange(
                                                    "minQuantity",
                                                    value,
                                                )
                                            }
                                            error={errors.minQuantity}
                                            disabled={processing}
                                            required
                                            min={1}
                                            step={1}
                                            suffix={
                                                selectedUnit?.symbol || "unit"
                                            }
                                            hint={
                                                data.minQuantity > 0
                                                    ? `Minimum ${data.minQuantity} ${selectedUnit?.symbol || "unit"}`
                                                    : "Jumlah minimum"
                                            }
                                            leftIcon={
                                                <Boxes className="w-4 h-4" />
                                            }
                                        />
                                    </div>

                                    {data.price > 0 &&
                                        data.minQuantity > 0 &&
                                        selectedUnit && (
                                            <Alert
                                                variant="info"
                                                title="Estimasi Harga Minimum"
                                                description={`Dengan kuantitas minimum ${data.minQuantity} ${selectedUnit.symbol}, pelanggan akan dikenakan biaya minimal ${formatCurrency(data.price * data.minQuantity)}`}
                                            />
                                        )}
                                </div>

                                <div className="space-y-6">
                                    <div
                                        className="flex items-center gap-3 pb-2"
                                        style={{
                                            borderBottom:
                                                "1px solid var(--color-border)",
                                        }}
                                    >
                                        <div
                                            className="flex items-center justify-center w-10 h-10 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-warning-bg)",
                                            }}
                                        >
                                            <ListOrdered
                                                className="w-5 h-5"
                                                style={{
                                                    color: "var(--color-warning)",
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4
                                                className="text-base font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Proses Layanan
                                            </h4>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Pilih proses produksi yang
                                                diperlukan
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={
                                                    allSelected
                                                        ? handleDeselectAllProcesses
                                                        : handleSelectAllProcesses
                                                }
                                                disabled={
                                                    processing ||
                                                    activeProcesses.length === 0
                                                }
                                            >
                                                {allSelected
                                                    ? "Batalkan Semua"
                                                    : "Pilih Semua"}
                                            </Button>
                                        </div>
                                    </div>

                                    {activeProcesses.length === 0 ? (
                                        <Alert
                                            variant="warning"
                                            title="Tidak ada proses tersedia"
                                            description="Belum ada proses yang aktif. Silakan tambahkan proses terlebih dahulu."
                                        />
                                    ) : (
                                        <div
                                            className="space-y-3 p-4 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-surface)",
                                                border: "1px solid var(--color-border)",
                                                maxHeight: "500px",
                                                overflowY: "auto",
                                            }}
                                        >
                                            {activeProcesses.map(
                                                (process, index) => {
                                                    const isSelected =
                                                        selectedProcessIds.includes(
                                                            process.id,
                                                        );
                                                    const selectedIndex =
                                                        selectedProcessIds.indexOf(
                                                            process.id,
                                                        );

                                                    return (
                                                        <motion.div
                                                            key={process.id}
                                                            initial={{
                                                                opacity: 0,
                                                                y: 10,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            transition={{
                                                                delay:
                                                                    index *
                                                                    0.05,
                                                            }}
                                                            onClick={() =>
                                                                handleProcessToggle(
                                                                    process.id,
                                                                )
                                                            }
                                                            className="flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-all duration-200"
                                                            style={{
                                                                backgroundColor:
                                                                    isSelected
                                                                        ? "var(--color-primary-bg)"
                                                                        : "var(--color-background)",
                                                                border: isSelected
                                                                    ? "2px solid var(--color-primary)"
                                                                    : "1px solid var(--color-border)",
                                                            }}
                                                        >
                                                            <div className="flex-shrink-0 mt-1">
                                                                {isSelected ? (
                                                                    <CheckSquare
                                                                        className="w-5 h-5"
                                                                        style={{
                                                                            color: "var(--color-primary)",
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Square
                                                                        className="w-5 h-5"
                                                                        style={{
                                                                            color: "var(--color-text-tertiary)",
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    {isSelected && (
                                                                        <Badge
                                                                            variant="primary"
                                                                            size="sm"
                                                                        >
                                                                            #
                                                                            {selectedIndex +
                                                                                1}
                                                                        </Badge>
                                                                    )}
                                                                    <h5
                                                                        className="font-medium"
                                                                        style={{
                                                                            color: isSelected
                                                                                ? "var(--color-primary)"
                                                                                : "var(--color-text-primary)",
                                                                        }}
                                                                    >
                                                                        {
                                                                            process.name
                                                                        }
                                                                    </h5>
                                                                </div>
                                                                {process.description && (
                                                                    <p
                                                                        className="text-sm"
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
                                                        </motion.div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    )}

                                    {selectedProcessIds.length > 0 && (
                                        <Alert
                                            variant="success"
                                            title={`${selectedProcessIds.length} proses dipilih`}
                                            description="Urutan proses akan diterapkan sesuai urutan pemilihan"
                                        />
                                    )}

                                    {errors.laundryServiceProcesses && (
                                        <Alert
                                            variant="error"
                                            title="Kesalahan pada proses"
                                            description={
                                                errors.laundryServiceProcesses
                                            }
                                        />
                                    )}
                                </div>

                                {Object.keys(errors).length > 0 && (
                                    <Alert
                                        variant="error"
                                        title="Terdapat kesalahan pada form"
                                        description="Silakan periksa kembali semua field yang bertanda merah."
                                        className="mt-6"
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
                                        onClick={handleBack}
                                        disabled={processing}
                                    >
                                        Batal
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={
                                            processing ||
                                            !data.name ||
                                            !data.unitId ||
                                            data.price <= 0 ||
                                            data.durationHours <= 0 ||
                                            data.minQuantity <= 0
                                        }
                                        loading={processing}
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

CategoryLaundryServiceEdit.layout = (page: any) => {
    const { category, laundryService } = page.props;
    return withAuthenticatedLayout({
        title: `Edit Layanan - ${laundryService.name}`,
        breadcrumbs: [
            {
                label: "Kategori",
                href: route("categories.index"),
            },
            {
                label: category.name,
                href: route("categories.show", category.id),
            },
            { label: "Edit Layanan" },
        ],
    })(page);
};

export default CategoryLaundryServiceEdit;
