import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { Input, SelectInput, TextAreaInput } from "@/Components/Input";
import { Alert } from "@/Components/Alert";
import { Form } from "@/Components/Form";
import PageHeader from "@/Components/Page/PageHeader";
import {
    Save,
    ArrowLeft,
    User,
    Phone,
    Mail,
    MapPin,
    Building2,
    Heart,
    UserPlus,
} from "lucide-react";
import { customerService } from "@/Services/customer.service";
import { CustomerFormData } from "@/types";
import { CustomerCreateProps } from "./types";
import { useState } from "react";

const CustomerCreate = ({ outlets, errors, flash }: CustomerCreateProps) => {
    const [formData, setFormData] = useState<CustomerFormData>({
        name: "",
        email: "",
        phone: "",
        outletId: "",
        gender: "",
        address: "",
        isActive: true,
    });
    const [processing, setProcessing] = useState(false);

    const outletOptions = [
        { value: "", label: "Pilih Outlet" },
        ...outlets.map((outlet) => ({
            value: outlet.id.toString(),
            label: `${outlet.name} (${outlet.code})`,
        })),
    ];

    const genderOptions = [
        { value: "", label: "Pilih Jenis Kelamin" },
        { value: "male", label: "Laki-laki" },
        { value: "female", label: "Perempuan" },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const submitData = {
            name: formData.name,
            outletId: parseInt(formData.outletId),
            email: formData.email || undefined,
            phone: formData.phone || undefined,
            gender: formData.gender || undefined,
            address: formData.address || undefined,
        };

        router.post(route("customers.store"), submitData, {
            preserveScroll: true,
            onError: () => {
                setProcessing(false);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const handleDataChange = (key: keyof CustomerFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleCancel = () => {
        customerService.goToIndex();
    };

    return (
        <>
            <Head title="Tambah Pelanggan" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Tambah Pelanggan Baru"
                        subtitle="Buat data pelanggan baru untuk outlet Anda"
                        icon={UserPlus}
                        variant="default"
                        actions={
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                leftIcon={<ArrowLeft className="w-4 h-4" />}
                            >
                                Kembali
                            </Button>
                        }
                    />

                    {flash?.error && (
                        <Alert
                            variant="error"
                            title="Error"
                            description={flash.error}
                        />
                    )}

                    <Card className="p-8">
                        <Form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-6">
                                <div
                                    className="flex items-center gap-3 pb-4 border-b"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <div
                                        className="p-3 rounded-lg"
                                        style={{
                                            backgroundColor:
                                                "var(--color-primary-100)",
                                        }}
                                    >
                                        <User
                                            className="w-6 h-6"
                                            style={{
                                                color: "var(--color-primary-600)",
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <h2
                                            className="text-xl font-semibold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            Informasi Dasar
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Data identitas pelanggan
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Nama Pelanggan"
                                        required
                                        value={formData.name}
                                        onChange={(e) =>
                                            handleDataChange(
                                                "name",
                                                e.target.value,
                                            )
                                        }
                                        error={errors?.name}
                                        placeholder="Masukkan nama lengkap pelanggan"
                                        disabled={processing}
                                        leftIcon={<User className="w-5 h-5" />}
                                        hint="Nama lengkap pelanggan"
                                        autoFocus
                                    />

                                    <SelectInput
                                        label="Outlet"
                                        required
                                        value={formData.outletId}
                                        onChange={(e) =>
                                            handleDataChange(
                                                "outletId",
                                                e.target.value,
                                            )
                                        }
                                        options={outletOptions}
                                        error={errors?.outletId}
                                        disabled={processing}
                                        leftIcon={
                                            <Building2 className="w-5 h-5" />
                                        }
                                        hint="Pilih outlet untuk pelanggan"
                                        placeholder="Pilih outlet..."
                                    />

                                    <SelectInput
                                        label="Jenis Kelamin"
                                        value={formData.gender}
                                        onChange={(e) =>
                                            handleDataChange(
                                                "gender",
                                                e.target.value,
                                            )
                                        }
                                        options={genderOptions}
                                        error={errors?.gender}
                                        disabled={processing}
                                        leftIcon={<Heart className="w-5 h-5" />}
                                        hint="Jenis kelamin pelanggan (opsional)"
                                        placeholder="Pilih jenis kelamin..."
                                        clearable={true}
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div
                                    className="flex items-center gap-3 pb-4 border-b"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <div
                                        className="p-3 rounded-lg"
                                        style={{
                                            backgroundColor:
                                                "var(--color-success-100)",
                                        }}
                                    >
                                        <Phone
                                            className="w-6 h-6"
                                            style={{
                                                color: "var(--color-success-600)",
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <h2
                                            className="text-xl font-semibold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            Informasi Kontak
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Data kontak pelanggan (opsional)
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Nomor Telepon"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            handleDataChange(
                                                "phone",
                                                e.target.value,
                                            )
                                        }
                                        error={errors?.phone}
                                        placeholder="08123456789"
                                        disabled={processing}
                                        leftIcon={<Phone className="w-5 h-5" />}
                                        hint="Nomor telepon pelanggan"
                                    />

                                    <Input
                                        label="Email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            handleDataChange(
                                                "email",
                                                e.target.value,
                                            )
                                        }
                                        error={errors?.email}
                                        placeholder="contoh@email.com"
                                        disabled={processing}
                                        leftIcon={<Mail className="w-5 h-5" />}
                                        hint="Alamat email pelanggan"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div
                                    className="flex items-center gap-3 pb-4 border-b"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <div
                                        className="p-3 rounded-lg"
                                        style={{
                                            backgroundColor:
                                                "var(--color-info-100)",
                                        }}
                                    >
                                        <MapPin
                                            className="w-6 h-6"
                                            style={{
                                                color: "var(--color-info-600)",
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <h2
                                            className="text-xl font-semibold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            Informasi Alamat
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Alamat tempat tinggal pelanggan
                                            (opsional)
                                        </p>
                                    </div>
                                </div>

                                <TextAreaInput
                                    label="Alamat Lengkap"
                                    placeholder="Jalan, nomor rumah, RT/RW, komplek, dll"
                                    value={formData.address}
                                    onChange={(e) =>
                                        handleDataChange(
                                            "address",
                                            e.target.value,
                                        )
                                    }
                                    error={errors?.address}
                                    disabled={processing}
                                    hint="Alamat lengkap jalan dan nomor rumah"
                                    rows={3}
                                    maxLength={500}
                                    showCharacterCount={true}
                                    autoResize={true}
                                    minRows={3}
                                    maxRows={5}
                                    leftIcon={<MapPin className="w-5 h-5" />}
                                />
                            </div>

                            <div
                                className="p-4 rounded-lg border"
                                style={{
                                    backgroundColor: "var(--color-info-50)",
                                    borderColor: "var(--color-info-200)",
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                        style={{
                                            backgroundColor:
                                                "var(--color-info-100)",
                                        }}
                                    >
                                        <span
                                            className="text-xs font-bold"
                                            style={{
                                                color: "var(--color-info-600)",
                                            }}
                                        >
                                            i
                                        </span>
                                    </div>
                                    <div>
                                        <h4
                                            className="text-sm font-medium mb-1"
                                            style={{
                                                color: "var(--color-info-700)",
                                            }}
                                        >
                                            Tips Mendaftarkan Pelanggan
                                        </h4>
                                        <ul
                                            className="text-xs space-y-1"
                                            style={{
                                                color: "var(--color-info-600)",
                                            }}
                                        >
                                            <li>
                                                • Nama lengkap dan outlet wajib
                                                diisi untuk identifikasi
                                            </li>
                                            <li>
                                                • Email dan telepon membantu
                                                komunikasi dengan pelanggan
                                            </li>
                                            <li>
                                                • Alamat berguna untuk layanan
                                                antar jemput
                                            </li>
                                            <li>
                                                • Data yang lengkap memberikan
                                                pengalaman pelayanan yang
                                                personal
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {errors && Object.keys(errors).length > 0 && (
                                <Alert
                                    variant="error"
                                    title="Terdapat kesalahan pada form"
                                    description="Silakan periksa kembali semua field yang bertanda merah."
                                />
                            )}

                            <div
                                className="flex items-center justify-end gap-3 pt-6 border-t"
                                style={{
                                    borderColor: "var(--color-border)",
                                }}
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={processing}
                                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                                >
                                    Batal
                                </Button>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={
                                        processing ||
                                        !formData.name.trim() ||
                                        !formData.outletId
                                    }
                                    loading={processing}
                                    size="lg"
                                    leftIcon={<Save className="w-4 h-4" />}
                                >
                                    {processing
                                        ? "Menyimpan..."
                                        : "Simpan Pelanggan"}
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </div>
            </motion.div>
        </>
    );
};

CustomerCreate.layout = withAuthenticatedLayout({
    title: "Tambah Pelanggan",
    breadcrumbs: [
        { label: "Customers", href: route("customers.index") },
        { label: "Tambah Pelanggan" },
    ],
});

export default CustomerCreate;
