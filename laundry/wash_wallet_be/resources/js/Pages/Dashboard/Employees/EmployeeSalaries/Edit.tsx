import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { SelectInput } from "@/Components/Input";
import NumberInput from "@/Components/Input/Number";
import { Alert } from "@/Components/Alert";
import { Form } from "@/Components/Form";
import PageHeader from "@/Components/Page/PageHeader";
import {
    Save,
    ArrowLeft,
    DollarSign,
    Briefcase,
    User,
    Building2,
} from "lucide-react";
import { employeeService } from "@/Services/employee.service";
import { formatCurrency } from "@/lib/utils";
import { EmployeeSalaryEditProps } from "./types";
import { EmployeeSalaryFormData } from "@/types";

const EmployeeSalaryEdit = ({
    employee,
    employeeSalary,
    salaries,
    errors,
    flash,
}: EmployeeSalaryEditProps) => {
    const { data, setData, put, processing, clearErrors } =
        useForm<EmployeeSalaryFormData>({
            salaryId: employeeSalary.salaryId ?? 0,
            amount: employeeSalary.amount ?? 0,
        });

    const salaryOptions = salaries.map((salary) => ({
        value: salary.id,
        label: salary.name,
    }));

    const handleDataChange = (
        key: keyof EmployeeSalaryFormData,
        value: any,
    ) => {
        setData(key as string, value);

        if (errors?.[key]) {
            clearErrors(key as string);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(
            route("employees.employee-salaries.update", {
                employeeId: employee.id,
                employeeSalaryId: employeeSalary.id,
            }),
            {
                preserveScroll: true,
                onError: () => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                },
            },
        );
    };

    const handleCancel = () => {
        employeeService.goToView(employee.id);
    };

    return (
        <>
            <Head title={`Edit Gaji - ${employee.name}`} />

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
                            title="Edit Komponen Gaji"
                            subtitle={`Ubah komponen gaji untuk ${employee.name}`}
                            icon={DollarSign}
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
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
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
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2">
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
                                        <div>
                                            <h2
                                                className="text-xl font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Informasi Gaji
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Ubah komponen gaji dan jumlahnya
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SelectInput
                                            label="Komponen Gaji"
                                            required
                                            value={data.salaryId}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "salaryId",
                                                    e.target.value,
                                                )
                                            }
                                            options={salaryOptions}
                                            error={errors?.salaryId}
                                            disabled={processing}
                                            leftIcon={
                                                <Briefcase className="w-5 h-5" />
                                            }
                                            hint="Pilih jenis komponen gaji untuk karyawan"
                                            placeholder="Pilih komponen gaji..."
                                            autoFocus
                                        />

                                        <NumberInput
                                            label="Jumlah"
                                            required
                                            value={data.amount}
                                            onValueChange={(val) =>
                                                handleDataChange(
                                                    "amount",
                                                    val ?? 0,
                                                )
                                            }
                                            error={errors?.amount}
                                            disabled={processing}
                                            prefix="Rp "
                                            hint={
                                                data.amount
                                                    ? `≈ ${formatCurrency(data.amount)}`
                                                    : "Masukkan jumlah gaji dalam rupiah"
                                            }
                                            min={0}
                                            step={1000}
                                            allowNegative={false}
                                        />
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
                                    className="flex items-center justify-between gap-3 pt-6 border-t"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCancel}
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
                                            !data.salaryId ||
                                            !data.amount ||
                                            data.amount <= 0
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

EmployeeSalaryEdit.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Edit Gaji Karyawan",
        breadcrumbs: [
            { label: "Karyawan", href: route("employees.index") },
            {
                label: page.props.employee.name,
                href: route("employees.show", page.props.employee.id),
            },
            { label: "Edit Gaji" },
        ],
    })(page);

export default EmployeeSalaryEdit;
