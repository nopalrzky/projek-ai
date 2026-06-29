import React from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Save, ArrowLeft, UserPlus, CheckSquare } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import { Input, TextAreaInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import { PositionCreateProps, PositionCreatePropsExtended } from "./types";
import { OutletPositionFormData } from "@/types";
import PageHeader from "@/Components/Page/PageHeader";
import outletService from "@/Services/outlet.service";
import PositionInfoSection from "./Partials/PositionInfoSection";
import PermissionSelector from "./Partials/PermissionSelector";
import PositionFormActions from "./Partials/PositionFormActions";

const OutletPositionCreate = ({
    outlet,
    permissionCatalog,
}: PositionCreatePropsExtended) => {
    const { data, setData, post, processing, errors, clearErrors } =
        useForm<OutletPositionFormData>({
            name: "",
            description: "",
            permissions: [],
        });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(route("outlets.positions.store", outlet.id), {
            preserveScroll: true,
            onError: (errors) => {
                console.error("Validation errors:", errors);
                window.scrollTo({ top: 0, behavior: "smooth" });
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
    };

    return (
        <>
            <Head title={`Tambah Posisi - ${outlet.name}`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title={`Tambah Posisi - ${outlet.name}`}
                        subtitle={`Buat posisi baru untuk outlet ${outlet.name} (${outlet.code})`}
                        icon={UserPlus}
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
                                </div>

                                <PositionFormActions
                                    processing={processing}
                                    isValid={!!data.name.trim()}
                                    submitLabel="Buat Posisi"
                                    onCancel={() => window.history.back()}
                                />
                            </Form>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

OutletPositionCreate.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Tambah Posisi",
        breadcrumbs: [
            { label: "Outlets", href: route("outlets.index") },
            {
                label: page.props.outlet.name,
                href: route("outlets.show", page.props.outlet.id),
            },
            { label: "Tambah Posisi" },
        ],
    })(page);

export default OutletPositionCreate;
