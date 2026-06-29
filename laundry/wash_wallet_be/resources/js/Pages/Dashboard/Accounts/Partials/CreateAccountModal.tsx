import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Modal } from "@/Components/Modal";
import { Form } from "@/Components/Form";
import { Input, SelectInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import Badge from "@/Components/Badge/Badge";
import {
    Folder,
    FileText,
    Plus,
    RefreshCw,
    Loader2,
    Info,
    TrendingUp,
} from "lucide-react";
import { AccountFormData, AccountType } from "@/types/account";
import { CreateAccountModalProps } from "../types";
import accountService from "@/Services/account.service";

const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
    isOpen,
    parentId,
    parentName,
    parentCode,
    parentType,
    accountTypes,
    onClose,
    onSuccess,
}) => {
    const [showSuccess, setShowSuccess] = useState(false);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [codeError, setCodeError] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } =
        useForm<AccountFormData>({
            parentId: parentId || null,
            code: "",
            name: "",
            type: (parentType as AccountType) || "",
        });

    useEffect(() => {
        if (!isOpen) {
            reset();
            setShowSuccess(false);
            setCodeError(null);
        } else {
            setData({
                ...data,
                parentId: parentId || null,
                type: (parentType as AccountType) || "",
                code: "",
                name: "",
            });
            if (isOpen) {
                generateNextCode();
            }
        }
    }, [isOpen, parentId, parentType]);

    const generateNextCode = async () => {
        setIsGeneratingCode(true);
        setCodeError(null);

        try {
            const nextCode = await accountService.getNextCode(parentId || null);
            setData("code", nextCode);
        } catch (error: any) {
            const errorMessage =
                error.message || "Terjadi kesalahan saat generate kode akun";
            setCodeError(errorMessage);
        } finally {
            setIsGeneratingCode(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route("accounts.store"), {
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

    const selectedTypeInfo = data.type ? getTypeInfo(data.type) : null;
    const isRootAccount = !parentId;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={parentId ? "Tambah Sub-Akun" : "Tambah Akun Baru"}
            size="lg"
        >
            <Form onSubmit={handleSubmit} className="space-y-6">
                {showSuccess && (
                    <Alert
                        variant="success"
                        title="Berhasil!"
                        description="Akun berhasil ditambahkan ke Chart of Accounts."
                    />
                )}

                {parentId && parentName && (
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
                                    {parentCode} - {parentName}
                                </p>
                                {selectedTypeInfo && (
                                    <Badge
                                        variant={selectedTypeInfo.variant}
                                        size="sm"
                                        className="mt-1"
                                    >
                                        {selectedTypeInfo.label}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                )}

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

                    {codeError && (
                        <Alert
                            variant="error"
                            title="Error Generate Kode"
                            description={codeError}
                        />
                    )}

                    <div className="space-y-2">
                        <Input
                            label="Kode Akun"
                            type="text"
                            placeholder={
                                isGeneratingCode
                                    ? "Generating..."
                                    : "Kode otomatis"
                            }
                            value={data.code}
                            onChange={(e) => setData("code", e.target.value)}
                            error={errors.code}
                            required
                            disabled={processing || isGeneratingCode}
                            className="font-mono"
                            hint="Kode akun di-generate otomatis oleh sistem"
                            leftIcon={
                                isGeneratingCode ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <FileText className="w-5 h-5" />
                                )
                            }
                        />

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={generateNextCode}
                            disabled={processing || isGeneratingCode}
                            leftIcon={<RefreshCw className="w-4 h-4" />}
                        >
                            {isGeneratingCode
                                ? "Generating..."
                                : "Generate Ulang Kode"}
                        </Button>
                    </div>

                    <Input
                        label="Nama Akun"
                        type="text"
                        placeholder="Contoh: Kas Besar"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        error={errors.name}
                        required
                        disabled={processing}
                        hint="Nama yang jelas dan deskriptif untuk akun ini"
                        autoFocus={!isGeneratingCode}
                    />
                </div>

                <div className="space-y-4">
                    {isRootAccount ? (
                        <>
                            <div
                                className="flex items-center gap-2 pb-3 border-b"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <TrendingUp
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-success-600)",
                                    }}
                                />
                                <h3
                                    className="font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Tipe Akun
                                </h3>
                            </div>
                            <SelectInput
                                label="Tipe Akun"
                                value={data.type}
                                onChange={(e) =>
                                    setData(
                                        "type",
                                        e.target.value as AccountType | "",
                                    )
                                }
                                options={[
                                    {
                                        value: "",
                                        label: "-- Pilih Tipe Akun --",
                                    },
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
                        </>
                    ) : (
                        <input type="hidden" name="type" value={data.type} />
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

                <Alert
                    variant="info"
                    title="Informasi"
                    description="Level dan klasifikasi akun ditentukan secara otomatis oleh sistem berdasarkan hierarki yang dipilih."
                />

                <div
                    className="flex items-center justify-end gap-3 pt-4 border-t"
                    style={{ borderColor: "var(--color-border)" }}
                >
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={processing || isGeneratingCode}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={
                            processing ||
                            isGeneratingCode ||
                            !data.code ||
                            !data.name ||
                            (!isRootAccount ? false : !data.type)
                        }
                        loading={processing}
                        leftIcon={<Plus className="w-4 h-4" />}
                    >
                        {processing ? "Menyimpan..." : "Simpan Akun"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateAccountModal;
