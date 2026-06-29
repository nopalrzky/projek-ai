import React from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Card } from "@/Components/Card";
import FeatureForm from "./Partials/FeatureForm";
import { FeatureEditProps } from "./types";

const FeaturesEdit = ({ feature }: FeatureEditProps) => {
    const { data, setData, put, processing, errors } = useForm<any>({
        key: feature.key,
        name: feature.name,
        description: feature.description || "",
        coinPrice: feature.coinPrice,
        isPaid: feature.isPaid,
        isActive: feature.isActive,
        sortOrder: feature.sortOrder,
        durationDays: feature.durationDays || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("features.update", feature.id));
    };

    return (
        <>
            <Head title={`Edit Fitur - ${feature.name}`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-8"
                    >
                        <h1
                            className="text-2xl font-bold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Edit Fitur: {feature.name}
                        </h1>
                        <p
                            className="mt-1"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Perbarui konfigurasi dan harga fitur
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Card className="p-8">
                            <FeatureForm
                                feature={feature}
                                data={data}
                                setData={setData}
                                errors={errors}
                                processing={processing}
                                onSubmit={handleSubmit}
                            />
                        </Card>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

FeaturesEdit.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Edit Fitur",
        breadcrumbs: [
            { label: "Fitur", href: route("features.index") },
            { label: "Edit Fitur" },
        ],
    })(page);

export default FeaturesEdit;
