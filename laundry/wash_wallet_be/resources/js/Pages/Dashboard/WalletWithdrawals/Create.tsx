import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { ArrowLeft, Landmark, Plus, Wallet } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/Page/PageHeader";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import { NoData } from "@/Components/State";
import { WithdrawalForm } from "./Partials/WithdrawalForm";
import { WalletWithdrawalCreateProps } from "./types";

function WalletWithdrawalCreate({ stats, accounts }: WalletWithdrawalCreateProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (data: { ownerBankAccountId: number; requestedAmount: number }) => {
        setIsLoading(true);
        router.post(route("wallet-withdrawals.store"), data, {
            onFinish: () => setIsLoading(false),
        });
    };

    const hasAccounts = accounts.length > 0;

    return (
        <>
            <Head title="Tarik Saldo" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Tarik Saldo Pendapatan"
                        subtitle="Ajukan penarikan dana dari saldo wallet pendapatan Anda ke rekening bank tujuan."
                        icon={Wallet}
                        animate={true}
                        actions={
                            <Button
                                type="button"
                                variant="outline"
                                leftIcon={<ArrowLeft className="w-4 h-4" />}
                                onClick={() =>
                                    router.visit(route("wallet.index"))
                                }
                            >
                                Kembali
                            </Button>
                        }
                    />

                    {!hasAccounts ? (
                        <Card variant="elevated" className="overflow-hidden">
                            <NoData
                                variant="feature"
                                title="Belum Ada Rekening Bank"
                                message="Daftarkan setidaknya satu rekening bank aktif sebelum mengajukan penarikan saldo pendapatan."
                                icon={
                                    <Landmark
                                        className="h-16 w-16"
                                        style={{
                                            color: "var(--color-warning-500)",
                                        }}
                                    />
                                }
                                action={
                                    <div className="flex flex-col items-center gap-3">
                                        <Button
                                            variant="primary"
                                            leftIcon={
                                                <Plus className="h-4 w-4" />
                                            }
                                            onClick={() =>
                                                router.visit(
                                                    route(
                                                        "bank-accounts.create",
                                                    ),
                                                )
                                            }
                                        >
                                            Tambah Rekening Bank
                                        </Button>
                                    </div>
                                }
                                className="px-6"
                            />
                        </Card>
                    ) : (
                        <Card className="p-8">
                            <WithdrawalForm
                                stats={stats}
                                accounts={accounts}
                                onSubmit={handleSubmit}
                                isLoading={isLoading}
                            />
                        </Card>
                    )}
                </div>
            </motion.div>
        </>
    );
}

WalletWithdrawalCreate.layout = withAuthenticatedLayout({
    title: "Tarik Saldo",
    searchable: false,
    breadcrumbs: [
        { label: "Wallet", href: route("wallet.index") },
        { label: "Tarik Saldo", href: route("wallet-withdrawals.create") },
    ],
});

export default WalletWithdrawalCreate;
