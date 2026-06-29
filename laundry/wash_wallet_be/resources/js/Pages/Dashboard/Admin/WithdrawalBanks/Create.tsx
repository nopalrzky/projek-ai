import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { CreditCard, ArrowLeft } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/Page/PageHeader";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { WithdrawalBankForm } from "./Partials/WithdrawalBankForm";
import { WithdrawalBankCreateProps } from "./types";

function WithdrawalBankCreate({ flash }: WithdrawalBankCreateProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (data: any) => {
        setIsLoading(true);
        router.post(route("admin.withdrawal-banks.store"), data, {
            onFinish: () => setIsLoading(false),
        });
    };

    return (
        <>
            <Head title="Tambah Bank Master" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Tambah Bank Master"
                        subtitle="Tambahkan master bank baru beserta biaya admin dan batas minimum penarikannya."
                        icon={CreditCard}
                        animate={true}
                        actions={
                            <Button
                                type="button"
                                variant="outline"
                                leftIcon={<ArrowLeft className="w-4 h-4" />}
                                onClick={() =>
                                    router.visit(
                                        route("admin.withdrawal-banks.index"),
                                    )
                                }
                            >
                                Kembali
                            </Button>
                        }
                    />

                    {flash?.error && (
                        <Alert
                            variant="error"
                            title="Error"
                            description={flash.error}
                        />
                    )}

                    <Card className="p-8 max-w-2xl">
                        <WithdrawalBankForm
                            onSubmit={handleSubmit}
                            isLoading={isLoading}
                        />
                    </Card>
                </div>
            </motion.div>
        </>
    );
}

WithdrawalBankCreate.layout = withAuthenticatedLayout({
    title: "Tambah Bank Master",
    searchable: false,
    breadcrumbs: [
        { label: "Bank Master", href: route("admin.withdrawal-banks.index") },
        { label: "Tambah Bank", href: route("admin.withdrawal-banks.create") },
    ],
});

export default WithdrawalBankCreate;
