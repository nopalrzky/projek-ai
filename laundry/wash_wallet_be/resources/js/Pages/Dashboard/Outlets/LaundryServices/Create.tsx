import React, { useState, useCallback } from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Save,
    ArrowLeft,
    Shirt,
    Tag,
    Package,
    DollarSign,
    Clock,
    Boxes,
    ListOrdered,
    CheckSquare,
    Square,
    Building2,
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
import { OutletLaundryServiceCreateProps } from "./types";
import { OutletLaundryServiceFormData } from "@/types";
import PageHeader from "@/Components/Page/PageHeader";
import { formatCurrency } from "@/lib/utils";
import outletService from "@/Services/outlet.service";
import CourierEligibilityField from "./Partials/CourierEligibilityField";

const OutletLaundryServiceCreate = ({
    outlet,
    categories = [],
    units = [],
    processes = [],
}: OutletLaundryServiceCreateProps) => {
    const { data, setData, post, processing, errors, clearErrors } =
        useForm<OutletLaundryServiceFormData>({
            categoryId: 0,
            unitId: 0,
            name: "",
            description: "",
            supportsCourier: false,
            price: 0,
            durationHours: 24,
            minQuantity: 1,
            laundryServiceProcesses: [],
        });

    const [selectedProcessIds, setSelectedProcessIds] = useState<number[]>([]);

    const handleSubmit = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            post(route("outlets.laundry-services.store", outlet.id), {
                onSuccess: () => {
                    setSelectedProcessIds([]);
                },
                onError: (errors) => {
                    console.error("Form submission errors:", errors);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                },
            });
        },
        [post, outlet.id],
    );
    const handleDataChange = (
        key: keyof OutletLaundryServiceFormData,
        value: any,
    ) => {
        setData(key as string, value);

        if (errors[key]) {
            clearErrors(key as string);
        }
    };

    const handleCategoryChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const categoryId = parseInt(event.target.value, 10);
        handleDataChange("categoryId", isNaN(categoryId) ? 0 : categoryId);
    };

    const handleUnitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const unitId = parseInt(event.target.value, 10);
        handleDataChange("unitId", isNaN(unitId) ? 0 : unitId);
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
            <Head title={`Tambah Layanan Laundry - ${outlet.name}`} />
            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Tambah Layanan Laundry"
                        subtitle={`Outlet: ${outlet.name} (${outlet.code})`}
                        icon={<Shirt className="w-6 h-6" />}
                        actions={
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    outletService.goToView(outlet.id)
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
                                            <Building2
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
                                                Informasi Outlet
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    {outlet.name}
                                                </p>
                                                <span
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-tertiary)",
                                                    }}
                                                >
                                                    •
                                                </span>
                                                <span
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-tertiary)",
                                                    }}
                                                >
                                                    {outlet.code}
                                                </span>
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
                                                <Shirt
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

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <SelectInput
                                                label="Kategori"
                                                options={categoryOptions}
                                                value={
                                                    data.categoryId > 0
                                                        ? data.categoryId.toString()
                                                        : ""
                                                }
                                                onChange={handleCategoryChange}
                                                error={errors.categoryId}
                                                disabled={
                                                    processing ||
                                                    categories.length === 0
                                                }
                                                required
                                                hint={
                                                    categories.length === 0
                                                        ? "Belum ada kategori"
                                                        : "Pilih kategori layanan"
                                                }
                                                leftIcon={
                                                    <Tag className="w-4 h-4" />
                                                }
                                            />

                                            <SelectInput
                                                label="Unit"
                                                options={unitOptions}
                                                value={
                                                    data.unitId > 0
                                                        ? data.unitId.toString()
                                                        : ""
                                                }
                                                onChange={handleUnitChange}
                                                error={errors.unitId}
                                                disabled={
                                                    processing ||
                                                    units.length === 0
                                                }
                                                required
                                                hint={
                                                    selectedUnit
                                                        ? `Satuan: ${selectedUnit.symbol}`
                                                        : "Pilih unit pengukuran"
                                                }
                                                leftIcon={
                                                    <Package className="w-4 h-4" />
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

                                    <div className="pt-4">
                                        <CourierEligibilityField
                                            value={
                                                data.supportsCourier ?? false
                                            }
                                            onChange={(v) =>
                                                handleDataChange(
                                                    "supportsCourier",
                                                    v,
                                                )
                                            }
                                            disabled={processing}
                                            error={errors.supportsCourier}
                                        />
                                    </div>

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
                                        onClick={() =>
                                            outletService.goToView(outlet.id)
                                        }
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
                                            !data.categoryId ||
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
};

OutletLaundryServiceCreate.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Tambah Layanan Laundry",
        breadcrumbs: [
            { label: "Outlets", href: route("outlets.index") },
            {
                label: page.props.outlet?.name || "Detail",
                href: route("outlets.show", page.props.outlet?.id),
            },
            { label: "Tambah Layanan" },
        ],
    })(page);

export default OutletLaundryServiceCreate;
