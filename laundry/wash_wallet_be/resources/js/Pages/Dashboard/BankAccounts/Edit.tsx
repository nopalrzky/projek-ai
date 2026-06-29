import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/Page/PageHeader";
import { Card } from "@/Components/Card";
import { BankAccountForm } from "./Partials/BankAccountForm";
import { OwnerBankAccount, WithdrawalBank } from "@/types";

interface BankAccountEditProps {
    account: OwnerBankAccount;
    banks: WithdrawalBank[];
}

function BankAccountEdit({ account, banks }: BankAccountEditProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (data: any) => {
        setIsLoading(true);
        router.put(route("bank-accounts.update", account.id), data, {
            onFinish: () => setIsLoading(false),
        });
    };

    return (
        <>
            <Head title="Ubah Rekening Bank" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Ubah Rekening Bank"
                        subtitle="Ubah detail informasi rekening bank Anda."
                        icon={CreditCard}
                        animate={true}
                    />

                    <Card className="p-8 max-w-2xl">
                        <BankAccountForm
                            account={account}
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

BankAccountEdit.layout = withAuthenticatedLayout({
    title: "Ubah Rekening Bank",
    searchable: false,
    breadcrumbs: [
        { label: "Rekening Bank", href: route("bank-accounts.index") },
        { label: "Ubah Rekening" },
    ],
});

export default BankAccountEdit;
