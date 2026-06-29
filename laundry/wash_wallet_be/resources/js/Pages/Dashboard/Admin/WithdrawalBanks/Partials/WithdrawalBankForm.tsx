import React, { FormEvent } from "react";
import { useForm } from "@inertiajs/react";
import { Building2, Hash, Save, WalletCards } from "lucide-react";
import { Button } from "@/Components/Button";
import { Form } from "@/Components/Form";
import { CheckboxInput, Input } from "@/Components/Input";
import { WithdrawalBankFormProps } from "../types";

export const WithdrawalBankForm: React.FC<WithdrawalBankFormProps> = ({
    bank,
    onSubmit,
    isLoading,
}) => {
    const isEdit = !!bank;

    const { data, setData, errors } = useForm({
        bankName: bank?.bankName || "",
        bankCode: bank?.bankCode || "",
        adminFee: bank?.adminFee || 0,
        minWithdrawal: bank?.minWithdrawal || 50000,
        maxWithdrawal: bank?.maxWithdrawal || "",
        isActive: bank ? bank.isActive : true,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(data);
    };

    return (
        <Form onSubmit={handleSubmit} loading={isLoading} className="space-y-6">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Nama Bank"
                        type="text"
                        disabled={isLoading}
                        value={data.bankName}
                        onChange={(e) => setData("bankName", e.target.value)}
                        placeholder="Contoh: BCA, BNI, Mandiri"
                        error={errors.bankName}
                        leftIcon={<Building2 className="w-5 h-5" />}
                        required
                    />

                    <Input
                        label="Kode Bank"
                        type="text"
                        disabled={isLoading}
                        value={data.bankCode}
                        onChange={(e) => setData("bankCode", e.target.value)}
                        placeholder="Contoh: 014, 008, 009"
                        error={errors.bankCode}
                        leftIcon={<Hash className="w-5 h-5" />}
                        optional
                    />
                </div>

                <Input
                    label="Biaya Admin Bank"
                    type="number"
                    min={0}
                    disabled={isLoading}
                    value={data.adminFee}
                    onChange={(e) =>
                        setData("adminFee", Number(e.target.value))
                    }
                    placeholder="0"
                    error={errors.adminFee}
                    leftAddon="Rp"
                    leftIcon={<WalletCards className="w-5 h-5" />}
                    hint="Biaya yang dipotong dari nominal withdrawal owner"
                    required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Minimal Penarikan"
                        type="number"
                        min={0}
                        disabled={isLoading}
                        value={data.minWithdrawal}
                        onChange={(e) =>
                            setData("minWithdrawal", Number(e.target.value))
                        }
                        placeholder="50000"
                        error={errors.minWithdrawal}
                        leftAddon="Rp"
                        required
                    />

                    <Input
                        label="Maksimal Penarikan"
                        type="number"
                        min={0}
                        disabled={isLoading}
                        value={data.maxWithdrawal}
                        onChange={(e) =>
                            setData(
                                "maxWithdrawal",
                                e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                            )
                        }
                        placeholder="Biarkan kosong jika tidak ada batasan"
                        error={errors.maxWithdrawal}
                        leftAddon="Rp"
                        optional
                    />
                </div>

                <CheckboxInput
                    id="isActive"
                    disabled={isLoading}
                    checked={data.isActive}
                    onChange={(checked) => setData("isActive", checked)}
                    label="Bank Aktif"
                    description="Bank aktif dapat dipilih oleh owner untuk rekening withdrawal."
                />
            </div>

            <div
                className="flex justify-end gap-2 pt-4 border-t"
                style={{ borderColor: "var(--color-border)" }}
            >
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                    loading={isLoading}
                    leftIcon={
                        !isLoading ? <Save className="w-4 h-4" /> : undefined
                    }
                >
                    {isEdit ? "Simpan Perubahan" : "Tambah Bank"}
                </Button>
            </div>
        </Form>
    );
};
