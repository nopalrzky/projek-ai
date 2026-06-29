import React from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Save,
    ArrowLeft,
    User,
    Phone,
    Calendar,
    Heart,
    UserCog,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import {
    Input,
    TextAreaInput,
    DateInput,
    FileInput,
    SelectInput,
    CheckboxInput,
} from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import PageHeader from "@/Components/Page/PageHeader";
import { EmployeeEditProps } from "./types";
import { OutletEmployeeEditFormData } from "@/types";
import { resolveStorageUrl } from "@/lib/utils";

const OutletEmployeeEdit = ({ employee, outlet }: EmployeeEditProps) => {
    const { data, setData, put, processing, errors, clearErrors } =
        useForm<OutletEmployeeEditFormData>({
            name: employee.name || "",
            username: employee.username || "",
            avatar: null,
            phone: employee.phone || "",
            address: employee.address || "",
            gender: employee.gender || "",
            dateOfBirth: employee.dateOfBirth || "",
            startDate:
                employee.startDate || new Date().toISOString().split("T")[0],
            isActive: employee.isActive ?? true,
            cutoffDays: employee.cutoffDays || 30,
        });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        put(route("outlets.employees.update", [outlet.id, employee.id]), {
            preserveScroll: true,

            onError: (errors) => {
                console.error("Validation errors:", errors);
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
        });
    };

    const handleDataChange = (
        key: keyof OutletEmployeeEditFormData,
        value: any,
    ) => {
        setData(key as string, value);

        if (errors[key as keyof typeof errors]) {
            clearErrors(key as string);
        }

        if (key === "password" && errors.passwordConfirmation) {
            clearErrors("passwordConfirmation");
        }
    };

    const handleGenderChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        handleDataChange("gender", event.target.value);
    };

    const handleAvatarSelect = (files: File[]) => {
        if (files && files.length > 0) {
            handleDataChange("avatar", files[0]);
        } else {
            handleDataChange("avatar", null);
        }
    };

    const genderOptions = [
        { value: "", label: "Pilih Jenis Kelamin" },
        { value: "male", label: "Pria" },
        { value: "female", label: "Wanita" },
    ];

    return (
        <>
            <Head title={`Edit Karyawan - ${employee.name}`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title={`Edit Karyawan - ${employee.name}`}
                        subtitle={`Perbarui informasi karyawan di ${outlet?.name || "outlet ini"}`}
                        icon={UserCog}
                        variant="default"
                        actions={
                            <Button
                                onClick={() => window.history.back()}
                                variant="outline"
                                leftIcon={<ArrowLeft className="w-4 h-4" />}
                            >
                                Kembali
                            </Button>
                        }
                    />

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
                                                    "var(--color-info-100)",
                                            }}
                                        >
                                            <User
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
                                                Informasi Dasar
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Data pribadi dan akun login
                                                karyawan
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Nama Lengkap"
                                            placeholder="Masukkan nama lengkap karyawan"
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
                                            leftIcon={
                                                <User className="w-5 h-5" />
                                            }
                                            hint="Nama lengkap sesuai identitas"
                                            autoFocus
                                        />

                                        <Input
                                            label="Username"
                                            placeholder="username_karyawan"
                                            value={data.username}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "username",
                                                    e.target.value.toLowerCase(),
                                                )
                                            }
                                            error={errors.username}
                                            required
                                            disabled={processing}
                                            leftIcon={
                                                <User className="w-5 h-5" />
                                            }
                                            hint="Username untuk login karyawan"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Nomor Telepon"
                                            placeholder="08xxxxxxxxxx"
                                            value={data.phone}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "phone",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.phone}
                                            optional
                                            disabled={processing}
                                            leftIcon={
                                                <Phone className="w-5 h-5" />
                                            }
                                            hint="Nomor telepon yang bisa dihubungi"
                                            type="tel"
                                        />

                                        <SelectInput
                                            label="Jenis Kelamin"
                                            placeholder="Pilih jenis kelamin..."
                                            value={data.gender}
                                            onChange={handleGenderChange}
                                            options={genderOptions}
                                            error={errors.gender}
                                            optional
                                            disabled={processing}
                                            leftIcon={
                                                <Heart className="w-5 h-5" />
                                            }
                                            hint="Jenis kelamin karyawan"
                                            multiple={false}
                                            clearable={true}
                                        />

                                        <DateInput
                                            label="Tanggal Lahir"
                                            value={data.birthDate || ""}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "birthDate",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.birthDate}
                                            optional
                                            disabled={processing}
                                            max={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                            leftIcon={
                                                <Calendar className="w-5 h-5" />
                                            }
                                            hint="Tanggal lahir karyawan"
                                        />

                                        <DateInput
                                            label="Tanggal Mulai Kerja"
                                            value={data.startDate}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "startDate",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.startDate}
                                            required
                                            disabled={processing}
                                            max={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                            leftIcon={
                                                <Calendar className="w-5 h-5" />
                                            }
                                            hint="Tanggal mulai bekerja"
                                        />
                                    </div>

                                    <TextAreaInput
                                        label="Alamat"
                                        placeholder="Alamat lengkap karyawan..."
                                        value={data.address}
                                        onChange={(e) =>
                                            handleDataChange(
                                                "address",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.address}
                                        optional
                                        disabled={processing}
                                        hint="Alamat tempat tinggal"
                                        rows={3}
                                        maxLength={500}
                                        showCharacterCount={true}
                                    />

                                    <FileInput
                                        label="Foto Profil"
                                        placeholder="Upload foto profil karyawan"
                                        accept="image/*"
                                        maxFileSize={2 * 1024 * 1024}
                                        allowedFileTypes={[
                                            "image/jpeg",
                                            "image/jpg",
                                            "image/png",
                                            "image/webp",
                                        ]}
                                        onFileSelect={handleAvatarSelect}
                                        files={data.avatar ? [data.avatar] : []}
                                        error={errors.avatar}
                                        optional
                                        disabled={processing}
                                        hint="Format: JPG, PNG, WEBP (max. 2MB). Kosongkan jika tidak ingin mengubah"
                                        preview={true}
                                        dragAndDrop={true}
                                        size="sm"
                                        browseText="Pilih Foto"
                                        dropzoneText="Drop foto di sini"
                                        maxFiles={1}
                                        multiple={false}
                                    />

                                    {employee.avatar && !data.avatar && (
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={
                                                    resolveStorageUrl(
                                                        employee.avatar,
                                                    ) ?? undefined
                                                }
                                                alt={employee.name}
                                                className="w-20 h-20 rounded-full object-cover"
                                            />
                                            <div>
                                                <p
                                                    className="text-sm font-medium"
                                                    style={{
                                                        color: "var(--color-text-primary)",
                                                    }}
                                                >
                                                    Foto Profil Saat Ini
                                                </p>
                                                <p
                                                    className="text-xs"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Upload foto baru untuk
                                                    mengubah
                                                </p>
                                            </div>
                                        </div>
                                    )}
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
                                                Status Karyawan
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Ubah status aktif karyawan
                                            </p>
                                        </div>
                                    </div>

                                    <CheckboxInput
                                        label="Karyawan Aktif"
                                        checked={data.isActive}
                                        onChange={(checked) =>
                                            handleDataChange(
                                                "isActive",
                                                checked,
                                            )
                                        }
                                        disabled={processing}
                                        description={
                                            data.isActive
                                                ? "Karyawan aktif dapat melakukan transaksi dan login"
                                                : "Karyawan nonaktif tidak dapat login atau melakukan transaksi"
                                        }
                                    />
                                </div>

                                <div
                                    className="flex items-center justify-between pt-6 border-t"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                        disabled={processing}
                                        leftIcon={
                                            <ArrowLeft className="w-4 h-4" />
                                        }
                                    >
                                        Kembali
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={
                                            processing ||
                                            !data.name.trim() ||
                                            !data.username.trim()
                                        }
                                        loading={processing}
                                        size="lg"
                                        leftIcon={<Save className="w-4 h-4" />}
                                    >
                                        Simpan Perubahan
                                    </Button>
                                </div>
                            </Form>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

OutletEmployeeEdit.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Edit Karyawan",
        breadcrumbs: [
            { label: "Outlets", href: route("outlets.index") },
            {
                label: page.props.outlet?.name || "Detail Outlet",
                href: route("outlets.show", page.props.outlet.id),
            },
            { label: "Edit Karyawan" },
        ],
    })(page);

export default OutletEmployeeEdit;
