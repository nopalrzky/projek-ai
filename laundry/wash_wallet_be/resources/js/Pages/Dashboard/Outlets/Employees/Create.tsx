import React from "react";
import { Head, useForm } from "@inertiajs/react";
import {
    Save,
    ArrowLeft,
    User,
    Phone,
    Calendar,
    Lock,
    Heart,
    UserPlus,
    DollarSign,
    Plus,
    Trash2,
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
    NumberInput,
} from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { EmployeeCreateProps } from "./types";
import {
    EmployeeProcessCommissionFormItem,
    EmployeeSalaryFormItem,
    OutletEmployeeCreateFormData,
} from "@/types/outlet";

const OutletEmployeeCreate = ({
    outlet,
    outletId,
    positions = [],
    processes = [],
    salaries = [],
}: EmployeeCreateProps) => {
    const { data, setData, post, processing, errors, clearErrors, reset } =
        useForm<OutletEmployeeCreateFormData>({
            name: "",
            username: "",
            password: "",
            passwordConfirmation: "",
            avatar: null,
            phone: "",
            address: "",
            gender: "",
            dateOfBirth: "",
            startDate: new Date().toISOString().split("T")[0],
            isActive: true,
            cutoffDays: 30,
            positionIds: [],
            employeeSalaries: [],
            employeeProcessCommissions: [],
        });

    const [employeeSalaries, setEmployeeSalaries] = React.useState<
        EmployeeSalaryFormItem[]
    >([]);
    const [employeeProcessCommissions, setEmployeeProcessCommissions] =
        React.useState<EmployeeProcessCommissionFormItem[]>([]);

    React.useEffect(() => {
        setData("employeeSalaries", employeeSalaries);
    }, [employeeSalaries, setData]);

    React.useEffect(() => {
        setData("employeeProcessCommissions", employeeProcessCommissions);
    }, [employeeProcessCommissions, setData]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(route("outlets.employees.store", outletId), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                reset();
                setEmployeeSalaries([]);
                setEmployeeProcessCommissions([]);
            },
            onError: (errors) => {
                console.error("Validation errors:", errors);
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
        });
    };

    const handleDataChange = (
        key: keyof OutletEmployeeCreateFormData,
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
    const handlePositionChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const options = event.target.options;
        const selectedValues: number[] = [];

        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                const value = parseInt(options[i].value, 10);
                if (!isNaN(value) && value > 0) {
                    selectedValues.push(value);
                }
            }
        }

        handleDataChange("positionIds", selectedValues);
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

    const handleAddSalary = () => {
        setEmployeeSalaries([
            ...employeeSalaries,
            {
                salaryId: null,
                type: "",
                status: "active",
                amount: 0,
            },
        ]);
    };

    const handleRemoveSalary = (index: number) => {
        const newSalaries = employeeSalaries.filter((_, i) => i !== index);
        setEmployeeSalaries(newSalaries);
    };

    const handleSalaryChange = (
        index: number,
        field: keyof EmployeeSalaryFormItem,
        value: any,
    ) => {
        const newSalaries = [...employeeSalaries];
        newSalaries[index] = { ...newSalaries[index], [field]: value };
        setEmployeeSalaries(newSalaries);
    };

    const handleAddCommission = () => {
        setEmployeeProcessCommissions([
            ...employeeProcessCommissions,
            {
                processId: null,
                commissionType: "percentage",
                commissionValue: 0,
                hasTarget: false,
                targetThreshold: 0,
                bonusAmount: 0,
                effectiveDate: new Date().toISOString().split("T")[0],
                isActive: true,
            },
        ]);
    };

    const handleRemoveCommission = (index: number) => {
        const newCommissions = employeeProcessCommissions.filter(
            (_, i) => i !== index,
        );
        setEmployeeProcessCommissions(newCommissions);
    };

    const handleCommissionChange = (
        index: number,
        field: keyof EmployeeProcessCommissionFormItem,
        value: any,
    ) => {
        const newCommissions = [...employeeProcessCommissions];
        newCommissions[index] = { ...newCommissions[index], [field]: value };
        setEmployeeProcessCommissions(newCommissions);
    };

    const positionOptions = positions.map((position) => ({
        value: position.id.toString(),
        label: position.name,
        description: position.description || undefined,
    }));

    const genderOptions = [
        { value: "", label: "Pilih Jenis Kelamin" },
        { value: "male", label: "Pria" },
        { value: "female", label: "Wanita" },
    ];

    const salaryOptions = [
        { value: "", label: "Pilih Jenis Gaji" },
        ...salaries.map((salary) => ({
            value: salary.id.toString(),
            label: salary.name,
            description: salary.description || undefined,
        })),
    ];

    const salaryStatusOptions = [
        { value: "active", label: "Aktif" },
        { value: "inactive", label: "Nonaktif" },
    ];

    const processOptions = [
        { value: "", label: "Pilih Proses" },
        ...processes.map((process) => ({
            value: process.id.toString(),
            label: process.name,
            description: process.description || undefined,
        })),
    ];

    const commissionTypeOptions = [
        { value: "percentage", label: "Persentase (%)" },
        { value: "per_item", label: "Per Item" },
        { value: "per_kg", label: "Per Kg" },
        { value: "flat", label: "Nominal Tetap" },
    ];

    return (
        <>
            <Head title="Tambah Karyawan" />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Tambah Karyawan"
                        subtitle={`Tambahkan karyawan baru untuk ${outlet?.name || "outlet ini"}`}
                        icon={UserPlus}
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

                    {Object.keys(errors).length > 0 && (
                        <Alert
                            variant="error"
                            title="Terdapat kesalahan pada form"
                            description="Silakan periksa kembali field yang bertanda merah."
                        />
                    )}

                    <Card className="p-8">
                        <Form onSubmit={handleSubmit} className="space-y-8">
                            {/* Informasi Dasar */}
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
                                            Data pribadi dan akun login karyawan
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
                                        leftIcon={<User className="w-5 h-5" />}
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
                                        leftIcon={<User className="w-5 h-5" />}
                                        hint="Username untuk login karyawan"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={data.password || ""}
                                        onChange={(e) =>
                                            handleDataChange(
                                                "password",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.password}
                                        required
                                        disabled={processing}
                                        leftIcon={<Lock className="w-5 h-5" />}
                                        hint="Password untuk login (min. 8 karakter)"
                                        minLength={8}
                                    />

                                    <Input
                                        label="Konfirmasi Password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={data.passwordConfirmation || ""}
                                        onChange={(e) =>
                                            handleDataChange(
                                                "passwordConfirmation",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.passwordConfirmation}
                                        required
                                        disabled={processing}
                                        leftIcon={<Lock className="w-5 h-5" />}
                                        hint="Ulangi password yang sama"
                                        minLength={8}
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
                                        leftIcon={<Phone className="w-5 h-5" />}
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
                                        leftIcon={<Heart className="w-5 h-5" />}
                                        hint="Jenis kelamin karyawan"
                                        multiple={false}
                                        clearable={true}
                                    />

                                    <DateInput
                                        label="Tanggal Lahir"
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

                                <SelectInput
                                    label="Posisi"
                                    placeholder={
                                        positions.length === 0
                                            ? "Tidak ada posisi tersedia"
                                            : "Pilih posisi..."
                                    }
                                    value={data.positionIds.map((id) =>
                                        id.toString(),
                                    )}
                                    onChange={handlePositionChange}
                                    error={errors.positionIds}
                                    optional
                                    disabled={
                                        processing || positions.length === 0
                                    }
                                    options={positionOptions}
                                    multiple={true}
                                    searchable={true}
                                    clearable={true}
                                    hint={
                                        positions.length === 0
                                            ? "Belum ada posisi tersedia di outlet ini"
                                            : "Pilih satu atau lebih posisi (opsional)"
                                    }
                                    noOptionsText="Tidak ada posisi tersedia"
                                />

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
                                    hint="Format: JPG, PNG, WEBP (max. 2MB)"
                                    preview={true}
                                    dragAndDrop={true}
                                    size="sm"
                                    browseText="Pilih Foto"
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
                                                "var(--color-success-100)",
                                        }}
                                    >
                                        <DollarSign
                                            className="w-6 h-6"
                                            style={{
                                                color: "var(--color-success-600)",
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h2
                                            className="text-xl font-semibold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            Pengaturan Gaji
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Tentukan gaji dan cutoff karyawan
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleAddSalary}
                                        disabled={processing}
                                        leftIcon={<Plus className="w-4 h-4" />}
                                    >
                                        Tambah Gaji
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                {employeeSalaries.length === 0 ? (
                                    <div
                                        className="text-center py-8 rounded-lg border-2 border-dashed"
                                        style={{
                                            borderColor: "var(--color-border)",
                                            backgroundColor:
                                                "var(--color-surface-secondary)",
                                        }}
                                    >
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Belum ada gaji ditambahkan. Klik
                                            "Tambah Gaji" untuk menambahkan.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {employeeSalaries.map(
                                            (salary, index) => (
                                                <div
                                                    key={index}
                                                    className="p-4 rounded-lg border"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--color-surface)",
                                                        borderColor:
                                                            "var(--color-border)",
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3
                                                            className="font-medium"
                                                            style={{
                                                                color: "var(--color-text-primary)",
                                                            }}
                                                        >
                                                            Gaji #{index + 1}
                                                        </h3>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleRemoveSalary(
                                                                    index,
                                                                )
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                            leftIcon={
                                                                <Trash2 className="w-4 h-4" />
                                                            }
                                                        >
                                                            Hapus
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <SelectInput
                                                            label="Jenis Gaji"
                                                            placeholder="Pilih jenis gaji..."
                                                            value={
                                                                salary.salaryId?.toString() ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleSalaryChange(
                                                                    index,
                                                                    "salaryId",
                                                                    e.target
                                                                        .value
                                                                        ? parseInt(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          )
                                                                        : null,
                                                                )
                                                            }
                                                            options={
                                                                salaryOptions
                                                            }
                                                            required
                                                            disabled={
                                                                processing
                                                            }
                                                            multiple={false}
                                                        />

                                                        <NumberInput
                                                            label="Jumlah"
                                                            value={
                                                                salary.amount
                                                            }
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                handleSalaryChange(
                                                                    index,
                                                                    "amount",
                                                                    value || 0,
                                                                )
                                                            }
                                                            required
                                                            disabled={
                                                                processing
                                                            }
                                                            min={0}
                                                            prefix="Rp "
                                                            thousandSeparator="."
                                                            decimalSeparator=","
                                                        />

                                                        <SelectInput
                                                            label="Status"
                                                            value={
                                                                salary.status ||
                                                                "active"
                                                            }
                                                            onChange={(e) =>
                                                                handleSalaryChange(
                                                                    index,
                                                                    "status",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            options={
                                                                salaryStatusOptions
                                                            }
                                                            required
                                                            disabled={
                                                                processing
                                                            }
                                                            multiple={false}
                                                        />
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Komisi Proses */}
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
                                                "var(--color-warning-100)",
                                        }}
                                    >
                                        <DollarSign
                                            className="w-6 h-6"
                                            style={{
                                                color: "var(--color-warning-600)",
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h2
                                            className="text-xl font-semibold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            Komisi Proses
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Pengaturan komisi berdasarkan proses
                                            laundry
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleAddCommission}
                                        disabled={processing}
                                        leftIcon={<Plus className="w-4 h-4" />}
                                    >
                                        Tambah Komisi
                                    </Button>
                                </div>

                                {employeeProcessCommissions.length === 0 ? (
                                    <div
                                        className="text-center py-8 rounded-lg border-2 border-dashed"
                                        style={{
                                            borderColor: "var(--color-border)",
                                            backgroundColor:
                                                "var(--color-surface-secondary)",
                                        }}
                                    >
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Belum ada komisi proses. Klik
                                            "Tambah Komisi" untuk menambahkan.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {employeeProcessCommissions.map(
                                            (commission, index) => (
                                                <div
                                                    key={index}
                                                    className="border rounded-lg p-4"
                                                    style={{
                                                        borderColor:
                                                            "var(--color-border)",
                                                    }}
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h3
                                                            className="font-medium"
                                                            style={{
                                                                color: "var(--color-text-primary)",
                                                            }}
                                                        >
                                                            Komisi Proses{" "}
                                                            {index + 1}
                                                        </h3>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleRemoveCommission(
                                                                    index,
                                                                )
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                            leftIcon={
                                                                <Trash2 className="w-4 h-4" />
                                                            }
                                                        >
                                                            Hapus
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <SelectInput
                                                                label="Proses"
                                                                value={
                                                                    commission.processId?.toString() ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleCommissionChange(
                                                                        index,
                                                                        "processId",
                                                                        e.target
                                                                            .value
                                                                            ? parseInt(
                                                                                  e
                                                                                      .target
                                                                                      .value,
                                                                              )
                                                                            : null,
                                                                    )
                                                                }
                                                                options={
                                                                    processOptions
                                                                }
                                                                disabled={
                                                                    processing ||
                                                                    processes.length ===
                                                                        0
                                                                }
                                                                hint={
                                                                    processes.length ===
                                                                    0
                                                                        ? "Belum ada proses tersedia"
                                                                        : "Pilih proses laundry"
                                                                }
                                                            />

                                                            <SelectInput
                                                                label="Tipe Komisi"
                                                                value={
                                                                    commission.commissionType
                                                                }
                                                                onChange={(e) =>
                                                                    handleCommissionChange(
                                                                        index,
                                                                        "commissionType",
                                                                        e.target
                                                                            .value as any,
                                                                    )
                                                                }
                                                                options={
                                                                    commissionTypeOptions
                                                                }
                                                                disabled={
                                                                    processing
                                                                }
                                                                hint="Jenis perhitungan komisi"
                                                            />

                                                            <NumberInput
                                                                label={
                                                                    commission.commissionType ===
                                                                    "percentage"
                                                                        ? "Nilai Komisi (%)"
                                                                        : commission.commissionType ===
                                                                            "per_item"
                                                                          ? "Nilai per Item (Rp)"
                                                                          : commission.commissionType ===
                                                                              "per_kg"
                                                                            ? "Nilai per Kg (Rp)"
                                                                            : "Nilai Tetap (Rp)"
                                                                }
                                                                value={
                                                                    commission.commissionValue
                                                                }
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
                                                                    handleCommissionChange(
                                                                        index,
                                                                        "commissionValue",
                                                                        value ||
                                                                            0,
                                                                    )
                                                                }
                                                                disabled={
                                                                    processing
                                                                }
                                                                min={0}
                                                                max={
                                                                    commission.commissionType ===
                                                                    "percentage"
                                                                        ? 100
                                                                        : undefined
                                                                }
                                                                prefix={
                                                                    commission.commissionType !==
                                                                    "percentage"
                                                                        ? "Rp "
                                                                        : ""
                                                                }
                                                                suffix={
                                                                    commission.commissionType ===
                                                                    "percentage"
                                                                        ? "%"
                                                                        : ""
                                                                }
                                                                thousandSeparator={
                                                                    commission.commissionType !==
                                                                    "percentage"
                                                                        ? "."
                                                                        : undefined
                                                                }
                                                                decimalSeparator={
                                                                    commission.commissionType !==
                                                                    "percentage"
                                                                        ? ","
                                                                        : undefined
                                                                }
                                                                hint="Nilai komisi yang didapat"
                                                            />

                                                            <DateInput
                                                                label="Tanggal Efektif"
                                                                value={
                                                                    commission.effectiveDate ||
                                                                    new Date()
                                                                        .toISOString()
                                                                        .split(
                                                                            "T",
                                                                        )[0]
                                                                }
                                                                onChange={(e) =>
                                                                    handleCommissionChange(
                                                                        index,
                                                                        "effectiveDate",
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                disabled={
                                                                    processing
                                                                }
                                                                hint="Tanggal mulai berlaku komisi"
                                                            />
                                                        </div>

                                                        <div className="border-t pt-4 mt-4">
                                                            <CheckboxInput
                                                                label="Memiliki Target"
                                                                checked={
                                                                    commission.hasTarget
                                                                }
                                                                onChange={(
                                                                    checked,
                                                                ) =>
                                                                    handleCommissionChange(
                                                                        index,
                                                                        "hasTarget",
                                                                        checked,
                                                                    )
                                                                }
                                                                disabled={
                                                                    processing
                                                                }
                                                                description="Aktifkan jika komisi memiliki target untuk mendapat bonus"
                                                            />
                                                        </div>

                                                        {commission.hasTarget && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                                <NumberInput
                                                                    label="Target Threshold"
                                                                    value={
                                                                        commission.targetThreshold
                                                                    }
                                                                    onValueChange={(
                                                                        value,
                                                                    ) =>
                                                                        handleCommissionChange(
                                                                            index,
                                                                            "targetThreshold",
                                                                            value ||
                                                                                0,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    min={0}
                                                                    thousandSeparator="."
                                                                    decimalSeparator=","
                                                                    allowDecimal={
                                                                        false
                                                                    }
                                                                    hint="Target minimal yang harus dicapai"
                                                                />

                                                                <NumberInput
                                                                    label="Bonus Amount"
                                                                    value={
                                                                        commission.bonusAmount
                                                                    }
                                                                    onValueChange={(
                                                                        value,
                                                                    ) =>
                                                                        handleCommissionChange(
                                                                            index,
                                                                            "bonusAmount",
                                                                            value ||
                                                                                0,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    min={0}
                                                                    prefix="Rp "
                                                                    thousandSeparator="."
                                                                    decimalSeparator=","
                                                                    hint="Bonus jika target tercapai"
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="border-t pt-4 mt-4">
                                                            <CheckboxInput
                                                                label="Komisi Aktif"
                                                                checked={
                                                                    commission.isActive
                                                                }
                                                                onChange={(
                                                                    checked,
                                                                ) =>
                                                                    handleCommissionChange(
                                                                        index,
                                                                        "isActive",
                                                                        checked,
                                                                    )
                                                                }
                                                                disabled={
                                                                    processing
                                                                }
                                                                description="Nonaktifkan untuk menangguhkan komisi sementara"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* Form Actions */}
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
                                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                                >
                                    Kembali
                                </Button>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={
                                        processing ||
                                        !data.name.trim() ||
                                        !data.username.trim() ||
                                        !data.password ||
                                        !data.password.trim() ||
                                        data.password !==
                                            data.passwordConfirmation
                                    }
                                    loading={processing}
                                    size="lg"
                                    leftIcon={<Save className="w-4 h-4" />}
                                >
                                    Simpan Karyawan
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </div>
            </div>
        </>
    );
};

OutletEmployeeCreate.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Tambah Karyawan",
        breadcrumbs: [
            { label: "Outlets", href: route("outlets.index") },
            {
                label: page.props.outlet?.name || "Detail Outlet",
                href: route("outlets.show", page.props.outletId),
            },
            { label: "Tambah Karyawan" },
        ],
    })(page);

export default OutletEmployeeCreate;
