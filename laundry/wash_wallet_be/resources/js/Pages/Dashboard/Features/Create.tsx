import React from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Card } from "@/Components/Card";
import FeatureForm from "./Partials/FeatureForm";

const FeaturesCreate = () => {
    const { data, setData, post, processing, errors, reset } = useForm<any>({
        key: "",
        name: "",
        description: "",
        coinPrice: 0,
        isPaid: true,
        isActive: true,
        sortOrder: 0,
        durationDays: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("features.store"), {
            onSuccess: () => reset(),
        });
    };

    return (
        <>
            <Head title="Buat Fitur Baru" />

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
                            Tambah Fitur Baru
                        </h1>
                        <p
                            className="mt-1"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Tambahkan fitur sistem baru ke katalog
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Card className="p-8">
                            <FeatureForm
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

FeaturesCreate.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Buat Fitur Baru",
        breadcrumbs: [
            { label: "Fitur", href: route("features.index") },
            { label: "Buat Baru" },
        ],
    })(page);

export default FeaturesCreate;
