import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Modal } from "@/Components/Modal";
import { Form } from "@/Components/Form";
import { Input, SelectInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import {
    Lock,
    Info,
    Edit,
    FileText,
    TrendingUp,
    AlertTriangle,
    Folder,
    Shield,
} from "lucide-react";
import { AccountFormData, AccountType } from "@/types/account";
import { EditAccountModalProps } from "../types";

const EditAccountModal: React.FC<EditAccountModalProps> = ({
    isOpen,
    account,
    accountTypes,
    onClose,
    onSuccess,
}) => {
    const [showSuccess, setShowSuccess] = useState(false);

    const { data, setData, put, processing, errors, reset } =
        useForm<AccountFormData>({
            parentId: account?.parentId || null,
            code: account?.code || "",
            name: account?.name || "",
            type: (account?.type as AccountType) || "",
        });

    useEffect(() => {
        if (!isOpen) {
            reset();
            setShowSuccess(false);
        } else if (account) {
            setData({
                parentId: account.parentId || null,
                code: account.code,
                name: account.name,
                type: account.type as AccountType,
            });
        }
    }, [isOpen, account]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!account) return;

        put(route("accounts.update", account.id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setShowSuccess(true);
                setTimeout(() => {
                    onClose();
                    if (onSuccess) onSuccess();
                }, 1500);
            },
        });
    };

    const getTypeInfo = (type: string) => {
        const info: Record<
            string,
            { label: string; variant: any; description: string }
        > = {
            asset: {
                label: "Aset",
                variant: "primary",
                description: "Harta atau kekayaan yang dimiliki perusahaan",
            },
            liability: {
                label: "Kewajiban",
                variant: "danger",
                description: "Utang atau kewajiban kepada pihak lain",
            },
            equity: {
                label: "Modal",
                variant: "warning",
                description: "Modal pemilik atau ekuitas perusahaan",
            },
            revenue: {
                label: "Pendapatan",
                variant: "success",
                description: "Penghasilan dari kegiatan usaha",
            },
            expense: {
                label: "Beban",
                variant: "info",
                description: "Biaya operasional perusahaan",
            },
        };
        return (
            info[type] || {
                label: type,
                variant: "secondary",
                description: "",
            }
        );
    };

    if (!account) return null;

    const selectedTypeInfo = data.type ? getTypeInfo(data.type) : null;
    const hasChildren = account.children && account.children.length > 0;
    const isRootAccount = !account.parentId;
    const canChangeType = isRootAccount && !hasChildren && !account.isSystem;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Akun" size="lg">
            <Form onSubmit={handleSubmit} className="space-y-6">
                {showSuccess && (
                    <Alert
                        variant="success"
                        title="Berhasil!"
                        description="Perubahan akun berhasil disimpan."
                    />
                )}

                {account.isSystem && (
                    <Alert
                        variant="warning"
                        title="Akun Sistem"
                        description="Ini adalah akun sistem yang dilindungi. Anda hanya dapat mengubah nama akun."
                        icon={<Lock className="w-5 h-5" />}
                    />
                )}

                {account.parent && (
                    <div
                        className="p-4 rounded-lg"
                        style={{
                            backgroundColor: "var(--color-primary-50)",
                            border: "1px solid var(--color-primary-200)",
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                    backgroundColor: "var(--color-primary-100)",
                                }}
                            >
                                <Folder
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <p
                                    className="text-xs font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Akun Induk
                                </p>
                                <p
                                    className="text-sm font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {account.parent.code} -{" "}
                                    {account.parent.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="primary" size="sm">
                                        Level {account.parent.level}
                                    </Badge>
                                    {account.parent.typeLabel && (
                                        <Badge
                                            variant={
                                                getTypeInfo(account.parent.type)
                                                    .variant
                                            }
                                            size="sm"
                                        >
                                            {account.parent.typeLabel}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div
                    className="p-3 rounded-lg flex items-center justify-between"
                    style={{
                        backgroundColor: "var(--color-info-50)",
                        border: "1px solid var(--color-info-200)",
                    }}
                >
                    <div className="flex items-center gap-2">
                        <div>
                            <p
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Level: {account.level}
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant={account.isTransactional ? "success" : "info"}
                        size="sm"
                    >
                        {account.isTransactional ? "Transaksional" : "Kategori"}
                    </Badge>
                </div>

                <div className="space-y-4">
                    <div
                        className="flex items-center gap-2 pb-3 border-b"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <FileText
                            className="w-5 h-5"
                            style={{ color: "var(--color-primary-600)" }}
                        />
                        <h3
                            className="font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Informasi Akun
                        </h3>
                    </div>

                    <Input
                        label="Kode Akun"
                        type="text"
                        value={data.code}
                        onChange={(e) => setData("code", e.target.value)}
                        error={errors.code}
                        required
                        disabled={account.isSystem || processing}
                        className="font-mono"
                        hint={
                            account.isSystem
                                ? "Kode akun sistem tidak dapat diubah"
                                : undefined
                        }
                        leftIcon={
                            account.isSystem ? (
                                <Lock className="w-5 h-5" />
                            ) : (
                                <FileText className="w-5 h-5" />
                            )
                        }
                    />

                    <Input
                        label="Nama Akun"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        error={errors.name}
                        required
                        disabled={processing}
                        autoFocus
                        hint="Nama yang jelas dan deskriptif untuk akun ini"
                    />
                </div>

                <div className="space-y-4">
                    <div
                        className="flex items-center gap-2 pb-3 border-b"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <TrendingUp
                            className="w-5 h-5"
                            style={{ color: "var(--color-success-600)" }}
                        />
                        <h3
                            className="font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Tipe Akun
                        </h3>
                    </div>

                    {canChangeType ? (
                        <SelectInput
                            label="Tipe Akun"
                            value={data.type}
                            onChange={(e) =>
                                setData("type", e.target.value as AccountType)
                            }
                            options={[
                                { value: "", label: "-- Pilih Tipe Akun --" },
                                ...accountTypes.map((type) => ({
                                    value: type.value,
                                    label: type.label,
                                })),
                            ]}
                            error={errors.type}
                            required
                            disabled={processing}
                            hint="Pilih kategori akun sesuai dengan jenis transaksi"
                        />
                    ) : (
                        <>
                            <input
                                type="hidden"
                                name="type"
                                value={data.type}
                            />

                            <div
                                className="p-4 rounded-lg"
                                style={{
                                    backgroundColor:
                                        "var(--color-surface-secondary)",
                                    border: "1px solid var(--color-border)",
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <Shield
                                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                                        style={{
                                            color: "var(--color-primary-600)",
                                        }}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <p
                                                className="text-sm font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Tipe Akun Terkunci
                                            </p>
                                            {selectedTypeInfo && (
                                                <Badge
                                                    variant={
                                                        selectedTypeInfo.variant
                                                    }
                                                    size="sm"
                                                >
                                                    {selectedTypeInfo.label}
                                                </Badge>
                                            )}
                                        </div>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {!isRootAccount
                                                ? "Tipe akun diwariskan dari akun induk dan tidak dapat diubah."
                                                : hasChildren
                                                  ? "Tipe akun tidak dapat diubah karena memiliki sub-akun."
                                                  : "Tipe akun sistem tidak dapat diubah."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {selectedTypeInfo && (
                        <div
                            className="p-4 rounded-lg space-y-2"
                            style={{
                                backgroundColor: "var(--color-primary-50)",
                                border: "1px solid var(--color-primary-200)",
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <Info
                                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                />
                                <div className="flex-1">
                                    <p
                                        className="font-semibold mb-1"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {selectedTypeInfo.label}
                                    </p>
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        {selectedTypeInfo.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {hasChildren && (
                    <Alert
                        variant="warning"
                        title="Perhatian"
                        description={`Akun ini memiliki ${account.children!.length} sub-akun. Tipe akun tidak dapat diubah.`}
                        icon={<AlertTriangle className="w-5 h-5" />}
                    />
                )}

                <div
                    className="flex items-center justify-end gap-3 pt-4 border-t"
                    style={{ borderColor: "var(--color-border)" }}
                >
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={
                            processing || !data.code || !data.name || !data.type
                        }
                        loading={processing}
                        leftIcon={<Edit className="w-4 h-4" />}
                    >
                        {processing ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default EditAccountModal;
