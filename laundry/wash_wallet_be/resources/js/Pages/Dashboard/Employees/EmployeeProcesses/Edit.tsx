import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { CheckboxInput, SelectInput } from "@/Components/Input";
import NumberInput from "@/Components/Input/Number";
import { Alert } from "@/Components/Alert";
import { Form } from "@/Components/Form";
import PageHeader from "@/Components/Page/PageHeader";
import { ArrowLeft, Building2, Save, User, Workflow } from "lucide-react";
import { employeeService } from "@/Services/employee.service";
import { EmployeeProcessEditProps } from "./types";

type EmployeeProcessEditFormData = {
    isActive: boolean;
    hasCommission: boolean;
    commissionType: "per_item" | "per_kg" | "percentage" | "flat";
    commissionValue: number;
    hasTarget: boolean;
    targetThreshold: number;
    bonusAmount: number;
};

const EmployeeProcessEdit = ({
    employee,
    employeeProcess,
    errors,
    flash,
}: EmployeeProcessEditProps) => {
    const existingCommission = employeeProcess.commission;

    const { data, setData, put, processing, clearErrors } =
        useForm<EmployeeProcessEditFormData>({
            isActive: employeeProcess.isActive ?? true,
            hasCommission: !!existingCommission,
            commissionType:
                (existingCommission?.commissionType as EmployeeProcessEditFormData["commissionType"]) ??
                "flat",
            commissionValue: existingCommission?.commissionValue
                ? Number(existingCommission.commissionValue)
                : 0,
            hasTarget: existingCommission?.hasTarget ?? false,
            targetThreshold: existingCommission?.targetThreshold ?? 0,
            bonusAmount: existingCommission?.bonusAmount ?? 0,
        });

    const commissionTypeOptions = [
        { value: "flat", label: "Nominal Tetap" },
        { value: "percentage", label: "Persentase" },
        { value: "per_item", label: "Per Item" },
        { value: "per_kg", label: "Per Kg" },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(
            route("employees.employee-processes.update", {
                employeeId: employee.id,
                employeeProcessId: employeeProcess.id,
            }),
            {
                preserveScroll: true,
                onError: () => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                },
            },
        );
    };

    return (
        <>
            <Head title={`Edit Proses - ${employee.name}`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-8"
                    >
                        <PageHeader
                            title="Edit Proses Karyawan"
                            subtitle={`Perbarui proses kerja untuk ${employee.name}`}
                            icon={Workflow}
                            variant="default"
                            actions={
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        employeeService.goToView(employee.id)
                                    }
                                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                                >
                                    Kembali
                                </Button>
                            }
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="space-y-6"
                    >
                        {/* Employee Info Card */}
                        <Card variant="elevated" className="p-6">
                            <div className="flex items-start gap-4">
                                <div
                                    className="p-4 rounded-xl"
                                    style={{
                                        backgroundColor:
                                            "var(--color-primary-100)",
                                    }}
                                >
                                    <User
                                        className="w-8 h-8"
                                        style={{
                                            color: "var(--color-primary-600)",
                                        }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <h2
                                        className="text-xl font-semibold mb-2"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {employee.name}
                                    </h2>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Building2
                                            className="w-4 h-4"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        />
                                        <span
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {employee.outlet?.name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Process Info Banner */}
                        <Card
                            className="p-4"
                            style={{
                                backgroundColor: "var(--color-primary-50)",
                                border: "1px solid var(--color-primary-200)",
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{
                                        backgroundColor:
                                            "var(--color-primary-100)",
                                    }}
                                >
                                    <Workflow
                                        className="w-5 h-5"
                                        style={{
                                            color: "var(--color-primary-600)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <p
                                        className="font-semibold"
                                        style={{
                                            color: "var(--color-primary-700)",
                                        }}
                                    >
                                        {employeeProcess.process?.name ||
                                            "Unknown Process"}
                                    </p>
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-primary-600)",
                                        }}
                                    >
                                        Proses tidak dapat diubah setelah
                                        disimpan
                                    </p>
                                </div>
                            </div>
                        </Card>

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
                                    {/* Status Toggle */}
                                    <div
                                        className="p-4 rounded-lg"
                                        style={{
                                            backgroundColor:
                                                "var(--color-surface-secondary)",
                                            border: "1px solid var(--color-border)",
                                        }}
                                    >
                                        <CheckboxInput
                                            label="Proses Aktif"
                                            checked={data.isActive}
                                            onChange={(checked: boolean) => {
                                                setData("isActive", checked);
                                            }}
                                            disabled={processing}
                                            hint="Nonaktifkan untuk menghentikan sementara proses ini bagi karyawan"
                                        />
                                    </div>

                                    {/* Commission Toggle */}
                                    <div
                                        className="p-4 rounded-lg"
                                        style={{
                                            backgroundColor:
                                                "var(--color-surface-secondary)",
                                            border: "1px solid var(--color-border)",
                                        }}
                                    >
                                        <CheckboxInput
                                            label="Karyawan ini memiliki komisi"
                                            checked={data.hasCommission}
                                            onChange={(checked: boolean) => {
                                                setData(
                                                    "hasCommission",
                                                    checked,
                                                );
                                                if (!checked) {
                                                    setData(
                                                        "commissionValue",
                                                        0,
                                                    );
                                                    setData("hasTarget", false);
                                                    setData(
                                                        "targetThreshold",
                                                        0,
                                                    );
                                                    setData("bonusAmount", 0);
                                                }
                                                clearErrors(
                                                    "hasCommission",
                                                    "commissionType",
                                                    "commissionValue",
                                                    "hasTarget",
                                                    "targetThreshold",
                                                    "bonusAmount",
                                                );
                                            }}
                                            disabled={processing}
                                            hint="Nonaktifkan untuk menghapus komisi pada proses ini"
                                        />
                                    </div>

                                    {/* Commission Fields */}
                                    {data.hasCommission && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <SelectInput
                                                label="Tipe Komisi"
                                                required
                                                value={data.commissionType}
                                                onChange={(e) => {
                                                    setData(
                                                        "commissionType",
                                                        e.target
                                                            .value as EmployeeProcessEditFormData["commissionType"],
                                                    );
                                                    clearErrors(
                                                        "commissionType",
                                                    );
                                                }}
                                                options={commissionTypeOptions}
                                                error={errors?.commissionType}
                                                disabled={processing}
                                            />

                                            <NumberInput
                                                label="Nilai Komisi"
                                                required
                                                value={data.commissionValue}
                                                onValueChange={(val) => {
                                                    setData(
                                                        "commissionValue",
                                                        val ?? 0,
                                                    );
                                                    if (
                                                        errors?.commissionValue
                                                    ) {
                                                        clearErrors(
                                                            "commissionValue",
                                                        );
                                                    }
                                                }}
                                                error={errors?.commissionValue}
                                                disabled={processing}
                                                allowNegative={false}
                                                min={0}
                                                step={1000}
                                                suffix={
                                                    data.commissionType ===
                                                    "percentage"
                                                        ? "%"
                                                        : undefined
                                                }
                                                prefix={
                                                    data.commissionType !==
                                                    "percentage"
                                                        ? "Rp "
                                                        : undefined
                                                }
                                            />

                                            <div className="md:col-span-2">
                                                <div
                                                    className="p-4 rounded-lg"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--color-surface-secondary)",
                                                        border: "1px solid var(--color-border)",
                                                    }}
                                                >
                                                    <CheckboxInput
                                                        label="Gunakan target komisi"
                                                        checked={data.hasTarget}
                                                        onChange={(
                                                            checked: boolean,
                                                        ) => {
                                                            setData(
                                                                "hasTarget",
                                                                checked,
                                                            );
                                                            if (!checked) {
                                                                setData(
                                                                    "targetThreshold",
                                                                    0,
                                                                );
                                                                setData(
                                                                    "bonusAmount",
                                                                    0,
                                                                );
                                                            }
                                                            clearErrors(
                                                                "hasTarget",
                                                                "targetThreshold",
                                                                "bonusAmount",
                                                            );
                                                        }}
                                                        disabled={processing}
                                                        hint="Jika aktif, bonus akan diberikan saat target tercapai"
                                                    />
                                                </div>
                                            </div>

                                            {data.hasTarget && (
                                                <>
                                                    <NumberInput
                                                        label="Target Threshold"
                                                        required
                                                        value={
                                                            data.targetThreshold
                                                        }
                                                        onValueChange={(
                                                            val,
                                                        ) => {
                                                            setData(
                                                                "targetThreshold",
                                                                val ?? 0,
                                                            );
                                                            if (
                                                                errors?.targetThreshold
                                                            ) {
                                                                clearErrors(
                                                                    "targetThreshold",
                                                                );
                                                            }
                                                        }}
                                                        error={
                                                            errors?.targetThreshold
                                                        }
                                                        disabled={processing}
                                                        allowNegative={false}
                                                        min={0}
                                                        step={1}
                                                        allowDecimal={false}
                                                        hint="Jumlah minimal item/kg untuk mencapai target"
                                                    />

                                                    <NumberInput
                                                        label="Bonus Saat Target Tercapai"
                                                        required
                                                        value={data.bonusAmount}
                                                        onValueChange={(
                                                            val,
                                                        ) => {
                                                            setData(
                                                                "bonusAmount",
                                                                val ?? 0,
                                                            );
                                                            if (
                                                                errors?.bonusAmount
                                                            ) {
                                                                clearErrors(
                                                                    "bonusAmount",
                                                                );
                                                            }
                                                        }}
                                                        error={
                                                            errors?.bonusAmount
                                                        }
                                                        disabled={processing}
                                                        allowNegative={false}
                                                        min={0}
                                                        step={1000}
                                                        prefix="Rp "
                                                    />
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div
                                    className="flex items-center justify-between gap-3 pt-6 border-t"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            employeeService.goToView(
                                                employee.id,
                                            )
                                        }
                                        disabled={processing}
                                        leftIcon={
                                            <ArrowLeft className="w-4 h-4" />
                                        }
                                    >
                                        Batal
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={
                                            processing ||
                                            (data.hasCommission &&
                                                data.commissionValue <= 0)
                                        }
                                        loading={processing}
                                        size="lg"
                                        leftIcon={<Save className="w-4 h-4" />}
                                    >
                                        {processing
                                            ? "Menyimpan..."
                                            : "Simpan Perubahan"}
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

EmployeeProcessEdit.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Edit Proses Karyawan",
        breadcrumbs: [
            { label: "Karyawan", href: route("employees.index") },
            {
                label: page.props.employee.name,
                href: route("employees.show", page.props.employee.id),
            },
            { label: "Edit Proses" },
        ],
    })(page);

export default EmployeeProcessEdit;
