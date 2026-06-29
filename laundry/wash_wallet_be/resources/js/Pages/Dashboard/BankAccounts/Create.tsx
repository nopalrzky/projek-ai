import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/Page/PageHeader";
import { Card } from "@/Components/Card";
import { BankAccountForm } from "./Partials/BankAccountForm";
import { WithdrawalBank } from "@/types";

interface BankAccountCreateProps {
    banks: WithdrawalBank[];
}

function BankAccountCreate({ banks }: BankAccountCreateProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (data: any) => {
        setIsLoading(true);
        router.post(route("bank-accounts.store"), data, {
            onFinish: () => setIsLoading(false),
        });
    };

    return (
        <>
            <Head title="Tambah Rekening Bank" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Tambah Rekening Bank"
                        subtitle="Tambahkan rekening baru untuk penarikan dana pendapatan Anda."
                        icon={CreditCard}
                        animate={true}
                    />

                    <Card className="p-8">
                        <BankAccountForm
                            banks={banks}
                            onSubmit={handleSubmit}
                            isLoading={isLoading}
                        />
                    </Card>
                </div>
            </motion.div>
        </>
    );
}

BankAccountCreate.layout = withAuthenticatedLayout({
    title: "Tambah Rekening Bank",
    searchable: false,
    breadcrumbs: [
        { label: "Rekening Bank", href: route("bank-accounts.index") },
        { label: "Tambah Rekening", href: route("bank-accounts.create") },
    ],
});

export default BankAccountCreate;
