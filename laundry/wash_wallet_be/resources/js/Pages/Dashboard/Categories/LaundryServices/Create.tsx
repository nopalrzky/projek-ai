import React, { useState, useCallback } from "react";
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
import { CategoryLaundryServiceCreateProps } from "./type";
import { formatCurrency } from "@/lib/utils";
import { CategoryLaundryServiceFormData } from "@/types";
import PageHeader from "@/Components/Page/PageHeader";

function CategoryLaundryServiceCreate({
    category,
    units,
    processes,
}: CategoryLaundryServiceCreateProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        clearErrors,
        wasSuccessful,
    } = useForm<CategoryLaundryServiceFormData>({
        unitId: 0,
        name: "",
        description: "",
        price: 0,
        durationHours: 24,
        minQuantity: 1,
        laundryServiceProcesses: [],
    });

    const [selectedProcessIds, setSelectedProcessIds] = useState<number[]>([]);

    const handleSubmit = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            post(route("categories.laundry-services.store", category.id), {
                onSuccess: () => {
                    setSelectedProcessIds([]);
                },
                onError: (errors) => {
                    console.error("Form submission errors:", errors);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                },
            });
        },
        [post, category.id],
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
            <Head title={`Tambah Layanan - ${category.name}`} />
            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Tambah Layanan Laundry"
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
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-warning-100)",
                                            }}
                                        >
                                            <FolderOpen
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
                                                Kategori
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Kategori untuk layanan laundry
                                                ini
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className="p-5 rounded-lg border"
                                        style={{
                                            backgroundColor:
                                                "var(--color-surface-secondary)",
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1 flex-1">
                                                    <h3
                                                        className="text-lg font-semibold"
                                                        style={{
                                                            color: "var(--color-text-primary)",
                                                        }}
                                                    >
                                                        {category.name}
                                                    </h3>
                                                    {category.description && (
                                                        <p
                                                            className="text-sm"
                                                            style={{
                                                                color: "var(--color-text-secondary)",
                                                            }}
                                                        >
                                                            {
                                                                category.description
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge
                                                    variant={
                                                        category.isActive
                                                            ? "success"
                                                            : "error"
                                                    }
                                                >
                                                    {category.isActive
                                                        ? "Aktif"
                                                        : "Non-aktif"}
                                                </Badge>
                                            </div>

                                            {category.outlet && (
                                                <div
                                                    className="flex items-center gap-2 pt-3 border-t"
                                                    style={{
                                                        borderColor:
                                                            "var(--color-border)",
                                                    }}
                                                >
                                                    <Building2
                                                        className="w-4 h-4"
                                                        style={{
                                                            color: "var(--color-text-tertiary)",
                                                        }}
                                                    />
                                                    <span
                                                        className="text-sm"
                                                        style={{
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        Outlet:{" "}
                                                        <span className="font-semibold">
                                                            {
                                                                category.outlet
                                                                    .name
                                                            }
                                                        </span>
                                                    </span>
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
                                                Detail dan informasi layanan
                                                laundry
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Nama Layanan"
                                            placeholder="Contoh: Cuci + Setrika Express"
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
                                                <Package className="w-5 h-5" />
                                            }
                                            hint="Nama layanan yang akan ditampilkan"
                                            autoFocus
                                            maxLength={255}
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
                                            hint={
                                                units.length === 0
                                                    ? "Belum ada unit tersedia"
                                                    : "Pilih unit untuk layanan ini"
                                            }
                                            searchable={true}
                                            clearable={true}
                                            multiple={false}
                                            noOptionsText="Tidak ada unit tersedia"
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
                                                Tentukan harga, durasi, dan
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
                                        className="flex items-center justify-between pb-4 border-b"
                                        style={{
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="p-3 rounded-lg"
                                                style={{
                                                    backgroundColor:
                                                        "var(--color-warning-100)",
                                                }}
                                            >
                                                <ListOrdered
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
                                        leftIcon={
                                            <ArrowLeft className="w-4 h-4" />
                                        }
                                    >
                                        Kembali ke Kategori
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={
                                            processing ||
                                            !data.unitId ||
                                            !data.name.trim() ||
                                            data.price <= 0 ||
                                            data.durationHours <= 0 ||
                                            data.minQuantity <= 0
                                        }
                                        loading={processing}
                                        size="lg"
                                        leftIcon={<Save className="w-4 h-4" />}
                                    >
                                        {processing
                                            ? "Menyimpan..."
                                            : "Buat Layanan"}
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

CategoryLaundryServiceCreate.layout = (page: any) => {
    const { category } = page.props;
    return withAuthenticatedLayout({
        title: `Tambah Layanan - ${category.name}`,
        breadcrumbs: [
            {
                label: "Kategori",
                href: route("categories.index"),
            },
            {
                label: category.name,
                href: route("categories.show", category.id),
            },
            { label: "Tambah Layanan" },
        ],
    })(page);
};

export default CategoryLaundryServiceCreate;
