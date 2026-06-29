import { Form, FormSection, FormField } from "@/Components/Form";
import { Input, TextAreaInput, NumberInput, ToggleSwitch } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Save, ArrowLeft, Zap, Coins, Calendar, Hash, Type, LayoutGrid } from "lucide-react";
import { FeatureFormProps } from "../types";

const FeatureForm = ({
    feature,
    data,
    setData,
    errors,
    processing,
    onSubmit,
}: FeatureFormProps) => {
    const isEdit = !!feature;

    const handleDataChange = (key: string, value: any) => {
        setData(key, value);
    };

    return (
        <Form onSubmit={onSubmit} className="space-y-0">
            <FormSection
                title="Informasi Dasar Fitur"
                description="Masukkan informasi identitas fitur sistem yang akan ditampilkan di katalog"
                icon={<Zap className="w-5 h-5" />}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        label="Nama Fitur"
                        error={errors.name}
                        required
                        description="Nama yang akan ditampilkan di dashboard"
                    >
                        <Input
                            placeholder="Contoh: Aktivasi Outlet"
                            value={data.name}
                            onChange={(e) => handleDataChange("name", e.target.value)}
                            disabled={processing}
                            leftIcon={<Type className="w-5 h-5" />}
                        />
                    </FormField>

                    <FormField
                        label="Key Fitur"
                        error={errors.key}
                        required
                        description="Key unik sistem (hanya huruf, angka, dan underscore)"
                    >
                        <Input
                            placeholder="Contoh: outlet_activation"
                            value={data.key}
                            onChange={(e) => handleDataChange("key", e.target.value)}
                            disabled={processing || isEdit}
                            leftIcon={<Hash className="w-5 h-5" />}
                            hint={isEdit ? "Key sistem bersifat permanen" : undefined}
                        />
                    </FormField>
                </div>

                <FormField
                    label="Deskripsi"
                    error={errors.description}
                    description="Jelaskan kegunaan fitur ini secara singkat"
                >
                    <TextAreaInput
                        placeholder="Jelaskan kegunaan fitur ini..."
                        value={data.description || ""}
                        onChange={(e) => handleDataChange("description", e.target.value)}
                        disabled={processing}
                        rows={3}
                        autoResize={true}
                    />
                </FormField>
            </FormSection>

            <FormSection
                title="Konfigurasi Harga & Durasi"
                description="Atur biaya coin dan masa berlaku fitur untuk setiap outlet"
                icon={<Coins className="w-5 h-5" />}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        label="Harga (Coin)"
                        error={errors.coinPrice}
                        required
                        description="Jumlah coin yang dipotong saat unlock"
                    >
                        <NumberInput
                            placeholder="0"
                            value={data.coinPrice}
                            onValueChange={(val) => handleDataChange("coinPrice", val)}
                            disabled={processing}
                            leftIcon={<Coins className="w-5 h-5" />}
                            min={0}
                            allowDecimal={false}
                        />
                    </FormField>

                    <FormField
                        label="Masa Aktif (Hari)"
                        error={errors.durationDays}
                        description="Isi 0 untuk fitur sekali aktif selamanya"
                    >
                        <NumberInput
                            placeholder="0"
                            value={data.durationDays || 0}
                            onValueChange={(val) => handleDataChange("durationDays", val)}
                            disabled={processing}
                            leftIcon={<Calendar className="w-5 h-5" />}
                            min={0}
                            allowDecimal={false}
                            suffix=" Hari"
                        />
                    </FormField>
                </div>
            </FormSection>

            <FormSection
                title="Pengaturan Lanjutan"
                description="Atur status aktif dan urutan tampilan fitur di katalog"
                icon={<LayoutGrid className="w-5 h-5" />}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                    <FormField
                        label="Urutan Tampilan"
                        error={errors.sortOrder}
                        description="Urutan posisi fitur di daftar katalog"
                    >
                        <NumberInput
                            placeholder="0"
                            value={data.sortOrder}
                            onValueChange={(val) => handleDataChange("sortOrder", val)}
                            disabled={processing}
                            min={0}
                        />
                    </FormField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                            label="Status Pembayaran"
                            error={errors.isPaid}
                            description="Tentukan apakah fitur ini berbayar"
                        >
                            <ToggleSwitch
                                label={data.isPaid ? "Berbayar" : "Gratis"}
                                checked={data.isPaid}
                                onChange={(val) => handleDataChange("isPaid", val)}
                                disabled={processing}
                                colorScheme="blue"
                            />
                        </FormField>

                        <FormField
                            label="Status Aktif"
                            error={errors.isActive}
                            description="Aktifkan agar muncul di katalog"
                        >
                            <ToggleSwitch
                                label={data.isActive ? "Aktif" : "Nonaktif"}
                                checked={data.isActive}
                                onChange={(val) => handleDataChange("isActive", val)}
                                disabled={processing}
                                colorScheme="green"
                            />
                        </FormField>
                    </div>
                </div>
            </FormSection>

            <div
                className="flex items-center justify-between pt-8 mt-8 border-t"
                style={{ borderColor: "var(--color-border)" }}
            >
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                    disabled={processing}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                    Batal
                </Button>

                <Button
                    type="submit"
                    variant="primary"
                    disabled={processing}
                    loading={processing}
                    size="lg"
                    leftIcon={<Save className="w-4 h-4" />}
                >
                    {isEdit ? "Simpan Perubahan" : "Buat Fitur"}
                </Button>
            </div>
        </Form>
    );
};

export default FeatureForm;
