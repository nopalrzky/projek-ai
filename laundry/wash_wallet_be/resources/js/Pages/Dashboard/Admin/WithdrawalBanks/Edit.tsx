import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { CreditCard, ArrowLeft } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/Page/PageHeader";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import { WithdrawalBankForm } from "./Partials/WithdrawalBankForm";
import { WithdrawalBankEditProps } from "./types";

function WithdrawalBankEdit({ bank }: WithdrawalBankEditProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (data: any) => {
        setIsLoading(true);
        router.put(route("admin.withdrawal-banks.update", bank.id), data, {
            onFinish: () => setIsLoading(false),
        });
    };

    return (
        <>
            <Head title={`Ubah Bank - ${bank.bankName}`} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title={`Ubah Bank ${bank.bankName}`}
                        subtitle="Sesuaikan konfigurasi biaya transfer admin bank dan minimal penarikannya."
                        icon={CreditCard}
                        animate={false}
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

                    <Card className="p-8 max-w-2xl">
                        <WithdrawalBankForm
                            bank={bank}
                            onSubmit={handleSubmit}
                            isLoading={isLoading}
                        />
                    </Card>
                </div>
            </motion.div>
        </>
    );
}

WithdrawalBankEdit.layout = withAuthenticatedLayout({
    title: "Ubah Bank Master",
    searchable: false,
    breadcrumbs: [
        { label: "Bank Master", href: route("admin.withdrawal-banks.index") },
        { label: "Ubah Bank", href: "#" },
    ],
});

export default WithdrawalBankEdit;
