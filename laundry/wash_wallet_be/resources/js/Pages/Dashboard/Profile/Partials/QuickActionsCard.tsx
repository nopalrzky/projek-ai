import React from "react";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { Edit, Key, Building2, Wallet, CreditCard, ArrowUpRight, Coins } from "lucide-react";
import type { ProfileSetupChecklist } from "../types";

interface QuickActionsCardProps {
    checklist: ProfileSetupChecklist;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ checklist }) => {
    return (
        <Card>
            <div className="p-6">
                <h3 className="text-base font-semibold text-primary mb-4">
                    Aksi Cepat
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="justify-start h-auto py-3 px-4 font-semibold text-left"
                        href={route("profile.edit")}
                        leftIcon={<Edit className="w-4 h-4 text-info-600 dark:text-info-400" />}
                    >
                        <div>
                            <p className="text-sm font-semibold">Edit Profil</p>
                            <p className="text-[10px] font-normal text-secondary mt-0.5">Ubah info detail akun Anda</p>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        className="justify-start h-auto py-3 px-4 font-semibold text-left"
                        href={route("profile.change-password")}
                        leftIcon={<Key className="w-4 h-4 text-error-600 dark:text-error-400" />}
                    >
                        <div>
                            <p className="text-sm font-semibold">Ganti Password</p>
                            <p className="text-[10px] font-normal text-secondary mt-0.5">Perbarui keamanan akun Anda</p>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        className="justify-start h-auto py-3 px-4 font-semibold text-left"
                        href={route("outlets.index")}
                        leftIcon={<Building2 className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />}
                    >
                        <div>
                            <p className="text-sm font-semibold">Kelola Outlet</p>
                            <p className="text-[10px] font-normal text-secondary mt-0.5">Buka & atur outlet laundry</p>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        className="justify-start h-auto py-3 px-4 font-semibold text-left"
                        href={route("wallet.index")}
                        leftIcon={<Wallet className="w-4 h-4 text-success-600 dark:text-success-400" />}
                    >
                        <div>
                            <p className="text-sm font-semibold">Dompet Koin & Saldo</p>
                            <p className="text-[10px] font-normal text-secondary mt-0.5">Histori & info pendapatan</p>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        className="justify-start h-auto py-3 px-4 font-semibold text-left"
                        href={route("bank-accounts.index")}
                        leftIcon={<CreditCard className="w-4 h-4 text-info-600 dark:text-info-400" />}
                    >
                        <div>
                            <p className="text-sm font-semibold">Rekening Bank</p>
                            <p className="text-[10px] font-normal text-secondary mt-0.5">Daftar rekening withdrawal</p>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        className="justify-start h-auto py-3 px-4 font-semibold text-left"
                        href={route("wallet-withdrawals.create")}
                        disabled={!checklist.hasActiveBankAccount}
                        leftIcon={<ArrowUpRight className="w-4 h-4 text-warning-600 dark:text-warning-400" />}
                    >
                        <div>
                            <p className="text-sm font-semibold">Tarik Saldo</p>
                            <p className="text-[10px] font-normal text-secondary mt-0.5">
                                {checklist.hasActiveBankAccount
                                    ? "Ajukan pencairan dana"
                                    : "Sambungkan bank dahulu"}
                            </p>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        className="justify-start h-auto py-3 px-4 font-semibold text-left"
                        href={route("topups.index")}
                        leftIcon={<Coins className="w-4 h-4 text-warning-600 dark:text-warning-400" />}
                    >
                        <div>
                            <p className="text-sm font-semibold">Topup Koin</p>
                            <p className="text-[10px] font-normal text-secondary mt-0.5">Beli koin kualifikasi outlet</p>
                        </div>
                    </Button>
                </div>
            </div>
        </Card>
    );
};
