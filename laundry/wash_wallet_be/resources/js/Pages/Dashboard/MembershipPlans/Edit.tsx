import React from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Save,
    ArrowLeft,
    Crown,
    DollarSign,
    Calendar,
    Percent,
    FileText,
    Store,
    FolderEdit,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/Page/PageHeader";
import { Form } from "@/Components/Form";
import { Input, TextAreaInput, SelectInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { MembershipPlanFormData } from "@/types";
import { MembershipPlanEditProps } from "./types";
import { membershipPlanService } from "@/Services/membership_plan.service";

const MembershipPlansEdit = ({ membershipPlan }: MembershipPlanEditProps) => {
    const { data, setData, put, processing, errors, clearErrors } =
        useForm<MembershipPlanFormData>({
            outletId: membershipPlan.outletId,
            name: membershipPlan.name,
            price: membershipPlan.price,
            durationDays: membershipPlan.durationDays,
            isActive: membershipPlan.isActive,
            discountPercentage: membershipPlan.discountPercentage,
            description: membershipPlan.description || "",
            level: membershipPlan.level,
        });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        put(route("membership-plans.update", membershipPlan.id), {
            preserveScroll: true,
            onSuccess: () => {
                console.log("Membership plan updated successfully");
            },
            onError: (errors) => {
                console.error("Form submission errors:", errors);
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
        });
    };
    const handleDataChange = (
        key: keyof MembershipPlanFormData,
        value: any,
    ) => {
        setData(key, value);

        if (errors[key]) {
            clearErrors(key);
        }
    };
    return (
        <>
            <Head title={`Edit ${membershipPlan.name}`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Edit Paket Membership"
                        subtitle={`Perbarui informasi paket membership ${membershipPlan.name}`}
                        icon={FolderEdit}
                        actions={
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    membershipPlanService.goToIndex()
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
                                                    "var(--color-primary-100)",
                                            }}
                                        >
                                            <Store
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
                                                Outlet
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Outlet untuk paket membership
                                                ini
                                            </p>
                                        </div>
                                    </div>

                                    <Input
                                        label="Outlet"
                                        value={membershipPlan.outlet.name}
                                        placeholder="Pilih Outlet"
                                        disabled={true}
                                        error={errors.outletId}
                                        required
                                        leftIcon={<Store className="w-5 h-5" />}
                                        hint="Outlet tidak dapat diubah setelah dibuat"
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
                                                    "var(--color-warning-100)",
                                            }}
                                        >
                                            <Crown
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
                                                Informasi Paket
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Detail dasar paket membership
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <Input
                                            label="Nama Paket"
                                            placeholder="Contoh: Silver, Gold, Platinum"
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
                                                <Crown className="w-5 h-5" />
                                            }
                                            hint="Nama yang mudah diingat untuk paket membership"
                                            autoFocus
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="Harga"
                                                type="number"
                                                placeholder="90000"
                                                value={data.price.toString()}
                                                onChange={(e) =>
                                                    handleDataChange(
                                                        "price",
                                                        parseFloat(
                                                            e.target.value,
                                                        ) || 0,
                                                    )
                                                }
                                                error={errors.price}
                                                required
                                                disabled={processing}
                                                leftIcon={
                                                    <DollarSign className="w-5 h-5" />
                                                }
                                                hint="Harga paket dalam Rupiah"
                                                min={0}
                                                step={1000}
                                            />

                                            <Input
                                                label="Durasi (Hari)"
                                                type="number"
                                                placeholder="30"
                                                value={
                                                    data.durationDays?.toString() ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    handleDataChange(
                                                        "durationDays",
                                                        e.target.value
                                                            ? parseInt(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : null,
                                                    )
                                                }
                                                error={errors.durationDays}
                                                disabled={processing}
                                                leftIcon={
                                                    <Calendar className="w-5 h-5" />
                                                }
                                                hint="Durasi berlaku (kosongkan untuk unlimited)"
                                                min={1}
                                            />
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
                                                    "var(--color-success-100)",
                                            }}
                                        >
                                            <Percent
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
                                                Diskon & Benefit
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Keuntungan untuk member
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Level Paket"
                                            type="number"
                                            placeholder="1"
                                            value={data.level.toString()}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "level",
                                                    parseInt(e.target.value) ||
                                                        1,
                                                )
                                            }
                                            error={errors.level}
                                            required
                                            disabled={processing}
                                            leftIcon={
                                                <Crown className="w-5 h-5" />
                                            }
                                            hint="Tingkat paket membership (1 = Basic, 2 = Silver, dll)"
                                            min={1}
                                            step={1}
                                        />

                                        <Input
                                            label="Diskon (%)"
                                            type="number"
                                            placeholder="10"
                                            value={data.discountPercentage.toString()}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "discountPercentage",
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                                )
                                            }
                                            error={errors.discountPercentage}
                                            disabled={processing}
                                            leftIcon={
                                                <Percent className="w-5 h-5" />
                                            }
                                            hint="Persentase diskon untuk setiap transaksi"
                                            min={0}
                                            max={100}
                                            step={0.5}
                                        />
                                    </div>

                                    <TextAreaInput
                                        label="Deskripsi"
                                        placeholder="Jelaskan benefit dan keuntungan dari paket ini..."
                                        value={data.description || ""}
                                        onChange={(e) =>
                                            handleDataChange(
                                                "description",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.description}
                                        disabled={processing}
                                        hint="Deskripsi lengkap tentang paket membership (opsional)"
                                        rows={4}
                                        showCharacterCount={true}
                                        maxLength={1000}
                                        autoResize={true}
                                        minRows={4}
                                        maxRows={8}
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
                                                Status Paket
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Ubah status ketersediaan paket
                                            </p>
                                        </div>
                                    </div>

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
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                                        />
                                        <div className="flex-1">
                                            <label
                                                htmlFor="isActive"
                                                className="text-sm font-medium cursor-pointer"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Paket Aktif
                                            </label>
                                            <p
                                                className="text-xs mt-0.5"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                Paket aktif dapat dipilih dan
                                                digunakan oleh pelanggan
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {Object.keys(errors).length > 0 && (
                                    <Alert
                                        variant="error"
                                        title="Terdapat kesalahan pada form"
                                        description="Silakan periksa kembali semua field yang bertanda merah."
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
                                            membershipPlanService.goToIndex()
                                        }
                                        disabled={processing}
                                        leftIcon={
                                            <ArrowLeft className="w-4 h-4" />
                                        }
                                    >
                                        Batal
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={
                                            processing ||
                                            !data.name.trim() ||
                                            data.price <= 0
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
};

MembershipPlansEdit.layout = withAuthenticatedLayout({
    title: "Edit Paket Membership",
    breadcrumbs: [
        {
            label: "Paket Membership",
            href: route("membership-plans.index"),
        },
        { label: "Edit" },
    ],
});

export default MembershipPlansEdit;
