import React, { useState, useEffect } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Save,
    DollarSign,
    Calendar,
    CreditCard,
    User,
    Building2,
    TrendingUp,
    FileText,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import { Input, TextAreaInput, SelectInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Account, EmployeeLoanFormData } from "@/types";
import { EmployeeLoansCreateProps } from "./types";

const EmployeeLoansCreate = ({
    employee,
    accounts,
}: EmployeeLoansCreateProps) => {
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(
        null,
    );
    const [calculatedInstallments, setCalculatedInstallments] = useState(0);

    const { data, setData, post, processing, errors } =
        useForm<EmployeeLoanFormData>({
            sourceAccountId: "",
            amount: "",
            installmentAmount: "",
            loanDate: new Date().toISOString().split("T")[0],
            dueDate: "",
            status: "ongoing",
            note: "",
        });

    useEffect(() => {
        if (data.sourceAccountId) {
            const account = accounts.find(
                (acc) => acc.id === Number(data.sourceAccountId),
            );
            setSelectedAccount(account || null);
        } else {
            setSelectedAccount(null);
        }
    }, [data.sourceAccountId, accounts]);

    useEffect(() => {
        const amount = Number(data.amount);
        const installment = Number(data.installmentAmount);

        if (amount > 0 && installment > 0) {
            const installments = Math.ceil(amount / installment);
            setCalculatedInstallments(installments);
        } else {
            setCalculatedInstallments(0);
        }
    }, [data.amount, data.installmentAmount]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("employees.loans.store", employee.id), {
            preserveScroll: true,
        });
    };

    const handleBack = () => {
        router.visit(route("employees.show", employee.id));
    };

    const accountOptions = [
        { value: "", label: "Pilih Sumber Dana..." },
        ...accounts.map((account) => ({
            value: account.id.toString(),
            label: `${account.code} - ${account.name}`,
        })),
    ];

    const setSuggestedDueDate = () => {
        if (!data.loanDate) return;
        const date = new Date(data.loanDate);
        date.setMonth(date.getMonth() + 3);
        setData("dueDate", date.toISOString().split("T")[0]);
    };

    return (
        <>
            <Head title={`Tambah Pinjaman - ${employee.name}`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto">
                    {/* Header Navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary-100 text-primary-600">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Tambah Pinjaman Baru
                                </h1>
                                <p className="text-gray-500 mt-1">
                                    Buat pinjaman baru untuk karyawan dan catat
                                    pengeluaran kas.
                                </p>
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
                                {/* 1. Informasi Karyawan (Read Only) */}
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                                        {employee.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {employee.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                    <User className="w-3 h-3" />{" "}
                                                    @{employee.username}
                                                    {employee.outlet && (
                                                        <>
                                                            <span>•</span>
                                                            <Building2 className="w-3 h-3" />{" "}
                                                            {
                                                                employee.outlet
                                                                    .name
                                                            }
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={
                                                    employee.isActive
                                                        ? "success"
                                                        : "warning"
                                                }
                                            >
                                                {employee.isActive
                                                    ? "Aktif"
                                                    : "Tidak Aktif"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Sumber Dana & Nominal */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                                        <CreditCard className="w-5 h-5 text-primary-600" />
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Detail Keuangan
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <SelectInput
                                                label="Sumber Dana (Kas/Bank)"
                                                value={data.sourceAccountId.toString()}
                                                onChange={(e) =>
                                                    setData(
                                                        "sourceAccountId",
                                                        e.target.value
                                                            ? Number(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : "",
                                                    )
                                                }
                                                options={accountOptions}
                                                error={errors.sourceAccountId}
                                                required
                                                disabled={processing}
                                                hint="Pilih akun kas/bank dari mana uang diambil."
                                            />
                                        </div>

                                        <Input
                                            label="Jumlah Pinjaman (Rp)"
                                            type="number"
                                            value={data.amount}
                                            onChange={(e) =>
                                                setData(
                                                    "amount",
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : "",
                                                )
                                            }
                                            error={errors.amount}
                                            required
                                            disabled={processing}
                                            leftIcon={
                                                <DollarSign className="w-4 h-4" />
                                            }
                                            placeholder="0"
                                        />

                                        <Input
                                            label="Cicilan per Bulan (Rp)"
                                            type="number"
                                            value={data.installmentAmount}
                                            onChange={(e) =>
                                                setData(
                                                    "installmentAmount",
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : "",
                                                )
                                            }
                                            error={errors.installmentAmount}
                                            disabled={processing}
                                            leftIcon={
                                                <TrendingUp className="w-4 h-4" />
                                            }
                                            placeholder="0"
                                            hint={
                                                calculatedInstallments > 0
                                                    ? `Estimasi lunas: ${calculatedInstallments} bulan`
                                                    : "Kosongkan jika bayar sekaligus nanti."
                                            }
                                        />
                                    </div>
                                </div>

                                {/* 3. Tanggal & Catatan */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                                        <Calendar className="w-5 h-5 text-orange-600" />
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Waktu & Keterangan
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            type="date"
                                            label="Tanggal Cair"
                                            value={data.loanDate}
                                            onChange={(e) =>
                                                setData(
                                                    "loanDate",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.loanDate}
                                            required
                                            disabled={processing}
                                        />

                                        <div className="relative">
                                            <Input
                                                type="date"
                                                label="Jatuh Tempo (Opsional)"
                                                value={data.dueDate || ""}
                                                onChange={(e) =>
                                                    setData(
                                                        "dueDate",
                                                        e.target.value,
                                                    )
                                                }
                                                error={errors.dueDate}
                                                disabled={processing}
                                                min={data.loanDate}
                                            />
                                            {!data.dueDate && (
                                                <button
                                                    type="button"
                                                    onClick={
                                                        setSuggestedDueDate
                                                    }
                                                    className="absolute right-0 top-0 text-xs text-primary-600 hover:text-primary-700"
                                                >
                                                    Set +3 Bulan
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <TextAreaInput
                                        label="Catatan"
                                        value={data.note || ""}
                                        onChange={(e) =>
                                            setData("note", e.target.value)
                                        }
                                        error={errors.note}
                                        placeholder="Contoh: Keperluan biaya sekolah..."
                                        rows={3}
                                        leftIcon={
                                            <FileText className="w-4 h-4 mt-1" />
                                        }
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleBack}
                                        disabled={processing}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        loading={processing}
                                        leftIcon={<Save className="w-4 h-4" />}
                                        disabled={
                                            !data.sourceAccountId ||
                                            !data.amount ||
                                            processing
                                        }
                                    >
                                        Simpan Pinjaman
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

EmployeeLoansCreate.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Tambah Pinjaman",
        breadcrumbs: [
            { label: "Karyawan", href: route("employees.index") },
            {
                label: page.props.employee.name,
                href: route("employees.show", page.props.employee.id),
            },
            { label: "Tambah Pinjaman" },
        ],
    })(page);

export default EmployeeLoansCreate;
