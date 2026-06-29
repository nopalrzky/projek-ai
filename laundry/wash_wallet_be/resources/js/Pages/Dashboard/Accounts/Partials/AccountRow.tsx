import React, { useState } from "react";
import { AccountRowProps } from "../types";
import { Account } from "@/types";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import {
    ChevronRight,
    ChevronDown,
    Folder,
    FileText,
    Plus,
    Edit,
    Trash2,
} from "lucide-react";

const AccountRow: React.FC<AccountRowProps> = ({
    account,
    level,
    onCreateChild,
    onEdit,
    onDelete,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const hasChildren = account.children && account.children.length > 0;
    const canDelete = !account.isSystem && !hasChildren;

    const indentPx = (account.level - 1) * 24;

    const getBadgeVariant = (type: string) => {
        const variantMap: Record<
            string,
            "primary" | "error" | "warning" | "success" | "info"
        > = {
            asset: "primary",
            liability: "error",
            equity: "warning",
            revenue: "success",
            expense: "info",
        };
        return variantMap[type] || "info";
    };

    return (
        <>
            <tr
                className="border-b hover:bg-opacity-50 transition-colors duration-150"
                style={{
                    borderBottomColor: "var(--color-border)",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                        "var(--color-surface-hover)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                }}
            >
                <td className="px-4 py-3">
                    <div
                        className="flex items-center gap-2"
                        style={{ paddingLeft: `${indentPx}px` }}
                    >
                        {hasChildren ? (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                {isExpanded ? (
                                    <ChevronDown className="w-4 h-4" />
                                ) : (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                            </button>
                        ) : (
                            <div className="w-5" />
                        )}

                        <div
                            className="flex items-center justify-center w-8 h-8 rounded-lg"
                            style={{
                                backgroundColor: hasChildren
                                    ? "var(--color-primary-100)"
                                    : "var(--color-surface-secondary)",
                            }}
                        >
                            {hasChildren ? (
                                <Folder
                                    className="w-4 h-4"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                />
                            ) : (
                                <FileText
                                    className="w-4 h-4"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span
                                    className="font-mono text-xs font-medium"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {account.code}
                                </span>
                            </div>
                            <p
                                className="text-sm font-medium truncate"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {account.name}
                            </p>
                        </div>
                    </div>
                </td>

                <td className="px-4 py-3">
                    <Badge variant={getBadgeVariant(account.type)} size="sm">
                        {account.typeLabel || account.type}
                    </Badge>
                </td>

                <td className="px-4 py-3 text-center">
                    <span
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {account.level}
                    </span>
                </td>

                <td className="px-4 py-3 text-center">
                    <Badge
                        variant={
                            account.isTransactional ? "success" : "secondary"
                        }
                        size="sm"
                    >
                        {account.isTransactional ? "Transaksional" : "Kategori"}
                    </Badge>
                </td>

                <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                onCreateChild(
                                    account.id,
                                    account.name,
                                    account.code,
                                    account.type,
                                )
                            }
                            title="Tambah sub-akun"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(account)}
                            title="Edit akun"
                        >
                            <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(account)}
                            disabled={!canDelete}
                            title={
                                !canDelete
                                    ? account.isSystem
                                        ? "Akun sistem tidak dapat dihapus"
                                        : "Hapus sub-akun terlebih dahulu"
                                    : "Hapus akun"
                            }
                            className={
                                !canDelete
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </td>
            </tr>

            {isExpanded &&
                hasChildren &&
                account.children!.map((childAccount: Account) => (
                    <AccountRow
                        key={childAccount.id}
                        account={childAccount}
                        level={childAccount.level}
                        onCreateChild={onCreateChild}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
        </>
    );
};

export default AccountRow;
