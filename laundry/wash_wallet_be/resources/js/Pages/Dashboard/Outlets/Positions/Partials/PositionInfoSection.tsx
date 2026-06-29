import React from "react";
import { Input, TextAreaInput } from "@/Components/Input";
import PageHeader from "@/Components/Page/PageHeader";
import { UserPlus } from "lucide-react";

interface Props {
    name: string;
    description?: string;
    errors: { name?: string; description?: string };
    processing: boolean;
    onChange: (key: "name" | "description", value: string) => void;
}

const PositionInfoSection: React.FC<Props> = ({
    name,
    description,
    errors,
    processing,
    onChange,
}) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: "var(--color-border)" }}>
                <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--color-primary-100)" }}>
                    <UserPlus className="w-6 h-6" style={{ color: "var(--color-primary-600)" }} />
                </div>
                <div>
                    <h2 className="text-xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        Informasi Posisi
                    </h2>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        Detail dasar posisi dan jabatan
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <Input
                    label="Nama Posisi"
                    placeholder="Contoh: Kasir, Manager, Karyawan Laundry"
                    value={name}
                    onChange={(e) => onChange("name", e.target.value)}
                    error={errors.name}
                    required
                    disabled={processing}
                    leftIcon={<UserPlus className="w-5 h-5" />}
                    hint="Nama jabatan atau posisi"
                    autoFocus
                />

                <TextAreaInput
                    label="Deskripsi Posisi"
                    placeholder="Jelaskan tanggung jawab dan tugas dari posisi ini..."
                    value={description}
                    onChange={(e) => onChange("description", e.target.value)}
                    error={errors.description}
                    disabled={processing}
                    hint="Deskripsi detail tentang posisi ini (opsional)"
                    rows={4}
                    maxLength={1000}
                    showCharacterCount={true}
                    autoResize={true}
                    minRows={4}
                    maxRows={8}
                />
            </div>
        </div>
    );
};

export default PositionInfoSection;
