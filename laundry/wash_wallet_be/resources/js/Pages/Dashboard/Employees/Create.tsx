import React, { useState, useEffect, useCallback, useRef } from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Save,
    ArrowLeft,
    User,
    Lock,
    Phone,
    Calendar,
    Building2,
    Heart,
    DollarSign,
    Plus,
    Trash2,
    AlertCircle,
    UserPlus,
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
import employeeService from "@/Services/employee.service";
import { EmployeeCreateProps } from "./types";
import {
    EmployeeCreateFormData,
    EmployeeProcessFormItem,
    EmployeeSalaryFormItem,
    EmployeeProcessCommissionFormItem,
} from "@/types";
import positionService from "@/Services/position.service";
import PageHeader from "@/Components/Page/PageHeader";

const EmployeeCreate = ({
    outlets,
    salaries,
    processes,
}: EmployeeCreateProps) => {
    const { data, setData, post, processing, errors, clearErrors, reset } =
        useForm<EmployeeCreateFormData>({
            outletId: 0,
            name: "",
            username: "",
            password: "",
            passwordConfirmation: "",
            avatar: null,
            phone: "",
            address: "",
            dateOfBirth: "",
            gender: "",
            startDate: new Date().toISOString().split("T")[0],
            cutoffDays: 30,
            positionIds: [],
            employeeSalaries: [],
            employeeProcesses: [],
            employeeProcessCommissions: [],
        });

    const [positions, setPositions] = useState<any[]>([]);
    const [loadingPositions, setLoadingPositions] = useState(false);
    const [positionsError, setPositionsError] = useState<string | null>(null);
    const [employeeSalaries, setEmployeeSalaries] = useState<
        EmployeeSalaryFormItem[]
    >([]);
    const [selectedProcessIds, setSelectedProcessIds] = useState<number[]>([]);
    const [employeeProcessCommissions, setEmployeeProcessCommissions] =
        useState<EmployeeProcessCommissionFormItem[]>([]);

    const activeProcesses = processes.filter((process) => process.isActive);
    const allProcessesSelected =
        activeProcesses.length > 0 &&
        activeProcesses.every((process) =>
            selectedProcessIds.includes(process.id),
        );

    const requestSeqRef = useRef(0);
    const currentOutletIdRef = useRef<number | null>(null);

    const loadPositionsByOutlet = useCallback(
        async (outletId: number) => {
            const seq = ++requestSeqRef.current;
            currentOutletIdRef.current = outletId;

            if (outletId === 0 || !outletId) {
                setPositions([]);
                return;
            }

            setLoadingPositions(true);
            setPositionsError(null);
            setPositions([]);
            setData("positionIds", []);

            try {
                const fetchedPositions =
                    await positionService.getPositionsByOutletId(
                        outletId,
                        true,
                    );
                
                if (seq === requestSeqRef.current && currentOutletIdRef.current === outletId) {
                    setPositions(fetchedPositions);
                    setLoadingPositions(false);
                }
            } catch (error: any) {
                if (seq === requestSeqRef.current && currentOutletIdRef.current === outletId) {
                    console.error("Error loading positions:", error);
                    setPositionsError(error.message || "Gagal memuat posisi");
                    setPositions([]);
                    setLoadingPositions(false);
                }
            }
        },
        [setData],
    );

    useEffect(() => {
        if (data.outletId) {
            loadPositionsByOutlet(data.outletId);
        } else {
            currentOutletIdRef.current = null;
            requestSeqRef.current++;
            setPositions([]);
            setData("positionIds", []);
            setPositionsError(null);
        }
    }, [data.outletId, loadPositionsByOutlet]);

    useEffect(() => {
        setData("employeeSalaries", employeeSalaries);
    }, [employeeSalaries, setData]);

    useEffect(() => {
        const employeeProcesses: EmployeeProcessFormItem[] =
            selectedProcessIds.map((processId) => ({
                processId,
                isActive: true,
            }));

        setData("employeeProcesses", employeeProcesses);
    }, [selectedProcessIds, setData]);

    useEffect(() => {
        setData("employeeProcessCommissions", employeeProcessCommissions);
    }, [employeeProcessCommissions, setData]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(route("employees.store"), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                reset();
                setEmployeeSalaries([]);
                setSelectedProcessIds([]);
                setEmployeeProcessCommissions([]);
            },
            onError: (errors) => {
                console.error("Validation errors:", errors);
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
        });
    };

    const handleDataChange = (
        key: keyof EmployeeCreateFormData,
        value: any,
    ) => {
        setData(key as string, value);

        if (errors[key]) {
            clearErrors(key as string);
        }

        if (key === "password" && errors.passwordConfirmation) {
            clearErrors("passwordConfirmation");
        }
    };

    const handleOutletChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value;
        const outletId = value ? parseInt(value, 10) : undefined;
        handleDataChange("outletId", outletId);
    };

    const handlePositionChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value;

        if (event.target.multiple && Array.isArray(value)) {
            const positionIds = value
                .map((v) => parseInt(v as string, 10))
                .filter((id) => !isNaN(id) && id > 0);
            handleDataChange("positionIds", positionIds);
        } else if (event.target.multiple && typeof value === "string") {
            const positionId = parseInt(value, 10);
            if (!isNaN(positionId) && positionId > 0) {
                handleDataChange("positionIds", [positionId]);
            } else {
                handleDataChange("positionIds", []);
            }
        } else {
            const positionId = parseInt(value as string, 10);
            if (!isNaN(positionId) && positionId > 0) {
                handleDataChange("positionIds", [positionId]);
            } else {
                handleDataChange("positionIds", []);
            }
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

    const handleAddSalary = () => {
        setEmployeeSalaries([
            ...employeeSalaries,
            {
                salaryId: null,
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
        const updated = { ...newSalaries[index], [field]: value };
        if (field === "salaryId" && value) {
            const selectedSalary = salaries.find((s) => s.id === Number(value));
            if (selectedSalary) {
                updated.type = selectedSalary.type;
            }
        }
        newSalaries[index] = updated;
        setEmployeeSalaries(newSalaries);
    };

    const handleToggleProcess = (processId: number, checked: boolean) => {
        setSelectedProcessIds((current) => {
            if (checked) {
                return current.includes(processId)
                    ? current
                    : [...current, processId];
            }

            return current.filter((id) => id !== processId);
        });

        if (!checked) {
            setEmployeeProcessCommissions((current) =>
                current.filter(
                    (commission) => commission.processId !== processId,
                ),
            );
        }
    };

    const handleSelectAllProcesses = () => {
        setSelectedProcessIds(activeProcesses.map((process) => process.id));
    };

    const handleClearProcesses = () => {
        setSelectedProcessIds([]);
        setEmployeeProcessCommissions([]);
    };

    const handleToggleCommission = (processId: number) => {
        const hasCommission = employeeProcessCommissions.some(
            (commission) => commission.processId === processId,
        );

        if (hasCommission) {
            setEmployeeProcessCommissions((current) =>
                current.filter(
                    (commission) => commission.processId !== processId,
                ),
            );
            return;
        }

        setEmployeeProcessCommissions((current) => [
            ...current,
            {
                processId,
                commissionType: "percentage",
                commissionValue: 0,
                hasTarget: false,
                targetThreshold: 0,
                bonusAmount: 0,
                effectiveDate: new Date().toISOString().split("T")[0],
            },
        ]);
    };

    const handleCommissionChange = (
        processId: number,
        field: keyof EmployeeProcessCommissionFormItem,
        value: any,
    ) => {
        setEmployeeProcessCommissions((current) =>
            current.map((commission) =>
                commission.processId === processId
                    ? { ...commission, [field]: value }
                    : commission,
            ),
        );
    };

    const getCommissionByProcessId = (processId: number) => {
        return employeeProcessCommissions.find(
            (commission) => commission.processId === processId,
        );
    };

    const outletOptions = [
        { value: "", label: "Pilih Outlet" },
        ...outlets.map((outlet) => ({
            value: outlet.id.toString(),
            label: outlet.name,
            description: outlet.code || undefined,
        })),
    ];

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
                        subtitle={`Tambah karyawan baru`}
                        icon={UserPlus}
                        variant="default"
                        className=""
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
                                                    "var(--color-primary-100)",
                                            }}
                                        >
                                            <Building2
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
                                                Penempatan Outlet
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Tentukan outlet dan posisi
                                                karyawan
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SelectInput
                                            label="Outlet"
                                            placeholder="Pilih outlet..."
                                            value={
                                                data.outletId?.toString() || ""
                                            }
                                            onChange={handleOutletChange}
                                            error={errors.outletId}
                                            required
                                            disabled={
                                                processing ||
                                                outlets.length === 0
                                            }
                                            options={outletOptions}
                                            leftIcon={
                                                <Building2 className="w-5 h-5" />
                                            }
                                            hint={
                                                outlets.length === 0
                                                    ? "Belum ada outlet tersedia"
                                                    : "Pilih outlet untuk Karyawan ini"
                                            }
                                            searchable={true}
                                            clearable={true}
                                            multiple={false}
                                            noOptionsText="Tidak ada outlet tersedia"
                                        />

                                        <SelectInput
                                            label="Posisi"
                                            placeholder={
                                                !data.outletId
                                                    ? "Pilih outlet terlebih dahulu"
                                                    : loadingPositions
                                                      ? "Memuat posisi..."
                                                      : positions.length === 0
                                                        ? "Tidak ada posisi tersedia"
                                                        : "Pilih posisi..."
                                            }
                                            value={(data.positionIds ?? []).map(
                                                (id) => id.toString(),
                                            )}
                                            onChange={handlePositionChange}
                                            error={
                                                errors.positionIds ||
                                                positionsError ||
                                                undefined
                                            }
                                            optional
                                            disabled={
                                                processing ||
                                                !data.outletId ||
                                                loadingPositions ||
                                                positions.length === 0
                                            }
                                            options={positionOptions}
                                            multiple={true}
                                            searchable={true}
                                            clearable={true}
                                            hint={
                                                !data.outletId
                                                    ? "Pilih outlet terlebih dahulu untuk melihat posisi"
                                                    : loadingPositions
                                                      ? "Sedang memuat posisi dari outlet..."
                                                      : positions.length === 0
                                                        ? "Belum ada posisi tersedia di outlet ini"
                                                        : "Pilih satu atau lebih posisi (opsional)"
                                            }
                                            noOptionsText="Tidak ada posisi tersedia"
                                            loading={loadingPositions}
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
                                            placeholder="Masukkan nama lengkap Karyawan"
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
                                            hint="Username untuk login Karyawan"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={data.password}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "password",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.password}
                                            required
                                            disabled={processing}
                                            leftIcon={
                                                <Lock className="w-5 h-5" />
                                            }
                                            hint="Password untuk login Karyawan (min. 8 karakter)"
                                            minLength={8}
                                        />
                                        <Input
                                            label="Konfirmasi Password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={data.passwordConfirmation}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "passwordConfirmation",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.passwordConfirmation}
                                            required
                                            disabled={processing}
                                            leftIcon={
                                                <Lock className="w-5 h-5" />
                                            }
                                            hint="Ulangi password yang sama"
                                            minLength={8}
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
                                            hint="Jenis kelamin Karyawan"
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
                                            hint="Tanggal lahir Karyawan"
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
                                        placeholder="Alamat lengkap Karyawan..."
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
                                    <FileInput
                                        label="Foto Profil"
                                        placeholder="Upload foto profil Karyawan"
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
                                                Tentukan gaji dan cutoff
                                                karyawan
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleAddSalary}
                                            disabled={processing}
                                            leftIcon={
                                                <Plus className="w-4 h-4" />
                                            }
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
                                                borderColor:
                                                    "var(--color-border)",
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
                                                                errors[
                                                                    `employeeSalaries.${index}.salaryId`
                                                                ] ||
                                                                errors[
                                                                    `employeeSalaries.${index}.type`
                                                                ] ||
                                                                errors[
                                                                    `employeeSalaries.${index}.amount`
                                                                ]
                                                                    ? "var(--color-error-500)"
                                                                    : "var(--color-border)",
                                                        }}
                                                    >
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h3
                                                                className="font-medium"
                                                                style={{
                                                                    color: "var(--color-text-primary)",
                                                                }}
                                                            >
                                                                Gaji #
                                                                {index + 1}
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
                                                                error={
                                                                    errors[
                                                                        `employeeSalaries.${index}.salaryId`
                                                                    ]
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
                                                                        value ||
                                                                            0,
                                                                    )
                                                                }
                                                                error={
                                                                    errors[
                                                                        `employeeSalaries.${index}.amount`
                                                                    ]
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
                                                        </div>
                                                    </div>
                                                ),
                                            )}
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
                                                Proses Produksi & Komisi
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Pilih proses yang bisa
                                                dikerjakan karyawan. Komisi
                                                hanya ditambahkan jika
                                                diperlukan.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={
                                                    handleSelectAllProcesses
                                                }
                                                disabled={
                                                    processing ||
                                                    activeProcesses.length ===
                                                        0 ||
                                                    allProcessesSelected
                                                }
                                            >
                                                Pilih Semua
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleClearProcesses}
                                                disabled={
                                                    processing ||
                                                    selectedProcessIds.length ===
                                                        0
                                                }
                                            >
                                                Reset
                                            </Button>
                                        </div>
                                    </div>

                                    <div
                                        className="flex flex-col gap-2 rounded-xl border px-4 py-4 md:flex-row md:items-center md:justify-between"
                                        style={{
                                            borderColor: "var(--color-border)",
                                            backgroundColor:
                                                "var(--color-surface-secondary)",
                                        }}
                                    >
                                        <p
                                            className="text-sm font-medium"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {selectedProcessIds.length} dari{" "}
                                            {activeProcesses.length} proses
                                            dipilih
                                        </p>
                                        <p
                                            className="text-xs"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Klik "Tambahkan Komisi" hanya pada
                                            proses yang perlu komisi.
                                        </p>
                                    </div>

                                    {processes.length === 0 ? (
                                        <div
                                            className="text-center py-8 rounded-lg border-2 border-dashed"
                                            style={{
                                                borderColor:
                                                    "var(--color-border)",
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
                                                tambahkan data proses terlebih
                                                dahulu.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {processes.map((process) => {
                                                const isSelected =
                                                    selectedProcessIds.includes(
                                                        process.id,
                                                    );
                                                const commission =
                                                    getCommissionByProcessId(
                                                        process.id,
                                                    );
                                                const commissionIndex =
                                                    employeeProcessCommissions.findIndex(
                                                        (item) =>
                                                            item.processId ===
                                                            process.id,
                                                    );

                                                return (
                                                    <div
                                                        key={process.id}
                                                        className="border rounded-xl p-5 shadow-sm"
                                                        style={{
                                                            borderColor:
                                                                isSelected
                                                                    ? "var(--color-primary-400)"
                                                                    : "var(--color-border)",
                                                            backgroundColor:
                                                                isSelected
                                                                    ? "var(--color-primary-50)"
                                                                    : "var(--color-surface)",
                                                        }}
                                                    >
                                                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
                                                            <div className="flex-1">
                                                                <CheckboxInput
                                                                    label={
                                                                        process.name
                                                                    }
                                                                    checked={
                                                                        isSelected
                                                                    }
                                                                    size="lg"
                                                                    spacing="loose"
                                                                    onChange={(
                                                                        checked,
                                                                    ) =>
                                                                        handleToggleProcess(
                                                                            process.id,
                                                                            checked,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        processing ||
                                                                        !process.isActive
                                                                    }
                                                                    description={
                                                                        process.isActive
                                                                            ? process.description ||
                                                                              "Proses ini akan tersedia untuk karyawan."
                                                                            : "Proses nonaktif tidak bisa dipilih."
                                                                    }
                                                                />
                                                            </div>

                                                            <Button
                                                                type="button"
                                                                variant={
                                                                    commission
                                                                        ? "outline"
                                                                        : "secondary"
                                                                }
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleToggleCommission(
                                                                        process.id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    processing ||
                                                                    !isSelected
                                                                }
                                                                leftIcon={
                                                                    commission ? (
                                                                        <Trash2 className="w-4 h-4" />
                                                                    ) : (
                                                                        <Plus className="w-4 h-4" />
                                                                    )
                                                                }
                                                            >
                                                                {commission
                                                                    ? "Hapus Komisi"
                                                                    : "Tambahkan Komisi"}
                                                            </Button>
                                                        </div>

                                                        {!isSelected ? (
                                                            <p
                                                                className="mt-3 text-xs"
                                                                style={{
                                                                    color: "var(--color-text-secondary)",
                                                                }}
                                                            >
                                                                Pilih proses ini
                                                                terlebih dahulu
                                                                sebelum
                                                                menambahkan
                                                                komisi.
                                                            </p>
                                                        ) : null}

                                                        {commission ? (
                                                            <div
                                                                className="space-y-5 mt-5 rounded-lg border pt-5 px-4 pb-4"
                                                                style={{
                                                                    borderColor:
                                                                        "var(--color-border)",
                                                                    backgroundColor:
                                                                        "var(--color-surface-secondary)",
                                                                }}
                                                            >
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <SelectInput
                                                                        label="Tipe Komisi"
                                                                        value={
                                                                            commission.commissionType
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleCommissionChange(
                                                                                process.id,
                                                                                "commissionType",
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        options={
                                                                            commissionTypeOptions
                                                                        }
                                                                        error={
                                                                            commissionIndex >=
                                                                            0
                                                                                ? errors[
                                                                                      `employeeProcessCommissions.${commissionIndex}.commissionType`
                                                                                  ]
                                                                                : undefined
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
                                                                                process.id,
                                                                                "commissionValue",
                                                                                value ||
                                                                                    0,
                                                                            )
                                                                        }
                                                                        error={
                                                                            commissionIndex >=
                                                                            0
                                                                                ? errors[
                                                                                      `employeeProcessCommissions.${commissionIndex}.commissionValue`
                                                                                  ]
                                                                                : undefined
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
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleCommissionChange(
                                                                                process.id,
                                                                                "effectiveDate",
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        error={
                                                                            commissionIndex >=
                                                                            0
                                                                                ? errors[
                                                                                      `employeeProcessCommissions.${commissionIndex}.effectiveDate`
                                                                                  ]
                                                                                : undefined
                                                                        }
                                                                        disabled={
                                                                            processing
                                                                        }
                                                                        hint="Tanggal mulai berlaku komisi"
                                                                    />
                                                                </div>

                                                                <div className="border-t pt-5 mt-1">
                                                                    <CheckboxInput
                                                                        label="Memiliki Target"
                                                                        checked={
                                                                            commission.hasTarget
                                                                        }
                                                                        size="lg"
                                                                        spacing="loose"
                                                                        onChange={(
                                                                            checked,
                                                                        ) =>
                                                                            handleCommissionChange(
                                                                                process.id,
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

                                                                {commission.hasTarget ? (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                                                        <NumberInput
                                                                            label="Target Threshold"
                                                                            value={
                                                                                commission.targetThreshold
                                                                            }
                                                                            onValueChange={(
                                                                                value,
                                                                            ) =>
                                                                                handleCommissionChange(
                                                                                    process.id,
                                                                                    "targetThreshold",
                                                                                    value ||
                                                                                        0,
                                                                                )
                                                                            }
                                                                            error={
                                                                                commissionIndex >=
                                                                                0
                                                                                    ? errors[
                                                                                          `employeeProcessCommissions.${commissionIndex}.targetThreshold`
                                                                                      ]
                                                                                    : undefined
                                                                            }
                                                                            disabled={
                                                                                processing
                                                                            }
                                                                            min={
                                                                                0
                                                                            }
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
                                                                                    process.id,
                                                                                    "bonusAmount",
                                                                                    value ||
                                                                                        0,
                                                                                )
                                                                            }
                                                                            error={
                                                                                commissionIndex >=
                                                                                0
                                                                                    ? errors[
                                                                                          `employeeProcessCommissions.${commissionIndex}.bonusAmount`
                                                                                      ]
                                                                                    : undefined
                                                                            }
                                                                            disabled={
                                                                                processing
                                                                            }
                                                                            min={
                                                                                0
                                                                            }
                                                                            prefix="Rp "
                                                                            thousandSeparator="."
                                                                            decimalSeparator=","
                                                                            hint="Bonus jika target tercapai"
                                                                        />
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
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
                                                <li>
                                                    • Password minimal 8
                                                    karakter dengan kombinasi
                                                    huruf besar, kecil, angka,
                                                    dan simbol
                                                </li>
                                                <li>
                                                    • Username hanya boleh
                                                    mengandung huruf, angka,
                                                    titik, strip, dan underscore
                                                </li>
                                                <li>
                                                    • Foto profil maksimal 2MB
                                                    dengan format JPG, PNG, atau
                                                    WEBP
                                                </li>
                                                <li>
                                                    • Field yang ditandai dengan{" "}
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
                                        onClick={() =>
                                            employeeService.goToIndex()
                                        }
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
                                            !data.outletId ||
                                            !data.name.trim() ||
                                            !data.username.trim() ||
                                            !data.password.trim() ||
                                            data.password !==
                                                data.passwordConfirmation ||
                                            loadingPositions
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
                    </motion.div>
                </div>
            </div>
        </>
    );
};

EmployeeCreate.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Tambah Karyawan",
        breadcrumbs: [
            { label: "Karyawan", href: route("employees.index") },
            { label: "Tambah Karyawan" },
        ],
    })(page);

export default EmployeeCreate;
