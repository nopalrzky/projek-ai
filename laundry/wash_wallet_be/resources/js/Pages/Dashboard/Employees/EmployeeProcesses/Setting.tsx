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
import { EmployeeProcessSettingProps } from "./types";

interface ProcessSetting {
    processId: number;
    name: string;
    selected: boolean;
    hasCommission: boolean;
    commissionType: "flat" | "percentage" | "per_item" | "per_kg";
    commissionValue: number;
    hasTarget: boolean;
    targetThreshold: number;
    bonusAmount: number;
}

const EmployeeProcessSetting = ({
    employee,
    processes,
    errors,
    flash,
}: EmployeeProcessSettingProps) => {
    const initialProcesses: ProcessSetting[] = processes.map((process) => {
        const assigned = employee.employeeProcesses?.find(
            (ep) => ep.process?.id === process.id
        );
        
        return {
            processId: process.id,
            name: process.name,
            selected: !!assigned,
            hasCommission: !!assigned?.commission,
            commissionType: assigned?.commission?.commissionType || "flat",
            commissionValue: assigned?.commission?.commissionValue || 0,
            hasTarget: assigned?.commission?.hasTarget || false,
            targetThreshold: assigned?.commission?.targetThreshold || 0,
            bonusAmount: assigned?.commission?.bonusAmount || 0,
        };
    });

    const { data, setData, post, processing } = useForm({
        processes: initialProcesses,
    });

    const commissionTypeOptions = [
        { value: "flat", label: "Nominal Tetap" },
        { value: "percentage", label: "Persentase" },
        { value: "per_item", label: "Per Item" },
        { value: "per_kg", label: "Per Kg" },
    ];

    const handleSelectAll = (checked: boolean) => {
        const updated = data.processes.map((p) => ({
            ...p,
            selected: checked,
        }));
        setData("processes", updated);
    };

    const handleProcessChange = (index: number, fields: Partial<ProcessSetting>) => {
        const updated = [...data.processes];
        updated[index] = { ...updated[index], ...fields };
        setData("processes", updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(
            route("employees.employee-processes.sync", {
                employeeId: employee.id,
            }),
            {
                preserveScroll: true,
            }
        );
    };

    const isAllSelected = data.processes.length > 0 && data.processes.every((p) => p.selected);

    return (
        <>
            <Head title={`Setting Proses - ${employee.name}`} />

            <div className="min-h-screen p-6" style={{ backgroundColor: "var(--color-background)" }}>
                <div className="mx-auto space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-8"
                    >
                        <PageHeader
                            title="Setting Proses Karyawan"
                            subtitle={`Atur proses kerja dan komisi untuk ${employee.name}`}
                            icon={Workflow}
                            variant="default"
                            actions={
                                <Button
                                    variant="outline"
                                    onClick={() => window.history.back()}
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
                        <Card variant="elevated" className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--color-primary-100)" }}>
                                    <User className="w-8 h-8" style={{ color: "var(--color-primary-600)" }} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
                                        {employee.name}
                                    </h2>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Building2 className="w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                                        <span style={{ color: "var(--color-text-secondary)" }}>
                                            {employee.outlet?.name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {flash?.error && (
                            <Alert variant="error" title="Error" description={flash.error} />
                        )}

                        <Card className="p-8">
                            <Form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: "var(--color-surface-secondary)", border: "1px solid var(--color-border)" }}>
                                        <CheckboxInput
                                            label="Pilih Semua (Select All)"
                                            checked={isAllSelected}
                                            onChange={handleSelectAll}
                                            disabled={processing}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        {data.processes.map((process, index) => (
                                            <div key={process.processId} className="p-4 rounded-lg border" style={{ borderColor: "var(--color-border)", backgroundColor: process.selected ? "var(--color-surface-primary)" : "var(--color-surface-secondary)" }}>
                                                <div className="flex items-center justify-between">
                                                    <CheckboxInput
                                                        label={process.name}
                                                        checked={process.selected}
                                                        onChange={(checked) => handleProcessChange(index, { selected: checked })}
                                                        disabled={processing}
                                                    />

                                                    {process.selected && (
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => handleProcessChange(index, { hasCommission: !process.hasCommission })}
                                                        >
                                                            {process.hasCommission ? "Batal Atur Komisi" : "Atur Komisi"}
                                                        </Button>
                                                    )}
                                                </div>

                                                {process.selected && process.hasCommission && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-6"
                                                        style={{ borderColor: "var(--color-border)" }}
                                                    >
                                                        <SelectInput
                                                            label="Tipe Komisi"
                                                            required
                                                            value={process.commissionType}
                                                            onChange={(e) => handleProcessChange(index, { commissionType: e.target.value as any })}
                                                            options={commissionTypeOptions}
                                                            disabled={processing}
                                                        />

                                                        <NumberInput
                                                            label="Nilai Komisi"
                                                            required
                                                            value={process.commissionValue}
                                                            onValueChange={(val) => handleProcessChange(index, { commissionValue: val ?? 0 })}
                                                            disabled={processing}
                                                            allowNegative={false}
                                                            min={0}
                                                            step={1000}
                                                            suffix={process.commissionType === "percentage" ? "%" : undefined}
                                                            prefix={process.commissionType !== "percentage" ? "Rp " : undefined}
                                                        />

                                                        <div className="md:col-span-2">
                                                            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--color-surface-secondary)", border: "1px solid var(--color-border)" }}>
                                                                <CheckboxInput
                                                                    label="Gunakan target komisi"
                                                                    checked={process.hasTarget}
                                                                    onChange={(checked) => handleProcessChange(index, { hasTarget: checked })}
                                                                    disabled={processing}
                                                                />
                                                            </div>
                                                        </div>

                                                        {process.hasTarget && (
                                                            <>
                                                                <NumberInput
                                                                    label="Target Threshold"
                                                                    required
                                                                    value={process.targetThreshold}
                                                                    onValueChange={(val) => handleProcessChange(index, { targetThreshold: val ?? 0 })}
                                                                    disabled={processing}
                                                                    allowNegative={false}
                                                                    min={0}
                                                                    step={1}
                                                                    allowDecimal={false}
                                                                />

                                                                <NumberInput
                                                                    label="Bonus Saat Target Tercapai"
                                                                    required
                                                                    value={process.bonusAmount}
                                                                    onValueChange={(val) => handleProcessChange(index, { bonusAmount: val ?? 0 })}
                                                                    disabled={processing}
                                                                    allowNegative={false}
                                                                    min={0}
                                                                    step={1000}
                                                                    prefix="Rp "
                                                                />
                                                            </>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-3 pt-6 border-t" style={{ borderColor: "var(--color-border)" }}>
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
                                        disabled={processing || data.processes.length === 0}
                                        loading={processing}
                                        size="lg"
                                        leftIcon={<Save className="w-4 h-4" />}
                                    >
                                        Simpan Pengaturan
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

EmployeeProcessSetting.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Setting Proses Karyawan",
        breadcrumbs: [
            { label: "Karyawan", href: route("employees.index") },
            {
                label: page.props.employee.name,
                href: route("employees.show", page.props.employee.id),
            },
            { label: "Setting Proses" },
        ],
    })(page);

export default EmployeeProcessSetting;
