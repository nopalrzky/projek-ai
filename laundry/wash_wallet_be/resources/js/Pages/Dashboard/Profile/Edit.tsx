import React from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Save, ArrowLeft, User, Phone, MapPin, Mail, Edit } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import { Input, TextAreaInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import type { ProfileUser, ProfileFormData } from "./types";

interface ProfileEditProps {
    user: ProfileUser;
}

function ProfileEdit({ user }: ProfileEditProps) {
    const { data, setData, put, processing, errors, clearErrors, isDirty } =
        useForm<ProfileFormData>({
            name: user.name || "",
            phone: user.phone || "",
            address: user.address || "",
        });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("profile.update"), {
            preserveScroll: true,
            onSuccess: () => {
                window.location.href = route("profile.index");
            },
        });
    };

    const handleDataChange = (key: keyof ProfileFormData, value: any) => {
        setData(key, value);
        if (errors[key]) {
            clearErrors(key);
        }
    };

    return (
        <>
            <Head title="Edit Profile" />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1">
                                <h1
                                    className="text-2xl font-bold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Edit Profile
                                </h1>
                                <p
                                    className="mt-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Perbarui informasi profil Anda
                                </p>
                            </div>
                        </div>

                        <div
                            className="p-4 rounded-lg border"
                            style={{
                                backgroundColor: "var(--color-surface)",
                                borderColor: "var(--color-border)",
                            }}
                        >
                            <div className="flex items-center gap-4">
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
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3
                                            className="text-lg font-semibold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {user.name}
                                        </h3>
                                        <Badge
                                            variant={
                                                user.status === "active"
                                                    ? "success"
                                                    : "secondary"
                                            }
                                            className="text-xs"
                                        >
                                            {user.status === "active"
                                                ? "Active"
                                                : "Inactive"}
                                        </Badge>
                                    </div>
                                    <div
                                        className="text-sm space-y-1"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        <div>@{user.username}</div>
                                        <div>{user.email}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
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
                                            <Edit
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
                                                Informasi Pribadi
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Ubah informasi dasar profil Anda
                                            </p>
                                        </div>
                                    </div>

                                    <Input
                                        label="Nama Lengkap"
                                        placeholder="Masukkan nama lengkap"
                                        value={data.name}
                                        onChange={(e) =>
                                            handleDataChange(
                                                "name",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.name}
                                        required
                                        disabled={processing}
                                        leftIcon={<User className="w-5 h-5" />}
                                        hint="Nama yang akan ditampilkan di profil Anda"
                                        autoFocus
                                    />
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
                                            <Phone
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
                                                Informasi Kontak
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Perbarui nomor telepon dan
                                                kontak lainnya
                                            </p>
                                        </div>
                                    </div>

                                    <Input
                                        label="Nomor Telepon"
                                        type="tel"
                                        placeholder="08xxxxxxxxxx"
                                        value={data.phone}
                                        onChange={(e) =>
                                            handleDataChange(
                                                "phone",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.phone}
                                        disabled={processing}
                                        leftIcon={<Phone className="w-5 h-5" />}
                                        hint="Nomor telepon yang dapat dihubungi"
                                    />

                                    <div className="space-y-2">
                                        <label
                                            className="block text-sm font-medium"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            Email
                                        </label>
                                        <div
                                            className="flex items-center gap-3 p-3 rounded-lg border"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-gray-50)",
                                                borderColor:
                                                    "var(--color-border)",
                                            }}
                                        >
                                            <Mail
                                                className="w-5 h-5"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            />
                                            <span
                                                className="flex-1"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                {user.email}
                                            </span>
                                            <Badge
                                                variant="secondary"
                                                size="sm"
                                            >
                                                Tidak dapat diubah
                                            </Badge>
                                        </div>
                                        <p
                                            className="text-xs"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Email tidak dapat diubah. Hubungi
                                            administrator jika perlu mengubah
                                            email.
                                        </p>
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
                                            <MapPin
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
                                                Alamat
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Alamat tempat tinggal Anda
                                                (opsional)
                                            </p>
                                        </div>
                                    </div>

                                    <TextAreaInput
                                        label="Alamat Lengkap"
                                        placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota"
                                        value={data.address}
                                        onChange={(e) =>
                                            handleDataChange(
                                                "address",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.address}
                                        disabled={processing}
                                        leftIcon={
                                            <MapPin className="w-5 h-5" />
                                        }
                                        hint="Alamat lengkap untuk keperluan komunikasi"
                                        rows={4}
                                        maxLength={500}
                                        showCharacterCount={true}
                                        autoResize={true}
                                        minRows={4}
                                        maxRows={8}
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
                                                Tips Mengisi Profil
                                            </h4>
                                            <ul
                                                className="text-xs space-y-1"
                                                style={{
                                                    color: "var(--color-info-600)",
                                                }}
                                            >
                                                <li>
                                                    • Gunakan nama asli untuk
                                                    identifikasi yang jelas
                                                </li>
                                                <li>
                                                    • Nomor telepon berguna
                                                    untuk notifikasi penting
                                                </li>
                                                <li>
                                                    • Alamat membantu dalam
                                                    pengiriman dokumen
                                                </li>
                                                <li>
                                                    • Informasi yang lengkap
                                                    meningkatkan kredibilitas
                                                    akun
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {Object.keys(errors).length > 0 && (
                                    <Alert
                                        variant="error"
                                        title="Terdapat kesalahan pada form"
                                        description="Silakan periksa kembali semua field yang bertanda merah."
                                    />
                                )}

                                <div
                                    className="flex items-center justify-between pt-6 border-t"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        href={route("profile.index")}
                                        disabled={processing}
                                        leftIcon={
                                            <ArrowLeft className="w-4 h-4" />
                                        }
                                    >
                                        Batal
                                    </Button>

                                    <div className="flex items-center gap-3">
                                        {isDirty && (
                                            <span
                                                className="text-xs"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                * Ada perubahan yang belum
                                                disimpan
                                            </span>
                                        )}
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled={
                                                processing ||
                                                !data.name.trim() ||
                                                !isDirty
                                            }
                                            loading={processing}
                                            size="lg"
                                            leftIcon={
                                                <Save className="w-4 h-4" />
                                            }
                                        >
                                            {processing
                                                ? "Menyimpan..."
                                                : "Simpan Perubahan"}
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </>
    );
}

ProfileEdit.layout = withAuthenticatedLayout({
    title: "Edit Profile",
    searchable: false,
    breadcrumbs: [
        { label: "Dashboard", href: route("dashboard") },
        { label: "Profil", href: route("profile.index") },
        { label: "Edit", href: "#" },
    ],
});

export default ProfileEdit;
