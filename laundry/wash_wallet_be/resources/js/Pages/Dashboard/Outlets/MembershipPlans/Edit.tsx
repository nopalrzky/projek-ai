import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Save,
    ArrowLeft,
    CreditCard,
    FileText,
    DollarSign,
    Calendar,
    Percent,
    Award,
    CheckSquare,
    Edit,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import { Input, TextAreaInput, NumberInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { OutletMembershipPlanEditProps } from "./types";
import { OutletMembershipPlanFormData } from "@/types";
import PageHeader from "@/Components/Page/PageHeader";
import outletService from "@/Services/outlet.service";

const OutletMembershipPlanEdit = ({
    outlet,
    membershipPlan,
}: OutletMembershipPlanEditProps) => {
    const { data, setData, put, processing, errors, clearErrors, isDirty } =
        useForm<OutletMembershipPlanFormData>({
            name: membershipPlan.name || "",
            price: membershipPlan.price || 0,
            durationDays: membershipPlan.durationDays || null,
            discountPercentage: membershipPlan.discountPercentage || null,
            description: membershipPlan.description || "",
            level: membershipPlan.level || 1,
            isActive: membershipPlan.isActive ?? true,
        });

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        put(
            route("outlets.membership-plans.update", [
                outlet.id,
                membershipPlan.id,
            ]),
            {
                preserveScroll: true,
                onError: (errors) => {
                    console.error("Validation errors:", errors);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                },
                onSuccess: () => {
                    setHasUnsavedChanges(false);
                },
            },
        );
    };

    const handleDataChange = (
        key: keyof OutletMembershipPlanFormData,
        value: any,
    ) => {
        setData(key, value);

        if (errors[key]) {
            clearErrors(key);
        }

        if (!hasUnsavedChanges) {
            setHasUnsavedChanges(true);
        }
    };

    const isFormValid =
        data.name.trim() !== "" && data.price > 0 && data.level > 0;

    const monthlyPrice =
        data.durationDays && data.durationDays > 0
            ? (data.price / data.durationDays) * 30
            : 0;

    const hasContracts = (membershipPlan.membershipContractsCount || 0) > 0;

    return (
        <>
            <Head
                title={`Edit Paket: ${membershipPlan.name} - ${outlet.name}`}
            />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title={`Edit Paket Membership - ${outlet.name}`}
                        subtitle={`Edit paket "${membershipPlan.name}" di outlet ${outlet.name} (${outlet.code})`}
                        icon={Edit}
                        variant="default"
                        actions={
                            <Button
                                onClick={() =>
                                    outletService.goToView(outlet.id)
                                }
                                variant="outline"
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
                                {/* Basic Information */}
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
                                            <CreditCard
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
                                                Informasi Paket
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Edit detail dasar paket
                                                membership
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <Input
                                            label="Nama Paket"
                                            placeholder="Contoh: Basic, Silver, Gold, Platinum"
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
                                            hint="Nama paket membership yang mudah diingat"
                                            autoFocus
                                            maxLength={255}
                                        />

                                        <NumberInput
                                            label="Level Membership"
                                            value={data.level}
                                            onValueChange={(value) =>
                                                handleDataChange(
                                                    "level",
                                                    value || 1,
                                                )
                                            }
                                            error={errors.level}
                                            required
                                            disabled={processing}
                                            leftIcon={
                                                <Award className="w-5 h-5" />
                                            }
                                            hint="Tingkat/urutan membership (1-100)"
                                            min={1}
                                            max={100}
                                            placeholder="1"
                                        />
                                    </div>

                                    <TextAreaInput
                                        label="Deskripsi Paket"
                                        placeholder="Jelaskan benefit dan keuntungan paket membership ini..."
                                        value={data.description}
                                        onChange={(e) =>
                                            handleDataChange(
                                                "description",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.description}
                                        disabled={processing}
                                        hint="Deskripsi detail tentang paket ini (opsional)"
                                        rows={4}
                                        maxLength={1000}
                                        showCharacterCount={true}
                                        autoResize={true}
                                        minRows={4}
                                        maxRows={8}
                                    />
                                </div>

                                {/* Pricing & Benefits */}
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
                                                Harga & Benefit
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Atur harga dan keuntungan
                                                membership
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <NumberInput
                                            label="Harga Paket"
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
                                            hint="Harga paket membership dalam Rupiah"
                                            min={0}
                                            max={99999999999.99}
                                            allowDecimal={true}
                                            prefix="Rp"
                                            thousandSeparator=","
                                            placeholder="0"
                                        />

                                        <NumberInput
                                            label="Durasi Berlaku"
                                            value={
                                                data.durationDays || undefined
                                            }
                                            onValueChange={(value) =>
                                                handleDataChange(
                                                    "durationDays",
                                                    value || null,
                                                )
                                            }
                                            error={errors.durationDays}
                                            disabled={processing}
                                            leftIcon={
                                                <Calendar className="w-5 h-5" />
                                            }
                                            hint="Durasi berlaku membership dalam hari (kosongkan untuk tanpa batas)"
                                            min={1}
                                            max={3650}
                                            placeholder="30"
                                            suffix="hari"
                                        />

                                        <NumberInput
                                            label="Diskon Membership"
                                            value={
                                                data.discountPercentage ||
                                                undefined
                                            }
                                            onValueChange={(value) =>
                                                handleDataChange(
                                                    "discountPercentage",
                                                    value || null,
                                                )
                                            }
                                            error={errors.discountPercentage}
                                            disabled={processing}
                                            leftIcon={
                                                <Percent className="w-5 h-5" />
                                            }
                                            hint="Persentase diskon untuk member (opsional)"
                                            min={0}
                                            max={100}
                                            allowDecimal={true}
                                            placeholder="0"
                                            suffix="%"
                                        />

                                        {monthlyPrice > 0 && (
                                            <div
                                                className="p-4 rounded-lg border"
                                                style={{
                                                    backgroundColor:
                                                        "var(--color-info-50)",
                                                    borderColor:
                                                        "var(--color-info-200)",
                                                }}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <DollarSign
                                                        className="w-4 h-4"
                                                        style={{
                                                            color: "var(--color-info-600)",
                                                        }}
                                                    />
                                                    <span
                                                        className="text-xs font-medium"
                                                        style={{
                                                            color: "var(--color-info-700)",
                                                        }}
                                                    >
                                                        Harga per Bulan
                                                    </span>
                                                </div>
                                                <p
                                                    className="text-lg font-semibold"
                                                    style={{
                                                        color: "var(--color-info-700)",
                                                    }}
                                                >
                                                    Rp{" "}
                                                    {monthlyPrice.toLocaleString(
                                                        "id-ID",
                                                        {
                                                            maximumFractionDigits: 0,
                                                        },
                                                    )}
                                                </p>
                                                <p
                                                    className="text-xs mt-1"
                                                    style={{
                                                        color: "var(--color-info-600)",
                                                    }}
                                                >
                                                    Perkiraan biaya bulanan
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Status & Settings */}
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
                                            <CheckSquare
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
                                                Status Paket
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Ubah status paket membership
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
                                                Paket Aktif
                                            </label>
                                            <span
                                                className="text-xs"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                (Paket aktif dapat dibeli oleh
                                                pelanggan)
                                            </span>
                                        </div>

                                        {!data.isActive && (
                                            <Alert
                                                variant="warning"
                                                description="Menonaktifkan paket ini akan membuatnya tidak tersedia untuk pembelian baru. Kontrak yang sudah ada tetap berlaku."
                                                className="text-sm"
                                            />
                                        )}

                                        {hasContracts && (
                                            <Alert
                                                variant="info"
                                                title="Informasi Kontrak"
                                                description={`Paket ini memiliki ${membershipPlan.membershipContractsCount} kontrak aktif. Perubahan harga atau durasi tidak akan mempengaruhi kontrak yang sudah berjalan.`}
                                                className="text-sm"
                                            />
                                        )}
                                    </div>
                                </div>

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
                                        onClick={() => window.history.back()}
                                        disabled={processing}
                                        leftIcon={
                                            <ArrowLeft className="w-4 h-4" />
                                        }
                                    >
                                        Batal
                                    </Button>

                                    <div className="flex items-center gap-3">
                                        {isDirty && hasUnsavedChanges && (
                                            <span
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                Ada perubahan yang belum
                                                disimpan
                                            </span>
                                        )}

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled={
                                                processing ||
                                                !isFormValid ||
                                                (!isDirty && !hasUnsavedChanges)
                                            }
                                            loading={processing}
                                            size="lg"
                                            leftIcon={
                                                <Save className="w-4 h-4" />
                                            }
                                        >
                                            {processing
                                                ? "Menyimpan..."
                                                : "Simpan Perubahan"}
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

OutletMembershipPlanEdit.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Edit Paket Membership",
        breadcrumbs: [
            { label: "Outlets", href: route("outlets.index") },
            {
                label: page.props.outlet?.name || "Detail",
                href: route("outlets.show", page.props.outlet?.id),
            },
            { label: "Edit Paket" },
        ],
    })(page);

export default OutletMembershipPlanEdit;
