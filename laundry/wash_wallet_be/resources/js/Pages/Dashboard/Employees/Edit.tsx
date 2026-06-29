import React from "react";
import { Head, useForm } from "@inertiajs/react";
import {
    Save,
    ArrowLeft,
    User,
    Phone,
    Calendar,
    Heart,
    AlertCircle,
    Info,
    UserCog,
    CheckSquare,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import {
    Input,
    TextAreaInput,
    SelectInput,
    NumberInput,
    FileInput,
    DateInput,
    CheckboxInput,
} from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import employeeService from "@/Services/employee.service";
import { EmployeeEditProps } from "./types";
import { EmployeeEditFormData } from "@/types";

const EmployeeEdit = ({ employee, flash }: EmployeeEditProps) => {
    const { data, setData, post, processing, errors, clearErrors, transform } =
        useForm<EmployeeEditFormData>({
            name: employee.name,
            username: employee.username,
            avatar: null,
            phone: employee.phone || "",
            address: employee.address || "",
            gender: employee.gender || "",
            startDate: employee.startDate,
            dateOfBirth: employee.dateOfBirth || "",
            isActive: employee.isActive,
            cutoffDays: employee.cutoffDays,
        });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        transform((current) => ({
            ...current,
            _method: "PUT",
        }));

        post(route("employees.update", employee.id), {
            preserveScroll: true,
            forceFormData: true,
            onError: (formErrors) => {
                console.error("Validation errors:", formErrors);
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
        });
    };

    const handleDataChange = (key: keyof EmployeeEditFormData, value: any) => {
        setData(key as string, value);

        if (errors[key]) {
            clearErrors(key as string);
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
                        title="Edit Karyawan"
                        subtitle={`Perbarui data karyawan: ${employee.name}`}
                        icon={UserCog}
                        actions={
                            <Button
                                onClick={() => employeeService.goToIndex()}
                                variant="outline"
                                leftIcon={<ArrowLeft className="w-4 h-4" />}
                            >
                                Kembali
                            </Button>
                        }
                    />

                    {flash?.error && (
                        <Alert
                            variant="error"
                            title="Kesalahan"
                            description={flash.error}
                        />
                    )}

                    {Object.keys(errors).length > 0 && (
                        <Alert
                            variant="error"
                            title="Terdapat kesalahan pada form"
                            description="Silakan periksa kembali field yang bertanda merah."
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
                                            Informasi dasar karyawan
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        hint="Nama lengkap sesuai identitas"
                                        autoFocus
                                    />

                                    <Input
                                        label="Username"
                                        value={data.username}
                                        disabled={true}
                                        leftIcon={<User className="w-5 h-5" />}
                                        hint="Username tidak dapat diubah"
                                    />
                                </div>

                                <div
                                    className="p-4 rounded-lg border"
                                    style={{
                                        backgroundColor:
                                            "var(--color-warning-50)",
                                        borderColor: "var(--color-warning-200)",
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <Info
                                            className="w-5 h-5 flex-shrink-0 mt-0.5"
                                            style={{
                                                color: "var(--color-warning-600)",
                                            }}
                                        />
                                        <div>
                                            <p
                                                className="text-sm font-medium"
                                                style={{
                                                    color: "var(--color-warning-700)",
                                                }}
                                            >
                                                Informasi Password
                                            </p>
                                            <p
                                                className="text-xs mt-1"
                                                style={{
                                                    color: "var(--color-warning-600)",
                                                }}
                                            >
                                                Untuk keamanan, password tidak
                                                dapat diubah melalui halaman
                                                ini. Silakan reset password
                                                melalui menu pengaturan akun.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SelectInput
                                        label="Jenis Kelamin"
                                        placeholder="Pilih jenis kelamin..."
                                        value={data.gender}
                                        onChange={handleGenderChange}
                                        options={genderOptions}
                                        error={errors.gender}
                                        optional
                                        disabled={processing}
                                        leftIcon={<Heart className="w-5 h-5" />}
                                        hint="Jenis kelamin Karyawan"
                                        multiple={false}
                                        clearable={true}
                                    />

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
                                        leftIcon={<Phone className="w-5 h-5" />}
                                        hint="Nomor telepon yang bisa dihubungi"
                                        type="tel"
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

                                    <DateInput
                                        label="Tanggal Lahir"
                                        placeholder="Pilih tanggal lahir..."
                                        value={data.dateOfBirth || ""}
                                        onChange={(e) =>
                                            handleDataChange(
                                                "dateOfBirth",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.dateOfBirth}
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
                                        hint="Tanggal lahir Karyawan"
                                    />

                                    <NumberInput
                                        label="Hari Cutoff"
                                        value={data.cutoffDays}
                                        onValueChange={(value) =>
                                            handleDataChange(
                                                "cutoffDays",
                                                value || 30,
                                            )
                                        }
                                        error={errors.cutoffDays}
                                        required
                                        disabled={processing}
                                        hint="Hari cutoff untuk perhitungan gaji"
                                        min={1}
                                        max={365}
                                        allowDecimal={false}
                                    />
                                </div>

                                <TextAreaInput
                                    label="Alamat"
                                    placeholder="Alamat lengkap..."
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
                                    placeholder="Upload foto profil baru"
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
                                    hint="Format: JPG, PNG, WEBP (max. 2MB)"
                                    preview={true}
                                    dragAndDrop={true}
                                    size="sm"
                                    browseText="Pilih Foto Baru"
                                    dropzoneText="Drop foto di sini"
                                    maxFiles={1}
                                    multiple={false}
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
                                        <CheckSquare
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
                                            Status Karyawan
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Aktifkan atau nonaktifkan
                                        </p>
                                    </div>
                                </div>

                                <CheckboxInput
                                    label="Status Aktif"
                                    description="Karyawan dapat login dan melakukan transaksi"
                                    checked={data.isActive}
                                    onChange={(checked) =>
                                        handleDataChange("isActive", checked)
                                    }
                                    disabled={processing}
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
                                    <AlertCircle
                                        className="w-5 h-5 mt-0.5 flex-shrink-0"
                                        style={{
                                            color: "var(--color-info-600)",
                                        }}
                                    />
                                    <div>
                                        <p
                                            className="text-sm font-medium mb-1"
                                            style={{
                                                color: "var(--color-info-700)",
                                            }}
                                        >
                                            Informasi Penting
                                        </p>
                                        <ul
                                            className="text-xs space-y-1"
                                            style={{
                                                color: "var(--color-info-600)",
                                            }}
                                        >
                                            <li>• Outlet tidak dapat diubah</li>
                                            <li>
                                                • Username tidak dapat diubah
                                            </li>
                                            <li>
                                                • Password tidak dapat diubah
                                                melalui halaman ini
                                            </li>
                                            <li>
                                                • Foto profil maksimal 2MB (JPG,
                                                PNG, WEBP)
                                            </li>
                                            <li>
                                                • Field yang ditandai{" "}
                                                <span
                                                    style={{
                                                        color: "var(--color-error-600)",
                                                    }}
                                                >
                                                    *
                                                </span>{" "}
                                                wajib diisi
                                            </li>
                                        </ul>
                                    </div>
                                </div>
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
                                    onClick={() => employeeService.goToIndex()}
                                    disabled={processing}
                                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                                >
                                    Kembali
                                </Button>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={processing}
                                    size="lg"
                                    leftIcon={<Save className="w-4 h-4" />}
                                >
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </Form>
                        <li>
                            • Posisi, gaji, dan komisi diatur melalui halaman
                            detail karyawan
                        </li>
                    </Card>
                </div>
            </div>
        </>
    );
};

EmployeeEdit.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Edit Karyawan",
        breadcrumbs: [
            { label: "Karyawan", href: route("employees.index") },
            { label: "Edit Karyawan" },
        ],
    })(page);

export default EmployeeEdit;
