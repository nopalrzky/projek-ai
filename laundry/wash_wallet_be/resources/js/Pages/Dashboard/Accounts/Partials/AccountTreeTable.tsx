import React from "react";
import AccountRow from "./AccountRow";
import { AccountTreeTableProps } from "../types";
import { Account } from "@/types";
import { AlertCircle } from "lucide-react";

const AccountTreeTable: React.FC<AccountTreeTableProps> = ({
    accounts,
    isLoading = false,
    onCreateChild,
    onEdit,
    onDelete,
}) => {
    if (isLoading) {
        return (
            <div
                className="rounded-xl border shadow-sm overflow-hidden"
                style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                }}
            >
                <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p
                        className="mt-4 text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Memuat data...
                    </p>
                </div>
            </div>
        );
    }

    if (!accounts || accounts.length === 0) {
        return (
            <div
                className="rounded-xl border shadow-sm overflow-hidden"
                style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                }}
            >
                <div className="p-8 text-center">
                    <AlertCircle
                        className="w-12 h-12 mx-auto mb-4 opacity-50"
                        style={{ color: "var(--color-text-secondary)" }}
                    />
                    <p
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Belum ada akun yang dibuat
                    </p>
                    <p
                        className="text-xs mt-1"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        Klik tombol "Tambah Akun" untuk memulai
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="rounded-xl border shadow-sm overflow-hidden"
            style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
            }}
        >
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr
                            style={{
                                backgroundColor:
                                    "var(--color-surface-secondary)",
                                borderBottomWidth: "1px",
                                borderBottomColor: "var(--color-border)",
                            }}
                        >
                            <th
                                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Kode & Nama Akun
                            </th>
                            <th
                                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Tipe
                            </th>
                            <th
                                className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Level
                            </th>
                            <th
                                className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Status
                            </th>
                            <th
                                className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody
                        style={{
                            backgroundColor: "var(--color-surface)",
                        }}
                    >
                        {accounts.map((account: Account) => (
                            <AccountRow
                                key={account.id}
                                account={account}
                                level={account.level}
                                onCreateChild={onCreateChild}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AccountTreeTable;
