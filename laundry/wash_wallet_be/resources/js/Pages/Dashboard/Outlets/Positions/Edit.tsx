import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Save, ArrowLeft, UserPlus, CheckSquare, Edit } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import { Input, TextAreaInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { PositionEditProps, PositionEditPropsExtended } from "./types";
import { OutletPositionFormData } from "@/types";
import PageHeader from "@/Components/Page/PageHeader";
import outletService from "@/Services/outlet.service";
import PositionInfoSection from "./Partials/PositionInfoSection";
import PermissionSelector from "./Partials/PermissionSelector";
import PositionStatusSection from "./Partials/PositionStatusSection";
import PositionFormActions from "./Partials/PositionFormActions";

const OutletPositionEdit = ({
    outlet,
    position,
    permissionCatalog,
}: PositionEditPropsExtended) => {
    const { data, setData, put, processing, errors, clearErrors, isDirty } =
        useForm<OutletPositionFormData>({
            name: position.name || "",
            description: position.description || "",
            isActive: position.isActive ?? true,
            permissions: position.permissions || [],
        });

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        put(route("outlets.positions.update", [outlet.id, position.id]), {
            preserveScroll: true,
            onError: (errors) => {
                console.error("Validation errors:", errors);
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
            onSuccess: () => {
                setHasUnsavedChanges(false);
            },
        });
    };

    const handleDataChange = (
        key: keyof OutletPositionFormData,
        value: any,
    ) => {
        setData(key as string, value);

        if (errors[key]) {
            clearErrors(key as string);
        }

        if (!hasUnsavedChanges) {
            setHasUnsavedChanges(true);
        }
    };

    return (
        <>
            <Head title={`Edit Posisi: ${position.name} - ${outlet.name}`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title={`Edit Posisi - ${outlet.name}`}
                        subtitle={`Edit posisi "${position.name}" di outlet ${outlet.name} (${outlet.code})`}
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
                                <div className="space-y-6">
                                    <PositionInfoSection
                                        name={data.name}
                                        description={data.description || ""}
                                        errors={{
                                            name: errors.name,
                                            description: errors.description,
                                        }}
                                        processing={processing}
                                        onChange={(k, v) =>
                                            handleDataChange(k, v)
                                        }
                                    />

                                    <PermissionSelector
                                        catalog={permissionCatalog}
                                        selected={data.permissions || []}
                                        onChange={(p) =>
                                            handleDataChange("permissions", p)
                                        }
                                        disabled={processing}
                                        errors={errors}
                                    />

                                    <PositionStatusSection
                                        isActive={data.isActive!}
                                        onChange={(v) =>
                                            handleDataChange("isActive", v)
                                        }
                                        disabled={processing}
                                    />
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
                                                !data.name.trim() ||
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

OutletPositionEdit.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Edit Posisi",
        breadcrumbs: [
            { label: "Outlets", href: route("outlets.index") },
            {
                label: page.props.outlet.name,
                href: route("outlets.show", page.props.outlet.id),
            },
            { label: "Edit Posisi" },
        ],
    })(page);

export default OutletPositionEdit;
