import React, { FormEvent } from "react";
import { useForm } from "@inertiajs/react";
import { Save } from "lucide-react";
import { Button } from "@/Components/Button";
import { Form } from "@/Components/Form";
import { Input, Select, CheckboxInput } from "@/Components/Input";
import { BankAccountFormProps } from "../types";

export const BankAccountForm: React.FC<BankAccountFormProps> = ({
    account,
    banks,
    onSubmit,
    isLoading,
}) => {
    const isEdit = !!account;

    const { data, setData, errors } = useForm({
        withdrawalBankId: account?.withdrawalBankId || "",
        accountNumber: account?.accountNumber || "",
        accountHolderName: account?.accountHolderName || "",
        isDefault: account?.isDefault || false,
        isActive: account ? account.isActive : true,
    });

    const bankOptions = banks.map((bank) => ({
        value: bank.id,
        label: `${bank.bankName} ${bank.bankCode ? `(${bank.bankCode})` : ""} - Biaya Rp ${Number(bank.adminFee).toLocaleString("id-ID")}`,
    }));

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(data);
    };

    return (
        <Form onSubmit={handleSubmit} loading={isLoading} className="space-y-6">
            <div className="space-y-4">
                <Select
                    label="Bank Tujuan"
                    disabled={isEdit || isLoading}
                    value={data.withdrawalBankId}
                    onChange={(e) => setData("withdrawalBankId", Number(e.target.value))}
                    options={bankOptions}
                    placeholder="Pilih Bank"
                    error={errors.withdrawalBankId}
                    required
                />

                <Input
                    label="Nomor Rekening"
                    type="text"
                    disabled={isLoading}
                    value={data.accountNumber}
                    onChange={(e) => setData("accountNumber", e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Contoh: 123456789"
                    error={errors.accountNumber}
                    required
                />

                <Input
                    label="Nama Pemilik Rekening"
                    type="text"
                    disabled={isLoading}
                    value={data.accountHolderName}
                    onChange={(e) => setData("accountHolderName", e.target.value)}
                    placeholder="Masukkan nama lengkap sesuai di buku tabungan"
                    error={errors.accountHolderName}
                    required
                />

                <div className="pt-2">
                    <CheckboxInput
                        id="isDefault"
                        disabled={isLoading || !!account?.isDefault}
                        checked={data.isDefault}
                        onChange={(checked) => setData("isDefault", checked)}
                        label="Jadikan sebagai rekening utama"
                    />
                </div>

                {isEdit && (
                    <div className="pt-2">
                        <CheckboxInput
                            id="isActive"
                            disabled={isLoading || !!account?.isDefault}
                            checked={data.isActive}
                            onChange={(checked) => setData("isActive", checked)}
                            label="Rekening Aktif"
                        />
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                    loading={isLoading}
                    leftIcon={!isLoading ? <Save className="w-4 h-4" /> : undefined}
                >
                    {isEdit ? "Simpan Perubahan" : "Tambah Rekening"}
                </Button>
            </div>
        </Form>
    );
};
export default BankAccountForm;
